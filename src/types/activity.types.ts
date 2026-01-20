import { ActivityType, ActivityStatus } from '@prisma/client';

// Activity input - matches Activity model fields
export interface CreateActivityInput {
  partyId?: string;
  holdingId?: string;
  activityType: ActivityType;
  activityStatus?: ActivityStatus;
  subject?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  completedBy?: string;
  assignedTo?: string;
  createdBy?: string;
  priority?: number;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {}

// Query parameters
export interface ActivityFilters {
  partyId?: string;
  holdingId?: string;
  activityType?: ActivityType;
  activityStatus?: ActivityStatus;
  assignedTo?: string;
  dueBefore?: string;
  dueAfter?: string;
}
