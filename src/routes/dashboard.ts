import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validators';
import {
  getDashboardStats,
  getUpcomingRenewals,
  getUpcomingAnniversaries,
  getTaskSummary,
  getLeadPipeline,
  getRecentActivityFeed,
} from '../services/dashboardService';

const router = Router();

// Query schema for days parameter
const daysQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional().default(30),
});

// Query schema for limit parameter
const limitQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// =============================================================================
// DASHBOARD ENDPOINTS
// =============================================================================

// GET /api/dashboard/stats - Get summary statistics
router.get(
  '/stats',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await getDashboardStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/renewals - Get upcoming policy renewals
router.get(
  '/renewals',
  validate(daysQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.query as unknown as { days: number };
      const renewals = await getUpcomingRenewals(days);
      
      res.json({
        success: true,
        data: renewals,
        meta: {
          days,
          count: renewals.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/anniversaries - Get upcoming birthdays and policy anniversaries
router.get(
  '/anniversaries',
  validate(daysQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.query as unknown as { days: number };
      const anniversaries = await getUpcomingAnniversaries(days);
      
      // Separate by type for convenience
      const birthdays = anniversaries.filter((a) => a.type === 'birthday');
      const policyAnniversaries = anniversaries.filter((a) => a.type === 'policy_anniversary');
      
      res.json({
        success: true,
        data: {
          all: anniversaries,
          birthdays,
          policyAnniversaries,
        },
        meta: {
          days,
          totalCount: anniversaries.length,
          birthdayCount: birthdays.length,
          policyAnniversaryCount: policyAnniversaries.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/tasks - Get task summary by status, assignee, and type
router.get(
  '/tasks',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getTaskSummary();
      
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/pipeline - Get lead pipeline summary
router.get(
  '/pipeline',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pipeline = await getLeadPipeline();
      
      // Calculate totals
      const totalLeads = pipeline.reduce((sum, p) => sum + p.count, 0);
      const wonLeads = pipeline.find((p) => p.status === 'WON')?.count || 0;
      const lostLeads = pipeline.find((p) => p.status === 'LOST')?.count || 0;
      const activeLeads = totalLeads - wonLeads - lostLeads;
      
      res.json({
        success: true,
        data: {
          stages: pipeline,
          summary: {
            total: totalLeads,
            active: activeLeads,
            won: wonLeads,
            lost: lostLeads,
            conversionRate: totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 10000) / 100 : 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/activity-feed - Get recent activity feed
router.get(
  '/activity-feed',
  validate(limitQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query as unknown as { limit: number };
      const feed = await getRecentActivityFeed(limit);
      
      res.json({
        success: true,
        data: feed,
        meta: {
          limit,
          count: feed.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dashboard/overview - Get combined overview (stats + key metrics)
router.get(
  '/overview',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all dashboard data in parallel
      const [stats, renewals, anniversaries, tasks, pipeline, activityFeed] = await Promise.all([
        getDashboardStats(),
        getUpcomingRenewals(30), // Next 30 days
        getUpcomingAnniversaries(14), // Next 2 weeks
        getTaskSummary(),
        getLeadPipeline(),
        getRecentActivityFeed(10), // Last 10 activities
      ]);
      
      res.json({
        success: true,
        data: {
          stats,
          upcomingRenewals: {
            items: renewals.slice(0, 5), // Top 5
            totalCount: renewals.length,
          },
          upcomingAnniversaries: {
            items: anniversaries.slice(0, 5), // Top 5
            totalCount: anniversaries.length,
          },
          taskSummary: tasks,
          leadPipeline: pipeline,
          recentActivity: activityFeed,
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
