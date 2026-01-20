import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  uploadFile,
  getAttachmentById,
  getAttachmentsByParty,
  getAttachmentsByHolding,
  getSignedUrl,
  downloadFile,
  deleteAttachment,
  deleteAttachmentsByParty,
  deleteAttachmentsByHolding,
  updateAttachmentMetadata,
  getUploadConfig,
  listAttachments,
  isAllowedFileType,
} from '../services/fileUploadService';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }
  },
});

// GET /api/attachments/config
router.get('/config', (_req: Request, res: Response) => {
  res.json({ success: true, data: getUploadConfig() });
});

// GET /api/attachments
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const partyId = req.query.partyId as string | undefined;
    const holdingId = req.query.holdingId as string | undefined;
    const attachmentType = req.query.attachmentType as string | undefined;

    const result = await listAttachments(page, limit, { partyId, holdingId, attachmentType });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list attachments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/attachments/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { partyId, holdingId, attachmentType, attachmentName, description } = req.body;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file provided', message: 'Please include a file in the request' });
      return;
    }

    if (!partyId && !holdingId) {
      res.status(400).json({ success: false, error: 'Missing required fields', message: 'Either partyId or holdingId is required' });
      return;
    }

    const result = await uploadFile({
      partyId,
      holdingId,
      file: file.buffer,
      fileName: file.originalname,
      fileType: file.mimetype,
      attachmentType,
      attachmentName,
      description,
    });

    res.status(201).json({ success: true, data: result.attachment, signedUrl: result.signedUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/attachments/party/:partyId
router.get('/party/:partyId', async (req: Request<{ partyId: string }>, res: Response) => {
  try {
    const { partyId } = req.params;
    const attachments = await getAttachmentsByParty(partyId);
    res.json({ success: true, data: attachments, count: attachments.length });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attachments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/attachments/holding/:holdingId
router.get('/holding/:holdingId', async (req: Request<{ holdingId: string }>, res: Response) => {
  try {
    const { holdingId } = req.params;
    const attachments = await getAttachmentsByHolding(holdingId);
    res.json({ success: true, data: attachments, count: attachments.length });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attachments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/attachments/:id
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const attachment = await getAttachmentById(id);

    if (!attachment) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Attachment not found' });
      return;
    }

    res.json({ success: true, data: attachment });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attachment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/attachments/:id/url
router.get('/:id/url', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const expiresIn = req.query.expiresIn ? parseInt(req.query.expiresIn as string, 10) : 3600;

    const signedUrl = await getSignedUrl(id, expiresIn);
    res.json({ success: true, data: { signedUrl, expiresIn } });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signed URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/attachments/:id/download
router.get('/:id/download', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { data, attachment } = await downloadFile(id);

    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName || 'download'}"`);
    res.setHeader('Content-Length', data.length);
    res.send(data);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PATCH /api/attachments/:id
router.patch('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { attachmentType, attachmentName, description } = req.body;

    const attachment = await updateAttachmentMetadata(id, { attachmentType, attachmentName, description });
    res.json({ success: true, data: attachment });
  } catch (error) {
    console.error('Error updating attachment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update attachment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/attachments/:id
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await deleteAttachment(id);
    res.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attachment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/attachments/party/:partyId
router.delete('/party/:partyId', async (req: Request<{ partyId: string }>, res: Response) => {
  try {
    const { partyId } = req.params;
    const deletedCount = await deleteAttachmentsByParty(partyId);
    res.json({ success: true, message: `Deleted ${deletedCount} attachment(s)`, deletedCount });
  } catch (error) {
    console.error('Error deleting attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attachments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/attachments/holding/:holdingId
router.delete('/holding/:holdingId', async (req: Request<{ holdingId: string }>, res: Response) => {
  try {
    const { holdingId } = req.params;
    const deletedCount = await deleteAttachmentsByHolding(holdingId);
    res.json({ success: true, message: `Deleted ${deletedCount} attachment(s)`, deletedCount });
  } catch (error) {
    console.error('Error deleting attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attachments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Error handler for multer
router.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, error: 'File too large', message: 'File size exceeds maximum allowed size' });
      return;
    }
    res.status(400).json({ success: false, error: 'Upload error', message: err.message });
    return;
  }
  
  if (err) {
    res.status(400).json({ success: false, error: 'Upload error', message: err.message });
    return;
  }
  
  next();
});

export default router;
