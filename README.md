# CRM Life & Annuity - Backend

[![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

Enterprise-grade API backend for insurance CRM, implementing **ACORD** (Association for Cooperative Operations Research and Development) standards for Life & Annuity data compliance and interoperability.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

| Category | Capabilities |
|----------|--------------|
| **ACORD Compliance** | 42+ models based on Life & Annuity XSD standards |
| **Authentication** | JWT with refresh tokens, role-based access (ADMIN, AGENT, READONLY) |
| **Party Management** | Individuals, organizations, addresses, phones, emails |
| **Holdings** | Policies, annuities, coverages, beneficiary relations |
| **CRM Activities** | Calls, emails, meetings, tasks, follow-ups |
| **File Management** | Supabase Storage integration, any-entity attachments |
| **Email Service** | Resend + React Email templates |
| **ACORD XML** | Import/export in standard XML format |
| **Audit Logging** | Complete change history on all entities |
| **Dashboard** | Stats, pipeline, renewals, activity feed |

**104 API endpoints** across 13 route modules.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24 LTS | Runtime environment |
| Express | 4.x | Web framework |
| TypeScript | 5.6+ | Type safety |
| Prisma | 5.x | ORM & database toolkit |
| PostgreSQL | 15+ | Database (Supabase hosted) |
| Zod | 3.x | Request validation |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| fast-xml-parser | 4.x | ACORD XML import/export |
| Resend | 4.x | Transactional email |
| React Email | 3.x | Email templates |

---

## Quick Start

### Prerequisites

- Node.js 24 LTS
- npm 10+
- PostgreSQL database (Supabase recommended)

```bash
# Verify Node.js version
node --version  # Should be v24.x.x

# Install Node 24 if needed
nvm install 24
nvm use 24
```

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/CRM-Life-Annuity-Backend.git
cd CRM-Life-Annuity-Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`

### Test Credentials

After seeding:
```
Admin:  admin@test.com / Test1234!
Agent:  agent@test.com / Test1234!
```

---

## Environment Variables

Create `.env` file with all required variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Authentication (Required)
JWT_SECRET="your-secure-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200

# Supabase Storage (Required for file uploads)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="attachments"

# Email Service (Required for notifications)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="CRM <noreply@yourdomain.com>"

# Optional
LOG_LEVEL=debug
```

---

## API Reference

Base URL: `http://localhost:3000/api`

### Authentication (16 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, get tokens | Public |
| POST | `/auth/logout` | Logout, invalidate token | Required |
| POST | `/auth/refresh` | Refresh access token | Public |
| GET | `/auth/me` | Get current user | Required |
| PATCH | `/auth/me` | Update profile | Required |
| POST | `/auth/change-password` | Change password | Required |
| POST | `/auth/forgot-password` | Request reset email | Public |
| POST | `/auth/reset-password` | Reset with token | Public |
| POST | `/auth/verify-email` | Verify email address | Public |
| POST | `/auth/resend-verification` | Resend verification | Public |
| GET | `/auth/users` | List users | Admin |
| GET | `/auth/users/:id` | Get user | Admin |
| PATCH | `/auth/users/:id` | Update user | Admin |
| DELETE | `/auth/users/:id` | Delete user | Admin |
| PATCH | `/auth/users/:id/role` | Change role | Admin |

### Parties (11 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/parties` | List parties (paginated) | Required |
| GET | `/parties/search` | Search parties | Required |
| GET | `/parties/export` | Export to CSV | Required |
| GET | `/parties/:id` | Get party by ID | Required |
| POST | `/parties` | Create party | Agent+ |
| PATCH | `/parties/:id` | Update party | Agent+ |
| DELETE | `/parties/:id` | Delete party | Admin |
| GET | `/parties/:id/holdings` | Get party's holdings | Required |
| GET | `/parties/:id/activities` | Get party's activities | Required |
| GET | `/parties/:id/attachments` | Get party's files | Required |
| GET | `/parties/:id/timeline` | Get party timeline | Required |

### Holdings (12 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/holdings` | List holdings | Required |
| GET | `/holdings/search` | Search holdings | Required |
| GET | `/holdings/export` | Export to CSV | Required |
| GET | `/holdings/renewals` | Upcoming renewals | Required |
| GET | `/holdings/:id` | Get holding by ID | Required |
| POST | `/holdings` | Create holding | Agent+ |
| PATCH | `/holdings/:id` | Update holding | Agent+ |
| DELETE | `/holdings/:id` | Delete holding | Admin |
| GET | `/holdings/:id/coverages` | Get coverages | Required |
| POST | `/holdings/:id/coverages` | Add coverage | Agent+ |
| GET | `/holdings/:id/relations` | Get relations | Required |
| POST | `/holdings/:id/relations` | Add relation | Agent+ |

### Activities (10 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/activities` | List activities | Required |
| GET | `/activities/search` | Search activities | Required |
| GET | `/activities/upcoming` | Due soon | Required |
| GET | `/activities/overdue` | Past due | Required |
| GET | `/activities/:id` | Get activity | Required |
| POST | `/activities` | Create activity | Agent+ |
| PATCH | `/activities/:id` | Update activity | Agent+ |
| DELETE | `/activities/:id` | Delete activity | Agent+ |
| POST | `/activities/:id/complete` | Mark complete | Agent+ |
| POST | `/activities/:id/reschedule` | Reschedule | Agent+ |

### Leads (10 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leads` | List leads | Required |
| GET | `/leads/search` | Search leads | Required |
| GET | `/leads/pipeline` | Pipeline summary | Required |
| GET | `/leads/:id` | Get lead | Required |
| POST | `/leads` | Create lead | Agent+ |
| PATCH | `/leads/:id` | Update lead | Agent+ |
| DELETE | `/leads/:id` | Delete lead | Admin |
| POST | `/leads/:id/convert` | Convert to party | Agent+ |
| POST | `/leads/:id/qualify` | Qualify lead | Agent+ |
| POST | `/leads/:id/disqualify` | Disqualify lead | Agent+ |

### Dashboard (7 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/overview` | Full dashboard data | Required |
| GET | `/dashboard/stats` | Summary statistics | Required |
| GET | `/dashboard/renewals` | Upcoming renewals | Required |
| GET | `/dashboard/anniversaries` | Policy anniversaries | Required |
| GET | `/dashboard/tasks` | Task summary | Required |
| GET | `/dashboard/pipeline` | Lead pipeline | Required |
| GET | `/dashboard/activity` | Recent activity feed | Required |

### Attachments (11 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/attachments` | List attachments | Required |
| GET | `/attachments/:id` | Get attachment | Required |
| GET | `/attachments/:id/download` | Download file | Required |
| POST | `/attachments/upload` | Upload file | Agent+ |
| POST | `/attachments/upload-multiple` | Upload multiple | Agent+ |
| DELETE | `/attachments/:id` | Delete attachment | Agent+ |
| GET | `/attachments/entity/:type/:id` | Get by entity | Required |
| POST | `/attachments/:id/rename` | Rename file | Agent+ |
| POST | `/attachments/:id/move` | Move to entity | Agent+ |
| GET | `/attachments/storage/usage` | Storage stats | Admin |
| GET | `/attachments/types` | Allowed file types | Required |

### ACORD XML (8 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/acord/import` | Import ACORD XML | Agent+ |
| POST | `/acord/import/validate` | Validate XML only | Agent+ |
| GET | `/acord/export/party/:id` | Export party XML | Required |
| GET | `/acord/export/holding/:id` | Export holding XML | Required |
| GET | `/acord/export/batch` | Batch export | Required |
| GET | `/acord/templates` | Available templates | Required |
| GET | `/acord/codes/:type` | ACORD code lookup | Required |
| POST | `/acord/transform` | Transform XML | Agent+ |

### Email (6 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/email/send` | Send email | Agent+ |
| POST | `/email/send-template` | Send from template | Agent+ |
| GET | `/email/templates` | List templates | Required |
| GET | `/email/templates/:id` | Get template | Required |
| POST | `/email/templates` | Create template | Admin |
| GET | `/email/history/:entityType/:entityId` | Email history | Required |

### Audit Logs (7 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/audit` | List audit logs | Admin |
| GET | `/audit/search` | Search logs | Admin |
| GET | `/audit/:id` | Get log entry | Admin |
| GET | `/audit/entity/:type/:id` | Logs by entity | Admin |
| GET | `/audit/user/:id` | Logs by user | Admin |
| GET | `/audit/summary` | Activity summary | Admin |
| GET | `/audit/export` | Export logs | Admin |

### System (6 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | Public |
| GET | `/health/ready` | Readiness check | Public |
| GET | `/health/live` | Liveness check | Public |
| GET | `/system/info` | System info | Admin |
| GET | `/system/config` | App config | Admin |
| POST | `/system/cache/clear` | Clear cache | Admin |

---

## Authentication

### Login Flow

```bash
# 1. Login to get tokens
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "Test1234!"}'

# Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}

# 2. Use access token for API calls
curl http://localhost:3000/api/parties \
  -H "Authorization: Bearer eyJhbG..."

# 3. Refresh when expired
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbG..."}'
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| ADMIN | Full access, user management, system config |
| AGENT | CRUD on parties, holdings, activities, leads |
| READONLY | View only, no create/update/delete |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "partyTypeCode": "PERSON",
    "person": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "pageSize": 25,
      "totalCount": 150,
      "totalPages": 6,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "validationErrors": [
      { "field": "person.firstName", "message": "First name is required" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate or conflict |
| SERVER_ERROR | 500 | Internal server error |

---

## Database Schema

### ACORD Core Models (42+ tables)

```
Party Management:
├── Party            # Base entity (person or organization)
├── Person           # Individual details
├── Organization     # Business details
├── Address          # Physical/mailing addresses
├── Phone            # Phone numbers
├── EmailAddress     # Email contacts
└── PartyRole        # Role assignments

Holdings:
├── Holding          # Policy/annuity container
├── Policy           # Policy details
├── Life             # Life insurance specifics
├── Annuity          # Annuity specifics
├── Coverage         # Coverages and riders
├── AnnuityPayout    # Payout schedules
└── Relation         # Party-to-holding links with roles

CRM Extensions:
├── Activity         # Calls, meetings, tasks
├── Lead             # Pre-sale prospects
├── Attachment       # File uploads
└── AuditLog         # Change history

System:
├── User             # Authentication
└── RefreshToken     # Token management
```

### Key Enums

- `PartyTypeCode`: PERSON, ORGANIZATION
- `HoldingTypeCode`: POLICY, ANNUITY, INVESTMENT
- `HoldingStatusCode`: PENDING, ACTIVE, LAPSED, TERMINATED, etc.
- `RelationRoleCode`: OWNER, INSURED, BENEFICIARY, AGENT, etc.
- `ActivityTypeCode`: CALL, EMAIL, MEETING, TASK, NOTE, FOLLOW_UP
- `ActivityStatusCode`: PENDING, SCHEDULED, COMPLETED, CANCELLED
- `UserRole`: ADMIN, AGENT, READONLY

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

---

## Deployment

### Render.com

**Build Settings:**
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm start`

**Environment Variables:**
Set all variables from `.env.example` in Render dashboard.

**Health Check:**
- Path: `/api/health`
- Expected: `200 OK`

### Docker (Alternative)

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### Common Issues

**Prisma client not generated:**
```bash
npx prisma generate
```

**Database connection failed:**
- Check `DATABASE_URL` format
- Ensure database exists
- Check firewall/network access

**JWT errors:**
- Ensure `JWT_SECRET` is set (min 32 chars)
- Check token expiration
- Verify `Authorization: Bearer <token>` header format

**CORS errors:**
- Add frontend URL to `CORS_ORIGIN`
- Multiple origins: `CORS_ORIGIN=http://localhost:4200,https://app.example.com`

**File upload fails:**
- Check Supabase credentials
- Verify storage bucket exists
- Check file size limits

---

## Related Projects

- **Frontend:** [CRM-Life-Annuity-Frontend](https://github.com/YOUR_USERNAME/CRM-Life-Annuity-Frontend)

---

## ACORD Resources

- [ACORD Standards](https://www.acord.org)
- [ACORD Life & Annuity Standards](https://www.acord.org/standards-architecture/acord-data-standards/Life_702702a)

---

## License

Proprietary - All rights reserved

---

## Support

For issues or questions, contact the development team.
