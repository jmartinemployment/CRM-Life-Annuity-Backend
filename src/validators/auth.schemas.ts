import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Password requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be at most 255 characters')
  .transform((val) => val.toLowerCase().trim());

// Name validation
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters')
  .transform((val) => val.trim());

// User role enum
const userRoleSchema = z.nativeEnum(UserRole);

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: z.string().max(100).optional().transform((val) => val?.trim()),
  role: userRoleSchema.optional().default('AGENT'),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Request password reset schema
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  displayName: z.string().max(100).optional().nullable().transform((val) => val?.trim()),
});

// Admin update user schema
export const adminUpdateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  displayName: z.string().max(100).optional().nullable().transform((val) => val?.trim()),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  partyId: z.string().cuid().optional().nullable(),
});

// Admin create user schema (registration without password confirmation)
export const adminCreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: z.string().max(100).optional().transform((val) => val?.trim()),
  role: userRoleSchema.optional().default('AGENT'),
  isActive: z.boolean().optional().default(true),
  isVerified: z.boolean().optional().default(false),
  partyId: z.string().cuid().optional().nullable(),
});

// User list query schema
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['email', 'firstName', 'lastName', 'role', 'createdAt', 'lastLoginAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  role: userRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// User ID param schema
export const userIdParamSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
