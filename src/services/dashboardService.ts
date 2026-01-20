import prisma from '../utils/prisma';
import { ActivityStatus, LeadStatus } from '@prisma/client';

// Dashboard stats summary
export interface DashboardStats {
  parties: {
    total: number;
    persons: number;
    organizations: number;
    newThisMonth: number;
  };
  holdings: {
    total: number;
    active: number;
    pending: number;
    policies: number;
    annuities: number;
  };
  activities: {
    total: number;
    pending: number;
    overdue: number;
    completedThisMonth: number;
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    won: number;
    conversionRate: number;
  };
}

// Get dashboard summary statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Party stats
  const [
    totalParties,
    totalPersons,
    totalOrganizations,
    newPartiesThisMonth,
  ] = await Promise.all([
    prisma.party.count({ where: { isActive: true } }),
    prisma.party.count({ where: { isActive: true, partyTypeCode: 'PERSON' } }),
    prisma.party.count({ where: { isActive: true, partyTypeCode: 'ORGANIZATION' } }),
    prisma.party.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  // Holding stats
  const [
    totalHoldings,
    activeHoldings,
    pendingHoldings,
    totalPolicies,
    totalAnnuities,
  ] = await Promise.all([
    prisma.holding.count(),
    prisma.holding.count({ where: { holdingStatus: 'ACTIVE' } }),
    prisma.holding.count({ where: { holdingStatus: { in: ['PROPOSED', 'PENDING'] } } }),
    prisma.holding.count({ where: { holdingTypeCode: 'POLICY' } }),
    prisma.holding.count({ where: { holdingTypeCode: 'ANNUITY' } }),
  ]);

  // Activity stats
  const [
    totalActivities,
    pendingActivities,
    overdueActivities,
    completedThisMonth,
  ] = await Promise.all([
    prisma.activity.count(),
    prisma.activity.count({ where: { activityStatus: 'PENDING' } }),
    prisma.activity.count({
      where: {
        activityStatus: { in: ['PENDING', 'SCHEDULED'] },
        dueDate: { lt: today },
      },
    }),
    prisma.activity.count({
      where: {
        activityStatus: 'COMPLETED',
        completedDate: { gte: startOfMonth },
      },
    }),
  ]);

  // Lead stats (from Client model)
  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    wonLeads,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { leadStatus: 'NEW' } }),
    prisma.client.count({ where: { leadStatus: 'QUALIFIED' } }),
    prisma.client.count({ where: { leadStatus: 'WON' } }),
  ]);

  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  return {
    parties: {
      total: totalParties,
      persons: totalPersons,
      organizations: totalOrganizations,
      newThisMonth: newPartiesThisMonth,
    },
    holdings: {
      total: totalHoldings,
      active: activeHoldings,
      pending: pendingHoldings,
      policies: totalPolicies,
      annuities: totalAnnuities,
    },
    activities: {
      total: totalActivities,
      pending: pendingActivities,
      overdue: overdueActivities,
      completedThisMonth: completedThisMonth,
    },
    leads: {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      won: wonLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
  };
}

// Renewal item
export interface RenewalItem {
  holdingId: string;
  policyId: string;
  polNumber: string;
  productType: string | null;
  planName: string | null;
  renewalDate: Date;
  daysUntilRenewal: number;
  partyName: string | null;
  partyId: string | null;
  annualPaymentAmt: number | null;
}

