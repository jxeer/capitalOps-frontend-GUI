# CapitalOps Architecture Documentation

**Last Updated:** 2026-03-16  
**Frontend Version:** React 18 + TypeScript + Vite  
**Backend Version:** Express.js 5 + Flask Proxy  
**API Layer:** Proxy-to-Flask with in-memory fallback

---

## Overview

CapitalOps is a capital + governance operating layer for real estate development. It provides three core modules:

1. **Capital Engine** - Investor alignment, deal distribution, allocation tracking
2. **Execution Control** - Project milestones, budget tracking, risk flags
3. **Asset & Vendor Control** - Vendor management, work orders, asset health

### Architecture Pattern

```
Frontend (React) → Express.js Proxy → Flask Backend (External) → PostgreSQL/SQLite
                    ↓
              In-Memory Storage (Fallback)
```

- **Primary Mode:** Proxy API requests to external Flask backend
- **Fallback Mode:** Use local in-memory storage with seed data
- **Database:** PostgreSQL (production) / SQLite (local dev) via Flask
- **Auth:** Session-based JWT in HTTP-only cookies

---

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (HMR dev server)
- **Routing:** Wouter (lightweight)
- **State Management:** TanStack Query (data fetching)
- **Styling:** Tailwind CSS + shadcn/ui("new-york" style)
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js 5
- **Authentication:** Passport.js (Local + Google OAuth)
- **Password Hashing:** Scrypt
- **Session Management:** JWT in HTTP-only cookies
- **Storage:** In-memory with realistic seed data
- **External Proxy:** Optional Flask backend at `BACKEND_URL`

---

## Directory Structure

```
capitalOps-frontend-GUI-main/
├── client/src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (new-york style)
│   │   ├── app-sidebar.tsx        # Navigation sidebar
│   │   ├── communication-center.tsx # Messaging UI
│   │   ├── connection-request-button.tsx
│   │   ├── connection-request-list.tsx
│   │   ├── deal-card.tsx          # Deal visualization
│   │   ├── media-gallery.tsx      # Image/video gallery
│   │   ├── page-header.tsx        # Page header component
│   │   ├── stat-card.tsx          # Statistic card
│   │   ├── theme-provider.tsx     # Theme context
│   │   └── ...                    # Other app-specific components
│   ├── pages/
│   │   ├── dashboard.tsx          # Executive overview
│   │   ├── assets.tsx             # Asset portfolio
│   │   ├── projects.tsx           # Project management
│   │   ├── deals.tsx              # Deal pipeline
│   │   ├── investors.tsx          # Investor profiles
│   │   ├── allocations.tsx        # Commitment tracking
│   │   ├── milestones.tsx         # Milestone timeline
│   │   ├── risk-flags.tsx         # Risk monitoring
│   │   ├── vendors.tsx            # Vendor management
│   │   ├── work-orders.tsx        # Work order tracking
│   │   ├── profile.tsx            # User profile management
│   │   ├── connections.tsx        # Connection & messaging
│   │   ├── auth-page.tsx          # Login/registration
│   │   └── investor-portal.tsx    # Investor-specific view
│   ├── hooks/
│   │   ├── use-auth.tsx           # Auth context & API
│   │   ├── use-mobile.tsx         # Mobile breakpoint
│   │   └── use-toast.ts           # Toast state management
│   ├── lib/
│   │   ├── utils.ts               # Utility functions (cn helper)
│   │   ├── formatters.ts          # Currency/date/number formatting
│   │   ├── queryClient.ts         # API request handling
│   │   └── s3.ts                  # AWS S3 upload helper
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # React entry point
├── server/
│   ├── index.ts                   # Express server entry
│   ├── routes.ts                  # API routes with proxy/fallback
│   ├── storage.ts                 # MemStorage with seed data
│   ├── auth.ts                    # Passport setup, password hashing
│   ├── vite.ts                    # Vite dev server integration
│   └── static.ts                  # Static file serving
├── shared/
│   └── schema.ts                  # Zod schemas & TypeScript types
├── client/                        # Vite client configuration
│   ├── index.html                 # HTML template
│   └── vite.config.ts             # Vite config
├── server/                        # Server Vite configuration
│   └── vite.config.ts             # Server bundling config
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── PLAN.md                        # Implementation plan & phases
├── ARCHITECTURE.md                # This file - architecture docs
├── README.md                      # Frontend user guide
└── .env                           # Environment variables (gitignored)

Backend (Flask) - Separate Repository:
├── /Users/julianxeer/dev/work/freelance/capitalops/backend/
│   ├── app/
│   │   ├── __init__.py            # Flask app factory
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── routes/compat.py       # API endpoints
│   │   └── ...
│   ├── .env                       # Flask config
│   └── requirements.txt           # Python dependencies
```

