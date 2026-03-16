# CapitalOps Implementation Plan

**Last Updated:** 2026-03-16  
**Current Phase:** Phase 4 - Profile Enhancement & UI Polish  
**Status:** Phase 1-3 Complete ✅

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
