# CRM Life & Annuity Backend - Handoff Document

**Date:** January 20, 2026  
**Project:** ACORD CRM Life & Annuity Backend  
**Location:** `/Users/jam/development/CRM-Life-Annuity-Backend`

---

## Project Overview

A comprehensive backend API for managing Life & Annuity insurance data following ACORD (Association for Cooperative Operations Research and Development) industry standards. Built with Express.js, TypeScript, Prisma ORM, and PostgreSQL.

---

## Current State: Backend Complete ✓

### Tech Stack
- **Runtime:** Node.js 24 LTS (Krypton) + Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **XML Parsing:** fast-xml-parser
- **File Upload:** multer + Supabase Storage
- **Email:** Resend + React Email
- **Schema:** 42+ models based on ACORD XMLife 2.20.01 XSD

### Completed Features

| Feature | Status |
|---------|--------|
| Prisma Schema (42+ models from ACORD XSD) | ✓ Complete |
| Party API (6 endpoints) | ✓ Complete |
| Holdings API (5 endpoints) | ✓ Complete |
| Activities API (10 endpoints) | ✓ Complete |
| Relations API (14 endpoints) | ✓ Complete |
| Coverages API (14 endpoints) | ✓ Complete |
| Input Validation (Zod) | ✓ Complete |
| JWT Authentication (16 endpoints) | ✓ Complete |
| User Management | ✓ Complete |
| Role-Based Access Control | ✓ Complete |
| READONLY Write Protection | ✓ Complete |
| Dashboard API (7 endpoints) | ✓ Complete |
| ACORD XML Import/Export (8 endpoints) | ✓ Complete |
| Audit Log Queries (7 endpoints) | ✓ Complete |
| File Upload/Attachments (11 endpoints) | ✓ Complete |
| Email Notifications (6 endpoints) | ✓ Complete |
| TypeScript Compilation | ✓ Clean |
| Database Migration | ✓ Applied |

**Total: 104 API endpoints - Backend fully functional**

---

## What's Next?

### Option 1: Angular Frontend (Recommended)
Start building the Angular 21 frontend with Bootstrap 5.3.8:

**Core Pages:**
- Login/Registration
- Dashboard (stats, renewals, pipeline, activity feed)
- Party Management (list, detail, create/edit)
- Holdings/Policy Management (list, detail, create/edit)
- Activity Tracking (calendar, tasks, notes)
- ACORD XML Upload/Download UI
- File Attachment Management

**Components:**
- Standalone Angular components with signals
- Bootstrap 5.3.8 CSS only (no JS)
- Separate .html/.scss files
- HTTP interceptor for JWT auth

### Option 2: Backend Enhancements
- **Reporting** - Generate PDF/Excel reports for policies, commissions
- **XSD Validation** - Validate imports against official ACORD schemas
- **Scheduled Jobs** - Cron for automated renewal alerts, activity reminders

### Option 3: Testing & Documentation
- **Swagger/OpenAPI** - Auto-generate API documentation
- **Unit Tests** - Jest tests for services
- **Integration Tests** - API endpoint tests
- **Postman Collection** - Ready-to-use API collection

### Option 4: Deployment
- **Deploy to Render.com** - Backend hosting
- **Supabase Production** - Production database setup
- **Environment Variables** - Production secrets
- **CI/CD Pipeline** - GitHub Actions for auto-deploy

---

## Quick Start

### Install Dependencies
```bash
cd /Users/jam/development/CRM-Life-Annuity-Backend
npm install
```

### Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "Test1234!"}'
```

---

## Email Service

### Overview
The email service uses **Resend** with **React Email** templates. Follows the same pattern as the Geek @ Your Spot project for consistency.

### Email Types
| Type | Purpose | Triggered By |
|------|---------|--------------|
| Password Reset | Send reset link | User request |
| Welcome | New account notification | Registration |
| Activity Reminder | Upcoming tasks/appointments | Scheduled job (future) |
| Renewal Alert | Policy renewal notification | Scheduled job (future) |
| Test | Verify email configuration | Admin testing |

### Endpoints (All authenticated users)
```
GET    /api/email/config           # Get email configuration (no secrets)
POST   /api/email/test             # Send test email
POST   /api/email/password-reset   # Send password reset email
POST   /api/email/welcome          # Send welcome email
POST   /api/email/activity-reminder # Send activity reminder
POST   /api/email/renewal-alert    # Send renewal alert
```

### Test Email
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"recipient@example.com"}'
```

