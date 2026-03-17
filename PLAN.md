# CapitalOps Implementation Plan

**Last Updated:** 2026-03-17  
**Current Phase:** Phase 8 - UI/UX Polish & Investor Demo  
**Status:** Phase 8 Implementation In Progress 🔄

---

## Recent Progress

### Phase 4 Completion - Profile & Connections ✅

**Date Completed:** 2026-03-17  
**Status:** Phase 4 is COMPLETE. All profile features and connections system fully functional.

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

### Phase 7 - Splash Page Creation ✅

**Date Completed:** 2026-03-17  
**Status:** Branding splash page created for investor demo preparation

**What Was Done:**
- Created client/src/pages/splash.tsx with hero section
- Stats banner with portfolio metrics
- 6 feature cards showcasing platform capabilities
- Professional CTA section with gradient styling
- Fully responsive design (mobile to desktop)
- Dark/light theme ready styling

**File Created:**
- client/src/pages/splash.tsx - Splash page component

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

### Phase 4 - Profile Enhancement & UI Polish ✅ COMPLETE

**Status:** Complete  
**Date Completed:** March 17, 2026

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
- Profile image persisted to disk (local dev)
- Profile image stored in database
- Flask serves static files from `/uploads/` endpoint
- User discovery search (global & filtered)
- UI polish for profile images and avatars

**Backend Changes:**
- `app/models.py` - Added `profile_image` column to User model, included in `to_dict()`
- `app/routes/compat.py` - Updated `/upload` endpoint to save files to disk when AWS not configured
- `app/routes/compat.py` - Added `PUT /api/user` endpoint to update user profile (including profileImage)
- `app/__init__.py` - Added `/uploads/<filename>` route to serve uploaded files statically

**Frontend Changes:**
- `client/src/pages/profile.tsx` - Upload logic, avatar preview
- `client/src/pages/connections.tsx` - User search and discovery
- `client/src/App.tsx` - UserMenu with profile images
- `client/src/lib/s3.ts` - Upload fallback to Flask backend
- `server/routes.ts` - Added `/api/users` search endpoint
- `server/storage.ts` - Added `getUsers()` method

---

### Phase 7 - Splash Page Creation ✅

**Date Completed:** 2026-03-17  
**Status:** Complete  
**Description:** Branding splash page created at client/src/pages/splash.tsx

**Features:**
- Hero section with impactful visual design
- Stats banner displaying portfolio metrics
- 6 feature cards showcasing platform capabilities
- Professional CTA section with gradient styling
- Fully responsive design (mobile to desktop)
- Dark/light theme ready styling

**Files Created:**
- client/src/pages/splash.tsx - Splash page component with professional branding layout

---

### Phase 8 - UI/UX Polish & Investor Demo 🔄 IN PROGRESS

**Status:** In Progress  
**Priority:** High (MVP Launch Preparation)

**Implementation Plan:**

**1. Glassmorphism Cards** 
- Add `backdrop-filter: blur(10px)` to dashboard cards
- Create `glass-card` utility component
- Apply to stat cards, chart containers, list items

**2. Dashboard Visual Enhancements**
- Add pulse animation to hero stats
- Enhance gradient orbs with subtle movement
- Add live indicators with blink animation

**3. Responsive Refinement**
- Test on 1024px (iPad) for demo
- Stack charts vertically on smaller screens
- Ensure 44px+ touch targets

**4. Micro-Interactions**
- Smooth sidebar menu transitions (200ms)
- Scale animations on stat card hover
- Enhanced skeleton loaders

**5. Typography**
- Add serif headings for investor-facing content
- Better hierarchy (H1=3xl, H2=2xl, H3=xl)

**6. Accessibility & Contrast**
- Ensure WCAG AA minimum contrast
- Add focus states for keyboard nav
- Screen reader labels

**7. Loading & Empty States**
- Polished skeleton loaders for data fetching
- Helpful empty state messages
- Progress indicators

**Status:** Pending implementation

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

### Phase 6 - UI/UX Polish & Investor Demo Prep 🔄 IN PROGRESS

**Status:** In Progress  
**Priority:** High (MVP Launch Preparation)

**What's Next:**
- UI polishing for investor demo
- Ensuring all pages look professional
- Responsive design review
- Component consistency check
- Testing on different screen sizes

**MVP Scope:**
The current implementation includes all core MVP functionality needed for investor pitch:
- Multi-tiered profile management (investor/vendor/developer)
- Dashboard with high-level monitoring
- Visual project management (photos, maps)
- Vendor management with performance scores
- Connection system with messaging

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
- Profile image persistence to disk/database
- AWS S3 integration for uploads
- Media galleries (assets, projects)
- Google Maps integration (assets, projects)
- Connection system (send, accept, decline)
- User discovery search (global & filtered)
- Messaging system (1-on-1 conversations)
- Comprehensive user profile schema (20 fields)

### Next Steps:
1. ✅ Branding splash page ✅ (COMPLETE)
2. Glassmorphism effect on dashboard cards
3. Dashboard visual enhancements (animations, gradients)
4. Responsive design refinement (iPad, mobile)
5. Micro-interactions on navigation
6. Typography and accessibility
7. Build and deploy to staging
8. Client review and feedback

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

## Project Dates
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |
| 2026-03-17 | today | Phase 4 complete (profile image persistence, user search, connections system) |
| 2026-03-17 | today | Phase 7 splash page created for investor demo |

---

## Implementation Phases Detail

### Phase 7 - Splash Page Creation ✅
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-17 | today | Phase 7 splash page created for investor demo |

---

### Phase 1 - Profile Management ✅ COMPLETE
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-16 | today | Phase 4 implementation (profile enhancements, connection system, S3 upload setup) |

| 2026-03-16 | today | Phase 4 profile image upload FIXED - CORS and multipart proxy to Flask backend |

---

| 2026-03-17 | today | Phase 4 UI polish and user discovery search |

---

| 2026-03-17 | today | Phase 7 splash page created for investor demo |

---

---