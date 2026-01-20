import { createClient, SupabaseClient } from '@supabase/supabase-js';
import prisma from '../utils/prisma';
import { randomUUID } from 'crypto';
import path from 'path';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024;
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 
  'application/pdf,image/jpeg,image/png,image/gif').split(',');
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'attachments';

// Matches existing Prisma Attachment model
export interface AttachmentData {
  id: string;
  partyId: string | null;
  holdingId: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  description: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  storageUrl: string | null;
  creationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadInput {
  partyId?: string;
  holdingId?: string;
  file: Buffer;
  fileName: string;
  fileType: string;
  attachmentType?: string;
  attachmentName?: string;
  description?: string;
}

export interface UploadResult {
  attachment: AttachmentData;
  signedUrl: string;
}

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

export function isAllowedFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };
  return mimeToExt[mimeType] || 'bin';
}

function generateStoragePath(partyId: string | undefined, holdingId: string | undefined, fileName: string, mimeType: string): string {
  const ext = getExtensionFromMimeType(mimeType);
  const uuid = randomUUID();
  const sanitizedName = path.parse(fileName).name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  const folder = partyId ? `party/${partyId}` : holdingId ? `holding/${holdingId}` : 'general';
  return `${folder}/${uuid}-${sanitizedName}.${ext}`;
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  const { partyId, holdingId, file, fileName, fileType, attachmentType, attachmentName, description } = input;

  if (!isAllowedFileType(fileType)) {
    throw new Error(`File type '${fileType}' is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
  }

  if (!isAllowedFileSize(file.length)) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
  }

  if (!partyId && !holdingId) {
    throw new Error('Either partyId or holdingId must be provided');
  }

  const client = getSupabaseClient();
  const storagePath = generateStoragePath(partyId, holdingId, fileName, fileType);

  const { error: uploadError } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { contentType: fileType, upsert: false });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: signedUrlData, error: signedUrlError } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (signedUrlError) {
    console.error('Failed to generate signed URL:', signedUrlError);
  }

  const attachment = await prisma.attachment.create({
    data: {
      partyId: partyId || null,
      holdingId: holdingId || null,
      attachmentType: attachmentType || null,
      attachmentName: attachmentName || fileName,
      description: description || null,
      fileName,
      mimeType: fileType,
      fileSize: file.length,
      storageUrl: signedUrlData?.signedUrl || storagePath, // Store path if no signed URL
      creationDate: new Date(),
    },
  });

  return {
    attachment: attachment as AttachmentData,
    signedUrl: signedUrlData?.signedUrl || '',
  };
}

export async function getAttachmentById(id: string): Promise<AttachmentData | null> {
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  return attachment as AttachmentData | null;
}

export async function getAttachmentsByParty(partyId: string): Promise<AttachmentData[]> {
  const attachments = await prisma.attachment.findMany({
    where: { partyId },
    orderBy: { createdAt: 'desc' },
  });
  return attachments as AttachmentData[];
}

export async function getAttachmentsByHolding(holdingId: string): Promise<AttachmentData[]> {
  const attachments = await prisma.attachment.findMany({
    where: { holdingId },
    orderBy: { createdAt: 'desc' },
  });
  return attachments as AttachmentData[];
}

export async function getSignedUrl(attachmentId: string, expiresIn: number = 3600): Promise<string> {
  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  if (!attachment.storageUrl) {
    throw new Error('No storage URL for attachment');
  }

  // If storageUrl is already a signed URL or external URL, try to generate fresh one
  // Extract path from stored URL or use it directly as path
  const storagePath = attachment.storageUrl.includes('://') 
    ? attachment.storageUrl.split('/').slice(-2).join('/') // Extract last 2 parts as path
    : attachment.storageUrl;

  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  // Update stored URL
  await prisma.attachment.update({
    where: { id: attachmentId },
    data: { storageUrl: data.signedUrl },
  });

  return data.signedUrl;
}

export async function downloadFile(attachmentId: string): Promise<{ data: Buffer; attachment: AttachmentData }> {
  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  if (!attachment.storageUrl) {
    throw new Error('No storage URL for attachment');
  }

  const storagePath = attachment.storageUrl.includes('://') 
    ? attachment.storageUrl.split('/').slice(-2).join('/')
    : attachment.storageUrl;

  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return { data: buffer, attachment: attachment as AttachmentData };
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  if (attachment.storageUrl) {
    const storagePath = attachment.storageUrl.includes('://') 
      ? attachment.storageUrl.split('/').slice(-2).join('/')
      : attachment.storageUrl;

    const client = getSupabaseClient();
    const { error: storageError } = await client.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
    }
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });
}

export async function deleteAttachmentsByParty(partyId: string): Promise<number> {
  const attachments = await prisma.attachment.findMany({ where: { partyId } });

  if (attachments.length === 0) {
    return 0;
  }

  const client = getSupabaseClient();
  const storagePaths = attachments
    .filter(a => a.storageUrl)
    .map((a) => a.storageUrl!.includes('://') 
      ? a.storageUrl!.split('/').slice(-2).join('/')
      : a.storageUrl!);
  
  if (storagePaths.length > 0) {
    const { error: storageError } = await client.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
    }
  }

  const result = await prisma.attachment.deleteMany({ where: { partyId } });
  return result.count;
}

export async function deleteAttachmentsByHolding(holdingId: string): Promise<number> {
  const attachments = await prisma.attachment.findMany({ where: { holdingId } });

  if (attachments.length === 0) {
    return 0;
  }

  const client = getSupabaseClient();
  const storagePaths = attachments
    .filter(a => a.storageUrl)
    .map((a) => a.storageUrl!.includes('://') 
      ? a.storageUrl!.split('/').slice(-2).join('/')
      : a.storageUrl!);
  
  if (storagePaths.length > 0) {
    const { error: storageError } = await client.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
    }
  }

  const result = await prisma.attachment.deleteMany({ where: { holdingId } });
  return result.count;
}

export async function updateAttachmentMetadata(
  attachmentId: string,
  data: { attachmentType?: string; attachmentName?: string; description?: string }
): Promise<AttachmentData> {
  const attachment = await prisma.attachment.update({
    where: { id: attachmentId },
    data: {
      attachmentType: data.attachmentType,
      attachmentName: data.attachmentName,
      description: data.description,
    },
  });
  return attachment as AttachmentData;
}

export function getUploadConfig() {
  return {
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    maxFileSizeBytes: MAX_FILE_SIZE,
    allowedFileTypes: ALLOWED_FILE_TYPES,
    bucket: STORAGE_BUCKET,
  };
}

export async function listAttachments(
  page: number = 1,
  limit: number = 50,
  filters?: { partyId?: string; holdingId?: string; attachmentType?: string }
): Promise<{
  data: AttachmentData[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const where: any = {};

  if (filters?.partyId) where.partyId = filters.partyId;
  if (filters?.holdingId) where.holdingId = filters.holdingId;
  if (filters?.attachmentType) where.attachmentType = filters.attachmentType;

  const total = await prisma.attachment.count({ where });
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  const attachments = await prisma.attachment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: attachments as AttachmentData[],
    pagination: { page, limit, total, totalPages },
  };
}
