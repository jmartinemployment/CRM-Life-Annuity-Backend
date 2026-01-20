import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma';

// Routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import partyRoutes from './routes/parties';
import holdingRoutes from './routes/holdings';
import activityRoutes from './routes/activities';
import relationRoutes from './routes/relations';
import coverageRoutes from './routes/coverages';
import acordRoutes from './routes/acord';
import auditLogRoutes from './routes/auditLogs';
import attachmentRoutes from './routes/attachments';
import emailRoutes from './routes/email';

// Middleware
import { authenticate, authorize, requireWriteAccess } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// XML body parser for ACORD import
app.use(express.text({ type: ['application/xml', 'text/xml'] }));

// Health check endpoint (public)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CRM-Life-Annuity-Backend',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'CRM-Life-Annuity-Backend',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API info (public)
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'ACORD CRM Life & Annuity API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      parties: '/api/parties',
      holdings: '/api/holdings',
      activities: '/api/activities',
      relations: '/api/relations',
      coverages: '/api/coverages',
      acord: '/api/acord',
      auditLogs: '/api/audit-logs',
      attachments: '/api/attachments',
      email: '/api/email',
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      loginEndpoint: 'POST /api/auth/login',
      registerEndpoint: 'POST /api/auth/register',
    },
  });
});

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

// Auth routes (some public, some protected - handled internally)
app.use('/api/auth', authRoutes);

// =============================================================================
// PROTECTED ROUTES (Require authentication)
// =============================================================================

// All routes below require valid JWT token
// READONLY: GET only, AGENT/ADMIN: full CRUD

// Dashboard - accessible to all authenticated users (read-only data)
app.use('/api/dashboard',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  dashboardRoutes
);

// Parties - accessible to all authenticated users
app.use('/api/parties',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  partyRoutes
);

// Holdings - accessible to all authenticated users
app.use('/api/holdings',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  holdingRoutes
);

// Activities - accessible to all authenticated users
app.use('/api/activities',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  activityRoutes
);

// Relations - accessible to all authenticated users
app.use('/api/relations',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  relationRoutes
);

// Coverages - accessible to all authenticated users
app.use('/api/coverages',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  coverageRoutes
);

// ACORD XML Import/Export - accessible to ADMIN and AGENT
app.use('/api/acord',
  authenticate,
  authorize('ADMIN', 'AGENT'),
  acordRoutes
);

// Audit Logs - accessible to ADMIN only
app.use('/api/audit-logs',
  authenticate,
  authorize('ADMIN'),
  auditLogRoutes
);

// Attachments/File Upload - accessible to ADMIN and AGENT
app.use('/api/attachments',
  authenticate,
  authorize('ADMIN', 'AGENT'),
  attachmentRoutes
);

// Email - accessible to all authenticated users (ties to Activity records)
app.use('/api/email',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  emailRoutes
);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: 'Database Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred',
    });
    return;
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Security reminder
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    console.warn('\n⚠️  WARNING: Using default JWT_SECRET. Set a secure value in production!');
  }
});

export default app;
