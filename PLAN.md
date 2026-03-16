# CapitalOps Implementation Plan

**Last Updated:** 2026-03-16  
**Current Phase:** Phase 4 - Profile Enhancement & UI Polish  
**Status:** Phase 1-3 Complete ✅ Theme System Complete ✅ Profile Image Upload Setup In Progress 🔄

---
## Recent Progress


### Profile Image Upload Setup 🔄 IN COMPLETE

**Status:** Implementation complete, upload testing pending

**Setup Completed:**
- ✅ Installed Python 3.11 for Flask backend
- ✅ Installed Flask dependencies (Flask, SQLAlchemy, Flask-CORS, Flask-JWT, psycopg2-binary, python-dotenv, boto3)
- ✅ Configured Flask backend with:
  - User model extended with 20 new profile fields
  - ConnectionRequest, Conversation, Message models
  - `/api/upload` endpoint for S3 (with local fallback)
  - Connection/messaging API endpoints
- ✅ Created `.env` file with AWS credentials (currently configured with mock S3 for local dev)
- ✅ Updated `.env` with `AWS_BUCKET_NAME` commented out to use mock URLs
- ✅ Updated Express server:
  - Added User model fields
  - Updated admin seed user with profile fields
  - Fixed `import.meta.env` instead of `process.env` in s3.ts
- ✅ Updated frontend `.env`:
  - `BACKEND_URL=http://localhost:3001`
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

**Remaining Tasks:**
- Update Profile page to show the new type-specific fields when editing
- Add conditional UI to show only relevant fields based on profileType
- Test profile image upload functionality
- Test all profile field persistence

**Backend Requirements:**
Your backend needs to provide a POST /upload endpoint that accepts multipart/form-data and returns { url, key }. Environment variable VITE_AWS_BUCKET_URL needs to be configured.

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

**API Pattern:**
- All routes first try to proxy to BACKEND_URL
- Falls back to in-memory storage if unavailable
- POST/PUT/DELETE require auth; GET routes work without

---

## Notes for Future Context

- Always check IMPLEMENTATION.md for detailed implementation documentation
- Schema types are in shared/schema.ts
- Storage methods are in server/storage.ts
- Routes are in server/routes.ts
- Frontend components use Path aliases: @/, @shared/
- Build system: Vite for client, Express for server (serverless compatible)
## Phase 4 Backend Requirements 🔄 IN PROGRESS

**Status:** In Progress  
**Backend Directory:** `/Users/julianxeer/Downloads/capitalOps-backend-API-main`

### What Frontend Needs from Backend:

**Priority 1 - Phase 4 (Profile Enhancement):**

1. **User Model Extension (20 new fields)**
   - General: `profile_type`, `profile_status`, `title`, `organization`, `linked_in_url`, `bio`
   - Investor-specific: `geographic_focus`, `investment_stage`, `risk_tolerance`, `target_return`, `check_size_min`, `check_size_max`, `strategic_interest`
   - Vendor-specific: `service_types`, `geographic_service_area`, `years_of_experience`, `certifications`, `average_project_size`
   - Developer-specific: `development_focus`, `development_type`, `team_size`, `portfolio_value`

2. **Profile Image Upload Endpoint**
   - `POST /upload` with S3 integration
   - AWS credentials needed
   - Required env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`

3. **Connection System**
   - `ConnectionRequest` model + endpoints (send, accept, decline)
   - `Conversation` model + endpoints
   - `Message` model + endpoints

4. **Profile Update**
   - `PUT /api/users/:id` already works (passes full body to DB)

---

### Backend Commit Reference:
**Commit:** `1c66319` - Add backend requirements for Phase 4  
**Full details:** See `BACKEND_REQUIREMENTS.md`

---

### Next Steps for Backend Development:

1. **Add new User fields (20 fields)**
2. **Add ConnectionRequest, Conversation, Message models**
3. **Create `/upload` endpoint with AWS S3**
4. **Create connection/messaging API endpoints**
5. **Configure AWS environment variables**

---

## Recent Progress (2026-03-16 Session - Profile Image Upload Setup)

### Session Progress Log

**Profile Image Upload Setup - IN COMPLETE**

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
Frontend `.env` file has `VITE_AWS_BUCKET_URL=http://localhost:3001` but the frontend is not loading it correctly. The browser console shows "AWS S3 bucket URL not configured" even though the file contains the correct value.

**Possible Causes:**
1. Frontend server needs full restart (not just hot-reload)
2. `.env` file location issue
3. Vite caching issue
4. Frontend is running but not re-reading `.env`

---

## Backend Setup Instructions (For Reference)

### Backend Requirements (Local Development)

**Python 3.11+ with pip installed**

```bash
# Navigate to backend
cd /Users/julianxeer/Downloads/capitalOps-backend-API-main

# Install dependencies
/opt/homebrew/Frameworks/Python.framework/Versions/3.11/bin/pip3.11 install flask flask-sqlalchemy flask-cors flask-jwt-extended psycopg2-binary python-dotenv boto3

# Create .env file (copy from .env.example)
cp .env.example .env
# Fill in AWS credentials (or comment out AWS_BUCKET_NAME for local dev mock)

# Run Flask backend
/opt/homebrew/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m flask run --host 0.0.0.0 --port 3001
```

### Frontend Requirements

**Node.js 20+ with npm installed**

```bash
# Navigate to frontend
cd /Users/julianxeer/Downloads/capitalOps-frontend-GUI-main

# Start frontend (includes Express server + Vite)
npm run dev
```

---

## Current Configuration

### Frontend `.env` (`/Users/julianxeer/Downloads/capitalOps-frontend-GUI-main/.env`):
```env
BACKEND_URL=http://localhost:3000
COMPAT_API_KEY=change-me-in-production
SESSION_SECRET=change-me-in-production
VITE_AWS_BUCKET_URL=http://localhost:3001
```

### Backend `.env` (`/Users/julianxeer/Downloads/capitalOps-backend-API-main/.env`):
```env
DATABASE_URL=sqlite:///capitalops.db
COMPAT_API_KEY=change-me-in-production
# AWS_ACCESS_KEY_ID=your-aws-access-key-id
# AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
# AWS_BUCKET_NAME=capitalops-images  # Commented for local dev
AWS_REGION=us-east-1
```

---

## Next Session: Profile Image Upload Debugging

When you start the next session, please:

1. **Verify `.env` file exists and contains correct values:**
   ```bash
   cat /Users/julianxeer/Downloads/capitalOps-frontend-GUI-main/.env
   ```

2. **Check if frontend is running:**
   ```bash
   curl -s http://localhost:3000 | head -5
   ```

3. **Test upload endpoint directly:**
   ```bash
   curl -s -X POST http://localhost:3001/api/upload -H "X-API-Key: change-me-in-production" -F "file=@/tmp/test.png;filename=test.png" -F "path=avatars/test/test.png"
   ```

4. **Check browser console** - Open DevTools (F12) → Console tab when uploading to see exact error

5. **Try forcing environment variable in package.json script:**
   - Check `/Users/julianxeer/Downloads/capitalOps-frontend-GUI-main/package.json` for dev script
   - May need to add `--env-file .env` or similar Vite flag

6. **Restart frontend cleanly:**
   ```bash
   pkill -f "tsx\|node.*tsx" 2>/dev/null
   sleep 2
   cd /Users/julianxeer/Downloads/capitalOps-frontend-GUI-main
   npm run dev
   ```

---

## Project Dates
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |
