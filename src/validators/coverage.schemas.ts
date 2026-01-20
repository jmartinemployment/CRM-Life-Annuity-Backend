import { z } from 'zod';
import { CoverageIndicatorCode, CoverageStatus, GenderCode } from '@prisma/client';
import {
  cuidSchema,
  optionalCuidSchema,
  optionalDateStringSchema,
  optionalNonEmptyStringSchema,
  optionalPositiveDecimalSchema,
  optionalInterestRateSchema,
  paginationQuerySchema,
  createEnumSchema,
  createOptionalEnumSchema,
} from './common.schemas';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

const coverageIndicatorCodeSchema = createEnumSchema(CoverageIndicatorCode, 'indicatorCode');
const optionalCoverageIndicatorCodeSchema = createOptionalEnumSchema(CoverageIndicatorCode, 'indicatorCode');
const coverageStatusSchema = createEnumSchema(CoverageStatus, 'lifeCovStatus');
const optionalCoverageStatusSchema = createOptionalEnumSchema(CoverageStatus, 'lifeCovStatus');
const optionalGenderCodeSchema = createOptionalEnumSchema(GenderCode, 'issueGender');

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

/**
 * Life participant schema
 */
export const lifeParticipantSchema = z.object({
  partyId: cuidSchema,
  participantType: optionalNonEmptyStringSchema,
  issueAge: z.number().int().min(0).max(120).optional(),
  issueGender: optionalGenderCodeSchema,
  underwritingClass: optionalNonEmptyStringSchema,
  tobaccoClass: optionalNonEmptyStringSchema,
  tableRating: optionalNonEmptyStringSchema,
  flatExtraAmt: optionalPositiveDecimalSchema,
  flatExtraEndDate: optionalDateStringSchema,
  permFlatExtraAmt: optionalPositiveDecimalSchema,
});

/**
 * Update life participant schema (partyId optional)
 */
export const updateLifeParticipantSchema = z.object({
  partyId: optionalCuidSchema,
  participantType: optionalNonEmptyStringSchema,
  issueAge: z.number().int().min(0).max(120).optional(),
  issueGender: optionalGenderCodeSchema,
  underwritingClass: optionalNonEmptyStringSchema,
  tobaccoClass: optionalNonEmptyStringSchema,
  tableRating: optionalNonEmptyStringSchema,
  flatExtraAmt: optionalPositiveDecimalSchema,
  flatExtraEndDate: optionalDateStringSchema,
  permFlatExtraAmt: optionalPositiveDecimalSchema,
});

/**
 * Coverage option schema
 */
export const covOptionSchema = z.object({
  optionType: optionalNonEmptyStringSchema,
  optionCode: optionalNonEmptyStringSchema,
  optionName: optionalNonEmptyStringSchema,
  optionAmt: optionalPositiveDecimalSchema,
  optionPremAmt: optionalPositiveDecimalSchema,
  effDate: optionalDateStringSchema,
  termDate: optionalDateStringSchema,
  isActive: z.boolean().default(true),
});

/**
 * Update coverage option schema
 */
export const updateCovOptionSchema = z.object({
  optionType: optionalNonEmptyStringSchema,
  optionCode: optionalNonEmptyStringSchema,
  optionName: optionalNonEmptyStringSchema,
  optionAmt: optionalPositiveDecimalSchema,
  optionPremAmt: optionalPositiveDecimalSchema,
  effDate: optionalDateStringSchema,
  termDate: optionalDateStringSchema,
  isActive: z.boolean().optional(),
});

// ============================================================================
// COVERAGE SCHEMAS
// ============================================================================

/**
 * Create coverage request body schema
 */
