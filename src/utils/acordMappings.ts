// =============================================================================
// ACORD Type Code Mappings
// Maps between ACORD tc values and Prisma enums
// =============================================================================

import type { TypeCode } from '../types/acord.types';

// =============================================================================
// Helper Functions
// =============================================================================

export function getTypeCodeValue(tc?: TypeCode): string | undefined {
  return tc?.value || tc?.tc;
}

// =============================================================================
// Forward Mappings (ACORD -> Prisma)
// =============================================================================

export function mapPartyTypeCode(tc?: TypeCode): 'PERSON' | 'ORGANIZATION' {
  const val = tc?.tc || tc?.value;
  if (val === '2') return 'ORGANIZATION';
  return 'PERSON';
}

export function mapGenderCode(tc?: TypeCode): 'MALE' | 'FEMALE' | 'UNKNOWN' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'MALE';
    case '2': return 'FEMALE';
    case '0': return 'UNKNOWN';
    default: return undefined;
  }
}

export function mapMaritalStatus(tc?: TypeCode): 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'DOMESTIC_PARTNER' | 'UNKNOWN' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'SINGLE';
    case '2': return 'MARRIED';
    case '3': return 'DIVORCED';
    case '4': return 'WIDOWED';
    case '5': return 'SEPARATED';
    case '6': return 'DOMESTIC_PARTNER';
    case '0': return 'UNKNOWN';
    default: return undefined;
  }
}

export function mapGovtIdType(tc?: TypeCode): 'SSN' | 'FEIN' | 'ITIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'SSN';
    case '2': return 'FEIN';
    case '3': return 'ITIN';
    case '4': return 'PASSPORT';
    case '5': return 'DRIVERS_LICENSE';
    default: return 'OTHER';
  }
}

export function mapAddressTypeCode(tc?: TypeCode): 'RESIDENCE' | 'BUSINESS' | 'MAILING' | 'BILLING' | 'PRIOR_RESIDENCE' | 'SEASONAL' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'RESIDENCE';
    case '2': return 'BUSINESS';
    case '5': return 'MAILING';
    case '18': return 'BILLING';
    case '3': return 'PRIOR_RESIDENCE';
    case '4': return 'SEASONAL';
    default: return 'OTHER';
  }
}

export function mapPhoneTypeCode(tc?: TypeCode): 'HOME' | 'BUSINESS' | 'MOBILE' | 'FAX' | 'PAGER' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'HOME';
    case '2': return 'BUSINESS';
    case '3': return 'MOBILE';
    case '4': return 'FAX';
    case '5': return 'PAGER';
    default: return 'OTHER';
  }
}

export function mapEmailTypeCode(tc?: TypeCode): 'PERSONAL' | 'BUSINESS' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'PERSONAL';
    case '2': return 'BUSINESS';
    default: return 'OTHER';
  }
}

export function mapOrgForm(tc?: TypeCode): 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLC' | 'CORPORATION' | 'S_CORP' | 'C_CORP' | 'NON_PROFIT' | 'TRUST' | 'ESTATE' | 'GOVERNMENT' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'SOLE_PROPRIETORSHIP';
    case '2': return 'PARTNERSHIP';
    case '3': return 'LLC';
    case '4': return 'CORPORATION';
    case '5': return 'S_CORP';
    case '6': return 'C_CORP';
    case '7': return 'NON_PROFIT';
    case '8': return 'TRUST';
    case '9': return 'ESTATE';
    case '10': return 'GOVERNMENT';
    default: return 'OTHER';
  }
}

export function mapTrustType(tc?: TypeCode): 'REVOCABLE' | 'IRREVOCABLE' | 'LIVING_TRUST' | 'TESTAMENTARY' | 'CHARITABLE' | 'SPECIAL_NEEDS' | 'QUALIFIED_TRUST' | 'ILIT' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'REVOCABLE';
    case '2': return 'IRREVOCABLE';
    case '3': return 'LIVING_TRUST';
    case '4': return 'TESTAMENTARY';
    case '5': return 'CHARITABLE';
    case '6': return 'SPECIAL_NEEDS';
    case '7': return 'QUALIFIED_TRUST';
    case '8': return 'ILIT';
    default: return 'OTHER';
  }
}

