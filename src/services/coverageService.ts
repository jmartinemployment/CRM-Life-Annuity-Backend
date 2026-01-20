import prisma from '../utils/prisma';
import { Prisma, CoverageIndicatorCode, CoverageStatus } from '@prisma/client';
import {
  CreateCoverageInput,
  UpdateCoverageInput,
  CreateLifeParticipantInput,
  UpdateLifeParticipantInput,
  CreateCovOptionInput,
  UpdateCovOptionInput,
  CoverageFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

// Include for detailed coverage view
const coverageDetailInclude = {
  policy: {
    select: {
      id: true,
      polNumber: true,
      productType: true,
      policyStatus: true,
      holding: {
        select: {
          id: true,
          holdingName: true,
        },
      },
    },
  },
  lifeParticipants: true,
  covOptions: true,
} satisfies Prisma.CoverageInclude;

// Include for list view
const coverageListInclude = {
  policy: {
    select: {
      id: true,
      polNumber: true,
    },
  },
  lifeParticipants: {
    select: {
      id: true,
      partyId: true,
      participantType: true,
      issueAge: true,
      underwritingClass: true,
    },
  },
  covOptions: {
    where: { isActive: true },
    select: {
      id: true,
      optionType: true,
      optionName: true,
      optionAmt: true,
    },
  },
} satisfies Prisma.CoverageInclude;

export type CoverageDetail = Prisma.CoverageGetPayload<{ include: typeof coverageDetailInclude }>;
export type CoverageListItem = Prisma.CoverageGetPayload<{ include: typeof coverageListInclude }>;

class CoverageService {
  // =========================================================================
  // COVERAGE CRUD
  // =========================================================================

  async create(input: CreateCoverageInput): Promise<CoverageDetail> {
    const { lifeParticipants, covOptions, ...coverageData } = input;

    // Validate policy exists
    const policy = await prisma.policy.findUnique({
      where: { id: input.policyId },
    });
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Validate life participants' parties exist
    if (lifeParticipants?.length) {
      for (const participant of lifeParticipants) {
        const party = await prisma.party.findUnique({
          where: { id: participant.partyId },
        });
        if (!party) {
          throw new Error(`Party not found: ${participant.partyId}`);
        }
      }
    }

    return prisma.coverage.create({
      data: {
        policyId: coverageData.policyId,
        coverageKey: coverageData.coverageKey,
        covNumber: coverageData.covNumber,
        productCode: coverageData.productCode,
        planName: coverageData.planName,
        indicatorCode: coverageData.indicatorCode || CoverageIndicatorCode.BASE,
        lifeCovTypeCode: coverageData.lifeCovTypeCode,
        lifeCovStatus: coverageData.lifeCovStatus || CoverageStatus.ACTIVE,
        currentAmt: coverageData.currentAmt,
        deathBenefitAmt: coverageData.deathBenefitAmt,
        initCovAmt: coverageData.initCovAmt,
        cashValue: coverageData.cashValue,
        modalPremAmt: coverageData.modalPremAmt,
        annualPremAmt: coverageData.annualPremAmt,
        targetPremAmt: coverageData.targetPremAmt,
        effDate: coverageData.effDate ? new Date(coverageData.effDate) : undefined,
        termDate: coverageData.termDate ? new Date(coverageData.termDate) : undefined,
        paidToDate: coverageData.paidToDate ? new Date(coverageData.paidToDate) : undefined,
        duration: coverageData.duration,
        benefitPeriod: coverageData.benefitPeriod,
        issueGender: coverageData.issueGender,
        equivalentAge: coverageData.equivalentAge,
        guarIntRate: coverageData.guarIntRate,
        lifeParticipants: lifeParticipants?.length
          ? {
              create: lifeParticipants.map((p) => ({
                partyId: p.partyId,
                participantType: p.participantType,
                issueAge: p.issueAge,
                issueGender: p.issueGender,
                underwritingClass: p.underwritingClass,
                tobaccoClass: p.tobaccoClass,
                tableRating: p.tableRating,
                flatExtraAmt: p.flatExtraAmt,
                flatExtraEndDate: p.flatExtraEndDate ? new Date(p.flatExtraEndDate) : undefined,
                permFlatExtraAmt: p.permFlatExtraAmt,
              })),
            }
          : undefined,
        covOptions: covOptions?.length
          ? {
              create: covOptions.map((o) => ({
                optionType: o.optionType,
                optionCode: o.optionCode,
                optionName: o.optionName,
                optionAmt: o.optionAmt,
                optionPremAmt: o.optionPremAmt,
                effDate: o.effDate ? new Date(o.effDate) : undefined,
                termDate: o.termDate ? new Date(o.termDate) : undefined,
                isActive: o.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: coverageDetailInclude,
    });
  }

  async findById(id: string): Promise<CoverageDetail | null> {
    return prisma.coverage.findUnique({
      where: { id },
      include: coverageDetailInclude,
    });
  }

  async findMany(
    filters: CoverageFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<CoverageListItem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CoverageWhereInput = {};

    if (filters.policyId) {
      where.policyId = filters.policyId;
    }

    if (filters.indicatorCode) {
      where.indicatorCode = filters.indicatorCode;
    }

    if (filters.lifeCovStatus) {
      where.lifeCovStatus = filters.lifeCovStatus;
    }

    if (filters.lifeCovTypeCode) {
      where.lifeCovTypeCode = filters.lifeCovTypeCode;
    }

    const [data, total] = await Promise.all([
      prisma.coverage.findMany({
        where,
        include: coverageListInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.coverage.count({ where }),
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

  async update(id: string, input: UpdateCoverageInput): Promise<CoverageDetail> {
    const { lifeParticipants, covOptions, ...coverageData } = input;

    return prisma.$transaction(async (tx) => {
      // Update coverage fields
      await tx.coverage.update({
        where: { id },
        data: {
          coverageKey: coverageData.coverageKey,
          covNumber: coverageData.covNumber,
          productCode: coverageData.productCode,
          planName: coverageData.planName,
          indicatorCode: coverageData.indicatorCode,
          lifeCovTypeCode: coverageData.lifeCovTypeCode,
          lifeCovStatus: coverageData.lifeCovStatus,
          currentAmt: coverageData.currentAmt,
          deathBenefitAmt: coverageData.deathBenefitAmt,
          initCovAmt: coverageData.initCovAmt,
          cashValue: coverageData.cashValue,
          modalPremAmt: coverageData.modalPremAmt,
          annualPremAmt: coverageData.annualPremAmt,
          targetPremAmt: coverageData.targetPremAmt,
          effDate: coverageData.effDate ? new Date(coverageData.effDate) : undefined,
          termDate: coverageData.termDate ? new Date(coverageData.termDate) : undefined,
          paidToDate: coverageData.paidToDate ? new Date(coverageData.paidToDate) : undefined,
          duration: coverageData.duration,
          benefitPeriod: coverageData.benefitPeriod,
          issueGender: coverageData.issueGender,
          equivalentAge: coverageData.equivalentAge,
          guarIntRate: coverageData.guarIntRate,
        },
      });

      // Replace life participants if provided
      if (lifeParticipants) {
        await tx.lifeParticipant.deleteMany({ where: { coverageId: id } });
        if (lifeParticipants.length > 0) {
          await tx.lifeParticipant.createMany({
            data: lifeParticipants.map((p) => ({
              coverageId: id,
              partyId: p.partyId,
              participantType: p.participantType,
              issueAge: p.issueAge,
              issueGender: p.issueGender,
              underwritingClass: p.underwritingClass,
              tobaccoClass: p.tobaccoClass,
              tableRating: p.tableRating,
              flatExtraAmt: p.flatExtraAmt,
              flatExtraEndDate: p.flatExtraEndDate ? new Date(p.flatExtraEndDate) : undefined,
              permFlatExtraAmt: p.permFlatExtraAmt,
            })),
          });
        }
      }

      // Replace coverage options if provided
      if (covOptions) {
        await tx.covOption.deleteMany({ where: { coverageId: id } });
        if (covOptions.length > 0) {
          await tx.covOption.createMany({
            data: covOptions.map((o) => ({
              coverageId: id,
              optionType: o.optionType,
              optionCode: o.optionCode,
              optionName: o.optionName,
              optionAmt: o.optionAmt,
              optionPremAmt: o.optionPremAmt,
              effDate: o.effDate ? new Date(o.effDate) : undefined,
              termDate: o.termDate ? new Date(o.termDate) : undefined,
              isActive: o.isActive ?? true,
            })),
          });
        }
      }

      return tx.coverage.findUniqueOrThrow({
        where: { id },
        include: coverageDetailInclude,
      });
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.coverage.delete({ where: { id } });
  }

  // Get all coverages for a policy
  async findByPolicy(policyId: string): Promise<CoverageListItem[]> {
    return prisma.coverage.findMany({
      where: { policyId },
      include: coverageListInclude,
      orderBy: [
        { indicatorCode: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  // Get base coverage for a policy
  async getBaseCoverage(policyId: string): Promise<CoverageDetail | null> {
    return prisma.coverage.findFirst({
      where: {
        policyId,
        indicatorCode: CoverageIndicatorCode.BASE,
      },
      include: coverageDetailInclude,
    });
  }

  // Get riders for a policy
  async getRiders(policyId: string): Promise<CoverageListItem[]> {
    return prisma.coverage.findMany({
      where: {
        policyId,
        indicatorCode: CoverageIndicatorCode.RIDER,
      },
      include: coverageListInclude,
    });
  }

  // =========================================================================
  // LIFE PARTICIPANT CRUD
  // =========================================================================

  async addLifeParticipant(coverageId: string, input: CreateLifeParticipantInput): Promise<CoverageDetail> {
    // Validate coverage exists
    const coverage = await prisma.coverage.findUnique({ where: { id: coverageId } });
    if (!coverage) {
      throw new Error('Coverage not found');
    }

    // Validate party exists
    const party = await prisma.party.findUnique({ where: { id: input.partyId } });
    if (!party) {
      throw new Error('Party not found');
    }

    await prisma.lifeParticipant.create({
      data: {
        coverageId,
        partyId: input.partyId,
        participantType: input.participantType,
        issueAge: input.issueAge,
        issueGender: input.issueGender,
        underwritingClass: input.underwritingClass,
        tobaccoClass: input.tobaccoClass,
        tableRating: input.tableRating,
        flatExtraAmt: input.flatExtraAmt,
        flatExtraEndDate: input.flatExtraEndDate ? new Date(input.flatExtraEndDate) : undefined,
        permFlatExtraAmt: input.permFlatExtraAmt,
      },
    });

    return this.findById(coverageId) as Promise<CoverageDetail>;
  }

  async updateLifeParticipant(participantId: string, input: UpdateLifeParticipantInput): Promise<void> {
    await prisma.lifeParticipant.update({
      where: { id: participantId },
      data: {
        partyId: input.partyId,
        participantType: input.participantType,
        issueAge: input.issueAge,
        issueGender: input.issueGender,
        underwritingClass: input.underwritingClass,
        tobaccoClass: input.tobaccoClass,
        tableRating: input.tableRating,
        flatExtraAmt: input.flatExtraAmt,
        flatExtraEndDate: input.flatExtraEndDate ? new Date(input.flatExtraEndDate) : undefined,
        permFlatExtraAmt: input.permFlatExtraAmt,
      },
    });
  }

  async removeLifeParticipant(participantId: string): Promise<void> {
    await prisma.lifeParticipant.delete({ where: { id: participantId } });
  }

  // =========================================================================
  // COVERAGE OPTION CRUD
  // =========================================================================

  async addCovOption(coverageId: string, input: CreateCovOptionInput): Promise<CoverageDetail> {
    // Validate coverage exists
    const coverage = await prisma.coverage.findUnique({ where: { id: coverageId } });
    if (!coverage) {
      throw new Error('Coverage not found');
    }

    await prisma.covOption.create({
      data: {
        coverageId,
        optionType: input.optionType,
        optionCode: input.optionCode,
        optionName: input.optionName,
        optionAmt: input.optionAmt,
        optionPremAmt: input.optionPremAmt,
        effDate: input.effDate ? new Date(input.effDate) : undefined,
        termDate: input.termDate ? new Date(input.termDate) : undefined,
        isActive: input.isActive ?? true,
      },
    });

    return this.findById(coverageId) as Promise<CoverageDetail>;
  }

  async updateCovOption(optionId: string, input: UpdateCovOptionInput): Promise<void> {
    await prisma.covOption.update({
      where: { id: optionId },
      data: {
        optionType: input.optionType,
        optionCode: input.optionCode,
        optionName: input.optionName,
        optionAmt: input.optionAmt,
        optionPremAmt: input.optionPremAmt,
        effDate: input.effDate ? new Date(input.effDate) : undefined,
        termDate: input.termDate ? new Date(input.termDate) : undefined,
        isActive: input.isActive,
      },
    });
  }

  async removeCovOption(optionId: string): Promise<void> {
    await prisma.covOption.delete({ where: { id: optionId } });
  }

  // Terminate a coverage option (soft delete)
  async terminateCovOption(optionId: string, termDate?: string): Promise<void> {
    await prisma.covOption.update({
      where: { id: optionId },
      data: {
        isActive: false,
        termDate: termDate ? new Date(termDate) : new Date(),
      },
    });
  }

  // =========================================================================
  // COVERAGE SUMMARY
  // =========================================================================

  // Get coverage summary for a policy
  async getPolicyCoverageSummary(policyId: string): Promise<{
    totalCoverages: number;
    baseCoverage: CoverageListItem | null;
    riders: CoverageListItem[];
    totalFaceAmount: number;
    totalAnnualPremium: number;
  }> {
    const coverages = await this.findByPolicy(policyId);

    const baseCoverage = coverages.find((c) => c.indicatorCode === CoverageIndicatorCode.BASE) || null;
    const riders = coverages.filter((c) => c.indicatorCode === CoverageIndicatorCode.RIDER);

    const totalFaceAmount = coverages.reduce(
      (sum, c) => sum + (Number(c.currentAmt) || 0),
      0
    );

    const totalAnnualPremium = coverages.reduce(
      (sum, c) => sum + (Number(c.annualPremAmt) || 0),
      0
    );

    return {
      totalCoverages: coverages.length,
      baseCoverage,
      riders,
      totalFaceAmount,
      totalAnnualPremium,
    };
  }
}

export const coverageService = new CoverageService();
export default coverageService;
