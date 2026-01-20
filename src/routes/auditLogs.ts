import { Router, Request, Response } from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getEntityAuditHistory,
  getAuditSummary,
  getUserAuditHistory,
  getDistinctEntityTypes,
  getDistinctActions,
  purgeOldAuditLogs,
} from '../services/auditLogService';

const router = Router();

// GET /api/audit-logs - List audit logs with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      entityType, entityId, action, userId, startDate, endDate,
      search, page, limit, sortBy, sortOrder,
    } = req.query;

    const result = await getAuditLogs({
      entityType: entityType as string | undefined,
      entityId: entityId as string | undefined,
      action: action as string | undefined,
      userId: userId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as 'createdAt' | 'entityType' | 'action' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/audit-logs/summary - Get summary grouped by entity type
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await getAuditSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/audit-logs/filters - Get available filter options
router.get('/filters', async (_req: Request, res: Response) => {
  try {
    const [entityTypes, actions] = await Promise.all([
      getDistinctEntityTypes(),
      getDistinctActions(),
    ]);
    res.json({ success: true, data: { entityTypes, actions } });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/audit-logs/entity/:entityType/:entityId - Get history for specific entity
router.get('/entity/:entityType/:entityId', async (req: Request<{ entityType: string; entityId: string }>, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const history = await getEntityAuditHistory(entityType, entityId);
    res.json({ success: true, data: history, count: history.length });
  } catch (error) {
    console.error('Error fetching entity audit history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entity audit history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/audit-logs/user/:userId - Get audit history for a specific user
router.get('/user/:userId', async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const history = await getUserAuditHistory(userId, limit);
    res.json({ success: true, data: history, count: history.length });
  } catch (error) {
    console.error('Error fetching user audit history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user audit history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/audit-logs/:id - Get a single audit log entry
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const log = await getAuditLogById(id);

    if (!log) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Audit log entry not found',
      });
      return;
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/audit-logs/purge - Purge old audit logs (ADMIN only)
router.delete('/purge', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can purge audit logs',
      });
      return;
    }

    const daysToKeep = req.query.daysToKeep 
      ? parseInt(req.query.daysToKeep as string, 10) 
      : 365;

    if (daysToKeep < 30) {
      res.status(400).json({
        success: false,
        error: 'Invalid Parameter',
        message: 'daysToKeep must be at least 30 days',
      });
      return;
    }

    const deletedCount = await purgeOldAuditLogs(daysToKeep);
    res.json({
      success: true,
      message: `Purged ${deletedCount} audit log entries older than ${daysToKeep} days`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error purging audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purge audit logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
