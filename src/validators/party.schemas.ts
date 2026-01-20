import { z } from 'zod';
import {
  PartyTypeCode,
  GenderCode,
  MaritalStatus,
  AddressTypeCode,
  PhoneTypeCode,
  EmailTypeCode,
  GovtIdType,
  OrgFormType,
  TrustType,
  LeadSource,
  LeadStatus,
} from '@prisma/client';
import {
  optionalCuidSchema,
  optionalDateStringSchema,
  optionalNonEmptyStringSchema,
  optionalStateCodeSchema,
  optionalCountryCodeSchema,
  optionalZipCodeSchema,
  paginationQuerySchema,
  createEnumSchema,
  createOptionalEnumSchema,
} from './common.schemas';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

const partyTypeCodeSchema = createEnumSchema(PartyTypeCode, 'partyTypeCode');
const optionalPartyTypeCodeSchema = createOptionalEnumSchema(PartyTypeCode, 'partyTypeCode');
const optionalGenderCodeSchema = createOptionalEnumSchema(GenderCode, 'gender');
const optionalMaritalStatusSchema = createOptionalEnumSchema(MaritalStatus, 'maritalStatus');
const addressTypeCodeSchema = createEnumSchema(AddressTypeCode, 'addressTypeCode');
const phoneTypeCodeSchema = createEnumSchema(PhoneTypeCode, 'phoneTypeCode');
const emailTypeCodeSchema = createEnumSchema(EmailTypeCode, 'emailTypeCode');
const optionalGovtIdTypeSchema = createOptionalEnumSchema(GovtIdType, 'govtIdType');
const optionalOrgFormTypeSchema = createOptionalEnumSchema(OrgFormType, 'orgForm');
const optionalTrustTypeSchema = createOptionalEnumSchema(TrustType, 'trustType');
const optionalLeadSourceSchema = createOptionalEnumSchema(LeadSource, 'leadSource');
const optionalLeadStatusSchema = createOptionalEnumSchema(LeadStatus, 'leadStatus');

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

/**
 * Person details schema
 */
export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  middleName: optionalNonEmptyStringSchema,
  prefix: optionalNonEmptyStringSchema,
  suffix: optionalNonEmptyStringSchema,
  nickName: optionalNonEmptyStringSchema,
  title: optionalNonEmptyStringSchema,
  gender: optionalGenderCodeSchema,
  birthDate: optionalDateStringSchema,
  maritalStatus: optionalMaritalStatusSchema,
  citizenship: optionalCountryCodeSchema,
  occupation: optionalNonEmptyStringSchema,
  smokerStatus: optionalNonEmptyStringSchema,
});

/**
 * Organization details schema
 */
export const organizationSchema = z.object({
  dba: optionalNonEmptyStringSchema,
  abbrName: optionalNonEmptyStringSchema,
  orgForm: optionalOrgFormTypeSchema,
  trustType: optionalTrustTypeSchema,
  establishedDate: optionalDateStringSchema,
  businessDesc: optionalNonEmptyStringSchema,
  sicCode: optionalNonEmptyStringSchema,
  naicsCode: optionalNonEmptyStringSchema,
  numEmployees: z.number().int().nonnegative().optional(),
});

/**
 * Address schema
 */
export const addressSchema = z.object({
  addressTypeCode: addressTypeCodeSchema.default('RESIDENCE'),
  line1: optionalNonEmptyStringSchema,
  line2: optionalNonEmptyStringSchema,
  line3: optionalNonEmptyStringSchema,
  city: optionalNonEmptyStringSchema,
  state: optionalStateCodeSchema,
  zip: optionalZipCodeSchema,
  country: optionalCountryCodeSchema,
  isPrimary: z.boolean().default(false),
  solicitationInd: z.boolean().default(true),
});

/**
 * Phone schema
 */
export const phoneSchema = z.object({
  phoneTypeCode: phoneTypeCodeSchema.default('HOME'),
  areaCode: z.string().length(3).optional(),
  dialNumber: z.string().min(7, 'Phone number is required').max(15),
  extension: optionalNonEmptyStringSchema,
  countryCode: z.string().default('1'),
  isPrimary: z.boolean().default(false),
  solicitationInd: z.boolean().default(true),
});

/**
 * Email schema
 */
export const emailAddressSchema = z.object({
  emailTypeCode: emailTypeCodeSchema.default('PERSONAL'),
  addrLine: z.string().email('Invalid email address'),
  isPrimary: z.boolean().default(false),
  solicitationInd: z.boolean().default(true),
});

/**
 * Client (CRM) details schema
 */
export const clientSchema = z.object({
  leadSource: optionalLeadSourceSchema,
  leadStatus: optionalLeadStatusSchema,
  assignedAgentId: optionalCuidSchema,
  riskTolerance: optionalNonEmptyStringSchema,
  investmentObjective: optionalNonEmptyStringSchema,
  timeHorizon: optionalNonEmptyStringSchema,
  notes: optionalNonEmptyStringSchema,
});

// ============================================================================
// PARTY SCHEMAS
// ============================================================================

/**
 * Create party request body schema
 */
export const createPartySchema = z.object({
  partyTypeCode: partyTypeCodeSchema,
  partyKey: optionalNonEmptyStringSchema,
  fullName: optionalNonEmptyStringSchema,
  govtId: optionalNonEmptyStringSchema,
  govtIdType: optionalGovtIdTypeSchema,
  residenceState: optionalStateCodeSchema,
  residenceCountry: optionalCountryCodeSchema,
  prefComm: optionalNonEmptyStringSchema,
  
  // Nested objects
  person: personSchema.optional(),
  organization: organizationSchema.optional(),
  addresses: z.array(addressSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  emails: z.array(emailAddressSchema).optional(),
  client: clientSchema.optional(),
}).refine(
  (data) => {
    // Person is required for PERSON type
    if (data.partyTypeCode === 'PERSON' && !data.person) {
      return false;
    }
    // Organization is required for ORGANIZATION type
    if (data.partyTypeCode === 'ORGANIZATION' && !data.organization) {
      return false;
    }
    return true;
  },
  {
    message: 'Person details required for PERSON type, Organization details required for ORGANIZATION type',
    path: ['partyTypeCode'],
  }
);

/**
 * Update party request body schema
 */
export const updatePartySchema = z.object({
  partyTypeCode: optionalPartyTypeCodeSchema,
  partyKey: optionalNonEmptyStringSchema,
  fullName: optionalNonEmptyStringSchema,
  govtId: optionalNonEmptyStringSchema,
  govtIdType: optionalGovtIdTypeSchema,
  residenceState: optionalStateCodeSchema,
  residenceCountry: optionalCountryCodeSchema,
  prefComm: optionalNonEmptyStringSchema,
  
  // Nested objects (all optional for update)
  person: personSchema.partial().optional(),
  organization: organizationSchema.partial().optional(),
  addresses: z.array(addressSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  emails: z.array(emailAddressSchema).optional(),
  client: clientSchema.partial().optional(),
});

/**
 * Party list query parameters
 */
export const partyListQuerySchema = paginationQuerySchema.extend({
  partyTypeCode: optionalPartyTypeCodeSchema,
  search: optionalNonEmptyStringSchema,
  leadStatus: optionalLeadStatusSchema,
  leadSource: optionalLeadSourceSchema,
  state: optionalStateCodeSchema,
});

/**
 * Party search query parameters
 */
export const partySearchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartyListQuery = z.infer<typeof partyListQuerySchema>;
export type PartySearchQuery = z.infer<typeof partySearchQuerySchema>;