export function mapHoldingTypeCode(tc?: TypeCode): 'POLICY' | 'ANNUITY' | 'INVESTMENT' | 'BANKING' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'POLICY';
    case '2': return 'ANNUITY';
    case '3': return 'INVESTMENT';
    case '4': return 'BANKING';
    default: return 'OTHER';
  }
}

export function mapHoldingStatus(tc?: TypeCode): 'PROPOSED' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'SURRENDERED' | 'LAPSED' | 'DEATH_CLAIM' | 'MATURED' | 'CANCELLED' | 'DECLINED' | 'NOT_TAKEN' | 'PAID_UP' | 'EXTENDED_TERM' | 'REDUCED_PAID_UP' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'PROPOSED';
    case '2': return 'PENDING';
    case '3': return 'ACTIVE';
    case '4': return 'INACTIVE';
    case '5': return 'TERMINATED';
    case '6': return 'SURRENDERED';
    case '7': return 'LAPSED';
    case '8': return 'DEATH_CLAIM';
    case '9': return 'MATURED';
    case '10': return 'CANCELLED';
    case '11': return 'DECLINED';
    case '12': return 'NOT_TAKEN';
    case '13': return 'PAID_UP';
    case '14': return 'EXTENDED_TERM';
    case '15': return 'REDUCED_PAID_UP';
    default: return 'PROPOSED';
  }
}

export function mapLineOfBusiness(tc?: TypeCode): 'LIFE' | 'ANNUITY' | 'HEALTH' | 'PROPERTY' | 'CASUALTY' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'LIFE';
    case '2': return 'ANNUITY';
    case '3': return 'HEALTH';
    case '4': return 'PROPERTY';
    case '5': return 'CASUALTY';
    default: return 'OTHER';
  }
}

export function mapProductType(tc?: TypeCode): 'WHOLE_LIFE' | 'TERM_LIFE' | 'UNIVERSAL_LIFE' | 'VARIABLE_LIFE' | 'VARIABLE_UL' | 'INDEXED_UL' | 'FIXED_ANNUITY' | 'VARIABLE_ANNUITY' | 'INDEXED_ANNUITY' | 'IMMEDIATE_ANNUITY' | 'DEFERRED_ANNUITY' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'WHOLE_LIFE';
    case '2': return 'TERM_LIFE';
    case '3': return 'UNIVERSAL_LIFE';
    case '4': return 'VARIABLE_LIFE';
    case '5': return 'VARIABLE_UL';
    case '6': return 'INDEXED_UL';
    case '20': return 'FIXED_ANNUITY';
    case '21': return 'VARIABLE_ANNUITY';
    case '22': return 'INDEXED_ANNUITY';
    case '23': return 'IMMEDIATE_ANNUITY';
    case '24': return 'DEFERRED_ANNUITY';
    default: return 'OTHER';
  }
}

export function mapPolicyStatus(tc?: TypeCode): 'PROPOSAL_PENDING' | 'PENDING_ISSUE' | 'INFORCE_ACTIVE' | 'INFORCE_PREMIUM_PAYING' | 'PENDING_REISSUE' | 'LAPSED' | 'SURRENDERED' | 'DEATH_CLAIM' | 'MATURED' | 'TERMINATED' | 'CANCELLED_BY_CARRIER' | 'CANCELLED_BY_OWNER' | 'PENDING_RESCIND' | 'RESCINDED' | 'NOT_TAKEN' | 'DECLINED' | 'INCOMPLETE' | 'ISSUED' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'PROPOSAL_PENDING';
    case '2': return 'PENDING_ISSUE';
    case '3': return 'INFORCE_ACTIVE';
    case '4': return 'INFORCE_PREMIUM_PAYING';
    case '5': return 'PENDING_REISSUE';
    case '6': return 'LAPSED';
    case '7': return 'SURRENDERED';
    case '8': return 'DEATH_CLAIM';
    case '9': return 'MATURED';
    case '10': return 'TERMINATED';
    case '11': return 'CANCELLED_BY_CARRIER';
    case '12': return 'CANCELLED_BY_OWNER';
    case '13': return 'PENDING_RESCIND';
    case '14': return 'RESCINDED';
    case '15': return 'NOT_TAKEN';
    case '16': return 'DECLINED';
    case '17': return 'INCOMPLETE';
    case '18': return 'ISSUED';
    default: return 'PROPOSAL_PENDING';
  }
}

