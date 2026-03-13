import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Users, Plus, Trash2, Pencil, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency, formatDate, getStatusColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Allocation, Investor, Deal, Project, Asset } from "@shared/schema";

const emptyForm = { investorId: "", dealId: "", softCommitAmount: "", hardCommitAmount: "0", status: "Pending", notes: "" };
const STATUS_FLOW = ["Pending", "Approved", "Soft Commit", "Hard Commit", "Funded", "Declined", "Withdrawn"];

const STATUS_ICONS: Record<string, typeof TrendingUp> = {
  Pending: Users,
  Approved: CheckCircle2,
  "Soft Commit": TrendingUp,
  "Hard Commit": DollarSign,
  Funded: CheckCircle2,
};

const PIPELINE_COLORS = [
  "from-muted/60 to-muted/30 text-muted-foreground",
  "from-chart-1/30 to-chart-1/10 text-chart-1",
  "from-chart-3/30 to-chart-3/10 text-chart-3",
  "from-chart-4/30 to-chart-4/10 text-chart-4",
  "from-chart-2/30 to-chart-2/10 text-chart-2",
];

export default function Allocations() {
  const { data: allocations, isLoading } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { data: investors } = useQuery<Investor[]>({ queryKey: ["/api/investors"] });
  const { data: deals } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Allocation | null>(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (alloc: Allocation) => {
    setEditing(alloc);
    setForm({ investorId: alloc.investorId, dealId: alloc.dealId, softCommitAmount: String(alloc.softCommitAmount), hardCommitAmount: String(alloc.hardCommitAmount), status: alloc.status, notes: alloc.notes || "" });
    setOpen(true);
  };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/allocations", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/allocations"] }); toast({ title: "Allocation created" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to create allocation", description: err.message, variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/allocations/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/allocations"] }); queryClient.invalidateQueries({ queryKey: ["/api/deals"] }); toast({ title: "Allocation updated" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to update allocation", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/allocations/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/allocations"] }); toast({ title: "Allocation deleted" }); },
    onError: (err: Error) => { toast({ title: "Failed to delete", description: err.message, variant: "destructive" }); },
  });

  const advanceStatus = (alloc: Allocation) => {
    const idx = STATUS_FLOW.indexOf(alloc.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 2) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    updateMutation.mutate({ id: alloc.id, data: { ...alloc, status: nextStatus } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, softCommitAmount: Number(form.softCommitAmount) || 0, hardCommitAmount: Number(form.hardCommitAmount) || 0, timestamp: editing?.timestamp || new Date().toISOString() };
    if (editing) { updateMutation.mutate({ id: editing.id, data: payload }); } else { createMutation.mutate(payload); }
  };

  const getDealName = (dealId: string) => {
    const deal = deals?.find(d => d.id === dealId);
    if (!deal) return "Unknown Deal";
    const project = projects?.find(p => p.id === deal.projectId);
    const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;
    return (deal as any).projectName || asset?.name || deal.phase || "Unknown Deal";
  };

  const nextStatusLabel = (status: string) => {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 2) return null;
    return STATUS_FLOW[idx + 1];
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  const totalSoft = allocations?.reduce((sum, a) => sum + a.softCommitAmount, 0) || 0;
  const totalHard = allocations?.reduce((sum, a) => sum + a.hardCommitAmount, 0) || 0;
  const funded = allocations?.filter(a => a.status === "Funded").length || 0;

  const pipelineStages = STATUS_FLOW.slice(0, 5).map((status, idx) => ({
    status,
    count: allocations?.filter(a => a.status === status).length || 0,
    amount: allocations?.filter(a => a.status === status).reduce((sum, a) => sum + a.hardCommitAmount, 0) || 0,
    color: PIPELINE_COLORS[idx] || PIPELINE_COLORS[0],
    Icon: STATUS_ICONS[status] || TrendingUp,
  }));
  const maxPipelineCount = Math.max(...pipelineStages.map(s => s.count), 1);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Allocations" description="Investor commitment tracking and capital flow">
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-allocation">
            <Plus className="h-4 w-4 mr-1" /> New Allocation
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Soft Commits" value={formatCurrency(totalSoft)} icon={TrendingUp} testId="stat-soft-commits" />
        <StatCard title="Total Hard Commits" value={formatCurrency(totalHard)} icon={DollarSign} variant="success" testId="stat-hard-commits" />
        <StatCard title="Funded Allocations" value={funded} icon={CheckCircle2} variant="highlight" testId="stat-funded" />
      </div>

      {/* Commitment Pipeline */}
      <Card data-testid="allocation-pipeline">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Commitment Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {pipelineStages.map(({ status, count, amount, color, Icon }, idx) => (
              <div key={status} className="relative" data-testid={`pipeline-stage-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                {/* Connector */}
                {idx < pipelineStages.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
                <div className={`rounded-xl bg-gradient-to-b ${color} p-3 text-center space-y-2 h-full`}>
                  <Icon className="h-4 w-4 mx-auto opacity-70" />
                  {/* Mini bar showing relative volume */}
                  <div className="h-1 rounded-full bg-current opacity-20 overflow-hidden">
                    <div className="h-full rounded-full bg-current opacity-80 transition-all duration-700"
                      style={{ width: `${(count / maxPipelineCount) * 100}%` }} />
                  </div>
                  <div>
                    <p className="text-xl font-black">{count}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider leading-tight opacity-80">{status}</p>
                    {amount > 0 && <p className="text-[9px] opacity-60 mt-0.5">{formatCurrency(amount)}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation list */}
      <div className="space-y-3">
        {allocations?.map((alloc) => {
          const investor = investors?.find(i => i.id === alloc.investorId);
          const next = nextStatusLabel(alloc.status);
          const initials = (investor?.name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

          return (
            <Card key={alloc.id} className="group hover:shadow-md transition-all duration-200 overflow-hidden" data-testid={`allocation-row-${alloc.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{investor?.name || "Unknown"}</p>
                      <Badge variant="secondary" className={`text-[10px] ${getStatusColor(alloc.status)}`}>{alloc.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{getDealName(alloc.dealId)}</p>
                  </div>

                  {/* Financials */}
                  <div className="hidden sm:flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Soft</p>
                      <p className="text-sm font-medium">{formatCurrency(alloc.softCommitAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Hard</p>
                      <p className="text-sm font-bold text-chart-2">{formatCurrency(alloc.hardCommitAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Date</p>
                      <p className="text-xs text-muted-foreground">{formatDate(alloc.timestamp)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {user && next && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 hidden sm:flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/5" onClick={() => advanceStatus(alloc)} data-testid={`button-advance-alloc-${alloc.id}`}>
                        <ArrowRight className="h-3 w-3" />{next}
                      </Button>
                    )}
                    {user && (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(alloc)} aria-label="Edit allocation" data-testid={`button-edit-alloc-${alloc.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-delete-alloc-${alloc.id}`} aria-label="Delete allocation">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this allocation?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(alloc.id)} data-testid="button-confirm-delete">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
                {alloc.notes && (
                  <p className="text-xs text-muted-foreground mt-2 ml-14">{alloc.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(!allocations || allocations.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No allocations recorded yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Allocation" : "Create Allocation"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Investor</Label>
              <Select value={form.investorId} onValueChange={(v) => setField("investorId", v)}>
                <SelectTrigger data-testid="select-alloc-investor"><SelectValue placeholder="Select investor" /></SelectTrigger>
                <SelectContent>{investors?.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select value={form.dealId} onValueChange={(v) => setField("dealId", v)}>
                <SelectTrigger data-testid="select-alloc-deal"><SelectValue placeholder="Select deal" /></SelectTrigger>
                <SelectContent>{deals?.map(d => <SelectItem key={d.id} value={d.id}>{getDealName(d.id)} — {d.phase}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Soft Commit</Label>
                <Input type="number" value={form.softCommitAmount} onChange={(e) => setField("softCommitAmount", e.target.value)} placeholder="0" data-testid="input-soft-commit" required />
              </div>
              <div className="space-y-2">
                <Label>Hard Commit</Label>
                <Input type="number" value={form.hardCommitAmount} onChange={(e) => setField("hardCommitAmount", e.target.value)} placeholder="0" data-testid="input-hard-commit" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger data-testid="select-alloc-status"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_FLOW.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Optional notes..." data-testid="input-alloc-notes" />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-allocation">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Create Allocation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
