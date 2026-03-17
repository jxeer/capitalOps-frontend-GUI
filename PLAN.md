# CapitalOps Implementation Plan

**Last Updated:** 2026-03-17  
**Current Phase:** Phase 4 - Profile Enhancement & UI Polish  
**Status:** Phase 4 Profile Image Persistence ✅ FIXED - Images now persist to disk and database

---
## Recent Progress

### Profile Image Persistence Implementation - FIXED ✅

**Date Completed:** 2026-03-17  
**Status:** Fully functional - images persist to disk in Flask backend

**What Was Done:**

**Backend Changes:**
- Added `profile_image` column to User model in `app/models.py`
- Updated Flask `/api/upload` endpoint in `app/routes/compat.py` to save files to `app/uploads/` directory
- Added `PUT /api/user` endpoint to update user profile including profile image
- Configured Flask to serve static files from `/uploads/` route in `app/__init__.py`
- Files are saved when AWS S3 is not configured (local dev mode)
- Profile image URL stored in database and persisted across restarts

**Current Status:**
- Profile images upload and persist to disk ✅
- Images served via `/uploads/filename.jpg` ✅
- Profile image URL saved to database ✅
- Frontend Profile page displays uploaded images ✅

**Files Modified (Backend):**
- `app/models.py` - Added `profile_image` column to User model, included in `to_dict()`
- `app/routes/compat.py` - Updated `/upload` endpoint to save files to disk, added `PUT /api/user` endpoint
- `app/__init__.py` - Added `/uploads/<filename>` route to serve uploaded files statically

**Backend Running:**
- Flask on port 3001
- Express on port 3000
- SQLite database (local dev, no PostgreSQL needed)

**Frontend Running:**
- Vite on port 3000 (via tsx)

**Current Issue:**
Frontend `.env` file has `VITE_AWS_BUCKET_URL=http://localhost:3001` but the frontend is not loading it correctly. The browser console shows "AWS S3 bucket URL not configured" even though the file contains the correct value.

**Possible Causes:**
1. Frontend server needs full restart (not just hot-reload)
2. `.env` file location issue
3. Vite caching issue
4. Frontend is running but not re-reading `.env`


## Project Overview

**CapitalOps** is a capital + governance operating layer for real estate development. It's designed to streamline capital raising, project governance, and stakeholder communication for commercial real estate development.

**What the App Does:**
- Portfolio management for real estate development projects
- Capital raising deal tracking and investor management
- Project lifecycle management with milestones and risk flags
- Investor portal for viewing allocations and committing capital
- Asset and vendor management for property operations
- Work order tracking for maintenance and compliance
- Professional networking (connections) and messaging between stakeholders

**Target Users:**
- Real estate investors (accredited investors, institutional investors)
- Vendors (contractors, architects, engineers, etc.)
- Developers (real estate development firms)
- Portfolio managers and project managers

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, TanStack Query, Wouter routing, Tailwind CSS, shadcn/ui
- Backend: Express.js 5, Passport (local + Google OAuth), in-memory storage with realistic seed data
- Database: Drizzle ORM (not actively used with in-memory storage)
- Auth: Session-based with scrypt password hashing

---

## Implementation Phases

### Phase 1 - Profile Management ✅ COMPLETE

**Status:** Complete  
**Date Completed:** March 16, 2026

**What Was Done:**
- Extended User schema with profileType (investor/vendor/developer) and profileStatus
- Updated OAuth flow to auto-create profiles on Google sign-up with default investor type
- Added profile menu in header with user avatar
- Created Profile page at /profile with edit capability

**Files Created:**
- client/src/pages/profile.tsx - Profile management page

**Files Modified:**
- client/src/App.tsx - Added profile route
- client/src/pages/auth-page.tsx - Updated OAuth flow
- server/routes.ts - Added profile routes
- server/storage.ts - Added profile persistence
- shared/schema.ts - Extended User schema

---

### Phase 2 - Visual Features (MVP) ✅ COMPLETE

**Status:** Complete  
**Date Completed:** March 16, 2026

**What Was Done:**
- AWS S3 integration for photo/video uploads (client/src/lib/s3.ts)
- MediaGallery component with upload/remove functionality (client/src/components/media-gallery.tsx)
- Google Maps integration for asset location tracking (client/src/components/asset-location-map.tsx)
- Assets page updated with media & location
- Projects page updated with media & location
- Description field added to Project type

