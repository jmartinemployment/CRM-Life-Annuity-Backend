import { CoverageIndicatorCode, CoverageStatus, GenderCode } from '@prisma/client';

// Coverage input - for creating coverages on policies
export interface CreateCoverageInput {
  policyId: string;
  
  // Identification
  coverageKey?: string;
  covNumber?: string;
  productCode?: string;
  planName?: string;
  
  // Type
  indicatorCode?: CoverageIndicatorCode;
  lifeCovTypeCode?: string;
  lifeCovStatus?: CoverageStatus;
  
  // Amounts
  currentAmt?: number;
  deathBenefitAmt?: number;
  initCovAmt?: number;
  cashValue?: number;
  
  // Premium
  modalPremAmt?: number;
  annualPremAmt?: number;
  targetPremAmt?: number;
  
  // Dates
  effDate?: string;
  termDate?: string;
  paidToDate?: string;
  
  // Duration
  duration?: number;
  benefitPeriod?: number;
  
  // Underwriting
  issueGender?: GenderCode;
  equivalentAge?: number;
  guarIntRate?: number;
  
  // Nested: Life participants
  lifeParticipants?: CreateLifeParticipantInput[];
  
  // Nested: Coverage options/riders
  covOptions?: CreateCovOptionInput[];
}

export interface UpdateCoverageInput extends Partial<Omit<CreateCoverageInput, 'policyId'>> {}

// Life Participant - links coverage to the party it covers
export interface CreateLifeParticipantInput {
  partyId: string;
  participantType?: string;
  issueAge?: number;
  issueGender?: GenderCode;
  underwritingClass?: string;
  tobaccoClass?: string;
  tableRating?: string;
  flatExtraAmt?: number;
  flatExtraEndDate?: string;
  permFlatExtraAmt?: number;
}

export interface UpdateLifeParticipantInput extends Partial<CreateLifeParticipantInput> {}

// Coverage Option - riders/options on a coverage
export interface CreateCovOptionInput {
  optionType?: string;
  optionCode?: string;
  optionName?: string;
  optionAmt?: number;
  optionPremAmt?: number;
  effDate?: string;
  termDate?: string;
  isActive?: boolean;
}

export interface UpdateCovOptionInput extends Partial<CreateCovOptionInput> {}

// Query filters
export interface CoverageFilters {
  policyId?: string;
  indicatorCode?: CoverageIndicatorCode;
  lifeCovStatus?: CoverageStatus;
  lifeCovTypeCode?: string;
}

// Common coverage type codes for reference
export const LIFE_COVERAGE_TYPES = {
  TERM: 'TERM',
  WHOLE_LIFE: 'WL',
  UNIVERSAL_LIFE: 'UL',
  VARIABLE_LIFE: 'VL',
  VARIABLE_UL: 'VUL',
  INDEXED_UL: 'IUL',
} as const;

// Common rider/option types
export const COVERAGE_OPTION_TYPES = {
  WAIVER_OF_PREMIUM: 'WP',
  ACCIDENTAL_DEATH: 'ADB',
  GUARANTEED_PURCHASE: 'GPO',
  CHILD_RIDER: 'CR',
  SPOUSE_RIDER: 'SR',
  LONG_TERM_CARE: 'LTC',
  CHRONIC_ILLNESS: 'CI',
  TERM_RIDER: 'TR',
  PAID_UP_ADDITIONS: 'PUA',
  DISABILITY_INCOME: 'DI',
} as const;

// Underwriting classes
export const UNDERWRITING_CLASSES = {
  PREFERRED_PLUS: 'PP',
  PREFERRED: 'PF',
  STANDARD_PLUS: 'SP',
  STANDARD: 'ST',
  SUBSTANDARD: 'SS',
} as const;

// Tobacco classes
export const TOBACCO_CLASSES = {
  NON_TOBACCO: 'NT',
  TOBACCO: 'T',
  PREFERRED_NON_TOBACCO: 'PNT',
  STANDARD_NON_TOBACCO: 'SNT',
} as const;
