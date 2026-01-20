import prisma from '../utils/prisma';
import { Prisma, RelationRoleCode } from '@prisma/client';
import {
  CreateRelationInput,
  UpdateRelationInput,
  RelationFilters,
  PaginationParams,
  PaginatedResponse,
  POLICY_ROLES,
  BENEFICIARY_ROLES,
  PRODUCER_ROLES,
  FAMILY_ROLES,
} from '../types';

// Include for detailed relation view
const relationDetailInclude = {
  originatingParty: {
    include: {
      person: true,
      organization: true,
    },
  },
  originatingHolding: {
    include: {
      policy: {
        select: {
          polNumber: true,
          productType: true,
          policyStatus: true,
        },
      },
    },
  },
  relatedParty: {
    include: {
      person: true,
      organization: true,
    },
  },
} satisfies Prisma.RelationInclude;

// Include for list view
const relationListInclude = {
  originatingParty: {
    select: {
      id: true,
      fullName: true,
      partyTypeCode: true,
      person: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      organization: {
        select: {
          dba: true,
        },
      },
    },
  },
  originatingHolding: {
    select: {
      id: true,
      holdingName: true,
      holdingTypeCode: true,
      holdingStatus: true,
      policy: {
        select: {
          polNumber: true,
        },
      },
    },
  },
  relatedParty: {
    select: {
      id: true,
      fullName: true,
      partyTypeCode: true,
      person: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      organization: {
        select: {
          dba: true,
        },
      },
    },
  },
} satisfies Prisma.RelationInclude;

export type RelationDetail = Prisma.RelationGetPayload<{ include: typeof relationDetailInclude }>;
export type RelationListItem = Prisma.RelationGetPayload<{ include: typeof relationListInclude }>;

class RelationService {
  async create(input: CreateRelationInput): Promise<RelationDetail> {
    // Validate that at least one originating entity is provided
    if (!input.originatingPartyId && !input.originatingHoldingId) {
      throw new Error('Either originatingPartyId or originatingHoldingId must be provided');
    }

    // Validate related party exists
    const relatedParty = await prisma.party.findUnique({
      where: { id: input.relatedPartyId },
    });
    if (!relatedParty) {
      throw new Error('Related party not found');
    }

    // Validate originating entity exists
    if (input.originatingPartyId) {
      const originatingParty = await prisma.party.findUnique({
        where: { id: input.originatingPartyId },
      });
      if (!originatingParty) {
        throw new Error('Originating party not found');
      }
    }

    if (input.originatingHoldingId) {
      const originatingHolding = await prisma.holding.findUnique({
        where: { id: input.originatingHoldingId },
      });
      if (!originatingHolding) {
        throw new Error('Originating holding not found');
      }
    }

    return prisma.relation.create({
      data: {
        originatingPartyId: input.originatingPartyId,
        originatingHoldingId: input.originatingHoldingId,
        relatedPartyId: input.relatedPartyId,
        relationRoleCode: input.relationRoleCode,
        relationDescription: input.relationDescription,
        interestPercent: input.interestPercent,
        beneficiarySeqNum: input.beneficiarySeqNum,
        beneficiaryDesignation: input.beneficiaryDesignation,
        irrevocableInd: input.irrevocableInd,
        volumeSharePct: input.volumeSharePct,
        commScheduleCode: input.commScheduleCode,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        sequence: input.sequence,
      },
      include: relationDetailInclude,
    });
  }

  async findById(id: string): Promise<RelationDetail | null> {
    return prisma.relation.findUnique({
      where: { id },
      include: relationDetailInclude,
    });
  }

