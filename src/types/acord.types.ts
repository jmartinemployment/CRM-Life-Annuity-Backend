// =============================================================================
// ACORD XML Type Definitions
// Based on TXLife 2.20.01 XSD specification
// =============================================================================

// -----------------------------------------------------------------------------
// Root Document Types
// -----------------------------------------------------------------------------

/**
 * TXLife - Root element for all ACORD Life/Annuity transactions
 * Maps to TXLife_Type in TXLife2.20.01.xsd
 */
export interface TXLife {
  version?: string;
  UserAuthRequest?: UserAuthRequest;
  UserAuthResponse?: UserAuthResponse;
  TXLifeRequest?: TXLifeRequest[];
  TXLifeResponse?: TXLifeResponse[];
}

/**
 * TXLifeRequest - Request container for transactions
 */
export interface TXLifeRequest {
  TransRefGUID?: string;
  TransType?: TypeCode;
  TransSubType?: TypeCode;
  TransExeDate?: string;
  TransExeTime?: string;
  TransMode?: TypeCode;
  OLifE?: OLifE;
}

/**
 * TXLifeResponse - Response container for transactions
 */
export interface TXLifeResponse {
  TransRefGUID?: string;
  TransType?: TypeCode;
  TransSubType?: TypeCode;
  TransExeDate?: string;
  TransExeTime?: string;
  TransResult?: TransResult;
  OLifE?: OLifE;
}

/**
 * TransResult - Transaction result information
 */
export interface TransResult {
  ResultCode?: TypeCode;
  ResultInfo?: ResultInfo[];
}

export interface ResultInfo {
  ResultInfoCode?: TypeCode;
  ResultInfoDesc?: string;
}

// -----------------------------------------------------------------------------
// OLifE Container
// -----------------------------------------------------------------------------

/**
 * OLifE - Object Life container - holds all business objects
 * This is the main container for parties, holdings, and relations
 */
export interface OLifE {
  Version?: string;
  SourceInfo?: SourceInfo;
  Holding?: OLifEHolding[];
  Party?: OLifEParty[];
  Relation?: OLifERelation[];
  FormInstance?: FormInstance[];
  Activity?: OLifEActivity[];
}

export interface SourceInfo {
  CreationDate?: string;
  CreationTime?: string;
  SourceInfoName?: string;
  FileControlID?: string;
}

// -----------------------------------------------------------------------------
// User Authentication
// -----------------------------------------------------------------------------

export interface UserAuthRequest {
  VendorApp?: VendorApp;
}

export interface UserAuthResponse {
  SvrDate?: string;
  SvrTime?: string;
}

export interface VendorApp {
  VendorName?: string;
  AppName?: string;
  AppVer?: string;
}

// -----------------------------------------------------------------------------
// Party Types
// -----------------------------------------------------------------------------

/**
 * Party - Represents any person or organization
 * Maps to Party_Type in XMLife2.20.xsd
 */
export interface OLifEParty {
  id?: string;  // XML ID attribute
  PartyTypeCode?: TypeCode;
  PartyKey?: string;
  FullName?: string;
  GovtID?: string;
  GovtIDTC?: TypeCode;
  ResidenceState?: string;
  ResidenceCountry?: string;
  ResidenceZip?: string;
  EstNetWorth?: CurrencyAmount;
  PrefComm?: TypeCode;
  Person?: OLifEPerson;
  Organization?: OLifEOrganization;
  Address?: OLifEAddress[];
  Phone?: OLifEPhone[];
  EMailAddress?: OLifEEMailAddress[];
  Employment?: OLifEEmployment[];
  Carrier?: OLifECarrier;
  Producer?: OLifEProducer;
  Client?: OLifEClient;
  OLifEExtension?: OLifEExtension[];
}

/**
 * Person - Individual person details
 * Maps to Person_Type
 */