---

## Data Model

### Core Entities (10)

| Entity | Description |
|--------|-------------|
| **Portfolio** | Top-level container for assets |
| **Asset** | Real estate assets (belongs to Portfolio) |
| **Project** | Development projects (belongs to Asset) |
| **Deal** | Capital raising deals (belongs to Project) |
| **Investor** | Investor profiles with preferences |
| **Allocation** | Investor commitments to deals |
| **Milestone** | Project milestones |
| **Vendor** | Service providers |
| **WorkOrder** | Maintenance/compliance tasks |
| **RiskFlag** | Risk monitoring |

### Connection & Messaging Entities (3)

| Entity | Description |
|--------|-------------|
| **ConnectionRequest** | User connection requests (pending/accepted/declined) |
| **Conversation** | 1-on-1 chat sessions |
| **Message** | Individual messages in conversations |

### User Profile Schema

**General Fields (All Types):**
- `title`, `organization`, `linkedInUrl`, `bio`
- `profileImage`, `profileType` (investor/vendor/developer)
- `profileStatus` (active/inactive/pending/suspended)

**Investor-Specific Fields:**
- `geographicFocus`, `investmentStage`, `targetReturn`
- `checkSizeMin`, `checkSizeMax`, `riskTolerance`, `strategicInterest`

**Vendor-Specific Fields:**
- `serviceTypes`, `geographicServiceArea`, `yearsOfExperience`
- `certifications`, `averageProjectSize`

**Developer-Specific Fields:**
- `developmentFocus`, `developmentType`, `teamSize`, `portfolioValue`

---

## API Routes

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login with Passport local strategy |
| POST | `/api/logout` | Clear JWT cookie |
| GET | `/api/user` | Get current user profile (authenticated) |
| PUT | `/api/users/:id` | Update user profile (authenticated) |
| GET | `/api/auth/google` | Google OAuth redirect (if configured) |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/google/status` | Check if Google OAuth is enabled |

### Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

### Core Entities (all support GET/POST/PUT/DELETE)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/portfolios` | List all portfolios |
| GET | `/api/assets`, `GET /api/assets/:id` | Assets CRUD |
| GET | `/api/projects`, `GET /api/projects/:id` | Projects CRUD |
| GET | `/api/deals`, `GET /api/deals/:id` | Deals CRUD |
| GET | `/api/investors`, `GET /api/investors/:id` | Investors CRUD |
| GET | `/api/allocations`, `GET /api/allocations/:id` | Allocations CRUD |

### Execution & Operations

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/milestones`, `/api/milestones/project/:projectId` | Milestones CRUD |
| GET | `/api/vendors`, `GET /api/vendors/:id` | Vendors CRUD |
| GET | `/api/work-orders`, `/api/work-orders/vendor/:vendorId` | Work orders CRUD |
| GET | `/api/risk-flags`, `/api/risk-flags/project/:projectId` | Risk flags CRUD |

### Connection System (Social/Networking)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/connection-requests` | Get all connection requests for user |
| POST | `/api/connection-requests` | Send connection request |
| PUT | `/api/connection-requests/:id` | Accept/decline connection |
| DELETE | `/api/connection-requests/:id` | Delete connection request |
| GET | `/api/connections` | Get all connected users |
| GET | `/api/connection-pending` | Get pending connection requests |

### Messaging System

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/conversations` | Get user conversations |
| POST | `/api/conversations` | Create/get conversation with user |
| GET | `/api/messages` | Get messages in conversation |
| POST | `/api/messages` | Send message |
| PUT | `/api/messages/:id/read` | Mark message as read |
| DELETE | `/api/messages/:id` | Delete message (sender only) |

### Utilities

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/backend-status` | Check Flask backend connection status |

---

## Backend Proxy with Fallback

### Pattern

All `/api/*` routes follow this pattern:

1. **Try Backend First:** Attempt to proxy request to `BACKEND_URL`
2. **Success:** Return backend response
3. **Fallback:** Use in-memory storage with seed data

