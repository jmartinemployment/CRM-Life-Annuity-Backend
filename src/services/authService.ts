import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { UserRole, User, RefreshToken } from '@prisma/client';
import {
  JwtPayload,
  RefreshTokenPayload,
  AuthResponse,
  UserResponse,
  TokenValidationResult,
  RefreshTokenValidationResult,
} from '../types/auth.types';

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30', 10);

// Parse expiry string to milliseconds
function parseExpiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default 15 minutes
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}

// Convert User to safe UserResponse (no password hash)
function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    role: user.role,
    partyId: user.partyId,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate access token
export function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

// Generate refresh token
export async function generateRefreshToken(
  user: User,
  userAgent?: string,
  ipAddress?: string
): Promise<{ token: string; record: RefreshToken }> {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY));
  
  const payload: RefreshTokenPayload = {
    userId: user.id,
    tokenId,
  };
  
  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  });
  
  // Store refresh token in database
  const record = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });
  
  return { token, record };
}

// Validate access token
export function validateAccessToken(token: string): TokenValidationResult {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token validation failed' };
  }
}

// Validate refresh token
export async function validateRefreshToken(token: string): Promise<RefreshTokenValidationResult> {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    
    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });
    
    if (!storedToken) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (storedToken.isRevoked) {
      return { valid: false, error: 'Token has been revoked' };
    }
    
    if (storedToken.expiresAt < new Date()) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token validation failed' };
  }
}

// Register new user
export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  partyId?: string | null;
}): Promise<UserResponse> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const passwordHash = await hashPassword(data.password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName,
      role: data.role || 'AGENT',
      isActive: data.isActive ?? true,
      isVerified: data.isVerified ?? false,
      partyId: data.partyId,
    },
  });
  
  return toUserResponse(user);
}

// Login user
export async function login(
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new Error(`Account locked. Try again in ${minutesRemaining} minutes`);
  }
  
  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  
  if (!isValidPassword) {
    // Increment failed login attempts
    const failedAttempts = user.failedLoginAttempts + 1;
    const updates: {
      failedLoginAttempts: number;
      lockedUntil?: Date;
    } = { failedLoginAttempts: failedAttempts };
    
    // Lock account if max attempts exceeded
    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
    
    throw new Error('Invalid email or password');
  }
  
  // Reset failed login attempts and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = await generateRefreshToken(user, userAgent, ipAddress);
  
  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
    expiresIn: parseExpiryToMs(ACCESS_TOKEN_EXPIRY) / 1000, // Convert to seconds
  };
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  // Validate refresh token
  const validation = await validateRefreshToken(refreshToken);
  
  if (!validation.valid || !validation.payload) {
    throw new Error(validation.error || 'Invalid refresh token');
  }
  
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: validation.payload.userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Revoke old refresh token (token rotation)
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'Token rotated',
    },
  });
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const { token: newRefreshToken } = await generateRefreshToken(user, userAgent, ipAddress);
  
  return {
    user: toUserResponse(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: parseExpiryToMs(ACCESS_TOKEN_EXPIRY) / 1000,
  };
}

// Logout (revoke refresh token)
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'User logout',
    },
  });
}

// Logout all sessions (revoke all refresh tokens for user)
export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'Logout all sessions',
    },
  });
}

// Get user by ID
export async function getUserById(id: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  
  return user ? toUserResponse(user) : null;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  return user ? toUserResponse(user) : null;
}

// Change password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
  
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);
  
  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
  
  // Revoke all refresh tokens (force re-login)
  await logoutAll(userId);
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    // Don't reveal if user exists
    return null;
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetTokenHash,
      passwordResetExpires: expires,
    },
  });
  
  return resetToken;
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Hash the provided token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpires: { gt: new Date() },
    },
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  
  // Revoke all refresh tokens
  await logoutAll(user.id);
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    displayName?: string | null;
  }
): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  
  return toUserResponse(user);
}

// Admin: List users
export async function listUsers(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}): Promise<{
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    role,
    isActive,
    search,
  } = params;
  
  const where: {
    role?: UserRole;
    isActive?: boolean;
    OR?: Array<{
      email?: { contains: string; mode: 'insensitive' };
      firstName?: { contains: string; mode: 'insensitive' };
      lastName?: { contains: string; mode: 'insensitive' };
    }>;
  } = {};
  
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);
  
  return {
    users: users.map(toUserResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Admin: Update user
export async function adminUpdateUser(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    displayName?: string | null;
    role?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
    partyId?: string | null;
  }
): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  
  return toUserResponse(user);
}

// Admin: Delete user
export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}

// Clean up expired refresh tokens (call periodically)
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true, revokedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // 7 days old revoked tokens
      ],
    },
  });
  
  return result.count;
}