**Files Created:**
- client/src/lib/s3.ts - AWS S3 upload helper
- client/src/components/media-gallery.tsx - Media gallery component
- client/src/components/asset-location-map.tsx - Google Maps location picker

**Files Modified:**
- client/src/pages/assets.tsx - Added media & location
- client/src/pages/projects.tsx - Added media & location
- shared/schema.ts - Added description field to Project

---

### Phase 3 - Connections & Messaging ✅ COMPLETE

**Status:** Complete  
**Date Completed:** March 16, 2026

**What Was Done:**
- Connection request system (send, accept, decline requests)
- Messaging system (1-on-1 conversations)
- Connections page with tabbed interface (All Connections, Connection Requests, Messages)
- Integrated with user profiles and authentication
- Professional "Connections" terminology (not "friends")

**Files Created:**
- client/src/components/connection-request-button.tsx - Connect button UI
- client/src/components/connection-request-list.tsx - Pending requests list
- client/src/components/communication-center.tsx - Messaging UI
- client/src/pages/connections.tsx - Connections management page

**Files Modified:**
- client/src/App.tsx - Added connections route
- client/src/components/app-sidebar.tsx - Added Connections link
- shared/schema.ts - Added ConnectionRequest, Message, Conversation schemas
- server/storage.ts - Added connection/message storage methods
- server/routes.ts - Added connection/message API endpoints

---

### Phase 4 - Profile Enhancement & UI Polish 🔄 IN PROGRESS

**Status:** In Progress  
**Date Started:** March 16, 2026

**What Was Done:**
- Profile image upload using S3 integration
- Comprehensive user profile schema with type-specific fields

**Completed Features:**
- Profile image upload UI (replace avatar, file selection, upload progress)
- General profile fields (title, organization, LinkedIn URL, bio)
- Investor-specific fields (geographicFocus, investmentStage, targetReturn, checkSizeMin/Max, riskTolerance, strategicInterest)
- Vendor-specific fields (serviceTypes, geographicServiceArea, yearsOfExperience, certifications, averageProjectSize)
- Developer-specific fields (developmentFocus, developmentType, teamSize, portfolioValue)
- Backend API endpoints updated
- Schema types in AuthUser and Zod schemas
- **Profile image persisted to disk in Flask backend** ✅
- Profile image stored in database ✅
- Flask serves static files from `/uploads/` endpoint ✅

**Backend Changes (New):**
- `app/models.py` - Added `profile_image` column to User model, included in `to_dict()`
- `app/routes/compat.py` - Updated `/upload` endpoint to save files to disk when AWS not configured
- `app/routes/compat.py` - Added `PUT /api/user` endpoint to update user profile (including profileImage)
- `app/__init__.py` - Added `/uploads/<filename>` route to serve uploaded files statically

---

### Phase 5 - Vendor Ranking 📋 PLANNED (Post-MVP)

**Status:** Not Started  
**Priority:** Low

**Planned Features:**
- Vendor performance tracking and scoring
- Rating system for vendors
- Ranking based on various metrics
- Vendor comparison tools

**Status:** Waiting for client requirements

---

## Complete Database Schema

### Core Entities:
| Entity | Description |
|--------|-------------|
| Portfolio | Top-level container |
| Asset | Real estate assets (belongs to Portfolio) |
| Project | Development projects (belongs to Asset) |
| Deal | Capital raising deals (belongs to Project) |
| Investor | Investor profiles with preferences |
| Allocation | Investor commitments to deals |
| Milestone | Project milestones |
| Vendor | Service providers |
| WorkOrder | Maintenance/compliance tasks |
| RiskFlag | Risk monitoring |

### Connection & Messaging Entities:
| Entity | Description |
|--------|-------------|
| ConnectionRequest | User connection requests (pending/accepted/declined) |
| Conversation | 1-on-1 chat sessions |
| Message | Individual messages in conversations |

### User Profile Fields:

**General (All Types):**
- title, organization, linkedInUrl, bio

**Investor-Specific:**
- geographicFocus, investmentStage, targetReturn
- checkSizeMin, checkSizeMax, riskTolerance, strategicInterest

**Vendor-Specific:**
- serviceTypes, geographicServiceArea, yearsOfExperience
- certifications, averageProjectSize