### Send Password Reset
```bash
curl -X POST http://localhost:3000/api/email/password-reset \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "resetToken": "abc123xyz",
    "expiresInMinutes": 60
  }'
```

### ACORD Activity Integration
Email communications align with the ACORD `Activity` model:
- `ActivityTypeCode` can be EMAIL
- Links to `PartyID` and/or `HoldingID`
- Supports `Attachment` for email attachments
- Tracks `DueDate`, `DoneDate`, `StartTime`, `EndTime`

---

## Email Configuration for Clients

Clients deploying their own instance need to configure:

### 1. Create Resend Account
- Sign up at https://resend.com
- Get API key from https://resend.com/api-keys

### 2. Verify Domain (Required for Production)
- Add DNS records in Resend dashboard
- Verify domain ownership
- Use verified domain for FROM address

### 3. Environment Variables
```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@client-domain.com
APP_NAME=Client Agency CRM
APP_URL=https://crm.client-domain.com
```

### 4. Test Configuration
```bash
curl http://localhost:3000/api/email/config \
  -H "Authorization: Bearer <token>"

# Should return:
# {"success":true,"data":{"configured":true,"fromEmail":"noreply@client-domain.com",...}}
```

---

## Future: AI-Powered Email Monitoring

With the advent of AI and MCP (Model Context Protocol), the CRM could be extended to:

### Inbound Email Processing
- **Monitor Inbox** - AI agent monitors agency inbox via MCP
- **Auto-Categorize** - Classify emails by Party, Holding, Activity type
- **Create Activities** - Auto-create Activity records from incoming emails
- **Extract Data** - Pull policy numbers, client info from email content
- **Smart Routing** - Route to appropriate agent based on content

### Implementation Approach
1. **MCP Server** - Connect to email provider (Gmail, Outlook)
2. **AI Classification** - Use Claude to categorize and extract
3. **Activity Creation** - POST to `/api/activities` with type=EMAIL
4. **Attachment Handling** - Save attachments via `/api/attachments/upload`
5. **Notification** - Alert assigned agent of new correspondence

### Potential MCP Tools
```
email_list_inbox     - List recent emails
email_get_message    - Get email content
email_send           - Send reply
email_archive        - Archive processed emails
```

This would transform the CRM from reactive to proactive client management.

---

## ACORD XML Import/Export

### Import XML
```bash
curl -X POST http://localhost:3000/api/acord/import \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/xml" \
  -d '@sample.xml'
```

### Export All to XML
```bash
curl -X GET http://localhost:3000/api/acord/export \
  -H "Authorization: Bearer <token>" \
  -o export.xml
```

### Export Specific Party
```bash
curl -X GET http://localhost:3000/api/acord/export/party/<partyId> \
  -H "Authorization: Bearer <token>" \
  -o party.xml
```

---

## File Upload Usage

### Upload a File
```bash
curl -X POST http://localhost:3000/api/attachments/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "partyId=<partyId>" \
  -F "attachmentType=application" \
  -F "description=Policy application form"
```

### Get Attachments for a Party
```bash
curl -X GET http://localhost:3000/api/attachments/party/<partyId> \
  -H "Authorization: Bearer <token>"
```

### Download a File
```bash
curl -X GET http://localhost:3000/api/attachments/<attachmentId>/download \
  -H "Authorization: Bearer <token>" \
  -o downloaded_file.pdf
```

---

## Project Structure

