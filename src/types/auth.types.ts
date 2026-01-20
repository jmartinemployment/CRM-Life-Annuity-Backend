import { UserRole } from '@prisma/client';

// JWT Payload structure
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Refresh token payload
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Auth response returned to client
export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User response (safe for client, no password hash)
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  role: UserRole;
  partyId: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Registration input
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: UserRole;
}

// Login input
export interface LoginInput {
  email: string;
  password: string;
}

// Token refresh input
export interface RefreshTokenInput {
  refreshToken: string;
}

// Password change input
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Password reset request
export interface RequestPasswordResetInput {
  email: string;
}

// Password reset with token
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

// Update user profile
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

// Admin update user
export interface AdminUpdateUserInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  partyId?: string | null;
}

// Token validation result
export interface TokenValidationResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

// Decoded refresh token result
export interface RefreshTokenValidationResult {
  valid: boolean;
  payload?: RefreshTokenPayload;
  error?: string;
}
