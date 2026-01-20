import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { validateAccessToken, getUserById } from '../services/authService';
import { JwtPayload, UserResponse } from '../types/auth.types';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      currentUser?: UserResponse;
    }
  }
}

// Authentication middleware - verifies JWT token
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'No authorization header provided',
    });
    return;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Invalid authorization header format. Use: Bearer <token>',
    });
    return;
  }
  
  const token = parts[1];
  const validation = validateAccessToken(token);
  
  if (!validation.valid || !validation.payload) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: validation.error || 'Invalid token',
    });
    return;
  }
  
  // Attach user payload to request
  req.user = validation.payload;
  next();
}

// Optional authentication - doesn't fail if no token, but attaches user if valid
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }
  
  const token = parts[1];
  const validation = validateAccessToken(token);
  
  if (validation.valid && validation.payload) {
    req.user = validation.payload;
  }
  
  next();
}

// Load full user data (use after authenticate middleware)
export async function loadCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    next();
    return;
  }
  
  try {
    const user = await getUserById(req.user.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found',
      });
      return;
    }
    
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated',
      });
      return;
    }
    
    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Role-based authorization middleware
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    
    next();
  };
}

// Shorthand middleware combinations
export const requireAdmin = [authenticate, authorize('ADMIN')];
export const requireAgent = [authenticate, authorize('ADMIN', 'AGENT')];
export const requireAnyRole = [authenticate, authorize('ADMIN', 'AGENT', 'READONLY')];

// Self-or-admin check for user-specific routes
export function selfOrAdmin(userIdParam = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }
    
    const targetUserId = req.params[userIdParam];
    const isSelf = req.user.userId === targetUserId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isSelf && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources unless you are an admin',
      });
      return;
    }
    
    next();
  };
}

// Prevent READONLY users from write operations
export function requireWriteAccess(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }
  
  // READONLY users can only perform GET requests
  if (req.user.role === 'READONLY' && req.method !== 'GET') {
    res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'READONLY users cannot create, update, or delete resources',
    });
    return;
  }
  
  next();
}