```
CRM-Life-Annuity-Backend/
├── .env
├── .env.example
├── .gitignore
├── HANDOFF.md
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma          # 42+ ACORD models
│   └── migrations/
└── src/
    ├── index.ts               # Express app entry
    ├── middleware/
    │   └── auth.middleware.ts # JWT auth, RBAC
    ├── emails/
    │   ├── emailService.ts    # Resend integration
    │   └── templates/         # React Email templates
    │       ├── PasswordResetEmail.tsx
    │       ├── WelcomeEmail.tsx
    │       ├── ActivityReminderEmail.tsx
    │       └── RenewalAlertEmail.tsx
    ├── types/
    │   ├── acord.types.ts     # TXLife XML types
    │   ├── party.types.ts
    │   ├── holding.types.ts
    │   └── ...
    ├── validators/
    │   ├── acord.schemas.ts   # Zod schemas
    │   └── ...
    ├── services/
    │   ├── acordService.ts    # XML import/export
    │   ├── auditLogService.ts # Audit log queries
    │   ├── fileUploadService.ts # Supabase Storage
    │   ├── partyService.ts
    │   ├── holdingService.ts
    │   └── ...
    ├── routes/
    │   ├── acord.ts           # 8 endpoints
    │   ├── auditLogs.ts       # 7 endpoints
    │   ├── attachments.ts     # 11 endpoints
    │   ├── email.ts           # 6 endpoints
    │   ├── parties.ts         # 6 endpoints
    │   ├── holdings.ts        # 5 endpoints
    │   └── ...
    └── utils/
        ├── prisma.ts
        └── acordMappings.ts   # ACORD tc ↔ Prisma enum
```

---

## API Quick Reference

### Public Endpoints
```
GET    /health                         # Health check
GET    /api                            # API info
POST   /api/auth/register              # Register user
POST   /api/auth/login                 # Login
POST   /api/auth/refresh               # Refresh token
```

### Email (All authenticated users)
```
GET    /api/email/config               # Get email configuration
POST   /api/email/test                 # Send test email
POST   /api/email/password-reset       # Send password reset
POST   /api/email/welcome              # Send welcome email
POST   /api/email/activity-reminder    # Send activity reminder
POST   /api/email/renewal-alert        # Send renewal alert
```

### ACORD XML (ADMIN/AGENT only)
```
POST   /api/acord/import               # Import TXLife XML
POST   /api/acord/validate             # Validate XML only
GET    /api/acord/export               # Export all to XML
GET    /api/acord/export/party/:id     # Export party to XML
GET    /api/acord/export/holding/:id   # Export holding to XML
POST   /api/acord/export/bulk          # Bulk export to XML
GET    /api/acord/export/json          # Export summary as JSON
```

### Dashboard (All authenticated users)
```
GET    /api/dashboard/stats
GET    /api/dashboard/renewals
GET    /api/dashboard/anniversaries
GET    /api/dashboard/tasks
GET    /api/dashboard/pipeline
GET    /api/dashboard/activity-feed
GET    /api/dashboard/overview
```

### Audit Logs (ADMIN only)
```
GET    /api/audit-logs              # List with filtering/pagination
GET    /api/audit-logs/summary      # Summary by entity type
GET    /api/audit-logs/filters      # Available filter options
GET    /api/audit-logs/entity/:type/:id  # History for specific entity
GET    /api/audit-logs/user/:userId # History for specific user
GET    /api/audit-logs/:id          # Single log entry
DELETE /api/audit-logs/purge        # Purge old logs (min 30 days)
```

### Attachments/File Upload (ADMIN/AGENT only)
```
GET    /api/attachments/config         # Get upload configuration
GET    /api/attachments                # List all with pagination
POST   /api/attachments/upload         # Upload file (multipart/form-data)
GET    /api/attachments/party/:partyId # Get attachments for party
GET    /api/attachments/holding/:holdingId # Get attachments for holding
GET    /api/attachments/:id            # Get attachment by ID
GET    /api/attachments/:id/url        # Get fresh signed URL
GET    /api/attachments/:id/download   # Download file
PATCH  /api/attachments/:id            # Update metadata
DELETE /api/attachments/:id            # Delete attachment
DELETE /api/attachments/party/:partyId # Delete all for party
DELETE /api/attachments/holding/:holdingId # Delete all for holding
```

