import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../validators';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateProfileSchema,
  adminUpdateUserSchema,
  adminCreateUserSchema,
  userListQuerySchema,
  userIdParamSchema,
} from '../validators/auth.schemas';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  listUsers,
  adminUpdateUser,
  deleteUser,
  getUserById,
} from '../services/authService';
import {
  authenticate,
  authorize,
  selfOrAdmin,
} from '../middleware/auth.middleware';

const router = Router();

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

// POST /api/auth/register - Register a new user
router.post(
  '/register',
  validate(registerSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  validate(loginSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;
      
      const result = await login(email, password, userAgent, ipAddress);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          res.status(401).json({
            success: false,
            error: 'Authentication failed',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('Account locked')) {
          res.status(423).json({
            success: false,
            error: 'Account locked',
            message: error.message,
          });
          return;
        }
        if (error.message === 'Account is deactivated') {
          res.status(403).json({
            success: false,
            error: 'Account deactivated',
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post(
  '/refresh',
  validate(refreshTokenSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;
      
      const result = await refreshAccessToken(refreshToken, userAgent, ipAddress);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: 'Token refresh failed',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/auth/password/reset-request - Request password reset
router.post(
  '/password/reset-request',
  validate(requestPasswordResetSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const resetToken = await requestPasswordReset(email);
      
      // In production, send email with reset link
      // For now, return token in response (development only)
      if (process.env.NODE_ENV === 'development' && resetToken) {
        res.json({
          success: true,
          message: 'Password reset email sent',
          data: { resetToken }, // Only in development!
        });
      } else {
        // Always return success to prevent email enumeration
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/password/reset - Reset password with token
router.post(
  '/password/reset',
  validate(resetPasswordSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await resetPassword(token, newPassword);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid or expired reset token') {
        res.status(400).json({
          success: false,
          error: 'Invalid token',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// =============================================================================
// AUTHENTICATED ROUTES (Require valid JWT)
// =============================================================================

// POST /api/auth/logout - Logout (revoke refresh token)
router.post(
  '/logout',
  authenticate,
  validate(refreshTokenSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      await logout(refreshToken);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout-all - Logout all sessions
router.post(
  '/logout-all',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await logoutAll(req.user!.userId);
      
      res.json({
        success: true,
        message: 'All sessions logged out',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me - Get current user
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserById(req.user!.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found',
        });
        return;
      }
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/auth/me - Update current user profile
router.put(
  '/me',
  authenticate,
  validate(updateProfileSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await updateProfile(req.user!.userId, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/password/change - Change password
router.post(
  '/password/change',
  authenticate,
  validate(changePasswordSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await changePassword(req.user!.userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        res.status(400).json({
          success: false,
          error: 'Invalid password',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// =============================================================================
// ADMIN ROUTES (Require ADMIN role)
// =============================================================================

// GET /api/auth/users - List all users (admin only)
router.get(
  '/users',
  authenticate,
  authorize('ADMIN'),
  validate(userListQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await listUsers(req.query as {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        role?: 'ADMIN' | 'AGENT' | 'READONLY';
        isActive?: boolean;
        search?: string;
      });
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/users - Create user (admin only)
router.post(
  '/users',
  authenticate,
  authorize('ADMIN'),
  validate(adminCreateUserSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/auth/users/:userId - Get user by ID (admin or self)
router.get(
  '/users/:userId',
  authenticate,
  validate(userIdParamSchema, 'params'),
  selfOrAdmin('userId'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string };
      const user = await getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found',
        });
        return;
      }
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/auth/users/:userId - Update user (admin only)
router.put(
  '/users/:userId',
  authenticate,
  authorize('ADMIN'),
  validate(userIdParamSchema, 'params'),
  validate(adminUpdateUserSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string };
      const user = await adminUpdateUser(userId, req.body);
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found',
        });
        return;
      }
      next(error);
    }
  }
);

// DELETE /api/auth/users/:userId - Delete user (admin only)
router.delete(
  '/users/:userId',
  authenticate,
  authorize('ADMIN'),
  validate(userIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string };
      
      // Prevent self-deletion
      if (userId === req.user!.userId) {
        res.status(400).json({
          success: false,
          error: 'Invalid operation',
          message: 'You cannot delete your own account',
        });
        return;
      }
      
      await deleteUser(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found',
        });
        return;
      }
      next(error);
    }
  }
);

export default router;
