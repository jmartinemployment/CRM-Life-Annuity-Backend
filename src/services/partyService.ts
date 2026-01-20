import prisma from '../utils/prisma';
import { Prisma, PartyTypeCode } from '@prisma/client';
import {
  CreatePartyInput,
  UpdatePartyInput,
  PartyFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

// Include for detailed party view
const partyDetailInclude = {
  person: true,
  organization: true,
  addresses: true,
  phones: true,
  emails: true,
  client: true,
  producer: true,
} satisfies Prisma.PartyInclude;

// Include for list view (primary contact info only)
const partyListInclude = {
  person: true,
  organization: true,
  addresses: {
    where: { isPrimary: true },
    take: 1,
  },
  phones: {
    where: { isPrimary: true },
    take: 1,
  },
  emails: {
    where: { isPrimary: true },
    take: 1,
  },
  client: true,
} satisfies Prisma.PartyInclude;

export type PartyDetail = Prisma.PartyGetPayload<{ include: typeof partyDetailInclude }>;
export type PartyListItem = Prisma.PartyGetPayload<{ include: typeof partyListInclude }>;

class PartyService {
  async create(input: CreatePartyInput): Promise<PartyDetail> {
    const { person, organization, addresses, phones, emails, client, ...partyData } = input;

    if (partyData.partyTypeCode === PartyTypeCode.PERSON && !person) {
      throw new Error('Person details required for PERSON party type');
    }
    if (partyData.partyTypeCode === PartyTypeCode.ORGANIZATION && !organization) {
      throw new Error('Organization details required for ORGANIZATION party type');
    }

    return prisma.party.create({
      data: {
        partyTypeCode: partyData.partyTypeCode,
        partyKey: partyData.partyKey,
        fullName: partyData.fullName,
        govtId: partyData.govtId,
        govtIdType: partyData.govtIdType,
        residenceState: partyData.residenceState,
        residenceCountry: partyData.residenceCountry,
        prefComm: partyData.prefComm,
        person: person
          ? {
              create: {
                firstName: person.firstName,
                lastName: person.lastName,
                middleName: person.middleName,
                prefix: person.prefix,
                suffix: person.suffix,
                nickName: person.nickName,
                title: person.title,
                gender: person.gender,
                birthDate: person.birthDate ? new Date(person.birthDate) : undefined,
                maritalStatus: person.maritalStatus,
                citizenship: person.citizenship,
                occupation: person.occupation,
                smokerStatus: person.smokerStatus,
              },
            }
          : undefined,
        organization: organization
          ? {
              create: {
                dba: organization.dba,
                abbrName: organization.abbrName,
                orgForm: organization.orgForm,
                establishedDate: organization.establishedDate
                  ? new Date(organization.establishedDate)
                  : undefined,
                businessDesc: organization.businessDesc,
                sicCode: organization.sicCode,
                naicsCode: organization.naicsCode,
                numEmployees: organization.numEmployees,
              },
            }
          : undefined,
        addresses: addresses?.length ? { create: addresses } : undefined,
        phones: phones?.length ? { create: phones } : undefined,
        emails: emails?.length ? { create: emails } : undefined,
        client: client
          ? {
              create: {
                leadSource: client.leadSource,
                leadStatus: client.leadStatus,
                assignedAgentId: client.assignedAgentId,
                riskTolerance: client.riskTolerance,
                investmentObjective: client.investmentObjective,
                timeHorizon: client.timeHorizon,
                notes: client.notes,
              },
            }
          : undefined,
      },
      include: partyDetailInclude,
    });
  }

  async findById(id: string): Promise<PartyDetail | null> {
    return prisma.party.findUnique({
      where: { id },
      include: partyDetailInclude,
    });
  }

  async findMany(
    filters: PartyFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<PartyListItem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.PartyWhereInput = {};

    if (filters.partyTypeCode) {
      where.partyTypeCode = filters.partyTypeCode;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { person: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { person: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { organization: { dba: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.leadStatus || filters.leadSource) {
      where.client = {};
      if (filters.leadStatus) where.client.leadStatus = filters.leadStatus;
      if (filters.leadSource) where.client.leadSource = filters.leadSource;
    }

    if (filters.state) {
      where.addresses = { some: { state: filters.state } };
    }

    const [data, total] = await Promise.all([
      prisma.party.findMany({
        where,
        include: partyListInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.party.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, input: UpdatePartyInput): Promise<PartyDetail> {
    const { person, organization, addresses, phones, emails, client, ...partyData } = input;

    return prisma.$transaction(async (tx) => {
      // Update party
      if (Object.keys(partyData).length > 0) {
        await tx.party.update({
          where: { id },
          data: {
            partyTypeCode: partyData.partyTypeCode,
            partyKey: partyData.partyKey,
            fullName: partyData.fullName,
            govtId: partyData.govtId,
            govtIdType: partyData.govtIdType,
            residenceState: partyData.residenceState,
            residenceCountry: partyData.residenceCountry,
            prefComm: partyData.prefComm,
          },
        });
      }

      // Update person
      if (person) {
        await tx.person.upsert({
          where: { partyId: id },
          update: {
            firstName: person.firstName,
            lastName: person.lastName,
            middleName: person.middleName,
            prefix: person.prefix,
            suffix: person.suffix,
            nickName: person.nickName,
            title: person.title,
            gender: person.gender,
            birthDate: person.birthDate ? new Date(person.birthDate) : undefined,
            maritalStatus: person.maritalStatus,
            citizenship: person.citizenship,
            occupation: person.occupation,
            smokerStatus: person.smokerStatus,
          },
          create: {
            partyId: id,
            firstName: person.firstName,
            lastName: person.lastName,
            middleName: person.middleName,
            prefix: person.prefix,
            suffix: person.suffix,
            nickName: person.nickName,
            title: person.title,
            gender: person.gender,
            birthDate: person.birthDate ? new Date(person.birthDate) : undefined,
            maritalStatus: person.maritalStatus,
            citizenship: person.citizenship,
            occupation: person.occupation,
            smokerStatus: person.smokerStatus,
          },
        });
      }

      // Update organization
      if (organization) {
        await tx.organization.upsert({
          where: { partyId: id },
          update: {
            dba: organization.dba,
            abbrName: organization.abbrName,
            orgForm: organization.orgForm,
            establishedDate: organization.establishedDate
              ? new Date(organization.establishedDate)
              : undefined,
            businessDesc: organization.businessDesc,
            sicCode: organization.sicCode,
            naicsCode: organization.naicsCode,
            numEmployees: organization.numEmployees,
          },
          create: {
            partyId: id,
            dba: organization.dba,
            abbrName: organization.abbrName,
            orgForm: organization.orgForm,
            establishedDate: organization.establishedDate
              ? new Date(organization.establishedDate)
              : undefined,
            businessDesc: organization.businessDesc,
            sicCode: organization.sicCode,
            naicsCode: organization.naicsCode,
            numEmployees: organization.numEmployees,
          },
        });
      }

      // Update client
      if (client) {
        await tx.client.upsert({
          where: { partyId: id },
          update: {
            leadSource: client.leadSource,
            leadStatus: client.leadStatus,
            assignedAgentId: client.assignedAgentId,
            riskTolerance: client.riskTolerance,
            investmentObjective: client.investmentObjective,
            timeHorizon: client.timeHorizon,
            notes: client.notes,
          },
          create: {
            partyId: id,
            leadSource: client.leadSource,
            leadStatus: client.leadStatus,
            assignedAgentId: client.assignedAgentId,
            riskTolerance: client.riskTolerance,
            investmentObjective: client.investmentObjective,
            timeHorizon: client.timeHorizon,
            notes: client.notes,
          },
        });
      }

      // Replace addresses if provided
      if (addresses) {
        await tx.address.deleteMany({ where: { partyId: id } });
        if (addresses.length > 0) {
          await tx.address.createMany({
            data: addresses.map((addr) => ({ ...addr, partyId: id })),
          });
        }
      }

      // Replace phones if provided
      if (phones) {
        await tx.phone.deleteMany({ where: { partyId: id } });
        if (phones.length > 0) {
          await tx.phone.createMany({
            data: phones.map((phone) => ({ ...phone, partyId: id })),
          });
        }
      }

      // Replace emails if provided
      if (emails) {
        await tx.eMailAddress.deleteMany({ where: { partyId: id } });
        if (emails.length > 0) {
          await tx.eMailAddress.createMany({
            data: emails.map((email) => ({ ...email, partyId: id })),
          });
        }
      }

      return tx.party.findUniqueOrThrow({
        where: { id },
        include: partyDetailInclude,
      });
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.party.delete({ where: { id } });
  }

  async search(query: string, limit = 10): Promise<PartyListItem[]> {
    return prisma.party.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { person: { firstName: { contains: query, mode: 'insensitive' } } },
          { person: { lastName: { contains: query, mode: 'insensitive' } } },
          { organization: { dba: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: partyListInclude,
      take: limit,
    });
  }
}

export const partyService = new PartyService();
export default partyService;
