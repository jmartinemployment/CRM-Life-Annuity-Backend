import {
  PartyTypeCode,
  GenderCode,
  MaritalStatus,
  AddressTypeCode,
  PhoneTypeCode,
  EmailTypeCode,
  LeadSource,
  LeadStatus,
  GovtIdType,
  OrgFormType,
} from '@prisma/client';

// Person input - matches Person model fields
export interface CreatePersonInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  prefix?: string;
  suffix?: string;
  nickName?: string;
  title?: string;
  gender?: GenderCode;
  birthDate?: string;
  maritalStatus?: MaritalStatus;
  citizenship?: string;
  occupation?: string;
  smokerStatus?: string;
}

// Organization input - matches Organization model fields
export interface CreateOrganizationInput {
  dba?: string;
  abbrName?: string;
  orgForm?: OrgFormType;
  establishedDate?: string;
  businessDesc?: string;
  sicCode?: string;
  naicsCode?: string;
  numEmployees?: number;
}

// Address input - matches Address model fields
export interface CreateAddressInput {
  addressTypeCode: AddressTypeCode;
  attentionLine?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isPrimary?: boolean;
  solicitationInd?: boolean;
}

// Phone input - matches Phone model fields
export interface CreatePhoneInput {
  phoneTypeCode: PhoneTypeCode;
  countryCode?: string;
  areaCode?: string;
  dialNumber: string;
  extension?: string;
  isPrimary?: boolean;
  solicitationInd?: boolean;
}

// Email input - matches EMailAddress model fields
export interface CreateEmailInput {
  emailTypeCode: EmailTypeCode;
  addrLine: string;
  isPrimary?: boolean;
  attachmentInd?: boolean;
  solicitationInd?: boolean;
}

// Client input - matches Client model fields
export interface CreateClientInput {
  leadSource?: LeadSource;
  leadStatus?: LeadStatus;
  assignedAgentId?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  timeHorizon?: string;
  notes?: string;
}

// Party input - matches Party model fields
export interface CreatePartyInput {
  partyTypeCode: PartyTypeCode;
  partyKey?: string;
  fullName?: string;
  govtId?: string;
  govtIdType?: GovtIdType;
  residenceState?: string;
  residenceCountry?: string;
  prefComm?: string;
  person?: CreatePersonInput;
  organization?: CreateOrganizationInput;
  addresses?: CreateAddressInput[];
  phones?: CreatePhoneInput[];
  emails?: CreateEmailInput[];
  client?: CreateClientInput;
}

export interface UpdatePartyInput extends Partial<CreatePartyInput> {}

// Query parameters
export interface PartyFilters {
  partyTypeCode?: PartyTypeCode;
  search?: string;
  leadStatus?: LeadStatus;
  leadSource?: LeadSource;
  state?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