export function mapPaymentMode(tc?: TypeCode): 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'WEEKLY' | 'BI_WEEKLY' | 'SINGLE' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'ANNUAL';
    case '2': return 'SEMI_ANNUAL';
    case '4': return 'QUARTERLY';
    case '12': return 'MONTHLY';
    case '52': return 'WEEKLY';
    case '26': return 'BI_WEEKLY';
    case '0': return 'SINGLE';
    default: return undefined;
  }
}

export function mapPaymentMethod(tc?: TypeCode): 'CHECK' | 'EFT' | 'CREDIT_CARD' | 'PAYROLL_DEDUCT' | 'GOVT_ALLOTMENT' | 'AUTO_PREMIUM' | 'DIVIDEND' | 'WIRE' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'CHECK';
    case '2': return 'EFT';
    case '3': return 'CREDIT_CARD';
    case '4': return 'PAYROLL_DEDUCT';
    case '5': return 'GOVT_ALLOTMENT';
    case '6': return 'AUTO_PREMIUM';
    case '7': return 'DIVIDEND';
    case '8': return 'WIRE';
    default: return 'OTHER';
  }
}

export function mapQualPlanType(tc?: TypeCode): 'NON_QUALIFIED' | 'IRA' | 'ROTH_IRA' | 'SEP_IRA' | 'SIMPLE_IRA' | 'K401' | 'K403B' | 'K457' | 'PENSION' | 'PROFIT_SHARING' | 'KEOGH' | 'INHERITED_IRA' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '0': return 'NON_QUALIFIED';
    case '1': return 'IRA';
    case '2': return 'ROTH_IRA';
    case '3': return 'SEP_IRA';
    case '4': return 'SIMPLE_IRA';
    case '5': return 'K401';
    case '6': return 'K403B';
    case '7': return 'K457';
    case '8': return 'PENSION';
    case '9': return 'PROFIT_SHARING';
    case '10': return 'KEOGH';
    case '11': return 'INHERITED_IRA';
    default: return 'OTHER';
  }
}

export function mapCoverageIndicatorCode(tc?: TypeCode): 'BASE' | 'RIDER' | 'OPTION' | 'SUPPLEMENTAL' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'BASE';
    case '2': return 'RIDER';
    case '3': return 'OPTION';
    case '4': return 'SUPPLEMENTAL';
    default: return 'BASE';
  }
}

export function mapCoverageStatus(tc?: TypeCode): 'ACTIVE' | 'PENDING' | 'TERMINATED' | 'WAIVED' | 'NOT_TAKEN' | 'REDUCED' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'ACTIVE';
    case '2': return 'PENDING';
    case '3': return 'TERMINATED';
    case '4': return 'WAIVED';
    case '5': return 'NOT_TAKEN';
    case '6': return 'REDUCED';
    default: return 'ACTIVE';
  }
}

export function mapRelationRoleCode(tc?: TypeCode): 'OWNER' | 'INSURED' | 'JOINT_INSURED' | 'ANNUITANT' | 'JOINT_ANNUITANT' | 'PAYOR' | 'PRIMARY_BENEFICIARY' | 'CONTINGENT_BENEFICIARY' | 'FINAL_BENEFICIARY' | 'IRREVOCABLE_BENEFICIARY' | 'PRIMARY_AGENT' | 'SERVICING_AGENT' | 'WRITING_AGENT' | 'BROKER_DEALER' | 'TRUSTEE' | 'CUSTODIAN' | 'EMPLOYER' | 'GUARDIAN' | 'POWER_OF_ATTORNEY' | 'CARRIER' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'GRANDPARENT' | 'GRANDCHILD' | 'OTHER_RELATIVE' | 'OTHER' {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '8': return 'OWNER';
    case '32': return 'INSURED';
    case '186': return 'JOINT_INSURED';
    case '36': return 'ANNUITANT';
    case '149': return 'JOINT_ANNUITANT';
    case '31': return 'PAYOR';
    case '34': return 'PRIMARY_BENEFICIARY';
    case '35': return 'CONTINGENT_BENEFICIARY';
    case '187': return 'FINAL_BENEFICIARY';
    case '188': return 'IRREVOCABLE_BENEFICIARY';
    case '37': return 'PRIMARY_AGENT';
    case '38': return 'SERVICING_AGENT';
    case '126': return 'WRITING_AGENT';
    case '127': return 'BROKER_DEALER';
    case '189': return 'TRUSTEE';
    case '190': return 'CUSTODIAN';
    case '21': return 'EMPLOYER';
    case '191': return 'GUARDIAN';
    case '192': return 'POWER_OF_ATTORNEY';
    case '87': return 'CARRIER';
    case '1': return 'SPOUSE';
    case '2': return 'CHILD';
    case '3': return 'PARENT';
    case '4': return 'SIBLING';
    case '5': return 'GRANDPARENT';
    case '6': return 'GRANDCHILD';
    case '7': return 'OTHER_RELATIVE';
    default: return 'OTHER';
  }
}

