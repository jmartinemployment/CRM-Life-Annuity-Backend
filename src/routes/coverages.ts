import { Router, Request, Response, NextFunction } from 'express';
import coverageService from '../services/coverageService';
import { validate } from '../validators';
import {
  createCoverageSchema,
  updateCoverageSchema,
  coverageListQuerySchema,
  lifeParticipantSchema,
  updateLifeParticipantSchema,
  covOptionSchema,
  updateCovOptionSchema,
  terminateCovOptionSchema,
  policyIdParamSchema,
  participantIdParamSchema,
  optionIdParamSchema,
} from '../validators/coverage.schemas';
import { idParamSchema } from '../validators/common.schemas';

const router = Router();

// =========================================================================
// COVERAGE ROUTES
// =========================================================================

// GET /api/coverages - List coverages with filters and pagination
router.get(
  '/',
  validate(coverageListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;
      const result = await coverageService.findMany(filters, { page, limit, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/coverages/policy/:policyId - Get all coverages for a policy
router.get(
  '/policy/:policyId',
  validate(policyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.params as { policyId: string };
      const coverages = await coverageService.findByPolicy(policyId);
      res.json({ success: true, data: coverages });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/coverages/policy/:policyId/base - Get base coverage for a policy
router.get(
  '/policy/:policyId/base',
  validate(policyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.params as { policyId: string };
      const baseCoverage = await coverageService.getBaseCoverage(policyId);
      
      if (!baseCoverage) {
        res.status(404).json({ success: false, error: 'Base coverage not found' });
        return;
      }

      res.json({ success: true, data: baseCoverage });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/coverages/policy/:policyId/riders - Get riders for a policy
router.get(
  '/policy/:policyId/riders',
  validate(policyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.params as { policyId: string };
      const riders = await coverageService.getRiders(policyId);
      res.json({ success: true, data: riders });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/coverages/policy/:policyId/summary - Get coverage summary for a policy
router.get(
  '/policy/:policyId/summary',
  validate(policyIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.params as { policyId: string };
      const summary = await coverageService.getPolicyCoverageSummary(policyId);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/coverages/:id - Get single coverage by ID
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const coverage = await coverageService.findById(id);

      if (!coverage) {
        res.status(404).json({ success: false, error: 'Coverage not found' });
        return;
      }

      res.json({ success: true, data: coverage });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/coverages - Create a new coverage
router.post(
  '/',
  validate(createCoverageSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coverage = await coverageService.create(req.body);
      res.status(201).json({ success: true, data: coverage, message: 'Coverage created successfully' });
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

// PUT /api/coverages/:id - Update a coverage
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateCoverageSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await coverageService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Coverage not found' });
        return;
      }

      const coverage = await coverageService.update(id, req.body);
      res.json({ success: true, data: coverage, message: 'Coverage updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/coverages/:id - Delete a coverage
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const existing = await coverageService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Coverage not found' });
        return;
      }

      await coverageService.delete(id);
      res.json({ success: true, message: 'Coverage deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// =========================================================================
// LIFE PARTICIPANT ROUTES
// =========================================================================

// POST /api/coverages/:id/participants - Add a life participant to a coverage
router.post(
  '/:id/participants',
  validate(idParamSchema, 'params'),
  validate(lifeParticipantSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const coverage = await coverageService.addLifeParticipant(id, req.body);
      res.status(201).json({ success: true, data: coverage, message: 'Life participant added successfully' });
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

// PUT /api/coverages/participants/:participantId - Update a life participant
router.put(
  '/participants/:participantId',
  validate(participantIdParamSchema, 'params'),
  validate(updateLifeParticipantSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { participantId } = req.params as { participantId: string };
      await coverageService.updateLifeParticipant(participantId, req.body);
      res.json({ success: true, message: 'Life participant updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/coverages/participants/:participantId - Remove a life participant
router.delete(
  '/participants/:participantId',
  validate(participantIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { participantId } = req.params as { participantId: string };
      await coverageService.removeLifeParticipant(participantId);
      res.json({ success: true, message: 'Life participant removed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// =========================================================================
// COVERAGE OPTION ROUTES
// =========================================================================

// POST /api/coverages/:id/options - Add a coverage option to a coverage
router.post(
  '/:id/options',
  validate(idParamSchema, 'params'),
  validate(covOptionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const coverage = await coverageService.addCovOption(id, req.body);
      res.status(201).json({ success: true, data: coverage, message: 'Coverage option added successfully' });
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

// PUT /api/coverages/options/:optionId - Update a coverage option
router.put(
  '/options/:optionId',
  validate(optionIdParamSchema, 'params'),
  validate(updateCovOptionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { optionId } = req.params as { optionId: string };
      await coverageService.updateCovOption(optionId, req.body);
      res.json({ success: true, message: 'Coverage option updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/coverages/options/:optionId/terminate - Terminate a coverage option
router.post(
  '/options/:optionId/terminate',
  validate(optionIdParamSchema, 'params'),
  validate(terminateCovOptionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { optionId } = req.params as { optionId: string };
      const { termDate } = req.body;
      await coverageService.terminateCovOption(optionId, termDate);
      res.json({ success: true, message: 'Coverage option terminated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/coverages/options/:optionId - Remove a coverage option
router.delete(
  '/options/:optionId',
  validate(optionIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { optionId } = req.params as { optionId: string };
      await coverageService.removeCovOption(optionId);
      res.json({ success: true, message: 'Coverage option removed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