export const createCoverageSchema = z.object({
  policyId: cuidSchema,
  
  // Identification
  coverageKey: optionalNonEmptyStringSchema,
  covNumber: optionalNonEmptyStringSchema,
  productCode: optionalNonEmptyStringSchema,
  planName: optionalNonEmptyStringSchema,
  
  // Type
  indicatorCode: coverageIndicatorCodeSchema.default('BASE'),
  lifeCovTypeCode: optionalNonEmptyStringSchema,
  lifeCovStatus: coverageStatusSchema.default('ACTIVE'),
  
  // Amounts
  currentAmt: optionalPositiveDecimalSchema,
  deathBenefitAmt: optionalPositiveDecimalSchema,
  initCovAmt: optionalPositiveDecimalSchema,
  cashValue: optionalPositiveDecimalSchema,
  
  // Premium
  modalPremAmt: optionalPositiveDecimalSchema,
  annualPremAmt: optionalPositiveDecimalSchema,
  targetPremAmt: optionalPositiveDecimalSchema,
  
  // Dates
  effDate: optionalDateStringSchema,
  termDate: optionalDateStringSchema,
  paidToDate: optionalDateStringSchema,
  
  // Duration
  duration: z.number().int().positive().optional(),
  benefitPeriod: z.number().int().positive().optional(),
  
  // Underwriting
  issueGender: optionalGenderCodeSchema,
  equivalentAge: z.number().int().min(0).max(120).optional(),
  guarIntRate: optionalInterestRateSchema,
  
  // Nested arrays
  lifeParticipants: z.array(lifeParticipantSchema).optional(),
  covOptions: z.array(covOptionSchema).optional(),
});

/**
 * Update coverage request body schema
 */
export const updateCoverageSchema = z.object({
  // Identification
  coverageKey: optionalNonEmptyStringSchema,
  covNumber: optionalNonEmptyStringSchema,
  productCode: optionalNonEmptyStringSchema,
  planName: optionalNonEmptyStringSchema,
  
  // Type
  indicatorCode: optionalCoverageIndicatorCodeSchema,
  lifeCovTypeCode: optionalNonEmptyStringSchema,
  lifeCovStatus: optionalCoverageStatusSchema,
  
  // Amounts
  currentAmt: optionalPositiveDecimalSchema,
  deathBenefitAmt: optionalPositiveDecimalSchema,
  initCovAmt: optionalPositiveDecimalSchema,
  cashValue: optionalPositiveDecimalSchema,
  
  // Premium
  modalPremAmt: optionalPositiveDecimalSchema,
  annualPremAmt: optionalPositiveDecimalSchema,
  targetPremAmt: optionalPositiveDecimalSchema,
  
  // Dates
  effDate: optionalDateStringSchema,
  termDate: optionalDateStringSchema,
  paidToDate: optionalDateStringSchema,
  
  // Duration
  duration: z.number().int().positive().optional(),
  benefitPeriod: z.number().int().positive().optional(),
  
  // Underwriting
  issueGender: optionalGenderCodeSchema,
  equivalentAge: z.number().int().min(0).max(120).optional(),
  guarIntRate: optionalInterestRateSchema,
  
  // Nested arrays (if provided, replaces existing)
  lifeParticipants: z.array(lifeParticipantSchema).optional(),
  covOptions: z.array(covOptionSchema).optional(),
});

/**
 * Coverage list query parameters
 */
export const coverageListQuerySchema = paginationQuerySchema.extend({
  policyId: optionalCuidSchema,
  indicatorCode: optionalCoverageIndicatorCodeSchema,
  lifeCovStatus: optionalCoverageStatusSchema,
  lifeCovTypeCode: optionalNonEmptyStringSchema,
});

/**
 * Terminate coverage option request body
 */
export const terminateCovOptionSchema = z.object({
  termDate: optionalDateStringSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

/**
 * Policy ID parameter
 */
export const policyIdParamSchema = z.object({
  policyId: cuidSchema,
});

/**
 * Coverage ID parameter
 */
export const coverageIdParamSchema = z.object({
  id: cuidSchema,
});

/**
 * Participant ID parameter
 */
export const participantIdParamSchema = z.object({
  participantId: cuidSchema,
});

/**
 * Option ID parameter
 */
export const optionIdParamSchema = z.object({
  optionId: cuidSchema,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateCoverageInput = z.infer<typeof createCoverageSchema>;
export type UpdateCoverageInput = z.infer<typeof updateCoverageSchema>;
export type CoverageListQuery = z.infer<typeof coverageListQuerySchema>;
export type CreateLifeParticipantInput = z.infer<typeof lifeParticipantSchema>;
export type UpdateLifeParticipantInput = z.infer<typeof updateLifeParticipantSchema>;
export type CreateCovOptionInput = z.infer<typeof covOptionSchema>;
export type UpdateCovOptionInput = z.infer<typeof updateCovOptionSchema>;
export type TerminateCovOptionInput = z.infer<typeof terminateCovOptionSchema>;
