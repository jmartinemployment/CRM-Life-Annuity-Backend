import { z } from 'zod';
import {
  HoldingTypeCode,
  HoldingStatus,
  PolicyStatus,
  LineOfBusiness,
  ProductType,
  QualifiedPlanType,
  PaymentMode,
  PaymentMethod,
} from '@prisma/client';
import {
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

const holdingTypeCodeSchema = createEnumSchema(HoldingTypeCode, 'holdingTypeCode');
const optionalHoldingTypeCodeSchema = createOptionalEnumSchema(HoldingTypeCode, 'holdingTypeCode');
const holdingStatusSchema = createEnumSchema(HoldingStatus, 'holdingStatus');
const optionalHoldingStatusSchema = createOptionalEnumSchema(HoldingStatus, 'holdingStatus');
const optionalPolicyStatusSchema = createOptionalEnumSchema(PolicyStatus, 'policyStatus');
const optionalLineOfBusinessSchema = createOptionalEnumSchema(LineOfBusiness, 'lineOfBusiness');
const optionalProductTypeSchema = createOptionalEnumSchema(ProductType, 'productType');
const optionalQualifiedPlanTypeSchema = createOptionalEnumSchema(QualifiedPlanType, 'qualPlanType');
const optionalPaymentModeSchema = createOptionalEnumSchema(PaymentMode, 'paymentMode');
const optionalPaymentMethodSchema = createOptionalEnumSchema(PaymentMethod, 'paymentMethod');

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

/**
 * Life insurance details schema
 */
export const lifeSchema = z.object({
  qualPlanType: optionalQualifiedPlanTypeSchema,
  faceAmt: optionalPositiveDecimalSchema,
  deathBenefitAmt: optionalPositiveDecimalSchema,
  cashValueAmt: optionalPositiveDecimalSchema,
  netSurrValueAmt: optionalPositiveDecimalSchema,
  surrenderChargeAmt: optionalPositiveDecimalSchema,
  targetPremAmt: optionalPositiveDecimalSchema,
  minPremAmt: optionalPositiveDecimalSchema,
  currIntRate: optionalInterestRateSchema,
  guarIntRate: optionalInterestRateSchema,
  loanAmtATD: optionalPositiveDecimalSchema,
  currLoanIntRate: optionalInterestRateSchema,
  maxAvailableLoan: optionalPositiveDecimalSchema,
  divType: optionalNonEmptyStringSchema,
  lastDivAmt: optionalPositiveDecimalSchema,
  lastDivDate: optionalDateStringSchema,
});

/**
 * Annuity details schema
 */
export const annuitySchema = z.object({
  premType: optionalNonEmptyStringSchema,
  payoutType: optionalNonEmptyStringSchema,
  qualPlanType: optionalQualifiedPlanTypeSchema,
  sourceOfFunds: optionalNonEmptyStringSchema,
  surrenderValue: optionalPositiveDecimalSchema,
  surrenderCharge: optionalPositiveDecimalSchema,
  deathBenefitAmt: optionalPositiveDecimalSchema,
  guarIntRate: optionalInterestRateSchema,
  initDepositAmt: optionalPositiveDecimalSchema,
  initDepositDate: optionalDateStringSchema,
  totalDepositITD: optionalPositiveDecimalSchema,
  manPayoutDate: optionalDateStringSchema,
});

/**
 * Policy details schema
 */
export const policySchema = z.object({
  polNumber: z.string().min(1, 'Policy number is required').max(50),
  certificateNo: optionalNonEmptyStringSchema,
  lineOfBusiness: optionalLineOfBusinessSchema,
  productType: optionalProductTypeSchema,
  productCode: optionalNonEmptyStringSchema,
  planName: optionalNonEmptyStringSchema,
  carrierCode: optionalNonEmptyStringSchema,
  carrierPartyId: optionalCuidSchema,
  policyStatus: optionalPolicyStatusSchema,
  jurisdiction: optionalNonEmptyStringSchema,
  
  // Dates
  effDate: optionalDateStringSchema,
  issueDate: optionalDateStringSchema,
  termDate: optionalDateStringSchema,
  paidToDate: optionalDateStringSchema,
  renewalDate: optionalDateStringSchema,
  
  // Payment
  paymentMode: optionalPaymentModeSchema,
  paymentAmt: optionalPositiveDecimalSchema,
  annualPaymentAmt: optionalPositiveDecimalSchema,
  paymentMethod: optionalPaymentMethodSchema,
  paymentDraftDay: z.number().int().min(1).max(31).optional(),
  
  // Banking (for EFT)
  bankName: optionalNonEmptyStringSchema,
  bankAcctType: optionalNonEmptyStringSchema,
  
  // Tax
  qualPlanType: optionalQualifiedPlanTypeSchema,
  
  // Nested Life or Annuity details
  life: lifeSchema.optional(),
  annuity: annuitySchema.optional(),
});

// ============================================================================
// HOLDING SCHEMAS
// ============================================================================

/**
 * Create holding request body schema
 */
export const createHoldingSchema = z.object({
  holdingKey: optionalNonEmptyStringSchema,
  holdingTypeCode: holdingTypeCodeSchema.default('POLICY'),
  holdingStatus: holdingStatusSchema.default('PROPOSED'),
  holdingName: optionalNonEmptyStringSchema,
  currencyTypeCode: z.string().length(3).default('USD'),
  assetValue: optionalPositiveDecimalSchema,
  
  // Policy details (required for POLICY type)
  policy: policySchema.optional(),
}).refine(
  (data) => {
    // Policy is required for POLICY holding type
    if (data.holdingTypeCode === 'POLICY' && !data.policy) {
      return false;
    }
    return true;
  },
  {
    message: 'Policy details are required for POLICY holding type',
    path: ['policy'],
  }
);

/**
 * Update holding request body schema
 */
export const updateHoldingSchema = z.object({
  holdingKey: optionalNonEmptyStringSchema,
  holdingTypeCode: optionalHoldingTypeCodeSchema,
  holdingStatus: optionalHoldingStatusSchema,
  holdingName: optionalNonEmptyStringSchema,
  currencyTypeCode: z.string().length(3).optional(),
  assetValue: optionalPositiveDecimalSchema,
  
  // Policy details (optional for update)
  policy: policySchema.partial().extend({
    polNumber: z.string().min(1).max(50).optional(), // Make polNumber optional for updates
    life: lifeSchema.partial().optional(),
    annuity: annuitySchema.partial().optional(),
  }).optional(),
});

/**
 * Holding list query parameters
 */
export const holdingListQuerySchema = paginationQuerySchema.extend({
  holdingTypeCode: optionalHoldingTypeCodeSchema,
  holdingStatus: optionalHoldingStatusSchema,
  search: optionalNonEmptyStringSchema,
  carrierCode: optionalNonEmptyStringSchema,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
export type HoldingListQuery = z.infer<typeof holdingListQuerySchema>;
