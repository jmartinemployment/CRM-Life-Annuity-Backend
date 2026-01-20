import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateHoldingInput,
  UpdateHoldingInput,
  HoldingFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

// Include for detailed holding view
const holdingDetailInclude = {
  policy: {
    include: {
      life: true,
      annuity: true,
      coverages: true,
    },
  },
  relationsAsOrigin: {
    include: {
      relatedParty: {
        include: {
          person: true,
          organization: true,
        },
      },
    },
  },
  loans: true,
  arrangements: true,
} satisfies Prisma.HoldingInclude;

// Include for list view
const holdingListInclude = {
  policy: {
    include: {
      life: true,
      annuity: true,
    },
  },
} satisfies Prisma.HoldingInclude;

export type HoldingDetail = Prisma.HoldingGetPayload<{ include: typeof holdingDetailInclude }>;
export type HoldingListItem = Prisma.HoldingGetPayload<{ include: typeof holdingListInclude }>;

class HoldingService {
  async create(input: CreateHoldingInput): Promise<HoldingDetail> {
    const { policy, ...holdingData } = input;

    return prisma.holding.create({
      data: {
        holdingKey: holdingData.holdingKey,
        holdingTypeCode: holdingData.holdingTypeCode,
        holdingStatus: holdingData.holdingStatus,
        holdingName: holdingData.holdingName,
        currencyTypeCode: holdingData.currencyTypeCode,
        policy: policy
          ? {
              create: {
                polNumber: policy.polNumber,
                certificateNo: policy.certificateNo,
                lineOfBusiness: policy.lineOfBusiness,
                productType: policy.productType,
                productCode: policy.productCode,
                planName: policy.planName,
                marketingName: policy.marketingName,
                carrierCode: policy.carrierCode,
                carrierPartyId: policy.carrierPartyId,
                policyStatus: policy.policyStatus,
                jurisdiction: policy.jurisdiction,
                effDate: policy.effDate ? new Date(policy.effDate) : undefined,
                issueDate: policy.issueDate ? new Date(policy.issueDate) : undefined,
                termDate: policy.termDate ? new Date(policy.termDate) : undefined,
                paymentMode: policy.paymentMode,
                paymentAmt: policy.paymentAmt,
                annualPaymentAmt: policy.annualPaymentAmt,
                paymentMethod: policy.paymentMethod,
                paymentDraftDay: policy.paymentDraftDay,
                qualPlanType: policy.qualPlanType,
                life: policy.life
                  ? {
                      create: {
                        qualPlanType: policy.life.qualPlanType,
                        faceAmt: policy.life.faceAmt,
                        deathBenefitAmt: policy.life.deathBenefitAmt,
                        cashValueAmt: policy.life.cashValueAmt,
                        netSurrValueAmt: policy.life.netSurrValueAmt,
                        targetPremAmt: policy.life.targetPremAmt,
                        currIntRate: policy.life.currIntRate,
                        guarIntRate: policy.life.guarIntRate,
                        divType: policy.life.divType,
                      },
                    }
                  : undefined,
                annuity: policy.annuity
                  ? {
                      create: {
                        premType: policy.annuity.premType,
                        payoutType: policy.annuity.payoutType,
                        qualPlanType: policy.annuity.qualPlanType,
                        sourceOfFunds: policy.annuity.sourceOfFunds,
                        surrenderValue: policy.annuity.surrenderValue,
                        deathBenefitAmt: policy.annuity.deathBenefitAmt,
                        guarIntRate: policy.annuity.guarIntRate,
                        initDepositAmt: policy.annuity.initDepositAmt,
                        initDepositDate: policy.annuity.initDepositDate
                          ? new Date(policy.annuity.initDepositDate)
                          : undefined,
                        totalDepositITD: policy.annuity.totalDepositITD,
                      },
                    }
                  : undefined,
              },
            }
          : undefined,
      },
      include: holdingDetailInclude,
    });
  }

  async findById(id: string): Promise<HoldingDetail | null> {
    return prisma.holding.findUnique({
      where: { id },
      include: holdingDetailInclude,
    });
  }

