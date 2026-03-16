# CapitalOps Implementation Plan

**Last Updated:** 2026-03-16  
**Current Phase:** Phase 4 - Profile Enhancement & UI Polish  
**Status:** Phase 1-3 Complete ✅ Theme System Complete ✅

## Recent Progress

### Theme System Update ✅

**Removed dim mode - simplified to light/dark only**

- Dim mode was abandoned (poor readability)
- Dark mode is now the default theme
- Light/dark toggle preserves user preference in localStorage
- Chart colors dynamically adjust per theme

### Backend Requirements ✅

**Created `BACKEND_REQUIREMENTS.md` for backend development**  
Includes:
- User model extension (20 new fields - profileType, profileStatus, title, organization, etc.)
- Connection system models + endpoints (ConnectionRequest, Conversation, Message)
- S3 upload endpoint for profile images
- AWS environment variables needed (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME)

---

## Files Changed (Recent Session)

- `client/src/components/theme-provider.tsx` - Simplified to 2 modes, dark as default
- `client/src/App.tsx` - ThemeToggle updated for light/dark only
- `client/src/index.css` - Removed dim mode CSS
- `client/src/pages/dashboard.tsx` - Dynamic chart colors per theme

---

## Project Directories

| Directory | Description |
|-----------|-------------|
| `/Users/julianxeer/Downloads/capitalOps-frontend-GUI-main` | Frontend - React + TypeScript + Vite |
| `/Users/julianxeer/Downloads/capitalOps-backend-API-main` | Backend - Express.js with Flask proxy |

---

## Project History & Evolution

| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-06 | a125e90 | Initial commit (Blueprint document) |
| 2026-03-06 | ea508bf | Stack files extracted |
| 2026-03-06 | 4afb847 | First comprehensive GUI for capital/governance |
| 2026-03-06 | a304704 | First iteration of GUI |
| 2026-03-06 | a7429c2 | Published App |
| 2026-03-06 | 3a07995 | Frontend connected to backend (proxy + fallback) |
| 2026-03-06 | 517f73f | Status colors updated for backend integration |
| 2026-03-06 | b10c22e | Published App |
| 2026-03-06 | 6c43978 | User authentication + CRUD operations |
| 2026-03-06 | bfe7294 | Secure Google sign-in authentication |
| 2026-03-06 | f499a49 | Investor matching on Deals Page + Stat cards |
| 2026-03-06 | 66ff786 | Merge conflict resolved |
| 2026-03-06 | d854e8b | Google OAuth progress |
| 2026-03-06 | 46ae467 | CRUD mutations connected to live backend with MemStorage fallback |
| 2026-03-06 | 8b8b596 | Status enums aligned with backend values |
| 2026-03-06 | 66bdca8 | GUI updates |
| 2026-03-06 | 94bba63 | Published App |
| 2026-03-06 | 5c5f068 | Screenshot UI update |
| 2026-03-06 | 56075a1 | Progress saved |
| 2026-03-06 | 8b846ef | Visual risk analysis + default admin login |
| 2026-03-06 | 051584e | Visual appearance enhancement across pages |
| 2026-03-06 | 78712f2 | Delete buttons test identifiers |
| 2026-03-06 | 43febe0 | Google Auth credentials fix + dotenv support |
| 2026-03-06 | 4195de1 | Authentication restored + favicon updated |
| 2026-03-06 | 7823b23 | Investor/Vendor/Developer profile types |
| 2026-03-06 | d63af11 | Phase 1-2 (Profile + Visual Features complete) |
| 2026-03-06 | 19de9db | Phase 3 (Connections & Messaging complete) |
| 2026-03-06 | 960dfd1 | IMPLEMENTATION.md updated |
| 2026-03-06 | 3dbbaf2 | Phase 4 progress (comprehensive schema) |
| 2026-03-06 | aee5c56 | PLAN.md added |
| 2026-03-06 | f04ccfc | PLAN.md updated with comprehensive context |

---

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

### For Next Session:

When you start a new session, please ask the user:

**"I see Phase 4 is in progress with these backend requirements. Should I begin working on the backend from the beginning and implement all these features, or would you like to focus on something specific first?"**

