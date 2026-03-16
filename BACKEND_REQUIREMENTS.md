# CapitalOps Backend Requirements

**Last Updated:** 2026-03-16  
**Current Status:** Complete - Frontend-aligned ✅  
**Backend:** Express.js with in-memory storage + external Flask proxy

---

## Overview

The backend is a Node.js/Express server that serves as a proxy to an external Flask backend (configurable via `BACKEND_URL`). When the Flask backend is unavailable, it falls back to in-memory storage with realistic seed data.

---

## Current Architecture

### Tech Stack
- **Runtime:** Node.js 20
- **Framework:** Express.js 5
- **Authentication:** Passport.js (Local + Google OAuth)
- **Password Hashing:** Scrypt
- **Session Management:** JWT in HTTP-only cookies
- **Storage:** MemStorage (in-memory) with seed data
- **External Proxy:** Optional Flask backend proxy

### Key Files
- `server/index.ts` - Express server entry point
- `server/routes.ts` - All API routes with backend proxy/fallback logic
- `server/storage.ts` - MemStorage implementation with seed data
- `server/auth.ts` - Passport setup, password hashing, JWT cookies
- `server/vite.ts` - Vite dev server integration
- `server/static.ts` - Static file serving for production

---

## API Routes

### Authentication
- `POST /api/register` - Register new user (username, password)
- `POST /api/login` - Login with Passport local strategy
- `POST /api/logout` - Clear JWT cookie
- `GET /api/user` - Get current user profile (authenticated)
- `PUT /api/users/:id` - Update user profile (authenticated)
- `GET /api/auth/google` - Google OAuth redirect (if configured)
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/google/status` - Check if Google OAuth is enabled

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Core Entities (all support GET/POST/PUT/DELETE)
- `GET /api/portfolios`
- `GET /api/assets`, `GET /api/assets/:id`, POST/PUT/DELETE
- `GET /api/projects`, `GET /api/projects/:id`, POST/PUT/DELETE
- `GET /api/deals`, `GET /api/deals/:id`, POST/PUT/DELETE
- `GET /api/investors`, `GET /api/investors/:id`, POST/PUT/DELETE
- `GET /api/allocations`, `GET /api/allocations/:id`, POST/PUT/DELETE

### Execution & Operations
- `GET /api/milestones`, `GET /api/milestones/project/:projectId`
- `GET /api/vendors`, `GET /api/vendors/:id`, POST/PUT/DELETE
- `GET /api/work-orders`, `GET /api/work-orders/vendor/:vendorId`
- `GET /api/risk-flags`, `GET /api/risk-flags/project/:projectId`

### Connection System (Social/Networking features)
- `GET /api/connection-requests` - Get all connection requests for user
- `POST /api/connection-requests` - Send connection request
- `PUT /api/connection-requests/:id` - Accept/decline connection
- `DELETE /api/connection-requests/:id` - Delete connection request
- `GET /api/connections` - Get all connected users
- `GET /api/connection-pending` - Get pending connection requests

### Messaging System
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create/get conversation with user
- `GET /api/messages` - Get messages in conversation
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message (sender only)

### Utilities
- `GET /api/backend-status` - Check Flask backend connection status

---

## Data Model

All entities defined in `shared/schema.ts`:

1. **User** - Authentication + Profile
   - `id`, `username`, `password`, `role`, `googleId`
   - `profileType` (investor/vendor/developer)
   - `profileStatus` (active/inactive/pending/suspended)
   - Profile fields (title, organization, LinkedIn, bio)
   - Investor-specific (geographicFocus, checkSize, etc.)
   - Vendor-specific (serviceTypes, certifications, etc.)
   - Developer-specific (developmentFocus, portfolioValue, etc.)

2. **Portfolio** - Top-level container
3. **Asset** - Real estate assets
4. **Project** - Development projects
5. **Deal** - Capital raising deals
6. **Investor** - Investor profiles with preferences
7. **Allocation** - Investor commitments to deals
8. **Milestone** - Project milestones
9. **Vendor** - Service providers
10. **WorkOrder** - Maintenance/compliance tasks
11. **RiskFlag** - Risk monitoring
12. **ConnectionRequest** - Social connections
13. **Conversation** - Message threads
14. **Message** - Direct messages

---

## Seed Data

The `MemStorage` class seeds realistic data in `server/storage.ts:146`:
- 1 portfolio
- 3 assets
- 6 projects
- 5 deals
- 10 investors
- 8 allocations
- 8 milestones
- 5 vendors
- 6 work orders
- 8 risk flags
- 1 admin user (username: `admin`, password: `admin123`)

Seed data follows pattern: `port-001`, `asset-001`, `proj-001`, etc.

---

## Backend Proxy with Fallback

### Pattern
All API routes attempt to proxy to `BACKEND_URL` first:
- If successful: return backend response
- If failed: use in-memory storage with seed data

### Helper Functions
- `withBackendFallback()` - For POST/PUT/DELETE mutations
- `withMergedList()` - For GET list requests (merges backend + local items)
- `isSeedId()` - Identify seed data IDs

### Configuration
```bash
BACKEND_URL=http://localhost:3001  # Flask backend URL
COMPAT_API_KEY=your-api-key       # For backend auth
SESSION_SECRET=change-me          # Express session secret
```

Google OAuth (optional):
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:3000     # Callback URL base
```

---

## S3 Upload Support

Profile images are uploaded to S3 via `/api/upload` endpoint.

Frontend usage:
```typescript
await uploadToS3(file, `avatars/${userId}/${timestamp}-${filename}`);
```

**Backend requirement:** Add `/api/upload` endpoint that:
1. Accepts multipart/form-data with `file`, `path`, `contentType`, `fileName`
2. Validates file type (images only), size (<2MB)
3. Uploads to S3 and returns `{ url, key }`

---

## Frontend Features Requiring Backend Support

### ✅ Already Implemented
1. **Theme System** - Light/Dark mode (session persistence via localStorage)
2. **User Profile** - Full CRUD with profile types, status, S3 avatar
3. **Connection System** - Send/accept/decline connections
4. **Messaging** - Conversations and direct messages
5. **Backend Status** - Shows connection state to Flask backend

### Next Steps (Optional)
1. **S3 Upload Endpoint** - Add `/api/upload` to handle avatar uploads
2. **External Database** - Replace MemStorage with PostgreSQL + Drizzle ORM
3. **Real-time Features** - WebSocket for messages/notifications
4. **Image Processing** - S3 image resize/optimization for avatars

---

## Testing

```bash
# Start backend
npm run dev

# Default credentials
Username: admin
Password: admin123
```

---

## Deployment

```bash
# Production build
npm run build

# Start production server
npm run start
```

Server runs on port 3000 (configurable via `PORT` env var).
