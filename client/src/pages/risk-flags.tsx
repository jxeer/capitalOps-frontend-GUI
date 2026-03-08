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

const emptyForm = {
  projectId: "", category: RISK_CATEGORIES[0], severity: "Medium",
  description: "", status: "Open",
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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (flag: RiskFlag) => {
    setEditing(flag);
    setForm({
      projectId: flag.projectId,
      category: flag.category,
      severity: flag.severity,
      description: flag.description,
      status: flag.status,
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/risk-flags", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Risk flag created" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create risk flag", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/risk-flags/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Risk flag updated" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/risk-flags/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Risk flag deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const quickStatus = (flag: RiskFlag, newStatus: string) => {
    updateMutation.mutate({
      id: flag.id,
      data: { ...flag, status: newStatus },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, createdAt: editing?.createdAt || new Date().toISOString() };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const openFlags = riskFlags?.filter(r => r.status === "Open") || [];
  const mitigated = riskFlags?.filter(r => r.status === "Mitigated") || [];
  const highSeverity = riskFlags?.filter(r => r.severity === "High" || r.severity === "Critical") || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Risk Flags"
        description="Governance risk monitoring and mitigation tracking"
      >
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-risk">
            <Plus className="h-4 w-4 mr-1" /> New Risk Flag
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Open Risks" value={openFlags.length} icon={ShieldAlert} testId="stat-open-risks" />
        <StatCard title="High/Critical" value={highSeverity.length} icon={AlertTriangle} testId="stat-high-risks" />
        <StatCard title="Mitigated" value={mitigated.length} icon={ShieldCheck} testId="stat-mitigated" />
      </div>

      <div className="space-y-3">
        {riskFlags?.map((flag) => {
          const project = projects?.find(p => p.id === flag.projectId);
          const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;

          return (
            <Card key={flag.id} className="hover-elevate" data-testid={`card-risk-${flag.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    flag.severity === "High" || flag.severity === "Critical"
                      ? "bg-destructive/10"
                      : flag.severity === "Medium"
                      ? "bg-chart-3/10"
                      : "bg-chart-2/10"
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${getRiskColor(flag.severity)}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-sm font-semibold">{flag.category}</span>
                        <Badge variant="secondary" className={getStatusColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(flag.status)}>
                          {flag.status}
                        </Badge>
                      </div>
                      {user && (
                        <div className="flex items-center gap-1 shrink-0">
                          {flag.status === "Open" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => quickStatus(flag, "Mitigated")} data-testid={`button-mitigate-${flag.id}`}>
                              Mitigate
                            </Button>
                          )}
                          {flag.status === "Mitigated" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => quickStatus(flag, "Resolved")} data-testid={`button-resolve-${flag.id}`}>
                              Resolve
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(flag)} aria-label="Edit risk flag" data-testid={`button-edit-risk-${flag.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Delete risk flag" data-testid={`button-delete-risk-${flag.id}`}>
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
                                <AlertDialogAction onClick={() => deleteMutation.mutate(flag.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{asset?.name || "Unknown"} — {project?.phase}</span>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Risk Flag" : "New Risk Flag"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => setField("projectId", v)}>
                <SelectTrigger data-testid="select-risk-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map(p => {
                    const a = assets?.find(a => a.id === p.assetId);
                    return <SelectItem key={p.id} value={p.id}>{a?.name || p.phase}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger data-testid="select-risk-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RISK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
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