export function mapBeneficiaryDesignation(tc?: TypeCode): 'NAMED' | 'PER_STIRPES' | 'ESTATE' | 'TRUST' | 'CHARITY' | 'CLASS' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'NAMED';
    case '2': return 'PER_STIRPES';
    case '3': return 'ESTATE';
    case '4': return 'TRUST';
    case '5': return 'CHARITY';
    case '6': return 'CLASS';
    default: return 'OTHER';
  }
}

export function mapLeadSource(tc?: TypeCode): 'REFERRAL' | 'WEB_INQUIRY' | 'COLD_CALL' | 'WALK_IN' | 'SEMINAR' | 'DIRECT_MAIL' | 'SOCIAL_MEDIA' | 'EXISTING_CLIENT' | 'PURCHASED_LIST' | 'OTHER' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'REFERRAL';
    case '2': return 'WEB_INQUIRY';
    case '3': return 'COLD_CALL';
    case '4': return 'WALK_IN';
    case '5': return 'SEMINAR';
    case '6': return 'DIRECT_MAIL';
    case '7': return 'SOCIAL_MEDIA';
    case '8': return 'EXISTING_CLIENT';
    case '9': return 'PURCHASED_LIST';
    default: return 'OTHER';
  }
}

export function mapLeadStatus(tc?: TypeCode): 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'DORMANT' | undefined {
  const val = tc?.tc || tc?.value;
  switch (val) {
    case '1': return 'NEW';
    case '2': return 'CONTACTED';
    case '3': return 'QUALIFIED';
    case '4': return 'PROPOSAL_SENT';
    case '5': return 'NEGOTIATION';
    case '6': return 'WON';
    case '7': return 'LOST';
    case '8': return 'DORMANT';
    default: return undefined;
  }
}

// =============================================================================
// Reverse Mappings (Prisma -> ACORD)
// =============================================================================

export function reverseMapPartyTypeCode(val: string): string {
  switch (val) {
    case 'PERSON': return '1';
    case 'ORGANIZATION': return '2';
    default: return '1';
  }
}

export function reverseMapGenderCode(val: string): string {
  switch (val) {
    case 'MALE': return '1';
    case 'FEMALE': return '2';
    case 'UNKNOWN': return '0';
    default: return '0';
  }
}

export function reverseMapMaritalStatus(val: string): string {
  switch (val) {
    case 'SINGLE': return '1';
    case 'MARRIED': return '2';
    case 'DIVORCED': return '3';
    case 'WIDOWED': return '4';
    case 'SEPARATED': return '5';
    case 'DOMESTIC_PARTNER': return '6';
    case 'UNKNOWN': return '0';
    default: return '0';
  }
}

export function reverseMapGovtIdType(val: string): string {
  switch (val) {
    case 'SSN': return '1';
    case 'FEIN': return '2';
    case 'ITIN': return '3';
    case 'PASSPORT': return '4';
    case 'DRIVERS_LICENSE': return '5';
    default: return '0';
  }
}

export function reverseMapAddressTypeCode(val: string): string {
  switch (val) {
    case 'RESIDENCE': return '1';
    case 'BUSINESS': return '2';
    case 'PRIOR_RESIDENCE': return '3';
    case 'SEASONAL': return '4';
    case 'MAILING': return '5';
    case 'BILLING': return '18';
    default: return '0';
  }
}