  async findMany(
    filters: HoldingFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<HoldingListItem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.HoldingWhereInput = {};

    if (filters.holdingTypeCode) {
      where.holdingTypeCode = filters.holdingTypeCode;
    }

    if (filters.holdingStatus) {
      where.holdingStatus = filters.holdingStatus;
    }

    if (filters.policyStatus || filters.lineOfBusiness || filters.carrierCode) {
      where.policy = {};
      if (filters.policyStatus) where.policy.policyStatus = filters.policyStatus;
      if (filters.lineOfBusiness) where.policy.lineOfBusiness = filters.lineOfBusiness;
      if (filters.carrierCode) where.policy.carrierCode = filters.carrierCode;
    }

    if (filters.search) {
      where.OR = [
        { holdingName: { contains: filters.search, mode: 'insensitive' } },
        { holdingKey: { contains: filters.search, mode: 'insensitive' } },
        { policy: { polNumber: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.holding.findMany({
        where,
        include: holdingListInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.holding.count({ where }),
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

  async update(id: string, input: UpdateHoldingInput): Promise<HoldingDetail> {
    const { policy, ...holdingData } = input;

    return prisma.$transaction(async (tx) => {
      // Update holding
      if (Object.keys(holdingData).length > 0) {
        await tx.holding.update({
          where: { id },
          data: {
            holdingKey: holdingData.holdingKey,
            holdingTypeCode: holdingData.holdingTypeCode,
            holdingStatus: holdingData.holdingStatus,
            holdingName: holdingData.holdingName,
            currencyTypeCode: holdingData.currencyTypeCode,
          },
        });
      }

      // Update policy if provided
      if (policy) {
        const existingHolding = await tx.holding.findUnique({
          where: { id },
          include: { policy: true },
        });

        if (existingHolding?.policy) {
          await tx.policy.update({
            where: { holdingId: id },
            data: {
              polNumber: policy.polNumber,
              certificateNo: policy.certificateNo,
              lineOfBusiness: policy.lineOfBusiness,
              productType: policy.productType,
              productCode: policy.productCode,
              planName: policy.planName,
              marketingName: policy.marketingName,
              carrierCode: policy.carrierCode,
              carrierPartyId: policy.carrierPartyId,
              policyStatus: policy.policyStatus,
              jurisdiction: policy.jurisdiction,
              effDate: policy.effDate ? new Date(policy.effDate) : undefined,
              issueDate: policy.issueDate ? new Date(policy.issueDate) : undefined,
              termDate: policy.termDate ? new Date(policy.termDate) : undefined,
              paymentMode: policy.paymentMode,
              paymentAmt: policy.paymentAmt,
              annualPaymentAmt: policy.annualPaymentAmt,
              paymentMethod: policy.paymentMethod,
              paymentDraftDay: policy.paymentDraftDay,
              qualPlanType: policy.qualPlanType,
            },
          });

          // Update life if provided
          if (policy.life) {
            await tx.life.upsert({
              where: { policyId: existingHolding.policy.id },
              update: {
                qualPlanType: policy.life.qualPlanType,
                faceAmt: policy.life.faceAmt,
                deathBenefitAmt: policy.life.deathBenefitAmt,
                cashValueAmt: policy.life.cashValueAmt,
                netSurrValueAmt: policy.life.netSurrValueAmt,
                targetPremAmt: policy.life.targetPremAmt,
                currIntRate: policy.life.currIntRate,
                guarIntRate: policy.life.guarIntRate,
                divType: policy.life.divType,
              },
              create: {
                policyId: existingHolding.policy.id,
                qualPlanType: policy.life.qualPlanType,
                faceAmt: policy.life.faceAmt,
                deathBenefitAmt: policy.life.deathBenefitAmt,
                cashValueAmt: policy.life.cashValueAmt,
                netSurrValueAmt: policy.life.netSurrValueAmt,
                targetPremAmt: policy.life.targetPremAmt,
                currIntRate: policy.life.currIntRate,
                guarIntRate: policy.life.guarIntRate,
                divType: policy.life.divType,
              },
            });
          }

          // Update annuity if provided
          if (policy.annuity) {
            await tx.annuity.upsert({
              where: { policyId: existingHolding.policy.id },
              update: {
                premType: policy.annuity.premType,
                payoutType: policy.annuity.payoutType,
                qualPlanType: policy.annuity.qualPlanType,
                sourceOfFunds: policy.annuity.sourceOfFunds,
                surrenderValue: policy.annuity.surrenderValue,
                deathBenefitAmt: policy.annuity.deathBenefitAmt,
                guarIntRate: policy.annuity.guarIntRate,
                initDepositAmt: policy.annuity.initDepositAmt,
                initDepositDate: policy.annuity.initDepositDate
                  ? new Date(policy.annuity.initDepositDate)
                  : undefined,
                totalDepositITD: policy.annuity.totalDepositITD,
              },
              create: {
                policyId: existingHolding.policy.id,
                premType: policy.annuity.premType,
                payoutType: policy.annuity.payoutType,
                qualPlanType: policy.annuity.qualPlanType,
                sourceOfFunds: policy.annuity.sourceOfFunds,
                surrenderValue: policy.annuity.surrenderValue,
                deathBenefitAmt: policy.annuity.deathBenefitAmt,
                guarIntRate: policy.annuity.guarIntRate,
                initDepositAmt: policy.annuity.initDepositAmt,
                initDepositDate: policy.annuity.initDepositDate
                  ? new Date(policy.annuity.initDepositDate)
                  : undefined,
                totalDepositITD: policy.annuity.totalDepositITD,
              },
            });
          }
        }
      }

      return tx.holding.findUniqueOrThrow({
        where: { id },
        include: holdingDetailInclude,
      });
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.holding.delete({ where: { id } });
  }
}

export const holdingService = new HoldingService();
export default holdingService;
