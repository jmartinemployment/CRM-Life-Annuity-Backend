import { Router, Request, Response, NextFunction } from 'express';
import partyService from '../services/partyService';
import { validate } from '../validators';
import {
  createPartySchema,
  updatePartySchema,
  partyListQuerySchema,
  partySearchQuerySchema,
} from '../validators/party.schemas';
import { idParamSchema } from '../validators/common.schemas';

const router = Router();

// GET /api/parties - List parties with filters and pagination
router.get(
  '/',
  validate(partyListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;
      const result = await partyService.findMany(filters, { page, limit, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/parties/search - Quick search by name
router.get(
  '/search',
  validate(partySearchQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit } = req.query as any;
      const parties = await partyService.search(q, limit);
      res.json({ success: true, data: parties });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/parties/:id - Get single party by ID
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const party = await partyService.findById(id);

      if (!party) {
        res.status(404).json({ success: false, error: 'Party not found' });
        return;
      }

      res.json({ success: true, data: party });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/parties - Create a new party
router.post(
  '/',
  validate(createPartySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const party = await partyService.create(req.body);
      res.status(201).json({ success: true, data: party, message: 'Party created successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/parties/:id - Update a party
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updatePartySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await partyService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Party not found' });
        return;
      }

      const party = await partyService.update(id, req.body);
      res.json({ success: true, data: party, message: 'Party updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/parties/:id - Delete a party
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await partyService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Party not found' });
        return;
      }

      await partyService.delete(id);
      res.json({ success: true, message: 'Party deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
