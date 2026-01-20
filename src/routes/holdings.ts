import { Router, Request, Response, NextFunction } from 'express';
import holdingService from '../services/holdingService';
import { validate } from '../validators';
import {
  createHoldingSchema,
  updateHoldingSchema,
  holdingListQuerySchema,
} from '../validators/holding.schemas';
import { idParamSchema } from '../validators/common.schemas';

const router = Router();

// GET /api/holdings - List holdings with filters and pagination
router.get(
  '/',
  validate(holdingListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;
      const result = await holdingService.findMany(filters, { page, limit, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/holdings/:id - Get single holding by ID
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const holding = await holdingService.findById(id);

      if (!holding) {
        res.status(404).json({ success: false, error: 'Holding not found' });
        return;
      }

      res.json({ success: true, data: holding });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/holdings - Create a new holding
router.post(
  '/',
  validate(createHoldingSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const holding = await holdingService.create(req.body);
      res.status(201).json({ success: true, data: holding, message: 'Holding created successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/holdings/:id - Update a holding
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateHoldingSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await holdingService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Holding not found' });
        return;
      }

      const holding = await holdingService.update(id, req.body);
      res.json({ success: true, data: holding, message: 'Holding updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/holdings/:id - Delete a holding
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await holdingService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Holding not found' });
        return;
      }

      await holdingService.delete(id);
      res.json({ success: true, message: 'Holding deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
