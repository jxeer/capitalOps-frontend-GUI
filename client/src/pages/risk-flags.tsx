/**
 * CapitalOps Risk Flags Page
 * 
 * Purpose: Track and manage risk indicators for projects and deals,
 * enabling proactive risk management and mitigation.
 * 
 * Key Features:
 * - Create/view risk flags with severity levels (Low, Medium, High, Critical)
 * - Status tracking (Open, Mitigated, Resolved)
 * - Link risks to specific projects
 * - Mitigation notes and resolution tracking
 * 
 * Related Backend Routes:
 * - GET /api/risk-flags - List risk flags
 * - POST /api/risk-flags - Create risk flag
 * - PUT /api/risk-flags/:id - Update risk flag
 * - DELETE /api/risk-flags/:id - Delete risk flag
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatDate, getStatusColor, getRiskColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { RiskFlag, Project, Asset } from "@shared/schema";

const RISK_CATEGORIES = ["Budget", "Schedule", "Permitting", "Contractor", "Market", "Legal", "Environmental", "Structural", "Other"];

const emptyForm = { projectId: "", category: RISK_CATEGORIES[0], severity: "Medium", description: "", status: "Open" };

const SEVERITY_META: Record<string, { bg: string; text: string; border: string; dot: string; leftBorder: string; rowBg: string }> = {
  Low:      { bg: "bg-chart-2/10", text: "text-chart-2", border: "border-chart-2/30", dot: "bg-chart-2", leftBorder: "border-l-4 border-l-chart-2", rowBg: "hover:bg-chart-2/5" },
  Medium:   { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/30", dot: "bg-chart-3", leftBorder: "border-l-4 border-l-chart-3", rowBg: "hover:bg-chart-3/5" },
  High:     { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", dot: "bg-destructive", leftBorder: "border-l-4 border-l-destructive", rowBg: "hover:bg-destructive/5" },
  Critical: { bg: "bg-chart-5/15", text: "text-chart-5", border: "border-chart-5/40", dot: "bg-chart-5", leftBorder: "border-l-4 border-l-chart-5", rowBg: "hover:bg-chart-5/5" },
};

export default function RiskFlags() {
  const { data: riskFlags, isLoading } = useQuery<RiskFlag[]>({ queryKey: ["/api/risk-flags"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RiskFlag | null>(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (flag: RiskFlag) => {
    setEditing(flag);
    setForm({ projectId: flag.projectId, category: flag.category, severity: flag.severity, description: flag.description, status: flag.status });
    setOpen(true);
  };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/risk-flags", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Risk flag created" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to create risk flag", description: err.message, variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/risk-flags/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Risk flag updated" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to update", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/risk-flags/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Risk flag deleted" }); },
    onError: (err: Error) => { toast({ title: "Failed to delete", description: err.message, variant: "destructive" }); },
  });

  const quickStatus = (flag: RiskFlag, newStatus: string) => {
    updateMutation.mutate({ id: flag.id, data: { ...flag, status: newStatus } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, createdAt: editing?.createdAt || new Date().toISOString() };
    if (editing) { updateMutation.mutate({ id: editing.id, data: payload }); } else { createMutation.mutate(payload); }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  const openFlags = riskFlags?.filter(r => r.status === "Open") || [];
  const mitigated = riskFlags?.filter(r => r.status === "Mitigated") || [];
  const highSeverity = riskFlags?.filter(r => r.severity === "High" || r.severity === "Critical") || [];

  const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
  const severityCounts = SEVERITIES.map(sev => ({
    label: sev,
    open: riskFlags?.filter(r => r.severity === sev && r.status === "Open").length || 0,
    mitigated: riskFlags?.filter(r => r.severity === sev && r.status === "Mitigated").length || 0,
    resolved: riskFlags?.filter(r => r.severity === sev && r.status === "Resolved").length || 0,
    total: riskFlags?.filter(r => r.severity === sev).length || 0,
  }));

  const categoryBreakdown = RISK_CATEGORIES.map(cat => ({
    category: cat,
    count: riskFlags?.filter(r => r.category === cat).length || 0,
    open: riskFlags?.filter(r => r.category === cat && r.status === "Open").length || 0,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const maxCategoryCount = Math.max(...categoryBreakdown.map(c => c.count), 1);

  // Sort flags: Critical/High first, then by status (Open first)
  const sortedFlags = [...(riskFlags || [])].sort((a, b) => {
    const sevOrder = ["Critical", "High", "Medium", "Low"];
    const statusOrder = ["Open", "Mitigated", "Resolved"];
    const sevDiff = sevOrder.indexOf(a.severity) - sevOrder.indexOf(b.severity);
    if (sevDiff !== 0) return sevDiff;
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Risk Flags" description="Governance risk monitoring and mitigation tracking">
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-risk">
            <Plus className="h-4 w-4 mr-1" /> New Risk Flag
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Open Risks" value={openFlags.length} icon={ShieldAlert} variant="danger" testId="stat-open-risks" />
        <StatCard title="High/Critical" value={highSeverity.length} icon={AlertTriangle} variant="warning" testId="stat-high-risks" />
        <StatCard title="Mitigated" value={mitigated.length} icon={ShieldCheck} variant="success" testId="stat-mitigated" />
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Severity Heatmap */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Severity Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {severityCounts.map(({ label, open: openCount, mitigated: mitigatedCount, resolved, total }) => {
                const meta = SEVERITY_META[label];
                return (
                  <div key={label} className={`rounded-xl border p-4 ${meta.bg} ${meta.border} transition-transform hover:scale-[1.02]`} data-testid={`heatmap-severity-${label.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                        <span className={`text-xs font-bold ${meta.text}`}>{label}</span>
                      </div>
                      <span className={`text-2xl font-black ${meta.text}`}>{total}</span>
                    </div>
                    <div className="space-y-1 text-[10px] text-muted-foreground">
                      <div className="flex justify-between"><span>Open</span><span className="font-semibold">{openCount}</span></div>
                      <div className="flex justify-between"><span>Mitigated</span><span className="font-semibold">{mitigatedCount}</span></div>
                      <div className="flex justify-between"><span>Resolved</span><span className="font-semibold">{resolved}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Risks by Category</h3>
            </div>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No risk flags recorded</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(({ category, count, open: openCount }) => (
                  <div key={category} className="space-y-1" data-testid={`heatmap-category-${category.toLowerCase()}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{category}</span>
                      <div className="flex items-center gap-2">
                        {openCount > 0 && <span className="font-bold text-destructive">{openCount} open</span>}
                        <span className="text-muted-foreground">{count} total</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${openCount > 0 ? "bg-gradient-to-r from-destructive/80 to-chart-3/60" : "bg-gradient-to-r from-primary to-primary/60"}`}
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Flag List */}
      <div className="space-y-3">
        {sortedFlags.map((flag) => {
          const project = projects?.find(p => p.id === flag.projectId);
          const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;
          const meta = SEVERITY_META[flag.severity] || SEVERITY_META.Low;

          return (
            <Card key={flag.id} className={`group transition-all duration-200 hover:shadow-md overflow-hidden ${meta.leftBorder} ${meta.rowBg}`} data-testid={`card-risk-${flag.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <AlertTriangle className={`h-4 w-4 ${getRiskColor(flag.severity)}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-sm font-bold">{flag.category}</span>
                        <Badge variant="secondary" className={`text-[10px] ${meta.bg} ${meta.text} border ${meta.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} mr-1 inline-block`} />
                          {flag.severity}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] ${getStatusColor(flag.status)}`}>{flag.status}</Badge>
                      </div>
                      {user && (
                        <div className="flex items-center gap-1 shrink-0">
                          {flag.status === "Open" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => quickStatus(flag, "Mitigated")} data-testid={`button-mitigate-${flag.id}`}>
                              Mitigate
                            </Button>
                          )}
                          {flag.status === "Mitigated" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-chart-2 border-chart-2/30 hover:bg-chart-2/10" onClick={() => quickStatus(flag, "Resolved")} data-testid={`button-resolve-${flag.id}`}>
                              Resolve
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(flag)} aria-label="Edit risk flag" data-testid={`button-edit-risk-${flag.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete risk flag" data-testid={`button-delete-risk-${flag.id}`}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this risk flag?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(flag.id)} data-testid="button-confirm-delete">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{flag.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
                      <span className="font-medium">{asset?.name || "Unknown Asset"}</span>
                      {project?.phase && <><span>·</span><span>{project.phase}</span></>}
                      <span>·</span>
                      <span>{formatDate(flag.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Risk Flag" : "New Risk Flag"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => setField("projectId", v)}>
                <SelectTrigger data-testid="select-risk-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map(p => { const a = assets?.find(a => a.id === p.assetId); return <SelectItem key={p.id} value={p.id}>{a?.name || p.phase}</SelectItem>; })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger data-testid="select-risk-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{RISK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setField("severity", v)}>
                  <SelectTrigger data-testid="select-risk-severity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger data-testid="select-risk-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Mitigated">Mitigated</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the risk..." data-testid="input-risk-description" required />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-risk">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Create Risk Flag"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