**Developer-Specific:**
- developmentFocus, developmentType, teamSize, portfolioValue

---

## Current State

### Completed:
- User authentication (local + Google OAuth)
- Profile management with multiple types
- AWS S3 integration for uploads
- Media galleries (assets, projects)
- Google Maps integration (assets, projects)
- Connection system (send, accept, decline)
- Messaging system (1-on-1 conversations)
- Comprehensive user profile schema (20 fields)

### Next Steps:
1. Complete Profile page UI for all type-specific fields
2. Test all new profile functionality
3. Build and deploy to staging
4. Client review and feedback

---

## Quick Reference: Project Structure

**Key Files & Folders:**
- `client/src/pages/` - Route components (dashboard, assets, projects, etc.)
- `client/src/components/` - UI components
- `server/routes.ts` - API endpoints with proxy/fallback logic
- `server/storage.ts` - In-memory storage with seed data
- `shared/schema.ts` - Zod schemas and TypeScript types
- `PLAN.md` - This file - implementation plan & status
- `ARCHITECTURE.md` - System architecture and API documentation (separate file)

**API Pattern:**
- All routes first try to proxy to BACKEND_URL
- Falls back to in-memory storage if unavailable
- POST/PUT/DELETE require auth; GET routes work without

**Build System:**
- Vite for client-side development and bundling
- Express.js for API routes and server-side rendering
- Production build creates `dist/public/` (client) and `dist/index.cjs` (server)

---

## Notes for Future Context

- Always check ARCHITECTURE.md for detailed architecture documentation
- Schema types are in shared/schema.ts
- Storage methods are in server/storage.ts
- Routes are in server/routes.ts
- Frontend components use Path aliases: @/, @shared/
- Build system: Vite for client, Express for server (serverless compatible)

---
**Current Status:** Uploading profile images works and images are now persisted to disk

**What Works:**
- ✅ Upload API endpoint working through Express proxy → Flask backend
- ✅ CORS headers configured for localhost:3000
- ✅ Frontend `s3.ts` file properly configured with env variables
- ✅ Upload returns URL and key from Flask backend
- ✅ Flask backend saves files to `app/uploads/` directory
- ✅ Flask serves static files from `/uploads/` route
- ✅ Profile image URL stored in database

**What Was Fixed:**
- ✅ Images persist to disk when AWS S3 not configured (local dev mode)
- ✅ Profile image stored in User model's `profile_image` field
- ✅ Static file serving configured in Flask `app/__init__.py`

**Next Steps:**

**Step 1: Fix Image Persistence** ✅ COMPLETE
1. Determine where profile images should be stored (disk vs database) - DISK (local dev)
2. Implement file storage in Flask backend:
   - Option A: Save to `app/uploads/` directory with unique filenames ✅
   - Option B: Store binary data in SQLite database (BLOB)
   - Option C: Set up actual AWS S3 bucket for production
3. Update Flask `/api/upload` endpoint to actually save files ✅
4. Configure Flask to serve static files from upload directory ✅
5. Test image upload persists across server restarts ✅

**Step 2: Update User Profile in Database** ✅ COMPLETE
1. When image uploads, update user's `profileImage` field in database ✅
2. Ensure `GET /api/user` endpoint returns updated profile image URL ✅
3. Test profile page displays correct image after upload ✅

**Step 3: Update Header Avatar** ✅ COMPLETE
1. Profile image upload should update user store/state ✅
2. Header/UserMenu component should re-render with new avatar ✅
3. Check if profile image URL is being stored in AuthUser context ✅

**Step 4: Move to Phase 5 - Vendor Ranking (Post-MVP)** 📋
1. Vendor performance tracking and scoring
2. Rating system for vendors
3. Ranking based on various metrics
4. Vendor comparison tools

---

## Current Configuration

### Frontend `.env` (`client/.env`):
```env
BACKEND_URL=http://localhost:3001
VITE_AWS_BUCKET_URL=/api
VITE_COMPAT_API_KEY=change-me-in-production
SESSION_SECRET=change-me-in-production
```

### Backend `.env` (`backend/.env`):
```env
DATABASE_URL=sqlite:///capitalops.db
COMPAT_API_KEY=change-me-in-production
# AWS_ACCESS_KEY_ID=your-aws-access-key-id
# AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
# AWS_BUCKET_NAME=capitalops-images  # Commented for local dev
AWS_REGION=us-east-1
```