// Get upcoming renewals
export async function getUpcomingRenewals(days: number = 90): Promise<RenewalItem[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const policies = await prisma.policy.findMany({
    where: {
      renewalDate: {
        gte: today,
        lte: futureDate,
      },
      policyStatus: {
        in: ['INFORCE_ACTIVE', 'INFORCE_PREMIUM_PAYING', 'ISSUED'],
      },
    },
    include: {
      holding: {
        include: {
          relationsAsOrigin: {
            where: {
              relationRoleCode: 'OWNER',
            },
            include: {
              relatedParty: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      renewalDate: 'asc',
    },
  });

  return policies.map((policy) => {
    const renewalDate = policy.renewalDate!;
    const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const ownerRelation = policy.holding.relationsAsOrigin[0];
    const owner = ownerRelation?.relatedParty;

    return {
      holdingId: policy.holdingId,
      policyId: policy.id,
      polNumber: policy.polNumber,
      productType: policy.productType,
      planName: policy.planName,
      renewalDate: renewalDate,
      daysUntilRenewal: daysUntil,
      partyName: owner?.fullName || null,
      partyId: owner?.id || null,
      annualPaymentAmt: policy.annualPaymentAmt ? Number(policy.annualPaymentAmt) : null,
    };
  });
}

// Anniversary item
export interface AnniversaryItem {
  type: 'birthday' | 'policy_anniversary';
  date: Date;
  daysUntil: number;
  partyId: string;
  partyName: string | null;
  // For policy anniversaries
  holdingId?: string;
  polNumber?: string;
  yearsActive?: number;
}

// Get upcoming anniversaries (birthdays and policy anniversaries)
export async function getUpcomingAnniversaries(days: number = 30): Promise<AnniversaryItem[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = today.getFullYear();

  const results: AnniversaryItem[] = [];

  // Get birthdays - find persons with birthDate
  const persons = await prisma.person.findMany({
    where: {
      birthDate: { not: null },
      party: { isActive: true },
    },
    include: {
      party: true,
    },
  });

  for (const person of persons) {
    if (!person.birthDate) continue;

    // Calculate this year's birthday
    const birthDate = new Date(person.birthDate);
    let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, check next year
    if (thisYearBirthday < today) {
      thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= days) {
      results.push({
        type: 'birthday',
        date: thisYearBirthday,
        daysUntil,
        partyId: person.partyId,
        partyName: person.party.fullName,
      });
    }
  }

  // Get policy anniversaries
  const policies = await prisma.policy.findMany({
    where: {
      effDate: { not: null },
      policyStatus: {
        in: ['INFORCE_ACTIVE', 'INFORCE_PREMIUM_PAYING', 'ISSUED'],
      },
    },
    include: {
      holding: {
        include: {
          relationsAsOrigin: {
            where: { relationRoleCode: 'OWNER' },
            include: { relatedParty: true },
            take: 1,
          },
        },
      },
    },
  });

  for (const policy of policies) {
    if (!policy.effDate) continue;

    const effDate = new Date(policy.effDate);
    let thisYearAnniversary = new Date(currentYear, effDate.getMonth(), effDate.getDate());

    if (thisYearAnniversary < today) {
      thisYearAnniversary = new Date(currentYear + 1, effDate.getMonth(), effDate.getDate());
    }

    const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= days) {
      const owner = policy.holding.relationsAsOrigin[0]?.relatedParty;
      const yearsActive = thisYearAnniversary.getFullYear() - effDate.getFullYear();

      results.push({
        type: 'policy_anniversary',
        date: thisYearAnniversary,
        daysUntil,
        partyId: owner?.id || '',
        partyName: owner?.fullName || null,
        holdingId: policy.holdingId,
        polNumber: policy.polNumber,
        yearsActive,
      });
    }
  }

  // Sort by days until
  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

// Task summary by status and assignee
export interface TaskSummary {
  byStatus: {
    status: ActivityStatus;
    count: number;
  }[];
  byAssignee: {
    assignedTo: string | null;
    assigneeName: string | null;
    pending: number;
    overdue: number;
    completedThisWeek: number;
  }[];
  byType: {
    activityType: string;
    count: number;
  }[];
}

// Get task summary
export async function getTaskSummary(): Promise<TaskSummary> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  // Count by status
  const statusCounts = await prisma.activity.groupBy({
    by: ['activityStatus'],
    _count: { id: true },
  });

  const byStatus = statusCounts.map((s) => ({
    status: s.activityStatus,
    count: s._count.id,
  }));

  // Count by type
  const typeCounts = await prisma.activity.groupBy({
    by: ['activityType'],
    _count: { id: true },
  });

  const byType = typeCounts.map((t) => ({
    activityType: t.activityType,
    count: t._count.id,
  }));

  // Get unique assignees
  const assignees = await prisma.activity.findMany({
    select: { assignedTo: true },
    distinct: ['assignedTo'],
  });

  const byAssignee: TaskSummary['byAssignee'] = [];

  for (const { assignedTo } of assignees) {
    const [pending, overdue, completedThisWeek] = await Promise.all([
      prisma.activity.count({
        where: {
          assignedTo,
          activityStatus: 'PENDING',
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo,
          activityStatus: { in: ['PENDING', 'SCHEDULED'] },
          dueDate: { lt: today },
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo,
          activityStatus: 'COMPLETED',
          completedDate: { gte: startOfWeek },
        },
      }),
    ]);

    // Try to get assignee name from User table
    let assigneeName: string | null = null;
    if (assignedTo) {
      const user = await prisma.user.findUnique({
        where: { id: assignedTo },
        select: { firstName: true, lastName: true },
      });
      if (user) {
        assigneeName = `${user.firstName} ${user.lastName}`;
      }
    }

    byAssignee.push({
      assignedTo,
      assigneeName,
      pending,
      overdue,
      completedThisWeek,
    });
  }

  return { byStatus, byAssignee, byType };
}

// Pipeline summary for leads
export interface PipelineItem {
  status: LeadStatus;
  count: number;
  totalValue: number;
}

// Get lead pipeline summary
export async function getLeadPipeline(): Promise<PipelineItem[]> {
  const clients = await prisma.client.findMany({
    where: { leadStatus: { not: null } },
    select: { leadStatus: true },
  });

  // Group by status
  const statusMap = new Map<LeadStatus, { count: number; totalValue: number }>();

  for (const client of clients) {
    if (!client.leadStatus) continue;
    
    const current = statusMap.get(client.leadStatus) || { count: 0, totalValue: 0 };
    current.count++;
    statusMap.set(client.leadStatus, current);
  }

  // Convert to array and sort by pipeline order
  const pipelineOrder: LeadStatus[] = [
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
    'DORMANT',
  ];

  return pipelineOrder
    .filter((status) => statusMap.has(status))
    .map((status) => ({
      status,
      count: statusMap.get(status)!.count,
      totalValue: statusMap.get(status)!.totalValue,
    }));
}

// Recent activity feed
export interface ActivityFeedItem {
  id: string;
  activityType: string;
  subject: string | null;
  description: string | null;
  activityStatus: string;
  dueDate: Date | null;
  partyId: string | null;
  partyName: string | null;
  holdingId: string | null;
  polNumber: string | null;
  createdAt: Date;
  assignedTo: string | null;
  assigneeName: string | null;
}

// Get recent activity feed
export async function getRecentActivityFeed(limit: number = 20): Promise<ActivityFeedItem[]> {
  const activities = await prisma.activity.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      party: true,
      holding: {
        include: {
          policy: true,
        },
      },
    },
  });

  const result: ActivityFeedItem[] = [];

  for (const activity of activities) {
    let assigneeName: string | null = null;
    if (activity.assignedTo) {
      const user = await prisma.user.findUnique({
        where: { id: activity.assignedTo },
        select: { firstName: true, lastName: true },
      });
      if (user) {
        assigneeName = `${user.firstName} ${user.lastName}`;
      }
    }

    result.push({
      id: activity.id,
      activityType: activity.activityType,
      subject: activity.subject,
      description: activity.description,
      activityStatus: activity.activityStatus,
      dueDate: activity.dueDate,
      partyId: activity.partyId,
      partyName: activity.party?.fullName || null,
      holdingId: activity.holdingId,
      polNumber: activity.holding?.policy?.polNumber || null,
      createdAt: activity.createdAt,
      assignedTo: activity.assignedTo,
      assigneeName,
    });
  }

  return result;
}