export function reverseMapPhoneTypeCode(val: string): string {
  switch (val) {
    case 'HOME': return '1';
    case 'BUSINESS': return '2';
    case 'MOBILE': return '3';
    case 'FAX': return '4';
    case 'PAGER': return '5';
    default: return '0';
  }
}

export function reverseMapEmailTypeCode(val: string): string {
  switch (val) {
    case 'PERSONAL': return '1';
    case 'BUSINESS': return '2';
    default: return '0';
  }
}

export function reverseMapOrgForm(val: string): string {
  switch (val) {
    case 'SOLE_PROPRIETORSHIP': return '1';
    case 'PARTNERSHIP': return '2';
    case 'LLC': return '3';
    case 'CORPORATION': return '4';
    case 'S_CORP': return '5';
    case 'C_CORP': return '6';
    case 'NON_PROFIT': return '7';
    case 'TRUST': return '8';
    case 'ESTATE': return '9';
    case 'GOVERNMENT': return '10';
    default: return '0';
  }
}

export function reverseMapTrustType(val: string): string {
  switch (val) {
    case 'REVOCABLE': return '1';
    case 'IRREVOCABLE': return '2';
    case 'LIVING_TRUST': return '3';
    case 'TESTAMENTARY': return '4';
    case 'CHARITABLE': return '5';
    case 'SPECIAL_NEEDS': return '6';
    case 'QUALIFIED_TRUST': return '7';
    case 'ILIT': return '8';
    default: return '0';
  }
}

export function reverseMapHoldingTypeCode(val: string): string {
  switch (val) {
    case 'POLICY': return '1';
    case 'ANNUITY': return '2';
    case 'INVESTMENT': return '3';
    case 'BANKING': return '4';
    default: return '0';
  }
}

export function reverseMapHoldingStatus(val: string): string {
  switch (val) {
    case 'PROPOSED': return '1';
    case 'PENDING': return '2';
    case 'ACTIVE': return '3';
    case 'INACTIVE': return '4';
    case 'TERMINATED': return '5';
    case 'SURRENDERED': return '6';
    case 'LAPSED': return '7';
    case 'DEATH_CLAIM': return '8';
    case 'MATURED': return '9';
    case 'CANCELLED': return '10';
    case 'DECLINED': return '11';
    case 'NOT_TAKEN': return '12';
    case 'PAID_UP': return '13';
    case 'EXTENDED_TERM': return '14';
    case 'REDUCED_PAID_UP': return '15';
    default: return '1';
  }
}

export function reverseMapLineOfBusiness(val: string): string {
  switch (val) {
    case 'LIFE': return '1';
    case 'ANNUITY': return '2';
    case 'HEALTH': return '3';
    case 'PROPERTY': return '4';
    case 'CASUALTY': return '5';
    default: return '0';
  }
}

export function reverseMapProductType(val: string): string {
  switch (val) {
    case 'WHOLE_LIFE': return '1';
    case 'TERM_LIFE': return '2';
    case 'UNIVERSAL_LIFE': return '3';
    case 'VARIABLE_LIFE': return '4';
    case 'VARIABLE_UL': return '5';
    case 'INDEXED_UL': return '6';
    case 'FIXED_ANNUITY': return '20';
    case 'VARIABLE_ANNUITY': return '21';
    case 'INDEXED_ANNUITY': return '22';
    case 'IMMEDIATE_ANNUITY': return '23';
    case 'DEFERRED_ANNUITY': return '24';
    default: return '0';
  }
}

export function reverseMapPolicyStatus(val: string): string {
  switch (val) {
    case 'PROPOSAL_PENDING': return '1';
    case 'PENDING_ISSUE': return '2';
    case 'INFORCE_ACTIVE': return '3';
    case 'INFORCE_PREMIUM_PAYING': return '4';
    case 'PENDING_REISSUE': return '5';
    case 'LAPSED': return '6';
    case 'SURRENDERED': return '7';
    case 'DEATH_CLAIM': return '8';
    case 'MATURED': return '9';
    case 'TERMINATED': return '10';
    case 'CANCELLED_BY_CARRIER': return '11';
    case 'CANCELLED_BY_OWNER': return '12';
    case 'PENDING_RESCIND': return '13';
    case 'RESCINDED': return '14';
    case 'NOT_TAKEN': return '15';
    case 'DECLINED': return '16';
    case 'INCOMPLETE': return '17';
    case 'ISSUED': return '18';
    default: return '1';
  }
}