---

## Next Development Phase: Phase 5 - Vendor Ranking (Post-MVP)

**Status:** Not Started  
**Priority:** Low (After Phase 4 completion)

**Planned Features:**
- Vendor performance tracking and scoring
- Rating system for vendors
- Ranking based on various metrics
- Vendor comparison tools

---

## Project Dates
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |
| 2026-03-16 | today | Phase 4 profile image upload FIXED - CORS and multipart proxy to Flask backend |

---

## Implementation Phases Detail

### Phase 1 - Profile Management ✅ COMPLETE
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |

| 2026-03-16 | today | Phase 4 profile image upload FIXED - CORS and multipart proxy to Flask backend |




**Profile Image Upload Implementation - FIXED ✅**

**Setup Completed:**
1. ✅ Installed Python 3.11 for Flask backend
2. ✅ Installed Flask dependencies (Flask, SQLAlchemy, Flask-CORS, Flask-JWT, psycopg2-binary, python-dotenv, boto3)
3. ✅ Configured Flask backend with:
   - User model extended with 20 new profile fields
   - ConnectionRequest, Conversation, Message models
   - `/api/upload` endpoint for S3 (with local fallback)
   - Connection/messaging API endpoints
4. ✅ Created `.env` file with AWS credentials (currently configured with mock S3 for local dev)
5. ✅ Updated `.env` with `AWS_BUCKET_NAME` commented out to use mock URLs
6. ✅ Updated Express server:
   - Added User model fields
   - Updated admin seed user with profile fields
   - Fixed `import.meta.env` instead of `process.env` in s3.ts
7. ✅ Updated frontend `.env`:
   - `BACKEND_URL=http://localhost:3000`
   - `VITE_AWS_BUCKET_URL=http://localhost:3001`

**Current Status:**
- Frontend login works
- User data loads correctly with all profile fields
- Profile page UI shows all fields
- **Profile image upload failing with "AWS S3 bucket URL not configured" error**
- Frontend is not properly reading `VITE_AWS_BUCKET_URL` from `.env` file

**Files Modified This Session:**
- `client/src/lib/s3.ts` - Updated to use `import.meta.env` with logging
- `client/src/pages/profile.tsx` - Already has upload logic
- `client/src/App.tsx` - ThemeToggle and UserMenu components
- `client/src/components/theme-provider.tsx` - Theme switching
- `server/routes.ts` - Updated admin seed with profile fields
- `server/storage.ts` - User schema updated
- `shared/schema.ts` - User schema extended with 20 fields
- `app/models.py` - User model with 20 new fields, ConnectionRequest, Conversation, Message
- `app/routes/compat.py` - Added /upload, connection/messaging endpoints
- `app/__init__.py` - Added dotenv loading
- `.env` (Flask) - AWS credentials configured
- `.env` (Frontend) - Backend and S3 URLs configured

**Backend Running:**
- Flask on port 3001
- Express on port 3000
- SQLite database (local dev, no PostgreSQL needed)

**Frontend Running:**
- Vite on port 3000 (via tsx)

**Current Issue:**

**Possible Causes:**
1. Frontend server needs full restart (not just hot-reload)
2. `.env` file location issue
3. Vite caching issue
4. Frontend is running but not re-reading `.env`

---

- Backend on port 3001 (Flask with in-memory SQLite)
- Frontend on port 3000 (Vite dev server via tsx)

**Current Issue:**

**Possible Causes:**
1. Frontend server needs full restart (not just hot-reload)
2. `.env` file location issue
3. Vite caching issue
4. Frontend is running but not re-reading `.env`

---



**Python 3.11+ with pip installed**

```bash
# Navigate to backend
cd /Users/julianxeer/dev/work/freelance/capitalops/backend

# Install dependencies
/opt/homebrew/Frameworks/Python.framework/Versions/3.11/bin/pip3.11 install flask flask-sqlalchemy flask-cors flask-jwt-extended psycopg2-binary python-dotenv boto3

# Create .env file (copy from .env.example)
cp .env.example .env
# Fill in AWS credentials (or comment out AWS_BUCKET_NAME for local dev mock)

# Run Flask backend
/opt/homebrew/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m flask run --host 0.0.0.0 --port 3001
```