### Protected Resources (READONLY: GET only, AGENT/ADMIN: full CRUD)
```
/api/parties      - Party management (6 endpoints)
/api/holdings     - Policy/contract management (5 endpoints)
/api/activities   - CRM activities (10 endpoints)
/api/relations    - Party-holding relationships (14 endpoints)
/api/coverages    - Coverage/rider management (14 endpoints)
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:4200

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Password hashing
BCRYPT_ROUNDS=12

# Account security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# Supabase Storage (for file uploads)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=attachments

# File upload limits
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/gif

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
APP_NAME=ACORD CRM
APP_URL=http://localhost:4200
```

---

## Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@react-email/components": "^1.0.3",
    "@react-email/render": "^2.0.1",
    "@supabase/supabase-js": "^2.45.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "fast-xml-parser": "^4.5.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.0",
    "react": "^19.x",
    "react-dom": "^19.x",
    "resend": "^6.x",
    "zod": "^3.23.8"
  }
}
```

---

## Supabase Storage Setup

To use file upload functionality:

1. **Create a Supabase project** at https://supabase.com
2. **Create a storage bucket** named `attachments`
3. **Get your credentials:**
   - Project URL: `https://your-project.supabase.co`
   - Service Role Key: Found in Settings → API → service_role key
4. **Add to .env:**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   SUPABASE_STORAGE_BUCKET=attachments
   ```

---

## ACORD Type Codes Reference

### Common Type Codes (tc values)

| Type | Code | Value |
|------|------|-------|
| Party - Person | 1 | PERSON |
| Party - Organization | 2 | ORGANIZATION |
| Gender - Male | 1 | MALE |
| Gender - Female | 2 | FEMALE |
| Holding - Policy | 1 | POLICY |
| Holding - Annuity | 2 | ANNUITY |
| LOB - Life | 1 | LIFE |
| LOB - Annuity | 2 | ANNUITY |
| Role - Owner | 8 | OWNER |
| Role - Insured | 32 | INSURED |
| Role - Primary Beneficiary | 34 | PRIMARY_BENEFICIARY |
| Role - Primary Agent | 37 | PRIMARY_AGENT |
| Payment - Monthly | 12 | MONTHLY |
| Payment - Annual | 1 | ANNUAL |

---

## Key Development Notes

1. **104 total endpoints** - Backend is fully functional
2. **fast-xml-parser** - High-performance XML parsing/building
3. **Transaction-safe imports** - All database changes are atomic
4. **ID mapping** - XML IDs mapped to database IDs during import
5. **Bidirectional mapping** - ACORD tc ↔ Prisma enum (40+ mappings)
6. **XML body parser** - Configured for application/xml content type
7. **RBAC** - ADMIN/AGENT can import/export, READONLY cannot
8. **File storage** - Uses existing ACORD Attachment model with partyId/holdingId
9. **Email** - React Email templates matching Geek @ Your Spot pattern
10. **JSX Support** - tsconfig.json configured with `"jsx": "react-jsx"`

---

## Session History

| Date | Work Completed |
|------|----------------|
| Jan 20, 2026 | Initial Prisma schema from ACORD XSD |
| Jan 20, 2026 | Party, Holdings, Activities, Relations, Coverages APIs |
| Jan 20, 2026 | JWT Authentication with RBAC |
| Jan 20, 2026 | Dashboard API (7 endpoints) |
| Jan 20, 2026 | ACORD XML Import/Export (8 endpoints) |
| Jan 20, 2026 | Audit Log Queries (7 endpoints) |
| Jan 20, 2026 | File Upload/Attachments (11 endpoints) |
| Jan 20, 2026 | **Email Notifications (6 endpoints)** |

---

## To Continue in New Chat

Say: **"Let's continue with the ACORD CRM project. Start the Angular 21 frontend."**

Or choose another option:
- "Add PDF/Excel reporting for policies and commissions"
- "Deploy the backend to Render.com"
- "Add Swagger/OpenAPI documentation"
- "Create a Postman collection for testing"
- "Add scheduled jobs for automated email reminders"
