/**
 * CapitalOps Dashboard Page
 * 
 * Purpose: Primary landing page providing executive overview of the entire capital operations
 * portfolio with statistics, charts, real-time data, and quick access to key metrics.
 * 
 * Approach:
 * - Uses chart.js/Recharts for interactive data visualization
 * - Fetches data from multiple endpoints simultaneously with TanStack Query
 * - Real-time backend connection status indicator
 * - Stat cards with trend indicators
 * - Dynamic chart color theming based on user's dark/light mode preference
 * 
 * Key Features:
 * - Portfolio summary with assets under management
 * - Capital pipeline chart showing raised vs required
 * - Deal pipeline funnel visualization
 * - Project budget burn tracking
 * - Risk alerts section
 * - Recent allocations and active deals lists
 * - Backend connection status indicator (online/local mode)
 */

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  FolderKanban,
  DollarSign,
  Users,
  AlertTriangle,
  ClipboardList,
  Handshake,
  TrendingUp,
  ArrowRight,
  Wifi,
  WifiOff,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, getStatusColor, formatDate } from "@/lib/formatters";
import { Link } from "wouter";
import type { Deal, Project, RiskFlag, Allocation, Investor } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Chart colors for dark theme
const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  quaternary: "#8b5cf6",
  accent: "#ec4899",
  grid: "rgba(255,255,255,0.1)",
  text: "rgba(255,255,255,0.6)",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

/**
 * Detects current theme (dark/light) and returns appropriate chart colors
 * Reads computed background color from CSS to determine theme preference
 * 
 * @returns Object with chart colors adapted to current theme
 */
const getChartColors = () => {
  const rootStyles = getComputedStyle(document.documentElement);
  const bgHsl = rootStyles.getPropertyValue("--background").trim();
  const isDark = bgHsl.includes("0% 7%)");
  
  if (isDark) {
    return {
      primary: "#60a5fa",
      secondary: "#34d399",
      tertiary: "#fbbf24",
      quaternary: "#a78bfa",
      accent: "#f472b6",
      grid: "rgba(255,255,255,0.15)",
      text: "rgba(255,255,255,0.7)",
    };
  }
  
  return {
    primary: "#3b82f6",
    secondary: "#10b981",
    tertiary: "#f59e0b",
    quaternary: "#8b5cf6",
    accent: "#ec4899",
    grid: "rgba(0,0,0,0.1)",
    text: "rgba(0,0,0,0.4)",
  };
};

/**
 * Main Dashboard page component
 * Aggregates data from multiple APIs and displays comprehensive portfolio overview
 */