**Node.js 20+ with npm installed**

```bash
# Navigate to frontend
cd /Users/julianxeer/dev/work/freelance/capitalops/frontend

# Start frontend (includes Express server + Vite)
npm run dev
```

---


```env
BACKEND_URL=http://localhost:3001
COMPAT_API_KEY=change-me-in-production
SESSION_SECRET=change-me-in-production
VITE_AWS_BUCKET_URL=http://localhost:3001
```

```env
DATABASE_URL=sqlite:///capitalops.db
COMPAT_API_KEY=change-me-in-production
# AWS_ACCESS_KEY_ID=your-aws-access-key-id
# AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
# AWS_BUCKET_NAME=capitalops-images  # Commented for local dev
AWS_REGION=us-east-1
```

---


**Status:** Not Started  
**Priority:** Medium (After Phase 4 completion)

**Planned Architecture:**
- Coral8 provides real-time capital deployment data and cash flow modeling
- Need API layer to bridge Coral8 data with CapitalOps frontend
- Coral8 data flow: Coral8 → API Gateway → CapitalOps Backend → Frontend
- likely uses WebSocket or Server-Sent Events (SSE) for real-time updates

**Future Backend Requirements:**
- Real-time data streaming from Coral8
- Transform Coral8 data models to match CapitalOps entity schema
- Handle Coral8 authentication and API key management
- Cache Coral8 data for offline/fallback mode

**Current Status:** Waiting for Coral8 API documentation and requirements

---

- Backend on port 3001 (Flask with in-memory SQLite)
- Frontend on port 3000 (Vite dev server via tsx)

**Current Issue:**
**Status:** Uploading profile images works but images are not persisted

**What Works:**
- ✅ Upload API endpoint working through Express proxy → Flask backend
- ✅ CORS headers configured for localhost:3000
- ✅ Frontend `s3.ts` file properly configured with env variables
- ✅ Upload returns URL and key from Flask backend

**What's Not Working:**
- ❌ Images not persisting permanently - Flask backend returns mock URLs (e.g., `http://localhost:3001/uploads/xxx.png`)
- ❌ Backend doesn't actually save files to disk
- ❌ Profile images stored in database? Need to verify
- ❌ User avatar in header doesn't update when profile image changes

**Next Steps:**

**Step 1: Fix Image Persistence**
1. Determine where profile images should be stored (disk vs database)
2. Implement file storage in Flask backend:
   - Option A: Save to `app/uploads/` directory with unique filenames
   - Option B: Store binary data in SQLite database (BLOB)
   - Option C: Set up actual AWS S3 bucket for production
3. Update Flask `/api/upload` endpoint to actually save files
4. Configure Flask to serve static files from upload directory
5. Test image upload persists across server restarts

**Step 2: Update User Profile in Database**
1. When image uploads, update user's `profileImage` field in database
2. Ensure `GET /api/user` endpoint returns updated profile image URL
3. Test profile page displays correct image after upload

**Step 3: Update Header Avatar**
1. Profile image upload should update user store/state
2. Header/UserMenu component should re-render with new avatar
3. Check if profile image URL is being stored in AuthUser context

**Step 4: Move to Phase 5 - Vendor Ranking (Post-MVP)**
1. Vendor performance tracking and scoring
2. Rating system for vendors
3. Ranking based on various metrics
4. Vendor comparison tools

---

1. Frontend server needs full restart (not just hot-reload)
2. `.env` file location issue
3. Vite caching issue
4. Frontend is running but not re-reading `.env`


| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |

## Replit Deployment Configuration

When deploying to Replit, configure environment variables:

### Frontend (client/.env):
- `VITE_AWS_BUCKET_URL=/api` - Keep relative URL for same-origin requests
- `VITE_COMPAT_API_KEY` - Set to your API key

### Server (server/.env):
- `BACKEND_URL` - Update to your Flask backend URL:
  - Same repl (default): `http://localhost:3001` or your repl's port
  - Separate backend repl: `https://your-username.capitalops-backend.replit.app`

### Flask Backend (backend/.env):
- No URL changes needed
- Ensure `COMPAT_API_KEY` matches what's configured in frontend

**Note:** The relative URL approach (`/api`) only works when frontend and backend are on the same domain. For separate Replit instances, use full URLs.
