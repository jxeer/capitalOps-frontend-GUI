# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CapitalOps is a capital + governance operating layer for real estate development. It's a React + TypeScript frontend with an Express.js backend that proxies requests to an external Flask backend (https://capital-ops.replit.app), falling back to in-memory storage when unavailable.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Wouter routing, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5, Passport (local + Google OAuth), in-memory storage with realistic seed data
- **Database**: Drizzle ORM (not actively used with in-memory storage)
- **Auth**: Session-based with scrypt password hashing

## Development Commands

```bash
# Start development server (port 3000 for server, Vite dev server for client)
npm run dev

# Build for production (bundles client + server to dist/)
npm run build

# Start production server (requires build first)
npm run start

# TypeScript type checking
npm run check
```

## Architecture

### Directory Structure

```
client/src/
  components/ui/      # shadcn/ui components
  components/         # App-specific components (app-sidebar, stat-card, etc.)
  pages/              # Route components (dashboard.tsx, deals.tsx, etc.)
  hooks/              # Custom hooks (use-auth.tsx, use-toast.ts)
  lib/                # Utilities (queryClient.ts, formatters.ts, utils.ts)
server/
  index.ts            # Express server entry, request logging
  routes.ts           # API routes with proxy/fallback logic
  storage.ts          # MemStorage implementation with seed data
  auth.ts             # Passport setup, password hashing
  vite.ts             # Vite dev server integration
shared/
  schema.ts           # Zod schemas and TypeScript types for all entities
```

### Key Patterns

**Backend Proxy with Fallback:** All `/api/*` routes first try to proxy to `BACKEND_URL`. If that fails (non-200 or connection error), they fall back to in-memory storage.

- `withBackendFallback()` - For POST/PUT/DELETE mutations (tries backend, falls back to local)
- `withMergedList()` - For GET list requests (merges backend data + locally-created items)

**Seed ID Pattern:** Items with IDs matching `/^(asset|proj|deal|inv|alloc|ms|vend|wo|rf|port)-\d+$/` are considered seed data. Locally-created items (UUIDs) are merged on top of backend results via `withMergedList`.

**Data Fetching:** Uses TanStack Query with a custom query client. All queries use `credentials: "include"` for session cookies. Mutations use the `apiRequest()` helper and invalidate queries on success.

**Page Structure:** Each page follows this pattern:
- Queries with `useQuery<Entity[]>({ queryKey: ["/api/entities"] })`
- Mutations with `useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries(...) })`
- Edit dialog with `editing` state, `emptyForm` object, `openCreate()`, `openEdit(item)`, `closeDialog()`
- Same dialog for create/edit; PUT vs POST based on `editing !== null`

**Express 5 Note:** `req.params` is `Record<string, string | string[]>`, must cast with `req.params["id"] as string`.

## Environment Variables

```bash
# Required for backend connection (set in .env)
BACKEND_URL=http://localhost:3001        # Flask backend URL
COMPAT_API_KEY=change-me-in-production  # API key for mutation auth
SESSION_SECRET=change-me-in-production  # Express session secret

# Optional for Google OAuth (leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Data Model

10 core entities in `shared/schema.ts`:
- **Portfolio** - Top-level container
- **Asset** - Real estate assets (belongs to Portfolio)
- **Project** - Development projects (belongs to Asset)
- **Deal** - Capital raising deals (belongs to Project)
- **Investor** - Investor profiles with preferences
- **Allocation** - Investor commitments to deals
- **Milestone** - Project milestones
- **Vendor** - Service providers
- **WorkOrder** - Maintenance/compliance tasks
- **RiskFlag** - Risk monitoring

## API Routes

All routes in `server/routes.ts` follow the pattern:
- `GET /api/entities` - List all (uses `withMergedList`)
- `GET /api/entities/:id` - Get one (uses `withBackendFallback`)
- `POST /api/entities` - Create (auth required)
- `PUT /api/entities/:id` - Update (auth required)
- `DELETE /api/entities/:id` - Delete (auth required)

Auth routes: `/api/login`, `/api/logout`, `/api/register`, `/api/user`, `/api/auth/google/*`

Status route: `/api/backend-status` - Returns connection state to Flask backend

## shadcn/ui Components

Configured in `components.json` with "new-york" style. Path aliases:
- `@/components/ui` - UI components
- `@/lib/utils` - Utility functions (cn helper)
- `@shared/*` - Shared schema/types

## Build System

- Development: Vite serves client with HMR, Express handles API routes
- Production: `npm run build` creates `dist/public/` (client) and `dist/index.cjs` (server)
- Server bundle uses esbuild with external deps whitelist for cold-start optimization
