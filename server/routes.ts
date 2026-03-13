import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { log } from "./index";
import { setupAuth, requireAuth, hashPassword, comparePasswords } from "./auth";
import passport from "passport";

const BACKEND_URL = process.env.BACKEND_URL || "";

async function proxyToBackend(path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; data: unknown }> {
  if (!BACKEND_URL) return { ok: false, status: 0, data: null };

  try {
    const url = `${BACKEND_URL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (process.env.COMPAT_API_KEY) {
      headers["X-API-Key"] = process.env.COMPAT_API_KEY;
    }
    const options: RequestInit = { method, headers };
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      return { ok: true, status: response.status, data };
    }
    return { ok: false, status: response.status, data: null };
  } catch (err) {
    log(`Backend proxy error for ${path}: ${err}`, "proxy");
    return { ok: false, status: 0, data: null };
  }
}

async function withBackendFallback(
  req: Request,
  res: Response,
  localHandler: () => Promise<unknown>
) {
  const backendPath = req.originalUrl;
  const result = await proxyToBackend(backendPath, req.method, req.body);

  if (result.ok) {
    log(`Proxied ${req.method} ${backendPath} -> backend (${result.status})`, "proxy");
    return res.status(result.status).json(result.data);
  }

  log(`Backend unavailable for ${backendPath}, using local storage`, "proxy");
  await localHandler();
}

function isSeedId(id: string): boolean {
  return /^(asset|proj|deal|inv|alloc|ms|vend|wo|rf|port)-\d+$/.test(id);
}

async function withMergedList<T extends { id: string }>(
  req: Request,
  res: Response,
  getLocal: () => Promise<T[]>
) {
  const backendPath = req.originalUrl;
  const result = await proxyToBackend(backendPath, "GET");

  if (result.ok && Array.isArray(result.data)) {
    log(`Proxied GET ${backendPath} -> backend (${result.status})`, "proxy");
    const localItems = await getLocal();
    const backendIds = new Set((result.data as T[]).map(item => item.id));
    // Include seed items not covered by backend + any user-created local items
    const localNotInBackend = localItems.filter(item => !backendIds.has(item.id));
    const merged = [...(result.data as T[]), ...localNotInBackend];
    return res.json(merged);
  }

  log(`Backend unavailable for ${backendPath}, using local storage`, "proxy");
  const localItems = await getLocal();
  res.json(localItems);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Seed a default admin user if none exists
  (async () => {
    const existing = await storage.getUserByUsername("admin");
    if (!existing) {
      const hashed = await hashPassword("admin123");
      await storage.createUser({ username: "admin", password: hashed, role: "admin" });
      log("Default admin user created (admin/admin123)");
    }
  })();

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashed = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashed, role: "viewer" });

      req.login({ id: user.id, username: user.username, role: user.role }, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, username: user.username, role: user.role });
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ id: user.id, username: user.username, role: user.role });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user!;
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  app.get("/api/auth/google", (req, res, next) => {
    if (!googleEnabled) {
      return res.status(503).json({ message: "Google sign-in is not configured" });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    if (!googleEnabled) {
      return res.redirect("/auth?error=google_failed");
    }
    passport.authenticate("google", { failureRedirect: "/auth?error=google_failed" })(req, res, () => {
      res.redirect("/");
    });
  });

  app.get("/api/auth/google/status", (_req, res) => {
    res.json({ enabled: googleEnabled });
  });

  app.get("/api/backend-status", async (_req, res) => {
    if (!BACKEND_URL) {
      return res.json({ connected: false, url: null, mode: "local" });
    }
    try {
      const response = await fetch(BACKEND_URL);
      const data = await response.json();
      res.json({ connected: response.ok, url: BACKEND_URL, mode: "proxy", backendInfo: data });
    } catch {
      res.json({ connected: false, url: BACKEND_URL, mode: "local-fallback" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    });
  });

  app.get("/api/portfolios", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const portfolios = await storage.getPortfolios();
      res.json(portfolios);
    });
  });

  // Assets
  app.get("/api/assets", async (req, res) => {
    await withMergedList(req, res, () => storage.getAssets());
  });

  app.get("/api/assets/:id", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const asset = await storage.getAsset(req.params["id"] as string);
      if (!asset) return res.status(404).json({ message: "Asset not found" });
      res.json(asset);
    });
  });

  app.post("/api/assets", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const asset = await storage.createAsset(req.body);
      res.status(201).json(asset);
    });
  });

  app.put("/api/assets/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const asset = await storage.updateAsset(req.params["id"] as string, req.body);
      if (!asset) return res.status(404).json({ message: "Asset not found" });
      res.json(asset);
    });
  });

  app.delete("/api/assets/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteAsset(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Asset not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    await withMergedList(req, res, () => storage.getProjects());
  });

  app.get("/api/projects/:id", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const project = await storage.getProject(req.params["id"] as string);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    });
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    });
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const project = await storage.updateProject(req.params["id"] as string, req.body);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    });
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteProject(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Project not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    await withMergedList(req, res, () => storage.getDeals());
  });

  app.get("/api/deals/:id", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deal = await storage.getDeal(req.params["id"] as string);
      if (!deal) return res.status(404).json({ message: "Deal not found" });
      res.json(deal);
    });
  });

  app.post("/api/deals", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deal = await storage.createDeal(req.body);
      res.status(201).json(deal);
    });
  });

  app.put("/api/deals/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deal = await storage.updateDeal(req.params["id"] as string, req.body);
      if (!deal) return res.status(404).json({ message: "Deal not found" });
      res.json(deal);
    });
  });

  app.delete("/api/deals/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteDeal(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Deal not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Investors
  app.get("/api/investors", async (req, res) => {
    await withMergedList(req, res, () => storage.getInvestors());
  });

  app.get("/api/investors/:id", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const investor = await storage.getInvestor(req.params["id"] as string);
      if (!investor) return res.status(404).json({ message: "Investor not found" });
      res.json(investor);
    });
  });

  app.post("/api/investors", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const investor = await storage.createInvestor(req.body);
      res.status(201).json(investor);
    });
  });

  app.put("/api/investors/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const investor = await storage.updateInvestor(req.params["id"] as string, req.body);
      if (!investor) return res.status(404).json({ message: "Investor not found" });
      res.json(investor);
    });
  });

  app.delete("/api/investors/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteInvestor(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Investor not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Allocations
  app.get("/api/allocations", async (req, res) => {
    await withMergedList(req, res, () => storage.getAllocations());
  });

  app.post("/api/allocations", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const allocation = await storage.createAllocation(req.body);
      res.status(201).json(allocation);
    });
  });

  app.put("/api/allocations/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const allocation = await storage.updateAllocation(req.params["id"] as string, req.body);
      if (!allocation) return res.status(404).json({ message: "Allocation not found" });
      res.json(allocation);
    });
  });

  app.delete("/api/allocations/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteAllocation(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Allocation not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Milestones
  app.get("/api/milestones", async (req, res) => {
    await withMergedList(req, res, () => storage.getMilestones());
  });

  app.get("/api/milestones/project/:projectId", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const milestones = await storage.getMilestonesByProject(req.params.projectId);
      res.json(milestones);
    });
  });

  app.post("/api/milestones", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const milestone = await storage.createMilestone(req.body);
      res.status(201).json(milestone);
    });
  });

  app.put("/api/milestones/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const milestone = await storage.updateMilestone(req.params["id"] as string, req.body);
      if (!milestone) return res.status(404).json({ message: "Milestone not found" });
      res.json(milestone);
    });
  });

  app.delete("/api/milestones/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteMilestone(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Milestone not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Vendors
  app.get("/api/vendors", async (req, res) => {
    await withMergedList(req, res, () => storage.getVendors());
  });

  app.get("/api/vendors/:id", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const vendor = await storage.getVendor(req.params["id"] as string);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      res.json(vendor);
    });
  });

  app.post("/api/vendors", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const vendor = await storage.createVendor(req.body);
      res.status(201).json(vendor);
    });
  });

  app.put("/api/vendors/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const vendor = await storage.updateVendor(req.params["id"] as string, req.body);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      res.json(vendor);
    });
  });

  app.delete("/api/vendors/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteVendor(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Vendor not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Work Orders
  app.get("/api/work-orders", async (req, res) => {
    await withMergedList(req, res, () => storage.getWorkOrders());
  });

  app.get("/api/work-orders/vendor/:vendorId", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const workOrders = await storage.getWorkOrdersByVendor(req.params.vendorId);
      res.json(workOrders);
    });
  });

  app.post("/api/work-orders", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const workOrder = await storage.createWorkOrder(req.body);
      res.status(201).json(workOrder);
    });
  });

  app.put("/api/work-orders/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const workOrder = await storage.updateWorkOrder(req.params["id"] as string, req.body);
      if (!workOrder) return res.status(404).json({ message: "Work order not found" });
      res.json(workOrder);
    });
  });

  app.delete("/api/work-orders/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteWorkOrder(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Work order not found" });
      res.json({ message: "Deleted" });
    });
  });

  // Risk Flags
  app.get("/api/risk-flags", async (req, res) => {
    await withMergedList(req, res, () => storage.getRiskFlags());
  });

  app.get("/api/risk-flags/project/:projectId", async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const riskFlags = await storage.getRiskFlagsByProject(req.params.projectId);
      res.json(riskFlags);
    });
  });

  app.post("/api/risk-flags", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const flag = await storage.createRiskFlag({ ...req.body, createdAt: req.body.createdAt || new Date().toISOString() });
      res.status(201).json(flag);
    });
  });

  app.put("/api/risk-flags/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const flag = await storage.updateRiskFlag(req.params["id"] as string, req.body);
      if (!flag) return res.status(404).json({ message: "Risk flag not found" });
      res.json(flag);
    });
  });

  app.delete("/api/risk-flags/:id", requireAuth, async (req, res) => {
    await withBackendFallback(req, res, async () => {
      const deleted = await storage.deleteRiskFlag(req.params["id"] as string);
      if (!deleted) return res.status(404).json({ message: "Risk flag not found" });
      res.json({ message: "Deleted" });
    });
  });

  return httpServer;
}