  async findMany(
    filters: RelationFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<RelationListItem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.RelationWhereInput = {};

    if (filters.originatingPartyId) {
      where.originatingPartyId = filters.originatingPartyId;
    }

    if (filters.originatingHoldingId) {
      where.originatingHoldingId = filters.originatingHoldingId;
    }

    if (filters.relatedPartyId) {
      where.relatedPartyId = filters.relatedPartyId;
    }

    if (filters.relationRoleCode) {
      where.relationRoleCode = filters.relationRoleCode;
    }

    // Filter by role category
    if (filters.roleCategory) {
      let roles: RelationRoleCode[] = [];
      switch (filters.roleCategory) {
        case 'POLICY':
          roles = POLICY_ROLES;
          break;
        case 'BENEFICIARY':
          roles = BENEFICIARY_ROLES;
          break;
        case 'PRODUCER':
          roles = PRODUCER_ROLES;
          break;
        case 'FAMILY':
          roles = FAMILY_ROLES;
          break;
      }
      where.relationRoleCode = { in: roles };
    }

    const [data, total] = await Promise.all([
      prisma.relation.findMany({
        where,
        include: relationListInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.relation.count({ where }),
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

  async update(id: string, input: UpdateRelationInput): Promise<RelationDetail> {
    return prisma.relation.update({
      where: { id },
      data: {
        originatingPartyId: input.originatingPartyId,
        originatingHoldingId: input.originatingHoldingId,
        relatedPartyId: input.relatedPartyId,
        relationRoleCode: input.relationRoleCode,
        relationDescription: input.relationDescription,
        interestPercent: input.interestPercent,
        beneficiarySeqNum: input.beneficiarySeqNum,
        beneficiaryDesignation: input.beneficiaryDesignation,
        irrevocableInd: input.irrevocableInd,
        volumeSharePct: input.volumeSharePct,
        commScheduleCode: input.commScheduleCode,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        sequence: input.sequence,
      },
      include: relationDetailInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.relation.delete({ where: { id } });
  }

  // Get all relations for a holding (owner, insured, beneficiaries, agents)
  async findByHolding(holdingId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: { originatingHoldingId: holdingId },
      include: relationListInclude,
      orderBy: [
        { relationRoleCode: 'asc' },
        { sequence: 'asc' },
      ],
    });
  }

  // Get all relations for a party (holdings they're connected to, family relations)
  async findByParty(partyId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        OR: [
          { originatingPartyId: partyId },
          { relatedPartyId: partyId },
        ],
      },
      include: relationListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get beneficiaries for a holding
  async getBeneficiaries(holdingId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        originatingHoldingId: holdingId,
        relationRoleCode: { in: BENEFICIARY_ROLES },
      },
      include: relationListInclude,
      orderBy: [
        { beneficiarySeqNum: 'asc' },
        { interestPercent: 'desc' },
      ],
    });
  }

  // Get owner(s) for a holding
  async getOwners(holdingId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        originatingHoldingId: holdingId,
        relationRoleCode: 'OWNER',
      },
      include: relationListInclude,
    });
  }

  // Get insured(s) for a holding
  async getInsureds(holdingId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        originatingHoldingId: holdingId,
        relationRoleCode: { in: ['INSURED', 'JOINT_INSURED', 'ANNUITANT', 'JOINT_ANNUITANT'] },
      },
      include: relationListInclude,
    });
  }

  // Get agents/producers for a holding
  async getProducers(holdingId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        originatingHoldingId: holdingId,
        relationRoleCode: { in: PRODUCER_ROLES },
      },
      include: relationListInclude,
      orderBy: { volumeSharePct: 'desc' },
    });
  }

  // Get family relations for a party
  async getFamilyRelations(partyId: string): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        OR: [
          { originatingPartyId: partyId, relationRoleCode: { in: FAMILY_ROLES } },
          { relatedPartyId: partyId, relationRoleCode: { in: FAMILY_ROLES } },
        ],
      },
      include: relationListInclude,
    });
  }

  // Get all holdings where a party has a specific role
  async findHoldingsByPartyRole(partyId: string, roleCode: RelationRoleCode): Promise<RelationListItem[]> {
    return prisma.relation.findMany({
      where: {
        relatedPartyId: partyId,
        relationRoleCode: roleCode,
        originatingHoldingId: { not: null },
      },
      include: relationListInclude,
    });
  }

  // Validate beneficiary percentages sum to 100% for each beneficiary level
  async validateBeneficiaryPercentages(holdingId: string): Promise<{
    valid: boolean;
    primary: number;
    contingent: number;
    errors: string[];
  }> {
    const beneficiaries = await this.getBeneficiaries(holdingId);
    
    const primaryBeneficiaries = beneficiaries.filter(
      (b) => b.relationRoleCode === 'PRIMARY_BENEFICIARY'
    );
    const contingentBeneficiaries = beneficiaries.filter(
      (b) => b.relationRoleCode === 'CONTINGENT_BENEFICIARY'
    );

    const primaryTotal = primaryBeneficiaries.reduce(
      (sum, b) => sum + (Number(b.interestPercent) || 0),
      0
    );
    const contingentTotal = contingentBeneficiaries.reduce(
      (sum, b) => sum + (Number(b.interestPercent) || 0),
      0
    );

    const errors: string[] = [];
    
    if (primaryBeneficiaries.length > 0 && primaryTotal !== 100) {
      errors.push(`Primary beneficiary percentages total ${primaryTotal}%, should be 100%`);
    }
    if (contingentBeneficiaries.length > 0 && contingentTotal !== 100) {
      errors.push(`Contingent beneficiary percentages total ${contingentTotal}%, should be 100%`);
    }

    return {
      valid: errors.length === 0,
      primary: primaryTotal,
      contingent: contingentTotal,
      errors,
    };
  }
}

export const relationService = new RelationService();
export default relationService;