export function reverseMapPaymentMode(val: string): string {
  switch (val) {
    case 'ANNUAL': return '1';
    case 'SEMI_ANNUAL': return '2';
    case 'QUARTERLY': return '4';
    case 'MONTHLY': return '12';
    case 'WEEKLY': return '52';
    case 'BI_WEEKLY': return '26';
    case 'SINGLE': return '0';
    default: return '12';
  }
}

export function reverseMapPaymentMethod(val: string): string {
  switch (val) {
    case 'CHECK': return '1';
    case 'EFT': return '2';
    case 'CREDIT_CARD': return '3';
    case 'PAYROLL_DEDUCT': return '4';
    case 'GOVT_ALLOTMENT': return '5';
    case 'AUTO_PREMIUM': return '6';
    case 'DIVIDEND': return '7';
    case 'WIRE': return '8';
    default: return '0';
  }
}

export function reverseMapQualPlanType(val: string): string {
  switch (val) {
    case 'NON_QUALIFIED': return '0';
    case 'IRA': return '1';
    case 'ROTH_IRA': return '2';
    case 'SEP_IRA': return '3';
    case 'SIMPLE_IRA': return '4';
    case 'K401': return '5';
    case 'K403B': return '6';
    case 'K457': return '7';
    case 'PENSION': return '8';
    case 'PROFIT_SHARING': return '9';
    case 'KEOGH': return '10';
    case 'INHERITED_IRA': return '11';
    default: return '99';
  }
}

export function reverseMapCoverageIndicatorCode(val: string): string {
  switch (val) {
    case 'BASE': return '1';
    case 'RIDER': return '2';
    case 'OPTION': return '3';
    case 'SUPPLEMENTAL': return '4';
    default: return '1';
  }
}

export function reverseMapCoverageStatus(val: string): string {
  switch (val) {
    case 'ACTIVE': return '1';
    case 'PENDING': return '2';
    case 'TERMINATED': return '3';
    case 'WAIVED': return '4';
    case 'NOT_TAKEN': return '5';
    case 'REDUCED': return '6';
    default: return '1';
  }
}

export function reverseMapRelationRoleCode(val: string): string {
  switch (val) {
    case 'OWNER': return '8';
    case 'INSURED': return '32';
    case 'JOINT_INSURED': return '186';
    case 'ANNUITANT': return '36';
    case 'JOINT_ANNUITANT': return '149';
    case 'PAYOR': return '31';
    case 'PRIMARY_BENEFICIARY': return '34';
    case 'CONTINGENT_BENEFICIARY': return '35';
    case 'FINAL_BENEFICIARY': return '187';
    case 'IRREVOCABLE_BENEFICIARY': return '188';
    case 'PRIMARY_AGENT': return '37';
    case 'SERVICING_AGENT': return '38';
    case 'WRITING_AGENT': return '126';
    case 'BROKER_DEALER': return '127';
    case 'TRUSTEE': return '189';
    case 'CUSTODIAN': return '190';
    case 'EMPLOYER': return '21';
    case 'GUARDIAN': return '191';
    case 'POWER_OF_ATTORNEY': return '192';
    case 'CARRIER': return '87';
    case 'SPOUSE': return '1';
    case 'CHILD': return '2';
    case 'PARENT': return '3';
    case 'SIBLING': return '4';
    case 'GRANDPARENT': return '5';
    case 'GRANDCHILD': return '6';
    case 'OTHER_RELATIVE': return '7';
    default: return '0';
  }
}

export function reverseMapBeneficiaryDesignation(val: string): string {
  switch (val) {
    case 'NAMED': return '1';
    case 'PER_STIRPES': return '2';
    case 'ESTATE': return '3';
    case 'TRUST': return '4';
    case 'CHARITY': return '5';
    case 'CLASS': return '6';
    default: return '0';
  }
}
