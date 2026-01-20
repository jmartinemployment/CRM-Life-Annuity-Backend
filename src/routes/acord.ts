// =============================================================================
// ACORD XML API Routes
// Import and Export ACORD TXLife 2.20.01 XML
// =============================================================================

import { Router, Request, Response } from 'express';
import { importAcordXml, exportAcordXml } from '../services/acordService';

const router = Router();

// =============================================================================
// Import Endpoints
// =============================================================================

/**
 * POST /api/acord/import
 * Import ACORD TXLife XML into the database
 */
router.post('/import', async (req: Request, res: Response): Promise<void> => {
  try {
    let xmlContent: string;
    
    if (typeof req.body === 'string') {
      xmlContent = req.body;
    } else if (req.body.xml) {
      xmlContent = req.body.xml;
    } else if (Buffer.isBuffer(req.body)) {
      xmlContent = req.body.toString('utf-8');
    } else {
      res.status(400).json({
        success: false,
        error: 'Request body must contain XML content',
      });
      return;
    }

    if (!xmlContent || xmlContent.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'XML content is required',
      });
      return;
    }

    const user = (req as any).user;
    const options = {
      updateExisting: req.query.updateExisting === 'true',
      validateOnly: req.query.validateOnly === 'true',
      userId: user?.id,
    };

    const result = await importAcordXml(xmlContent, options);

    if (result.success) {
      res.status(options.validateOnly ? 200 : 201).json({
        success: true,
        message: options.validateOnly ? 'XML validated successfully' : 'ACORD XML imported successfully',
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Import failed with errors',
        data: result,
      });
    }
  } catch (error) {
    console.error('ACORD import error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/acord/validate
 * Validate ACORD TXLife XML without importing
 */
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    let xmlContent: string;
    
    if (typeof req.body === 'string') {
      xmlContent = req.body;
    } else if (req.body.xml) {
      xmlContent = req.body.xml;
    } else if (Buffer.isBuffer(req.body)) {
      xmlContent = req.body.toString('utf-8');
    } else {
      res.status(400).json({
        success: false,
        error: 'Request body must contain XML content',
      });
      return;
    }

    const result = await importAcordXml(xmlContent, { validateOnly: true });

    res.json({
      success: result.success,
      message: result.success ? 'XML is valid ACORD TXLife format' : 'Validation failed',
      data: { valid: result.success, summary: result.summary },
    });
  } catch (error) {
    console.error('ACORD validation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// =============================================================================
// Export Endpoints
// =============================================================================

/**
 * GET /api/acord/export
 * Export all data to ACORD TXLife XML
 */
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const options = {
      includeParties: req.query.includeParties !== 'false',
      includeHoldings: req.query.includeHoldings !== 'false',
      includeRelations: req.query.includeRelations !== 'false',
      vendorName: req.query.vendorName as string | undefined,
      appName: req.query.appName as string | undefined,
      appVersion: req.query.appVersion as string | undefined,
    };

    const result = await exportAcordXml(options);

    if (result.success && result.xml) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="acord-export-${Date.now()}.xml"`);
      res.send(result.xml);
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Export failed',
      });
    }
  } catch (error) {
    console.error('ACORD export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/acord/export/party/:partyId
 * Export a specific party and related data to ACORD XML
 */
router.get('/export/party/:partyId', async (req: Request<{ partyId: string }>, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params;

    const result = await exportAcordXml({
      partyIds: [partyId],
      includeParties: true,
      includeHoldings: true,
      includeRelations: true,
    });

    if (result.success && result.xml) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="party-${partyId}.xml"`);
      res.send(result.xml);
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Export failed',
      });
    }
  } catch (error) {
    console.error('ACORD export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/acord/export/holding/:holdingId
 * Export a specific holding/policy to ACORD XML
 */
router.get('/export/holding/:holdingId', async (req: Request<{ holdingId: string }>, res: Response): Promise<void> => {
  try {
    const { holdingId } = req.params;

    const result = await exportAcordXml({
      holdingIds: [holdingId],
      includeParties: true,
      includeHoldings: true,
      includeRelations: true,
    });

    if (result.success && result.xml) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="holding-${holdingId}.xml"`);
      res.send(result.xml);
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Export failed',
      });
    }
  } catch (error) {
    console.error('ACORD export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/acord/export/bulk
 * Export multiple parties/holdings to ACORD XML
 */
router.post('/export/bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyIds, holdingIds, includeParties, includeHoldings, includeRelations } = req.body;

    if ((!partyIds || partyIds.length === 0) && (!holdingIds || holdingIds.length === 0)) {
      res.status(400).json({
        success: false,
        error: 'At least one partyId or holdingId must be provided',
      });
      return;
    }

    const result = await exportAcordXml({
      partyIds,
      holdingIds,
      includeParties: includeParties !== false,
      includeHoldings: includeHoldings !== false,
      includeRelations: includeRelations !== false,
    });

    if (result.success && result.xml) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="acord-bulk-export-${Date.now()}.xml"`);
      res.send(result.xml);
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Export failed',
      });
    }
  } catch (error) {
    console.error('ACORD export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/acord/export/json
 * Export data as JSON (for preview before XML export)
 */
router.get('/export/json', async (req: Request, res: Response): Promise<void> => {
  try {
    const options = {
      includeParties: req.query.includeParties !== 'false',
      includeHoldings: req.query.includeHoldings !== 'false',
      includeRelations: req.query.includeRelations !== 'false',
      partyIds: req.query.partyIds ? (req.query.partyIds as string).split(',') : undefined,
      holdingIds: req.query.holdingIds ? (req.query.holdingIds as string).split(',') : undefined,
    };

    const result = await exportAcordXml(options);

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      summary: result.summary,
      error: result.error,
    });
  } catch (error) {
    console.error('ACORD export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
