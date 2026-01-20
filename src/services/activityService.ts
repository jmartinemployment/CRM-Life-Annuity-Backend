import prisma from '../utils/prisma';
import { Prisma, ActivityStatus } from '@prisma/client';
import {
  CreateActivityInput,
  UpdateActivityInput,
  ActivityFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

// Include for detailed activity view
const activityDetailInclude = {
  party: {
    include: {
      person: true,
      organization: true,
    },
  },
  holding: {
    include: {
      policy: true,
    },
  },
} satisfies Prisma.ActivityInclude;

// Include for list view
const activityListInclude = {
  party: {
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
  holding: {
    select: {
      id: true,
      holdingName: true,
      holdingTypeCode: true,
      policy: {
        select: {
          polNumber: true,
        },
      },
    },
  },
} satisfies Prisma.ActivityInclude;

export type ActivityDetail = Prisma.ActivityGetPayload<{ include: typeof activityDetailInclude }>;
export type ActivityListItem = Prisma.ActivityGetPayload<{ include: typeof activityListInclude }>;

class ActivityService {
  async create(input: CreateActivityInput): Promise<ActivityDetail> {
    return prisma.activity.create({
      data: {
        partyId: input.partyId,
        holdingId: input.holdingId,
        activityType: input.activityType,
        activityStatus: input.activityStatus || ActivityStatus.PENDING,
        subject: input.subject,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        dueTime: input.dueTime,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        completedDate: input.completedDate ? new Date(input.completedDate) : undefined,
        completedBy: input.completedBy,
        assignedTo: input.assignedTo,
        createdBy: input.createdBy,
        priority: input.priority,
        isRecurring: input.isRecurring,
        recurringFrequency: input.recurringFrequency,
      },
      include: activityDetailInclude,
    });
  }

  async findById(id: string): Promise<ActivityDetail | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: activityDetailInclude,
    });
  }

  async findMany(
    filters: ActivityFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ActivityListItem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = {};

    if (filters.partyId) {
      where.partyId = filters.partyId;
    }

    if (filters.holdingId) {
      where.holdingId = filters.holdingId;
    }

    if (filters.activityType) {
      where.activityType = filters.activityType;
    }

    if (filters.activityStatus) {
      where.activityStatus = filters.activityStatus;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    // Due date filters
    if (filters.dueBefore || filters.dueAfter) {
      where.dueDate = {};
      if (filters.dueBefore) {
        where.dueDate.lte = new Date(filters.dueBefore);
      }
      if (filters.dueAfter) {
        where.dueDate.gte = new Date(filters.dueAfter);
      }
    }

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: activityListInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.activity.count({ where }),
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

  async update(id: string, input: UpdateActivityInput): Promise<ActivityDetail> {
    return prisma.activity.update({
      where: { id },
      data: {
        partyId: input.partyId,
        holdingId: input.holdingId,
        activityType: input.activityType,
        activityStatus: input.activityStatus,
        subject: input.subject,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        dueTime: input.dueTime,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        completedDate: input.completedDate ? new Date(input.completedDate) : undefined,
        completedBy: input.completedBy,
        assignedTo: input.assignedTo,
        createdBy: input.createdBy,
        priority: input.priority,
        isRecurring: input.isRecurring,
        recurringFrequency: input.recurringFrequency,
      },
      include: activityDetailInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.activity.delete({ where: { id } });
  }

  // Mark activity as completed
  async complete(id: string, completedBy?: string): Promise<ActivityDetail> {
    return prisma.activity.update({
      where: { id },
      data: {
        activityStatus: ActivityStatus.COMPLETED,
        completedDate: new Date(),
        completedBy,
      },
      include: activityDetailInclude,
    });
  }

  // Get upcoming activities (due within specified days)
  async getUpcoming(days: number = 7, assignedTo?: string): Promise<ActivityListItem[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const where: Prisma.ActivityWhereInput = {
      dueDate: {
        gte: now,
        lte: futureDate,
      },
      activityStatus: {
        in: [ActivityStatus.PENDING, ActivityStatus.SCHEDULED, ActivityStatus.IN_PROGRESS],
      },
    };

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    return prisma.activity.findMany({
      where,
      include: activityListInclude,
      orderBy: { dueDate: 'asc' },
    });
  }

  // Get overdue activities
  async getOverdue(assignedTo?: string): Promise<ActivityListItem[]> {
    const now = new Date();

    const where: Prisma.ActivityWhereInput = {
      dueDate: {
        lt: now,
      },
      activityStatus: {
        in: [ActivityStatus.PENDING, ActivityStatus.SCHEDULED, ActivityStatus.IN_PROGRESS],
      },
    };

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    return prisma.activity.findMany({
      where,
      include: activityListInclude,
      orderBy: { dueDate: 'asc' },
    });
  }

  // Get activities by party
  async findByParty(partyId: string, limit: number = 20): Promise<ActivityListItem[]> {
    return prisma.activity.findMany({
      where: { partyId },
      include: activityListInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get activities by holding
  async findByHolding(holdingId: string, limit: number = 20): Promise<ActivityListItem[]> {
    return prisma.activity.findMany({
      where: { holdingId },
      include: activityListInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const activityService = new ActivityService();
export default activityService;
