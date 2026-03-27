# CapitalOps Implementation Plan

**Last Updated:** 2026-03-27  
**Status:** Production Deployed - MFA + Email Auth Complete 🎉

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
- Username/password login with mandatory MFA
- Email/password registration (with email field required)
- Forgot password with on-screen reset link
- 6-digit MFA codes (displayed on-screen, emailed when domain verified)
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
| 10 | AWS S3 File Upload Configuration | 2026-03-23 |
| 11 | Forgot Password + MFA | 2026-03-27 |

### Phase 12 - Forgot Password + MFA (2026-03-27) ✅
- Added `MfaCode` model for 6-digit verification codes with 5-minute expiry
- Modified login flow to require MFA after valid username/password
- Added `/api/v1/auth/login/verify-mfa` endpoint to verify codes
- Created MFA input screen in `auth-page.tsx` with 6-digit numeric input
- Debug mode shows MFA code on-screen (for testing without email)
- Resend email integration for sending codes (requires domain verification for production)
- Added email field to registration form (was missing - security issue)
- Backend sends MFA code via Resend when email fails, falls back to on-screen display
- PostgreSQL: Had to `DROP TYPE mfa_codes` to resolve conflict with SQLAlchemy table creation

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
| Add "Load Demo Data" button | MEDIUM | 1 hr |
| Verify domain for Resend (enables real email sending) | HIGH | 5 min (after client purchases domain) |

### Future Enhancements

| Item | Priority | Effort |
|------|----------|--------|
| Clerk migration (optional auth service) | LOW | 2-4 hrs |
| Data export endpoint (GDPR compliance) | MEDIUM | 2 hrs |
| Privacy policy / Terms of service | MEDIUM | 2 hrs |

---

## File Upload Status

**Resolved:** Files now upload to AWS S3 bucket (`capitalops-images`)

- Bucket: `capitalops-images.s3.us-east-1.amazonaws.com`
- Path format: `media/{user_id}/{uuid}.{ext}`
- Public read enabled via bucket policy
- Falls back to base64 data URL if S3 unavailable
- Railway env vars set: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `AWS_REGION`

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
| AWS S3 for uploads | ✅ Complete |
| MFA (6-digit codes) | ✅ Complete |
| Email sending (password reset, MFA) | ⚠️ Domain verification needed for production |

---

## Email Configuration

**Current State:** Email sending is configured but requires domain verification in Resend.

**How it works:**
- Password reset and MFA codes show on-screen in development/production (until domain verified)
- Resend API key is set in Railway environment variables
- Domain `capitalops.app` needs verification at https://resend.com/domains

**To enable real email sending:**
1. Client purchases a domain (e.g., `capitalops.com`)
2. Add domain to Resend dashboard and verify DNS records
3. Update `FRONTEND_ORIGIN` env var to use the verified domain

**MFA Codes:**
- 6-digit numeric codes
- Valid for 5 minutes
- Single-use (marked as used after successful verification)

---

## Railway PostgreSQL Backups

**To verify backup settings:**
1. Go to https://railway.app/dashboard
2. Select project → PostgreSQL database → Backups tab
3. Verify: Automatic backups enabled, retention period

**Railway Free Tier:** 1 backup/day, 3 day retention  
**Railway Pro Tier:** Configurable, longer retention

---

## Backend Repository

**GitHub:** `git@github.com:jxeer/capialOps-backend-API.git`
**Railway Project:** https://railway.app/dashboard
