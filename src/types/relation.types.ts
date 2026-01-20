import { RelationRoleCode, BeneficiaryDesignation } from '@prisma/client';

// Relation input - for linking parties to holdings or other parties
export interface CreateRelationInput {
  // Origin (one of these should be provided)
  originatingPartyId?: string;
  originatingHoldingId?: string;
  
  // Related party
  relatedPartyId: string;
  
  // Role
  relationRoleCode: RelationRoleCode;
  relationDescription?: string;
  
  // Beneficiary fields
  interestPercent?: number;
  beneficiarySeqNum?: number;
  beneficiaryDesignation?: BeneficiaryDesignation;
  irrevocableInd?: boolean;
  
  // Producer fields
  volumeSharePct?: number;
  commScheduleCode?: string;
  
  // Validity
  startDate?: string;
  endDate?: string;
  
  // Order
  sequence?: number;
}

export interface UpdateRelationInput extends Partial<CreateRelationInput> {}

// Query filters
export interface RelationFilters {
  originatingPartyId?: string;
  originatingHoldingId?: string;
  relatedPartyId?: string;
  relationRoleCode?: RelationRoleCode;
  roleCategory?: 'POLICY' | 'BENEFICIARY' | 'PRODUCER' | 'FAMILY';
}

// Role categories for easier filtering
export const POLICY_ROLES: RelationRoleCode[] = [
  'OWNER',
  'INSURED',
  'JOINT_INSURED',
  'ANNUITANT',
  'JOINT_ANNUITANT',
  'PAYOR',
];

export const BENEFICIARY_ROLES: RelationRoleCode[] = [
  'PRIMARY_BENEFICIARY',
  'CONTINGENT_BENEFICIARY',
  'FINAL_BENEFICIARY',
  'IRREVOCABLE_BENEFICIARY',
];

export const PRODUCER_ROLES: RelationRoleCode[] = [
  'PRIMARY_AGENT',
  'SERVICING_AGENT',
  'WRITING_AGENT',
  'BROKER_DEALER',
];

export const FAMILY_ROLES: RelationRoleCode[] = [
  'SPOUSE',
  'CHILD',
  'PARENT',
  'SIBLING',
  'GRANDPARENT',
  'GRANDCHILD',
  'OTHER_RELATIVE',
];

export const OTHER_ROLES: RelationRoleCode[] = [
  'TRUSTEE',
  'CUSTODIAN',
  'EMPLOYER',
  'GUARDIAN',
  'POWER_OF_ATTORNEY',
  'CARRIER',
  'OTHER',
];
