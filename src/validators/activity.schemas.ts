import { z } from 'zod';
import { ActivityType, ActivityStatus } from '@prisma/client';
import {
  optionalCuidSchema,
  optionalDateStringSchema,
  optionalTimeStringSchema,
  optionalNonEmptyStringSchema,
  optionalPrioritySchema,
  paginationQuerySchema,
  createEnumSchema,
  createOptionalEnumSchema,
} from './common.schemas';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

const activityTypeSchema = createEnumSchema(ActivityType, 'activityType');
const optionalActivityTypeSchema = createOptionalEnumSchema(ActivityType, 'activityType');
const activityStatusSchema = createEnumSchema(ActivityStatus, 'activityStatus');
const optionalActivityStatusSchema = createOptionalEnumSchema(ActivityStatus, 'activityStatus');

// ============================================================================
// ACTIVITY SCHEMAS
// ============================================================================

/**
 * Create activity request body schema
 */
export const createActivitySchema = z.object({
  partyId: optionalCuidSchema,
  holdingId: optionalCuidSchema,
  activityType: activityTypeSchema,
  activityStatus: activityStatusSchema.default('PENDING'),
  subject: optionalNonEmptyStringSchema,
  description: optionalNonEmptyStringSchema,
  
  // Scheduling
  dueDate: optionalDateStringSchema,
  dueTime: optionalTimeStringSchema,
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  
  // Completion
  completedDate: optionalDateStringSchema,
  completedBy: optionalNonEmptyStringSchema,
  
  // Assignment
  assignedTo: optionalNonEmptyStringSchema,
  createdBy: optionalNonEmptyStringSchema,
  
  // Priority (1=High, 2=Medium, 3=Low)
  priority: z.number().int().min(1).max(5).default(3),
  
  // Recurrence
  isRecurring: z.boolean().default(false),
  recurringFrequency: optionalNonEmptyStringSchema,
});

/**
 * Update activity request body schema
 */
export const updateActivitySchema = z.object({
  partyId: optionalCuidSchema,
  holdingId: optionalCuidSchema,
  activityType: optionalActivityTypeSchema,
  activityStatus: optionalActivityStatusSchema,
  subject: optionalNonEmptyStringSchema,
  description: optionalNonEmptyStringSchema,
  
  // Scheduling
  dueDate: optionalDateStringSchema,
  dueTime: optionalTimeStringSchema,
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  
  // Completion
  completedDate: optionalDateStringSchema,
  completedBy: optionalNonEmptyStringSchema,
  
  // Assignment
  assignedTo: optionalNonEmptyStringSchema,
  createdBy: optionalNonEmptyStringSchema,
  
  // Priority
  priority: optionalPrioritySchema,
  
  // Recurrence
  isRecurring: z.boolean().optional(),
  recurringFrequency: optionalNonEmptyStringSchema,
});

/**
 * Complete activity request body schema
 */
export const completeActivitySchema = z.object({
  completedBy: optionalNonEmptyStringSchema,
});

/**
 * Activity list query parameters
 */
export const activityListQuerySchema = paginationQuerySchema.extend({
  partyId: optionalCuidSchema,
  holdingId: optionalCuidSchema,
  activityType: optionalActivityTypeSchema,
  activityStatus: optionalActivityStatusSchema,
  assignedTo: optionalNonEmptyStringSchema,
  dueBefore: optionalDateStringSchema,
  dueAfter: optionalDateStringSchema,
});

/**
 * Upcoming activities query parameters
 */
export const upcomingActivitiesQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(7),
  assignedTo: optionalNonEmptyStringSchema,
});

/**
 * Overdue activities query parameters
 */
export const overdueActivitiesQuerySchema = z.object({
  assignedTo: optionalNonEmptyStringSchema,
});

/**
 * Activities by entity query parameters
 */
export const activitiesByEntityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CompleteActivityInput = z.infer<typeof completeActivitySchema>;
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
export type UpcomingActivitiesQuery = z.infer<typeof upcomingActivitiesQuerySchema>;