### Helper Functions (server/routes.ts)

**`proxyToBackend()`** - Low-level HTTP proxy
```typescript
async function proxyToBackend(
  path: string, 
  method: string, 
  body?: unknown
): Promise<{ ok: boolean; status: number; data: unknown }>
```

**`withBackendFallback()`** - For POST/PUT/DELETE mutations
```typescript
async function withBackendFallback(
  req: Request, 
  res: Response, 
  localHandler: () => Promise<unknown>
)
```

**`withMergedList()`** - For GET list requests
- Merges backend results with locally-created items
- Backend returns seed data, local storage has user-created items with UUIDs
- Combines both to show complete list to user

**`isSeedId()`** - Identify seed data
```typescript
function isSeedId(id: string): boolean {
  return /^(asset|proj|deal|inv|alloc|ms|vend|wo|rf|port)-\d+$/.test(id);
}
```

### Seed Data Pattern

Seed data follows IDs matching: `/^(asset|proj|deal|inv|alloc|ms|vend|wo|rf|port)-\d+$/`

Examples:
- `port-001` - Portfolio
- `asset-001` - Asset
- `proj-001` - Project
- `deal-001` - Deal
- `inv-001` - Investor
- `alloc-001` - Allocation

User-created items use UUIDs (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Configuration

```bash
# Backend connection
BACKEND_URL=http://localhost:3001        # Flask backend URL
COMPAT_API_KEY=your-api-key              # For backend auth

# Session management
SESSION_SECRET=change-me-in-production   # Express session secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:3000            # Callback URL base
```

---

## Frontend Data Fetching

### TanStack Query Pattern

**Query Configuration:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/entities"],
  queryFn: () => fetch("/api/entities", {
    credentials: "include"
  }).then(res => res.json()),
});
```

**Mutation Pattern:**
```typescript
const mutation = useMutation({
  mutationFn: (data) => apiRequest("/api/entities", "POST", data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/entities"] }),
});
```

### API Request Helper

```typescript
// lib/queryClient.ts
export async function apiRequest(
  path: string,
  method: string = "GET",
  body?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(path, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}
```

---

## Authentication

### Local Auth

```bash
# Default credentials (auto-created)
Username: admin
Password: admin123
```

### Google OAuth

```bash
# Required env vars
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Configure in Google Cloud Console:
# - Authorized redirect URI: http://localhost:3000/api/auth/google/callback
# - Authorized JavaScript origins: http://localhost:3000
```

### Session Management

- **Cookie:** `jwt` (HTTP-only, same-site)
- **Expiration:** 24 hours
- **Storage:** In-memory (resets on server restart)
- **JWT Payload:** `{ id, username, role }`

---

## Theme System

### Implementation

**Theme Provider:**
```typescript
// client/src/components/theme-provider.tsx
<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
  {children}
</ThemeContext.Provider>
```

**Theme State:**
- Default: `"dark"` (unless system preference detected)
- Options: `"light"`, `"dark"`, `"system"`
- Persistence: localStorage

**Theme Transition:**
- CSS variables updated on `<html>` element
- Smooth fade effect via Tailwind
- Theme toggle available in header (UserMenu component)

### Color Scheme

- **Primary:** Blue (`hsl(217 91% 35%)`)
- **Background:** Dark (`#0a0a0a`), Light (`#f8f8f8`)
- **Surface:** Dark (`#1a1a1a`), Light (`#ffffff`)
- **Text:** Dark (`#e5e5e5`), Light (`#1a1a1a`)

---

## AWS S3 Upload

### Frontend Setup

**Environment Variables:**
```bash
VITE_AWS_BUCKET_URL=http://localhost:3001
```

**Usage:**
```typescript
import { uploadToS3 } from "@/lib/s3";

const result = await uploadToS3(
  file, 
  `avatars/${userId}/${timestamp}-${filename}`
);

// Returns: { url, key }
```

### Backend Requirements

**Endpoint:** `POST /api/upload`

**Request:**
- Content-Type: multipart/form-data
- Fields: `file`, `path`, `contentType`, `fileName`

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/key",
  "key": "avatars/user123/filename.jpg"
}
```

**Fallback:** Local file storage if S3 not configured

---

## Build System

### Development

```bash
npm run dev
```

**Starts:**
- Express server on port 3000 (API routes)
- Vite dev server on port 3000 (React client with HMR)

**Hot Module Replacement:**
- Client-side changes: Instant HMR
- Server-side changes: Hot reload with esbuild

### Production Build

```bash
npm run build
```

**Creates:**
- `dist/public/` - Client bundle (static files)
- `dist/index.cjs` - Server bundle (Node.js)

**Client Bundling:**
- Vite optimizes assets
- Code splitting by route
- Tree-shaking enabled
- Source maps generated

**Server Bundling:**
- esbuild bundles all server code
- External deps whitelist for cold-start
- CJS output for Node.js compatibility

### Production Server

```bash
npm run start
```

**Configuration:**
```bash
PORT=3000                # Server port
NODE_ENV=production      # Production mode
BACKEND_URL=http://...   # Flask backend URL
```

---

## Deployment

### Environment Setup

```bash
# Required for production
BACKEND_URL=https://capital-ops.replit.app
COMPAT_API_KEY=secure-random-string
SESSION_SECRET=secure-random-string

# Optional for Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
APP_URL=https://yourdomain.com
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker (Optional)

```bash
docker build -t capitalops .
docker run -p 3000:3000 --env-file .env capitalops
```

---

##珊瑚8 Integration (Post-MVP)

**Status:** Not Started  
**Priority:** Medium (After Phase 4 completion)

### Planned Architecture

```
Coral8 API → API Gateway → CapitalOps Backend → Frontend
                              ↓
                        WebSocket/SSE Stream
```

### Future Backend Requirements

1. **Real-time Streaming**
   - WebSocket for live capital deployment data
   - Server-Sent Events (SSE) for cash flow updates

2. **Data Transformation**
   - Transform Coral8 models to CapitalOps entities
   - Handle schema differences

3. **Authentication**
   - API key management for Coral8 access
   - Token refresh strategy

4. **Caching**
   - Redis cache for Coral8 data
   - Offline/fallback mode support

### Current Status

Waiting for Coral8 API documentation and requirements specification.

---

## Testing

### Manual Testing

```bash
# Start backend
npm run dev

# Test API endpoints
curl http://localhost:3000/api/backend-status

# Login test
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c /tmp/cookies.txt
```

### Backend Testing

```bash
# Flask backend
cd /Users/julianxeer/dev/work/freelance/capitalops/backend
python -m flask run --host 0.0.0.0 --port 3001

# Backend test credentials
admin / admin123
```

---

## Security

### Current Implementation

- **Password Hashing:** Scrypt (Node.js crypto)
- **Session Cookies:** HTTP-only, same-site
- **JWT Signing:** Secret-based
- **API Key:** `COMPAT_API_KEY` for backend auth

### Recommendations for Production

1. **HTTPS Only** - Enforce HTTPS in production
2. **CORS Configuration** - Restrict origins
3. **Rate Limiting** - Add rate limiting to auth endpoints
4. **Input Validation** - All user inputs validated with Zod
5. **SQL Injection** - Use parameterized queries (Drizzle ORM)
6. **XSS Protection** - React's automatic escaping + Tailwind

---

## Troubleshooting

### Common Issues

**1. Backend Connection Failed**
```
Error: Backend unavailable, using local storage
```
**Solution:** Ensure Flask backend is running on `BACKEND_URL`

**2. Auth Errors**
```
401 Unauthorized
```
**Solution:** Check session cookie is being sent with requests

**3. Environment Variables Not Loading**
```
VITE_SOMETHING is undefined
```
**Solution:** Restart dev server after changing `.env` (Vite caches at start)

**4. Google OAuth Not Working**
```
Google sign-in is not configured
```
**Solution:** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars

---

## Contributing

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (default config)
- **Imports:** Path aliases (`@/`, `@shared/`)
- **Comments:** All public functions documented

### Commit conventions

```
feat: add new feature
fix: bug fix
docs: documentation
refactor: code refactoring
test: add tests
```

### Pull Request Process

1. Create feature branch from `main`
2. Run `npm run check` (TypeScript)
3. Run `npm run lint` (ESLint)
4. Update PLAN.md if feature completes a phase
5. Update ARCHITECTURE.md if architecture changes
6. Squash and merge to `main`

---

## License

Proprietary - CapitalOps Platform

---

**For additional information:**
- See `PLAN.md` for implementation phases and roadmap
- See `README.md` for user-facing documentation
- Check `shared/schema.ts` for up-to-date data models
- Review `server/storage.ts` for seed data details