export default function Dashboard() {
  const { data: backendStatus } = useQuery<{
    connected: boolean;
    url: string | null;
    mode: string;
  }>({ queryKey: ["/api/backend-status"] });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalAssets: number;
    activeProjects: number;
    totalCapitalRequired: number;
    totalCapitalRaised: number;
    activeDeals: number;
    totalInvestors: number;
    openWorkOrders: number;
    riskFlags: number;
  }>({ queryKey: ["/api/dashboard/stats"] });

  const { data: deals } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: riskFlags } = useQuery<RiskFlag[]>({ queryKey: ["/api/risk-flags"] });
  const { data: allocations } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { data: investors } = useQuery<Investor[]>({ queryKey: ["/api/investors"] });
  const CHART_COLORS = getChartColors();

  /**
   * Shows skeleton loader while initial data is loading
   */
  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Calculates overall capital progress percentage
   */
  const capitalProgress = stats && stats.totalCapitalRequired > 0
    ? Math.round((stats.totalCapitalRaised / stats.totalCapitalRequired) * 100)
    : 0;

  /**
   * Looks up investor name by ID
   * @param id - Investor ID to look up
   * @returns Investor name or "Unknown" if not found
   */
  const getInvestorName = (id: string) => investors?.find(i => i.id === id)?.name || "Unknown";

  /**
   * Generates capital raised over time data for area chart
   * Maps deals to chart data points showing required vs raised
   */
  const capitalOverTimeData = deals?.map((deal, index) => ({
    name: deal.phase || `Deal ${index + 1}`,
    required: deal.capitalRequired / 1000000,
    raised: deal.capitalRaised / 1000000,
  })) || [];

  /**
   * Counts deals by status for pipeline funnel chart
   */
  const dealStatusCounts = deals?.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  /**
   * Generates pipeline data for pie chart showing deal status distribution
   */
  const pipelineData = [
    { name: "Draft", value: dealStatusCounts?.["Draft"] || 0, fill: PIE_COLORS[0] },
    { name: "Open", value: dealStatusCounts?.["Open"] || 0, fill: PIE_COLORS[1] },
    { name: "Active", value: dealStatusCounts?.["Active"] || 0, fill: PIE_COLORS[2] },
    { name: "Funded", value: dealStatusCounts?.["Funded"] || 0, fill: PIE_COLORS[3] },
    { name: "Closed", value: dealStatusCounts?.["Closed"] || 0, fill: PIE_COLORS[4] },
  ].filter(d => d.value > 0);

  /**
   * Aggregates allocations by status for commitment breakdown chart
   */
  const allocationStatusData = allocations?.reduce((acc, alloc) => {
    const status = alloc.status;
    acc[status] = (acc[status] || 0) + alloc.hardCommitAmount;
    return acc;
  }, {} as Record<string, number>);

  /**
   * Generates commitment data for pie chart showing allocation status breakdown
   */
  const commitmentData = Object.entries(allocationStatusData || {})
    .map(([name, value]) => ({ name, value: value / 1000000 }))
    .filter(d => d.value > 0);

  /**
   * Generates project budget data for bar chart showing budget vs actual spend
   */
  const projectBudgetData = projects?.map(p => ({
    name: p.phase?.slice(0, 15) || "Project",
    budget: p.budgetTotal / 1000000,
    actual: p.budgetActual / 1000000,
  })) || [];

  const totalAUM = formatCurrency(stats?.totalCapitalRaised || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Hero Header with Portfolio Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Coral Capital Portfolio</h1>
              <p className="text-muted-foreground mt-1">Real estate investment management platform</p>
            </div>
            {backendStatus && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                backendStatus.connected
                  ? "bg-chart-2/20 text-chart-2 border border-chart-2/30"
                  : "bg-chart-3/20 text-chart-3 border border-chart-3/30"
              }`} data-testid="text-backend-status">
                {backendStatus.connected ? (
                  <><Wifi className="h-3 w-3" /> Backend Connected</>
                ) : (
                  <><WifiOff className="h-3 w-3" /> Local Mode</>
                )}
              </div>
            )}
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-primary">{totalAUM}</span>
            <span className="text-lg text-muted-foreground">Assets Under Management</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              {capitalProgress}% Capital Committed
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(stats?.totalCapitalRaised || 0)} raised of {formatCurrency(stats?.totalCapitalRequired || 0)}
            </span>
          </div>
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Stat Cards with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          icon={Building2}
          trend={{ value: "+12% YoY", positive: true }}
          testId="stat-assets"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={FolderKanban}
          trend={{ value: "On track", positive: true }}
          testId="stat-projects"
        />
        <StatCard
          title="Active Investors"
          value={stats?.totalInvestors || 0}
          icon={Users}
          trend={{ value: "+3 this month", positive: true }}
          testId="stat-investors"
        />
        <StatCard
          title="Active Deals"
          value={stats?.activeDeals || 0}
          icon={Handshake}
          trend={{ value: `${capitalProgress}% funded`, positive: capitalProgress >= 50 }}
          testId="stat-active-deals"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capital Raised Over Time */}
        <Card className="min-h-[320px]">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Capital Pipeline</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">$ in millions</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={capitalOverTimeData}>
                <defs>
                  <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={{ stroke: CHART_COLORS.grid }} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={{ stroke: CHART_COLORS.grid }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`$${value}M`, ""]}
                />
                <Area type="monotone" dataKey="raised" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorRaised)" name="Raised" />
                <Area type="monotone" dataKey="required" stroke={CHART_COLORS.secondary} fillOpacity={1} fill="url(#colorRequired)" name="Required" />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deal Pipeline Status */}
        <Card className="min-h-[320px]">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Deal Pipeline</CardTitle>
            </div>
            <Link href="/deals" data-testid="link-view-deals">
              <span className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                View All <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RePieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Budget Burn */}
        <Card className="min-h-[320px]">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Project Budget Overview</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">$ in millions</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectBudgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={{ stroke: CHART_COLORS.grid }} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={{ stroke: CHART_COLORS.grid }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`$${value}M`, ""]}
                />
                <Bar dataKey="budget" fill={CHART_COLORS.primary} name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill={CHART_COLORS.tertiary} name="Actual" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity & Risk Alerts */}
        <div className="space-y-4">
          {/* Risk Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm font-semibold">Risk Alerts</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                {stats?.riskFlags || 0} Open
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskFlags?.filter(r => r.status === "Open").slice(0, 3).map((flag) => {
                const project = projects?.find(p => p.id === flag.projectId);
                return (
                  <div key={flag.id} className="p-3 rounded-lg bg-accent/30 border-l-2 border-l-chart-5 space-y-1" data-testid={`risk-flag-${flag.id}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{flag.category}</span>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(flag.severity)}>
                        {flag.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{flag.description}</p>
                    <p className="text-[10px] text-muted-foreground/70">{project?.phase} | {formatDate(flag.createdAt)}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Capital Progress"
              value={`${capitalProgress}%`}
              subtitle="Overall portfolio"
              icon={TrendingUp}
              testId="stat-capital-progress"
            />
            <StatCard
              title="Open Work Orders"
              value={stats?.openWorkOrders || 0}
              icon={ClipboardList}
              testId="stat-work-orders"
            />
          </div>
        </div>
      </div>

      {/* Recent Allocations & Execution Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold">Recent Allocations</CardTitle>
            <Link href="/allocations" data-testid="link-view-allocations">
              <span className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                View All <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {allocations?.slice(0, 4).map((alloc) => (
              <div key={alloc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/30" data-testid={`allocation-row-${alloc.id}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{getInvestorName(alloc.investorId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(alloc.softCommitAmount)} soft | {formatCurrency(alloc.hardCommitAmount)} hard
                  </p>
                </div>
                <Badge variant="secondary" className={getStatusColor(alloc.status)}>
                  {alloc.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold">Active Deals</CardTitle>
            <Link href="/deals" data-testid="link-view-deals">
              <span className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                View All <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {deals?.slice(0, 3).map((deal) => {
              const project = projects?.find(p => p.id === deal.projectId);
              const dealName = (deal as any).projectName || project?.phase || deal.phase || "Unknown";
              const progress = deal.capitalRequired > 0 ? Math.round((deal.capitalRaised / deal.capitalRequired) * 100) : 0;
              return (
                <div key={deal.id} className="space-y-2 p-3 rounded-lg bg-accent/30" data-testid={`deal-row-${deal.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Handshake className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{dealName}</span>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(deal.status)}>
                      {deal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatCurrency(deal.capitalRaised)} / {formatCurrency(deal.capitalRequired)}</span>
                    <span className="font-medium text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
