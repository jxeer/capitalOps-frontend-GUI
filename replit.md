# CapitalOps - Capital Infrastructure Platform

## Overview
CapitalOps is a capital + governance operating layer for real estate development, built on Coral8. It provides three core modules:
1. **Capital Engine** - Investor alignment, deal distribution, allocation tracking
2. **Execution Control** - Project milestones, budget tracking, risk flags
3. **Asset & Vendor Control** - Vendor management, work orders, asset health

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui components
- **Backend**: Express.js serving API endpoints with in-memory storage (seed data included)
- **Design**: Dark mode by default, Inter font, blue primary theme (217 91% 35%)
- **Future**: Backend is designed to be swapped to connect to external Coral8 backend

## Data Model (9 Core Entities)
- Portfolio, Asset, Project, Deal, Investor, Allocation, Milestone, Vendor, WorkOrder, RiskFlag

## File Structure
- `shared/schema.ts` - Zod schemas and TypeScript types for all entities
- `server/storage.ts` - In-memory storage with seed data
- `server/routes.ts` - All REST API endpoints
- `client/src/App.tsx` - Main app with sidebar layout and routing
- `client/src/components/` - Shared components (app-sidebar, stat-card, page-header, theme-provider)
- `client/src/pages/` - All page components (dashboard, assets, projects, deals, investors, allocations, milestones, risk-flags, vendors, work-orders)
- `client/src/lib/formatters.ts` - Currency, date, number formatting utilities

## Pages
- `/` - Dashboard (portfolio overview with KPIs)
- `/deals` - Deal pipeline and capital distribution
- `/investors` - Investor profiles and alignment
- `/allocations` - Commitment tracking
- `/projects` - Project execution tracking
- `/milestones` - Milestone timeline per project
- `/risk-flags` - Risk monitoring
- `/assets` - Portfolio assets
- `/vendors` - Vendor management
- `/work-orders` - Work order tracking

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000
