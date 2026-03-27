/**
 * CapitalOps Investor Portal Page
 * 
 * Purpose: Dedicated dashboard for investor users to view their investments, allocations,
 * returns, and discover new investment opportunities.
 * 
 * Approach:
 * - Tabbed interface separating My Portfolio, Available Deals, and Reports
 * - Shows only deals the investor has allocated to (in Portfolio tab)
 * - Shows all open/active deals in Available Deals tab for new investments
 * - Portfolio analytics with returns tracking
 * 
 * INVESTOR-SPECIFIC FEATURES:
 * - View allocated deals with capital commitment and funded amounts
 * - Track returns (total, YTD, IRR)
 * - Discover new investment opportunities
 * - View allocation history and status
 * 
 * NOTE:
 * - Currently uses mock data for returns/analytics (hardcoded mockInvestorData)
 * - In production, this would come from API endpoints
 * 
 * Related Backend Routes:
 * - GET /api/allocations - Investor's allocations
 * - GET /api/deals - Available deals
 * - GET /api/projects - Projects for context
 * - GET /api/risk-flags - Risk flags affecting allocations
 */

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2,
  Wallet,
  TrendingUp,
  FileText,
  Clock,
  ChevronRight,
  Download,
  AlertCircle,
  PieChart,
  Activity,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, getStatusColor, formatDate } from "@/lib/formatters";
import type { Deal, Project, Asset, Allocation, Investor, RiskFlag } from "@shared/schema";

/**
 * Mock investor data for returns/analytics display
 * 
 * TODO: In production, this data should come from backend API
 * Currently hardcoded for UI development/testing
 */
const mockInvestorData = {
  name: "John Smith",
  email: "john.smith@example.com",
  tier: "Tier 1",
  joinedDate: "2024-01-15",
  totalCommitted: 2500000,
  totalInvested: 1800000,
  activeAllocations: 3,
  returns: {
    total: 324000,
    ytd: 89000,
    irr: "18.2%",
  },
};

/**
 * Main InvestorPortal Page Component
 * 
 * Three main tabs:
 * 1. "portfolio" - My investments, allocations, and returns
 * 2. "deals" - Available investment opportunities
 * 3. "reports" - Performance reports and documents
 */
export default function InvestorPortal() {
  // Fetch data for portfolio and available deals
  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { data: allocations, isLoading: allocationsLoading } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { data: riskFlags } = useQuery<RiskFlag[]>({ queryKey: ["/api/risk-flags"] });
  
  // Currently selected deal for detail view
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Filter allocations to show only current investor's deals
  // TODO: In production, backend should filter by authenticated user
  const myDealIds = allocations?.map(a => a.dealId) || [];
  const myDeals = deals?.filter(d => myDealIds.includes(d.id)) || [];
  const myAllocations = allocations || [];

  // Available deals: Open/Active deals investor hasn't invested in yet
  const availableDeals = deals?.filter(d =>
    (d.status === "Open" || d.status === "Active") &&
    !myDealIds.includes(d.id)
  ) || [];

  const isLoading = dealsLoading || allocationsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const totalCommitted = myAllocations.reduce((sum, a) => sum + a.hardCommitAmount, 0);
  const totalSoftCommit = myAllocations.reduce((sum, a) => sum + a.softCommitAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {mockInvestorData.name}</h1>
          <p className="text-muted-foreground mt-1">
            Tier {mockInvestorData.tier} Investor • Member since {formatDate(mockInvestorData.joinedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Shield className="h-3 w-3 mr-1" />
            Accredited Investor
          </Badge>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Committed</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalCommitted)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(totalSoftCommit)} soft commit
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Investments</p>
                <p className="text-2xl font-bold mt-1">{myAllocations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {myDeals.length} deals
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio IRR</p>
                <p className="text-2xl font-bold mt-1 text-chart-2">{mockInvestorData.returns.irr}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Net annualized return
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Returns</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(mockInvestorData.returns.total)}</p>
                <p className="text-xs text-chart-2 mt-1">
                  +{formatCurrency(mockInvestorData.returns.ytd)} YTD
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="available">Available Deals</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <h2 className="text-lg font-semibold">My Investments</h2>

          {myDeals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No active investments</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You haven't made any allocations yet. Browse available deals to start investing.
                </p>
                <Button className="mt-2">
                  View Available Deals
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myDeals.map((deal) => {
                const project = projects?.find(p => p.id === deal.projectId);
                const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;
                const myAllocation = myAllocations.find(a => a.dealId === deal.id);
                const progress = deal.capitalRequired > 0
                  ? Math.round((deal.capitalRaised / deal.capitalRequired) * 100)
                  : 0;

                return (
                  <Card key={deal.id} className="group hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{(deal as any).projectName || asset?.name || "Investment Opportunity"}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {asset?.location} • {deal.phase}
                          </p>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(deal.status)}>
                          {deal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Deal Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Deal Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(deal.capitalRaised)} raised</span>
                          <span>{formatCurrency(deal.capitalRequired)} target</span>
                        </div>
                      </div>

                      {/* My Allocation */}
                      <div className="p-3 rounded-lg bg-accent/50 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Allocation</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">{formatCurrency(myAllocation?.hardCommitAmount || 0)}</p>
                            <p className="text-xs text-muted-foreground">
                              Soft: {formatCurrency(myAllocation?.softCommitAmount || 0)}
                            </p>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(myAllocation?.status || "")}>
                            {myAllocation?.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Deal Terms */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Return</p>
                          <p className="text-sm font-semibold">{deal.returnProfile}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-semibold">{deal.duration}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Risk</p>
                          <p className="text-sm font-semibold">{deal.riskLevel}</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" onClick={() => setSelectedDeal(deal)}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <h2 className="text-lg font-semibold">Available Investment Opportunities</h2>

          {availableDeals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <PieChart className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No deals available</h3>
                <p className="text-sm text-muted-foreground">
                  Check back later for new investment opportunities.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availableDeals.map((deal) => {
                const project = projects?.find(p => p.id === deal.projectId);
                const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;
                const progress = deal.capitalRequired > 0
                  ? Math.round((deal.capitalRaised / deal.capitalRequired) * 100)
                  : 0;

                return (
                  <Card key={deal.id} className="group hover:shadow-lg transition-all border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{(deal as any).projectName || asset?.name || "Investment Opportunity"}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {asset?.location} • {deal.phase}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Deal Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Deal Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(deal.capitalRaised)} raised</span>
                          <span>{formatCurrency(deal.capitalRequired)} target</span>
                        </div>
                      </div>

                      {/* Deal Terms */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Return</p>
                          <p className="text-sm font-semibold">{deal.returnProfile}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-semibold">{deal.duration}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground">Risk</p>
                          <p className="text-sm font-semibold">{deal.riskLevel}</p>
                        </div>
                      </div>

                      <Button className="w-full">
                        Request Allocation
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Investment Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Operating Agreement", "Subscription Agreement", "Investor Rights"].map((doc) => (
                  <div key={doc} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quarterly Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Q4 2024 Report", "Q3 2024 Report", "Q2 2024 Report"].map((report) => (
                  <div key={report} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{report}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Risk Notifications */}
      {riskFlags && riskFlags.filter(r => r.status === "Open" && r.severity === "High").length > 0 && (
        <Card className="border-chart-5/50 bg-chart-5/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-chart-5" />
              Portfolio Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {riskFlags.filter(r => r.status === "Open" && r.severity === "High").length} high-priority risk flags
              may affect your investments. Contact your relationship manager for details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
