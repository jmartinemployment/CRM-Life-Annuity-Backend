import { Router, Request, Response, NextFunction } from 'express';
import relationService from '../services/relationService';
import { validate } from '../validators';
import {
  createRelationSchema,
  updateRelationSchema,
  relationListQuerySchema,
  holdingsByPartyRoleQuerySchema,
  holdingIdParamSchema,
  partyIdParamSchema,
} from '../validators/relation.schemas';
import { idParamSchema } from '../validators/common.schemas';

const router = Router();

// GET /api/relations - List relations with filters and pagination
router.get(
  '/',
  validate(relationListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;
      const result = await relationService.findMany(filters, { page, limit, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId - Get all relations for a holding
router.get(
  '/holding/:holdingId',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const relations = await relationService.findByHolding(holdingId);
      res.json({ success: true, data: relations });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId/beneficiaries - Get beneficiaries for a holding
router.get(
  '/holding/:holdingId/beneficiaries',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const beneficiaries = await relationService.getBeneficiaries(holdingId);
      res.json({ success: true, data: beneficiaries });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId/beneficiaries/validate - Validate beneficiary percentages
router.get(
  '/holding/:holdingId/beneficiaries/validate',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const validation = await relationService.validateBeneficiaryPercentages(holdingId);
      res.json({ success: true, data: validation });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId/owners - Get owners for a holding
router.get(
  '/holding/:holdingId/owners',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const owners = await relationService.getOwners(holdingId);
      res.json({ success: true, data: owners });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId/insureds - Get insureds for a holding
router.get(
  '/holding/:holdingId/insureds',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const insureds = await relationService.getInsureds(holdingId);
      res.json({ success: true, data: insureds });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/holding/:holdingId/producers - Get agents/producers for a holding
router.get(
  '/holding/:holdingId/producers',
  validate(holdingIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { holdingId } = req.params as { holdingId: string };
      const producers = await relationService.getProducers(holdingId);
      res.json({ success: true, data: producers });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/party/:partyId - Get all relations for a party
router.get(
  '/party/:partyId',
  validate(partyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params as { partyId: string };
      const relations = await relationService.findByParty(partyId);
      res.json({ success: true, data: relations });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/party/:partyId/family - Get family relations for a party
router.get(
  '/party/:partyId/family',
  validate(partyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params as { partyId: string };
      const familyRelations = await relationService.getFamilyRelations(partyId);
      res.json({ success: true, data: familyRelations });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/party/:partyId/holdings - Get holdings where party has a specific role
router.get(
  '/party/:partyId/holdings',
  validate(partyIdParamSchema, 'params'),
  validate(holdingsByPartyRoleQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params as { partyId: string };
      const { role } = req.query as any;
      const holdings = await relationService.findHoldingsByPartyRole(partyId, role);
      res.json({ success: true, data: holdings });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/relations/:id - Get single relation by ID
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const relation = await relationService.findById(id);

      if (!relation) {
        res.status(404).json({ success: false, error: 'Relation not found' });
        return;
      }

      res.json({ success: true, data: relation });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/relations - Create a new relation
router.post(
  '/',
  validate(createRelationSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const relation = await relationService.create(req.body);
      res.status(201).json({ success: true, data: relation, message: 'Relation created successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ success: false, error: error.message });
          return;
        }
      }
      next(error);
    }
  }
);

// PUT /api/relations/:id - Update a relation
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateRelationSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await relationService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Relation not found' });
        return;
      }

      const relation = await relationService.update(id, req.body);
      res.json({ success: true, data: relation, message: 'Relation updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/relations/:id - Delete a relation
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await relationService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Relation not found' });
        return;
      }

      await relationService.delete(id);
      res.json({ success: true, message: 'Relation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
