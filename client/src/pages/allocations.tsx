import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Users, Plus, Trash2, Pencil } from "lucide-react";
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

const emptyForm = {
  investorId: "", dealId: "", softCommitAmount: "", hardCommitAmount: "0", status: "Pending", notes: "",
};

const STATUS_FLOW = ["Pending", "Soft Commit", "Hard Commit", "Funded", "Withdrawn"];

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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (alloc: Allocation) => {
    setEditing(alloc);
    setForm({
      investorId: alloc.investorId,
      dealId: alloc.dealId,
      softCommitAmount: String(alloc.softCommitAmount),
      hardCommitAmount: String(alloc.hardCommitAmount),
      status: alloc.status,
      notes: alloc.notes || "",
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
      const res = await apiRequest("POST", "/api/allocations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      toast({ title: "Allocation created" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create allocation", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/allocations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({ title: "Allocation updated" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update allocation", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/allocations/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      toast({ title: "Allocation deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const advanceStatus = (alloc: Allocation) => {
    const idx = STATUS_FLOW.indexOf(alloc.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 2) return; // -2 to exclude Withdrawn
    const nextStatus = STATUS_FLOW[idx + 1];
    updateMutation.mutate({
      id: alloc.id,
      data: { ...alloc, status: nextStatus },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      softCommitAmount: Number(form.softCommitAmount) || 0,
      hardCommitAmount: Number(form.hardCommitAmount) || 0,
      timestamp: editing?.timestamp || new Date().toISOString(),
    };
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

  const totalSoft = allocations?.reduce((sum, a) => sum + a.softCommitAmount, 0) || 0;
  const totalHard = allocations?.reduce((sum, a) => sum + a.hardCommitAmount, 0) || 0;
  const funded = allocations?.filter(a => a.status === "Funded").length || 0;

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

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Allocations"
        description="Investor commitment tracking and capital flow"
      >
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-allocation">
            <Plus className="h-4 w-4 mr-1" /> New Allocation
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Soft Commits" value={formatCurrency(totalSoft)} icon={TrendingUp} testId="stat-soft-commits" />
        <StatCard title="Total Hard Commits" value={formatCurrency(totalHard)} icon={DollarSign} testId="stat-hard-commits" />
        <StatCard title="Funded Allocations" value={funded} icon={Users} testId="stat-funded" />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">All Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allocations?.map((alloc) => {
              const investor = investors?.find(i => i.id === alloc.investorId);
              const next = nextStatusLabel(alloc.status);

              return (
                <div
                  key={alloc.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-md bg-accent/30"
                  data-testid={`allocation-row-${alloc.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{investor?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{getDealName(alloc.dealId)}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Soft</p>
                      <p className="text-sm font-medium">{formatCurrency(alloc.softCommitAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Hard</p>
                      <p className="text-sm font-semibold">{formatCurrency(alloc.hardCommitAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Date</p>
                      <p className="text-xs">{formatDate(alloc.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className={getStatusColor(alloc.status)}>
                      {alloc.status}
                    </Badge>
                    {user && (
                      <>
                        {next && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 hidden sm:flex" onClick={() => advanceStatus(alloc)} data-testid={`button-advance-alloc-${alloc.id}`}>
                            → {next}
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(alloc)} aria-label="Edit allocation" data-testid={`button-edit-alloc-${alloc.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-delete-alloc-${alloc.id}`} aria-label="Delete allocation">
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
                              <AlertDialogAction onClick={() => deleteMutation.mutate(alloc.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Allocation" : "Create Allocation"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Investor</Label>
              <Select value={form.investorId} onValueChange={(v) => setField("investorId", v)}>
                <SelectTrigger data-testid="select-alloc-investor"><SelectValue placeholder="Select investor" /></SelectTrigger>
                <SelectContent>
                  {investors?.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select value={form.dealId} onValueChange={(v) => setField("dealId", v)}>
                <SelectTrigger data-testid="select-alloc-deal"><SelectValue placeholder="Select deal" /></SelectTrigger>
                <SelectContent>
                  {deals?.map(d => (
                    <SelectItem key={d.id} value={d.id}>{getDealName(d.id)} — {d.phase}</SelectItem>
                  ))}
                </SelectContent>
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
                <SelectContent>
                  {STATUS_FLOW.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
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
