import { Router, Request, Response, NextFunction } from 'express';
import activityService from '../services/activityService';
import { validate } from '../validators';
import {
  createActivitySchema,
  updateActivitySchema,
  completeActivitySchema,
  activityListQuerySchema,
  upcomingActivitiesQuerySchema,
  overdueActivitiesQuerySchema,
  activitiesByEntityQuerySchema,
} from '../validators/activity.schemas';
import { idParamSchema, cuidSchema } from '../validators/common.schemas';
import { z } from 'zod';

const router = Router();

// Param schemas for entity routes
const partyIdParamSchema = z.object({ partyId: cuidSchema });
const holdingIdParamSchema = z.object({ holdingId: cuidSchema });

// GET /api/activities - List activities with filters and pagination
router.get(
  '/',
  validate(activityListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;
      const result = await activityService.findMany(filters, { page, limit, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/upcoming - Get upcoming activities
router.get(
  '/upcoming',
  validate(upcomingActivitiesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days, assignedTo } = req.query as any;
      const activities = await activityService.getUpcoming(days, assignedTo);
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/overdue - Get overdue activities
router.get(
  '/overdue',
  validate(overdueActivitiesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assignedTo } = req.query as any;
      const activities = await activityService.getOverdue(assignedTo);
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/party/:partyId - Get activities for a party
router.get(
  '/party/:partyId',
  validate(partyIdParamSchema, 'params'),
  validate(activitiesByEntityQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params as { partyId: string };
      const { limit } = req.query as any;
      const activities = await activityService.findByParty(partyId, limit);
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/holding/:holdingId - Get activities for a holding
router.get(
  '/holding/:holdingId',
  validate(holdingIdParamSchema, 'params'),
  validate(activitiesByEntityQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const { limit } = req.query as any;
      const activities = await activityService.findByHolding(holdingId, limit);
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/activities/:id - Get single activity by ID
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const activity = await activityService.findById(id);

      if (!activity) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }

      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/activities - Create a new activity
router.post(
  '/',
  validate(createActivitySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.create(req.body);
      res.status(201).json({ success: true, data: activity, message: 'Activity created successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/activities/:id - Update an activity
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateActivitySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await activityService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }

      const activity = await activityService.update(id, req.body);
      res.json({ success: true, data: activity, message: 'Activity updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/activities/:id/complete - Mark activity as completed
router.post(
  '/:id/complete',
  validate(idParamSchema, 'params'),
  validate(completeActivitySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const { completedBy } = req.body;

      const existing = await activityService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }

      const activity = await activityService.complete(id, completedBy);
      res.json({ success: true, data: activity, message: 'Activity marked as completed' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/activities/:id - Delete an activity
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await activityService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }

      await activityService.delete(id);
      res.json({ success: true, message: 'Activity deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
