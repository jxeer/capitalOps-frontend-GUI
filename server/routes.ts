import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/dashboard/stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/portfolios", async (_req, res) => {
    const portfolios = await storage.getPortfolios();
    res.json(portfolios);
  });

  app.get("/api/assets", async (_req, res) => {
    const assets = await storage.getAssets();
    res.json(assets);
  });

  app.get("/api/assets/:id", async (req, res) => {
    const asset = await storage.getAsset(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  });

  app.post("/api/assets", async (req, res) => {
    const asset = await storage.createAsset(req.body);
    res.status(201).json(asset);
  });

  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    const project = await storage.createProject(req.body);
    res.status(201).json(project);
  });

  app.get("/api/deals", async (_req, res) => {
    const deals = await storage.getDeals();
    res.json(deals);
  });

  app.get("/api/deals/:id", async (req, res) => {
    const deal = await storage.getDeal(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  app.post("/api/deals", async (req, res) => {
    const deal = await storage.createDeal(req.body);
    res.status(201).json(deal);
  });

  app.get("/api/investors", async (_req, res) => {
    const investors = await storage.getInvestors();
    res.json(investors);
  });

  app.get("/api/investors/:id", async (req, res) => {
    const investor = await storage.getInvestor(req.params.id);
    if (!investor) return res.status(404).json({ message: "Investor not found" });
    res.json(investor);
  });

  app.post("/api/investors", async (req, res) => {
    const investor = await storage.createInvestor(req.body);
    res.status(201).json(investor);
  });

  app.get("/api/allocations", async (_req, res) => {
    const allocations = await storage.getAllocations();
    res.json(allocations);
  });

  app.post("/api/allocations", async (req, res) => {
    const allocation = await storage.createAllocation(req.body);
    res.status(201).json(allocation);
  });

  app.get("/api/milestones", async (_req, res) => {
    const milestones = await storage.getMilestones();
    res.json(milestones);
  });

  app.get("/api/milestones/project/:projectId", async (req, res) => {
    const milestones = await storage.getMilestonesByProject(req.params.projectId);
    res.json(milestones);
  });

  app.post("/api/milestones", async (req, res) => {
    const milestone = await storage.createMilestone(req.body);
    res.status(201).json(milestone);
  });

  app.get("/api/vendors", async (_req, res) => {
    const vendors = await storage.getVendors();
    res.json(vendors);
  });

  app.get("/api/vendors/:id", async (req, res) => {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  });

  app.post("/api/vendors", async (req, res) => {
    const vendor = await storage.createVendor(req.body);
    res.status(201).json(vendor);
  });

  app.get("/api/work-orders", async (_req, res) => {
    const workOrders = await storage.getWorkOrders();
    res.json(workOrders);
  });

  app.get("/api/work-orders/vendor/:vendorId", async (req, res) => {
    const workOrders = await storage.getWorkOrdersByVendor(req.params.vendorId);
    res.json(workOrders);
  });

  app.post("/api/work-orders", async (req, res) => {
    const workOrder = await storage.createWorkOrder(req.body);
    res.status(201).json(workOrder);
  });

  app.get("/api/risk-flags", async (_req, res) => {
    const riskFlags = await storage.getRiskFlags();
    res.json(riskFlags);
  });

  app.get("/api/risk-flags/project/:projectId", async (req, res) => {
    const riskFlags = await storage.getRiskFlagsByProject(req.params.projectId);
    res.json(riskFlags);
  });

  return httpServer;
}