export interface OLifEPerson {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Prefix?: string;
  Suffix?: string;
  NickName?: string;
  Title?: string;
  Gender?: TypeCode;
  BirthDate?: string;
  Age?: number;
  MarStat?: TypeCode;
  Citizenship?: string;
  BirthCountry?: string;
  BirthJurisdiction?: string;
  Occupation?: string;
  OccupClass?: TypeCode;
  EstSalary?: CurrencyAmount;
  SmokerStat?: TypeCode;
  TobaccoType?: TypeCode;
  Height2?: Measurement;
  Weight2?: Measurement;
  DriversLicenseNum?: string;
  DriversLicenseState?: string;
  ImmigrationStatus?: TypeCode;
  DeathDate?: string;
  OLifEExtension?: OLifEExtension[];
}

/**
 * Organization - Organization/company details
 * Maps to Organization_Type
 */
export interface OLifEOrganization {
  OrgForm?: TypeCode;
  DBA?: string;
  AbbrName?: string;
  TrustTypeCode?: TypeCode;
  IrrevocableInd?: boolean;
  EstabDate?: string;
  NatureCategory?: string;
  SICCode?: string;
  NAICSCode?: string;
  DUNSNumber?: string;
  NumEmployees?: number;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Contact Information Types
// -----------------------------------------------------------------------------

export interface OLifEAddress {
  id?: string;
  AddressTypeCode?: TypeCode;
  AttentionLine?: string;
  Line1?: string;
  Line2?: string;
  Line3?: string;
  City?: string;
  AddressStateTC?: TypeCode;
  AddressState?: string;
  Zip?: string;
  AddressCountryTC?: TypeCode;
  AddressCountry?: string;
  StartDate?: string;
  EndDate?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEPhone {
  id?: string;
  PhoneTypeCode?: TypeCode;
  CountryCode?: string;
  AreaCode?: string;
  DialNumber?: string;
  Ext?: string;
  BestTimeToCallFrom?: string;
  BestTimeToCallTo?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEEMailAddress {
  id?: string;
  EMailType?: TypeCode;
  AddrLine?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEEmployment {
  id?: string;
  EmployerPartyID?: string;
  Occupation?: string;
  Title?: string;
  HireDate?: string;
  TerminationDate?: string;
  AnnualSalary?: CurrencyAmount;
  EmploymentStatus?: TypeCode;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Party Role Types
// -----------------------------------------------------------------------------

export interface OLifECarrier {
  CarrierCode?: string;
  NAICCode?: string;
  AMBestCode?: string;
  AMBestRating?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEProducer {
  NationalProducerNumber?: string;
  CarrierAppointment?: CarrierAppointment[];
  OLifEExtension?: OLifEExtension[];
}

export interface CarrierAppointment {
  CompanyProducerID?: string;
  CarrierCode?: string;
  AppointmentStatus?: TypeCode;
}

export interface OLifEClient {
  LeadSource?: TypeCode;
  LeadStatus?: TypeCode;
  LeadDate?: string;
  AssignedAgentID?: string;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Holding Types
// -----------------------------------------------------------------------------

/**
 * Holding - Container for policies, annuities, investments
 * Maps to Holding_Type in XMLife2.20.xsd
 */
export interface OLifEHolding {
  id?: string;
  HoldingTypeCode?: TypeCode;
  HoldingStatus?: TypeCode;
  HoldingKey?: string;
  HoldingName?: string;
  CurrencyTypeCode?: TypeCode;
  AssetValue?: CurrencyAmount;
  AsOfDate?: string;
  Policy?: OLifEPolicy;
  Investment?: OLifEInvestment;
  Banking?: OLifEBanking;
  Loan?: OLifELoan[];
  Arrangement?: OLifEArrangement[];
  OLifEExtension?: OLifEExtension[];
}

/**
 * Policy - Insurance policy details
 * Maps to Policy_Type
 */
export interface OLifEPolicy {
  PolNumber?: string;
  LineOfBusiness?: TypeCode;
  ProductType?: TypeCode;
  ProductCode?: string;
  PlanName?: string;
  MarketingName?: string;
  CarrierCode?: string;
  CarrierPartyID?: string;
  PolicyStatus?: TypeCode;
  Jurisdiction?: string;
  EffDate?: string;
  IssueDate?: string;
  TermDate?: string;
  PaidToDate?: string;
  BilledToDate?: string;
  RenewalDate?: string;
  PaymentMode?: TypeCode;
  PaymentAmt?: CurrencyAmount;
  AnnualPaymentAmt?: CurrencyAmount;
  PaymentMethod?: TypeCode;
  PaymentDueDay?: number;
  PolicyValue?: CurrencyAmount;
  QualPlanType?: TypeCode;
  ReplacementType?: TypeCode;
  Life?: OLifELife;
  Annuity?: OLifEAnnuity;
  Coverage?: OLifECoverage[];
  RequirementInfo?: OLifERequirementInfo[];
  ApplicationInfo?: OLifEApplicationInfo;
  OLifEExtension?: OLifEExtension[];
}

/**
 * Life - Life insurance specific details
 * Maps to Life_Type
 */
export interface OLifELife {
  QualPlanType?: TypeCode;
  FaceAmt?: CurrencyAmount;
  FaceUnits?: number;
  ValuePerUnit?: CurrencyAmount;
  DeathBenefitAmt?: CurrencyAmount;
  NetDeathBenefitAmt?: CurrencyAmount;
  CashValueAmt?: CurrencyAmount;
  NetSurrValueAmt?: CurrencyAmount;
  SurrenderChargeAmt?: CurrencyAmount;
  TargetPremAmt?: CurrencyAmount;
  MinPremAmt?: CurrencyAmount;
  GrossPremAmtITD?: CurrencyAmount;
  TotCumPremAmt?: CurrencyAmount;
  CurrIntRate?: number;
  GuarIntRate?: number;
  LoanAmtATD?: CurrencyAmount;
  CurrLoanIntRate?: number;
  DivType?: TypeCode;
  DivOnDepositAmt?: CurrencyAmount;
  Coverage?: OLifECoverage[];
  OLifEExtension?: OLifEExtension[];
}

/**
 * Annuity - Annuity contract specific details
 * Maps to Annuity_Type
 */
export interface OLifEAnnuity {
  PremType?: TypeCode;
  PayoutType?: TypeCode;
  QualPlanType?: TypeCode;
  SourceOfFunds?: TypeCode;
  SurrenderValue?: CurrencyAmount;
  SurrenderCharge?: CurrencyAmount;
  DeathBenefitAmt?: CurrencyAmount;
  GuarIntRate?: number;
  AccumValueIntRateCurrent?: number;
  InitDepositAmt?: CurrencyAmount;
  InitDepositDate?: string;
  TotalDepositITD?: CurrencyAmount;
  CumWthdrwlAmtITD?: CurrencyAmount;
  ManPayoutDate?: string;
  Payout?: OLifEPayout[];
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEPayout {
  id?: string;
  IncomeOption?: TypeCode;
  PayoutType?: TypeCode;
  PayoutAmt?: CurrencyAmount;
  PayoutPct?: number;
  PayoutMode?: TypeCode;
  StartDate?: string;
  PayoutEndDate?: string;
  NextPayoutDate?: string;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Coverage Types
// -----------------------------------------------------------------------------

export interface OLifECoverage {
  id?: string;
  CoverageKey?: string;
  CovNumber?: string;
  ProductCode?: string;
  PlanName?: string;
  IndicatorCode?: TypeCode;
  LifeCovTypeCode?: TypeCode;
  LifeCovStatus?: TypeCode;
  CurrentAmt?: CurrencyAmount;
  DeathBenefitAmt?: CurrencyAmount;
  InitCovAmt?: CurrencyAmount;
  CashValue?: CurrencyAmount;
  ModalPremAmt?: CurrencyAmount;
  AnnualPremAmt?: CurrencyAmount;
  EffDate?: string;
  TermDate?: string;
  LifeParticipant?: OLifELifeParticipant[];
  CovOption?: OLifECovOption[];
  OLifEExtension?: OLifEExtension[];
}

export interface OLifELifeParticipant {
  id?: string;
  PartyID?: string;
  LifeParticipantRoleCode?: TypeCode;
  IssueAge?: number;
  IssueGender?: TypeCode;
  UnderwritingClass?: TypeCode;
  TobaccoClass?: TypeCode;
  TableRating?: TypeCode;
  FlatExtraAmt?: CurrencyAmount;
  PermFlatExtraAmt?: CurrencyAmount;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifECovOption {
  id?: string;
  OptionType?: TypeCode;
  OptionCode?: string;
  OptionName?: string;
  OptionAmt?: CurrencyAmount;
  OptionPremAmt?: CurrencyAmount;
  EffDate?: string;
  TermDate?: string;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Relation Types
// -----------------------------------------------------------------------------

/**
 * Relation - Links parties to holdings with specific roles
 * Maps to Relation_Type
 */
export interface OLifERelation {
  id?: string;
  OriginatingObjectID?: string;
  OriginatingObjectType?: TypeCode;
  RelatedObjectID?: string;
  RelatedObjectType?: TypeCode;
  RelationRoleCode?: TypeCode;
  RelationDescription?: string;
  InterestPercent?: number;
  BeneficiaryDesignation?: TypeCode;
  IrrevocableInd?: boolean;
  VolumeSharePct?: number;
  StartDate?: string;
  EndDate?: string;
  OLifEExtension?: OLifEExtension[];
}

// -----------------------------------------------------------------------------
// Supporting Types
// -----------------------------------------------------------------------------

export interface OLifELoan {
  id?: string;
  LoanType?: TypeCode;
  LoanAmt?: CurrencyAmount;
  LoanIntRate?: number;
  LoanDate?: string;
  LoanBalance?: CurrencyAmount;
  AccruedInterest?: CurrencyAmount;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEArrangement {
  id?: string;
  ArrType?: TypeCode;
  ArrMode?: TypeCode;
  ArrAmt?: CurrencyAmount;
  ArrPct?: number;
  StartDate?: string;
  EndDate?: string;
  NextProcessDate?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifERequirementInfo {
  id?: string;
  ReqCode?: TypeCode;
  RequirementDetails?: string;
  ReqStatus?: TypeCode;
  RequestedDate?: string;
  ReceivedDate?: string;
  FulfilledDate?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEApplicationInfo {
  ApplicationNumber?: string;
  ApplicationDate?: string;
  SignedDate?: string;
  SubmittedDate?: string;
  ApplicationState?: string;
  ReplacementInd?: boolean;
  RequestedPolNumber?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEInvestment {
  AccountValue?: CurrencyAmount;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEBanking {
  AccountBalance?: CurrencyAmount;
  OLifEExtension?: OLifEExtension[];
}

export interface OLifEActivity {
  id?: string;
  ActivityTypeCode?: TypeCode;
  ActivityStatus?: TypeCode;
  ActivityDate?: string;
  DueDate?: string;
  Description?: string;
  OLifEExtension?: OLifEExtension[];
}

export interface FormInstance {
  id?: string;
  FormName?: string;
  FormInstanceData?: FormInstanceData;
  OLifEExtension?: OLifEExtension[];
}

export interface FormInstanceData {
  QuestionAnswer?: QuestionAnswer[];
}

export interface QuestionAnswer {
  QuestionNumber?: string;
  QuestionText?: string;
  AnswerText?: string;
}

// -----------------------------------------------------------------------------
// Common/Shared Types
// -----------------------------------------------------------------------------

/**
 * TypeCode - ACORD type code pattern (tc attribute with string value)
 */
export interface TypeCode {
  tc?: string;
  value?: string;
}

/**
 * CurrencyAmount - Amount with optional currency type
 */
export interface CurrencyAmount {
  value?: number;
  currencyTypeCode?: string;
}

/**
 * Measurement - Value with units
 */
export interface Measurement {
  MeasureValue?: number;
  MeasureUnits?: TypeCode;
}

/**
 * OLifEExtension - Vendor-specific extensions
 */
export interface OLifEExtension {
  VendorCode?: string;
  ExtensionCode?: string;
  [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Import/Export Result Types
// -----------------------------------------------------------------------------

export interface ImportResult {
  success: boolean;
  transactionId?: string;
  summary: {
    partiesCreated: number;
    partiesUpdated: number;
    holdingsCreated: number;
    holdingsUpdated: number;
    relationsCreated: number;
    coveragesCreated: number;
    errors: ImportError[];
    warnings: ImportWarning[];
  };
  mappings?: {
    partyIdMap: Record<string, string>;  // XML id -> DB id
    holdingIdMap: Record<string, string>;
    coverageIdMap: Record<string, string>;
  };
}

export interface ImportError {
  path: string;
  message: string;
  xmlId?: string;
}

export interface ImportWarning {
  path: string;
  message: string;
  xmlId?: string;
}

export interface ExportOptions {
  includeParties?: boolean;
  includeHoldings?: boolean;
  includeRelations?: boolean;
  includeCoverages?: boolean;
  includeActivities?: boolean;
  partyIds?: string[];
  holdingIds?: string[];
  transactionType?: string;
  vendorCode?: string;
  vendorName?: string;
  appName?: string;
  appVersion?: string;
}

export interface ExportResult {
  success: boolean;
  xml?: string;
  transactionId?: string;
  summary?: {
    partiesExported: number;
    holdingsExported: number;
    relationsExported: number;
    coveragesExported: number;
  };
  error?: string;
}

// -----------------------------------------------------------------------------
// Type Code Constants (subset of ACORD OLI_LU_ codes)
// -----------------------------------------------------------------------------

export const ACORD_TYPE_CODES = {
  // Party Type
  PARTY_PERSON: '1',
  PARTY_ORGANIZATION: '2',
  
  // Gender
  GENDER_MALE: '1',
  GENDER_FEMALE: '2',
  GENDER_UNKNOWN: '0',
  
  // Marital Status
  MARSTAT_SINGLE: '1',
  MARSTAT_MARRIED: '2',
  MARSTAT_DIVORCED: '3',
  MARSTAT_WIDOWED: '4',
  
  // Holding Type
  HOLDING_POLICY: '1',
  HOLDING_ANNUITY: '2',
  HOLDING_INVESTMENT: '3',
  HOLDING_BANKING: '4',
  
  // Holding Status
  HOLDSTAT_PROPOSED: '1',
  HOLDSTAT_PENDING: '2',
  HOLDSTAT_ACTIVE: '3',
  HOLDSTAT_TERMINATED: '5',
  
  // Line of Business
  LOB_LIFE: '1',
  LOB_ANNUITY: '2',
  LOB_HEALTH: '3',
  
  // Coverage Indicator
  COVIND_BASE: '1',
  COVIND_RIDER: '2',
  
  // Relation Role Codes
  ROLE_OWNER: '8',
  ROLE_INSURED: '32',
  ROLE_ANNUITANT: '36',
  ROLE_PRIMARY_BENE: '34',
  ROLE_CONTINGENT_BENE: '35',
  ROLE_PRIMARY_AGENT: '37',
  ROLE_CARRIER: '87',
  
  // Transaction Types
  TRANS_NEW_BUSINESS: '103',
  TRANS_INQUIRY: '228',
  TRANS_UPDATE: '1203',
  
  // Result Codes
  RESULT_SUCCESS: '1',
  RESULT_FAILURE: '5',
} as const;
