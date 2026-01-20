import { z } from 'zod';
import { RelationRoleCode, BeneficiaryDesignation } from '@prisma/client';
import {
  cuidSchema,
  optionalCuidSchema,
  optionalDateStringSchema,
  optionalNonEmptyStringSchema,
  optionalPercentageSchema,
  paginationQuerySchema,
  createEnumSchema,
  createOptionalEnumSchema,
} from './common.schemas';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

const relationRoleCodeSchema = createEnumSchema(RelationRoleCode, 'relationRoleCode');
const optionalRelationRoleCodeSchema = createOptionalEnumSchema(RelationRoleCode, 'relationRoleCode');
const optionalBeneficiaryDesignationSchema = createOptionalEnumSchema(BeneficiaryDesignation, 'beneficiaryDesignation');

// ============================================================================
// ROLE CATEGORY ENUM
// ============================================================================

const roleCategorySchema = z.enum(['POLICY', 'BENEFICIARY', 'PRODUCER', 'FAMILY']);
const optionalRoleCategorySchema = roleCategorySchema.optional();

// ============================================================================
// RELATION SCHEMAS
// ============================================================================

/**
 * Create relation request body schema
 */
export const createRelationSchema = z.object({
  // Origin (one must be provided)
  originatingPartyId: optionalCuidSchema,
  originatingHoldingId: optionalCuidSchema,
  
  // Related party (required)
  relatedPartyId: cuidSchema,
  
  // Role (required)
  relationRoleCode: relationRoleCodeSchema,
  relationDescription: optionalNonEmptyStringSchema,
  
  // Beneficiary fields
  interestPercent: optionalPercentageSchema,
  beneficiarySeqNum: z.number().int().positive().optional(),
  beneficiaryDesignation: optionalBeneficiaryDesignationSchema,
  irrevocableInd: z.boolean().optional(),
  
  // Producer fields
  volumeSharePct: optionalPercentageSchema,
  commScheduleCode: optionalNonEmptyStringSchema,
  
  // Validity period
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  
  // Order
  sequence: z.number().int().positive().optional(),
}).refine(
  (data) => {
    // At least one originating entity must be provided
    return !!(data.originatingPartyId || data.originatingHoldingId);
  },
  {
    message: 'Either originatingPartyId or originatingHoldingId is required',
    path: ['originatingPartyId'],
  }
);

/**
 * Update relation request body schema
 */
export const updateRelationSchema = z.object({
  // Origin (optional for updates)
  originatingPartyId: optionalCuidSchema,
  originatingHoldingId: optionalCuidSchema,
  
  // Related party
  relatedPartyId: optionalCuidSchema,
  
  // Role
  relationRoleCode: optionalRelationRoleCodeSchema,
  relationDescription: optionalNonEmptyStringSchema,
  
  // Beneficiary fields
  interestPercent: optionalPercentageSchema,
  beneficiarySeqNum: z.number().int().positive().optional(),
  beneficiaryDesignation: optionalBeneficiaryDesignationSchema,
  irrevocableInd: z.boolean().optional(),
  
  // Producer fields
  volumeSharePct: optionalPercentageSchema,
  commScheduleCode: optionalNonEmptyStringSchema,
  
  // Validity period
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  
  // Order
  sequence: z.number().int().positive().optional(),
});

/**
 * Relation list query parameters
 */
export const relationListQuerySchema = paginationQuerySchema.extend({
  originatingPartyId: optionalCuidSchema,
  originatingHoldingId: optionalCuidSchema,
  relatedPartyId: optionalCuidSchema,
  relationRoleCode: optionalRelationRoleCodeSchema,
  roleCategory: optionalRoleCategorySchema,
});

/**
 * Holdings by party role query parameters
 */
export const holdingsByPartyRoleQuerySchema = z.object({
  role: relationRoleCodeSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

/**
 * Holding ID parameter
 */
export const holdingIdParamSchema = z.object({
  holdingId: cuidSchema,
});

/**
 * Party ID parameter
 */
export const partyIdParamSchema = z.object({
  partyId: cuidSchema,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateRelationInput = z.infer<typeof createRelationSchema>;
export type UpdateRelationInput = z.infer<typeof updateRelationSchema>;
export type RelationListQuery = z.infer<typeof relationListQuerySchema>;
export type HoldingsByPartyRoleQuery = z.infer<typeof holdingsByPartyRoleQuerySchema>;
