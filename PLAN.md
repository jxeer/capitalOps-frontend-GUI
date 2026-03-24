# CapitalOps Implementation Plan

**Last Updated:** 2026-03-23  
**Status:** Production Deployed - OAuth & Data Isolation Working 🎉

---

## Project Overview

**CapitalOps** is a capital + governance operating layer for real estate development. It streamlines capital raising, project governance, and stakeholder communication for commercial real estate development.

**Target Users:** Real estate investors, vendors, developers, portfolio managers

**Tech Stack:** React 18, TypeScript, Vite, TanStack Query, Wouter routing, Tailwind CSS, shadcn/ui | Flask, PostgreSQL, SQLAlchemy ORM

---

## Infrastructure Deployed

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| Backend API | Railway | `https://capialops-backend-api-production.up.railway.app` | ✅ Running |
| PostgreSQL Database | Railway | Railway Managed | ✅ Connected |
| Frontend GUI | Vercel | `https://capitalops-frontend-gui.vercel.app` | ✅ Deployed |

---

## What's Working

### Authentication ✅
- Google OAuth sign-in (using Google Identity Services)
- Username/password login
- JWT session management
- User data isolation (users only see their own data)

### Core Features ✅
- Dashboard with portfolio overview
- Assets, Projects, Deals management
- Investor management with allocations
- Milestones, Risk Flags, Vendors, Work Orders
- Profile management with image upload
- Connections and messaging between users
- Image lightbox and media galleries

### Data Privacy ✅
- User-scoped data isolation implemented
- Authenticated users only see their own portfolios/assets/projects/deals
- Graceful fallback shows global demo data for unauthenticated users

---

## Demo Data

**Admin credentials:**
- Username: `admin`
- Password: `admin123`

**To populate demo data for a user:**
```bash
curl -X POST https://capialops-backend-api-production.up.railway.app/api/full-seed \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## Completion History

CapitalOps has been developed over several phases, all now complete:

| Phase | Feature | Date |
|-------|---------|------|
| 1 | Profile Management (investor/vendor/developer types) | 2026-03-16 |
| 2 | Visual Features (S3 uploads, Maps, Media Gallery) | 2026-03-16 |
| 3 | Connections & Messaging (1-on-1 conversations) | 2026-03-16 |
| 4 | Profile Enhancement (image upload, UI polish) | 2026-03-17 |
| 5 | Vendor Ranking (performance tracking) | 2026-03-17 |
| 6 | UI/UX Polish (glassmorphism, animations, branding) | 2026-03-17 |
| 7 | Dashboard & Analytics (KPIs, charts) | 2026-03-17 |
| 8 | Railway/Vercel Production Deployment | 2026-03-20 |
| 9 | Google OAuth & Data Isolation Fixes | 2026-03-23 |

### Phase 1 - Profile Management (2026-03-16)
- Extended User schema with profileType (investor/vendor/developer) and profileStatus
- Updated OAuth flow to auto-create profiles on Google sign-up
- Added profile menu in header with user avatar
- Created Profile page at /profile with edit capability

### Phase 2 - Visual Features (2026-03-16)
- AWS S3 integration for photo/video uploads
- MediaGallery component with upload/remove functionality
- Google Maps integration for asset location tracking
- Assets page updated with media & location
- Projects page updated with media & location

### Phase 3 - Connections & Messaging (2026-03-16)
- Connection request system (send, accept, decline requests)
- Messaging system (1-on-1 conversations)
- Connections page with tabbed interface
- Professional "Connections" terminology

### Phase 4 - Profile Enhancement (2026-03-17)
- Profile image upload using S3 integration
- Comprehensive user profile schema with 20+ fields
- User discovery search (global & filtered)
- UI polish for profile images and avatars

### Phase 5 - Vendor Ranking (2026-03-17)
- Vendor performance tracking and scoring
- Rating system for vendors

### Phase 6 - UI/UX Polish (2026-03-17)
- Branding splash page with hero, stats, features sections
- Glassmorphism effect on dashboard cards
- Interactive animations (pulse, ping, fade-in)
- Wealth color palette (dark blue, emerald, amber)
- Responsive design for demo (1024px iPad, mobile)

### Phase 7 - Dashboard & Analytics (2026-03-17)
- Dashboard page with key metrics and KPIs
- Assets overview with portfolio monitoring
- Projects tracking with milestone management
- Investor portal for allocations

### Phase 8 - Railway/Vercel Deployment (2026-03-20)
- Backend on Railway with PostgreSQL
- Frontend on Vercel
- JWT authentication working
- Media upload/save/view working
- Image lightbox component

### Phase 9 - Google OAuth & Data Isolation (2026-03-23)
- Fixed Google OAuth redirect_uri issues
- Switched to Google Identity Services (browser-side JWT)
- Implemented user-scoped data isolation
- Users only see their own portfolios/assets/projects/deals
- Graceful fallback for unauthenticated users

### Key Accomplishments

**Auth & Security:**
- JWT + Google OAuth authentication ✅
- User data isolation (users only see own data) ✅
- SQL injection protection ✅
- API key auth ✅

**Core Features:**
- Portfolio/Asset/Project/Deal management ✅
- Investor allocations ✅
- Milestones, Risk Flags, Vendors, Work Orders ✅
- Profile management with image upload ✅
- Connections and messaging ✅
- Image lightbox and media galleries ✅

**Deployment:**
- Backend on Railway (PostgreSQL) ✅
- Frontend on Vercel ✅
- Google OAuth working ✅
- User-scoped data isolation ✅

---

## What's Next

### Immediate (This Week)

| Item | Priority | Effort |
|------|----------|--------|
| Verify Railway PostgreSQL backups | HIGH | 5 min |
| Configure AWS S3 for file uploads | HIGH | 2-4 hrs |
| Add "Load Demo Data" button | MEDIUM | 1 hr |
| Forgot Password feature | MEDIUM | 2-4 hrs (needs email service) |

### Future Enhancements

| Item | Priority | Effort |
|------|----------|--------|
| Multi-Factor Authentication (MFA) | HIGH | 1-2 days |
| Clerk migration (optional auth service) | LOW | 2-4 hrs |
| Data export endpoint (GDPR compliance) | MEDIUM | 2 hrs |
| Privacy policy / Terms of service | MEDIUM | 2 hrs |

---

## File Upload Issue (CRITICAL)

**Current:** Files upload to Railway disk (`backend/app/uploads/`)

**Problem:** Railway containers are ephemeral - files are LOST on redeploy!

**Fix:** Use AWS S3 bucket
1. Create S3 bucket (capitalops-uploads-prod)
2. Add to Railway: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
3. Update `backend/app/routes/uploads.py` to use S3

---

## Security Checklist

| Item | Status |
|------|--------|
| User authentication | ✅ Complete |
| User data isolation | ✅ Complete |
| HTTPS/TLS | ✅ Complete (Railway + Vercel) |
| SQL injection protection | ✅ Complete (SQLAlchemy ORM) |
| API key auth | ✅ Complete |
| PostgreSQL database | ✅ Complete |
| Railway PostgreSQL backups | ⚠️ Verify in Railway dashboard |
| AWS S3 for uploads | ⚠️ Not configured |

---

## Railway PostgreSQL Backups

**To verify backup settings:**
1. Go to https://railway.app/dashboard
2. Select project → PostgreSQL database → Backups tab
3. Verify: Automatic backups enabled, retention period

**Railway Free Tier:** 1 backup/day, 3 day retention  
**Railway Pro Tier:** Configurable, longer retention
