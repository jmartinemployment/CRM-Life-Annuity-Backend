import {
  HoldingTypeCode,
  HoldingStatus,
  LineOfBusiness,
  ProductType,
  PolicyStatus,
  PaymentMode,
  PaymentMethod,
  QualifiedPlanType,
} from '@prisma/client';

// Holding input - matches Holding model fields
export interface CreateHoldingInput {
  holdingKey?: string;
  holdingTypeCode?: HoldingTypeCode;
  holdingStatus?: HoldingStatus;
  holdingName?: string;
  currencyTypeCode?: string;
  policy?: CreatePolicyInput;
}

// Policy input - matches Policy model fields
export interface CreatePolicyInput {
  polNumber: string;
  certificateNo?: string;
  lineOfBusiness?: LineOfBusiness;
  productType?: ProductType;
  productCode?: string;
  planName?: string;
  marketingName?: string;
  carrierCode?: string;
  carrierPartyId?: string;
  policyStatus?: PolicyStatus;
  jurisdiction?: string;
  effDate?: string;
  issueDate?: string;
  termDate?: string;
  paymentMode?: PaymentMode;
  paymentAmt?: number;
  annualPaymentAmt?: number;
  paymentMethod?: PaymentMethod;
  paymentDraftDay?: number;
  qualPlanType?: QualifiedPlanType;
  life?: CreateLifeInput;
  annuity?: CreateAnnuityInput;
}

// Life input - matches Life model fields
export interface CreateLifeInput {
  qualPlanType?: QualifiedPlanType;
  faceAmt?: number;
  deathBenefitAmt?: number;
  cashValueAmt?: number;
  netSurrValueAmt?: number;
  targetPremAmt?: number;
  currIntRate?: number;
  guarIntRate?: number;
  divType?: string;
}

// Annuity input - matches Annuity model fields
export interface CreateAnnuityInput {
  premType?: string;
  payoutType?: string;
  qualPlanType?: QualifiedPlanType;
  sourceOfFunds?: string;
  surrenderValue?: number;
  deathBenefitAmt?: number;
  guarIntRate?: number;
  initDepositAmt?: number;
  initDepositDate?: string;
  totalDepositITD?: number;
}

export interface UpdateHoldingInput extends Partial<CreateHoldingInput> {}

// Query parameters
export interface HoldingFilters {
  holdingTypeCode?: HoldingTypeCode;
  holdingStatus?: HoldingStatus;
  policyStatus?: PolicyStatus;
  lineOfBusiness?: LineOfBusiness;
  carrierCode?: string;
  search?: string;
}
