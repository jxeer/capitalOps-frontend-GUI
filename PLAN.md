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
