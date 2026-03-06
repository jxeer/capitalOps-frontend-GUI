import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Handshake, TrendingUp, Clock, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, getStatusColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Deal, Project, Asset, Allocation, Investor } from "@shared/schema";

export default function Deals() {
  const { data: deals, isLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { data: allocations } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { data: investors } = useQuery<Investor[]>({ queryKey: ["/api/investors"] });
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    projectId: "", capitalRequired: "", capitalRaised: "0", returnProfile: "",
    duration: "", riskLevel: "Medium", complexity: "Moderate", phase: "", status: "Draft",
  });
  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Deal created" });
      setForm({ projectId: "", capitalRequired: "", capitalRaised: "0", returnProfile: "", duration: "", riskLevel: "Medium", complexity: "Moderate", phase: "", status: "Draft" });
      setOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create deal", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/deals/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Deal deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      portfolioId: "port-001",
      capitalRequired: Number(form.capitalRequired) || 0,
      capitalRaised: Number(form.capitalRaised) || 0,
    });
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

  const totalRequired = deals?.reduce((sum, d) => sum + d.capitalRequired, 0) || 0;
  const totalRaised = deals?.reduce((sum, d) => sum + d.capitalRaised, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Deal Pipeline"
        description="Capital distribution and deal management"
      >
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-new-deal">
                <Plus className="h-4 w-4 mr-1" /> New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={form.projectId} onValueChange={(v) => setField("projectId", v)}>
                    <SelectTrigger data-testid="select-deal-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map(p => {
                        const a = assets?.find(a => a.id === p.assetId);
                        return <SelectItem key={p.id} value={p.id}>{(p as any).assetName || a?.name || p.phase}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capital Required</Label>
                    <Input type="number" value={form.capitalRequired} onChange={(e) => setField("capitalRequired", e.target.value)} placeholder="0" data-testid="input-capital-req" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Capital Raised</Label>
                    <Input type="number" value={form.capitalRaised} onChange={(e) => setField("capitalRaised", e.target.value)} placeholder="0" data-testid="input-capital-raised" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Return Profile</Label>
                    <Input value={form.returnProfile} onChange={(e) => setField("returnProfile", e.target.value)} placeholder="e.g. 18-22% IRR" data-testid="input-return" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={form.duration} onChange={(e) => setField("duration", e.target.value)} placeholder="e.g. 36 months" data-testid="input-duration" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select value={form.riskLevel} onValueChange={(v) => setField("riskLevel", v)}>
                      <SelectTrigger data-testid="select-risk"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Complexity</Label>
                    <Select value={form.complexity} onValueChange={(v) => setField("complexity", v)}>
                      <SelectTrigger data-testid="select-complexity"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Simple">Simple</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phase</Label>
                    <Input value={form.phase} onChange={(e) => setField("phase", e.target.value)} placeholder="e.g. Fundraising" data-testid="input-phase" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                      <SelectTrigger data-testid="select-deal-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Funded">Funded</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-deal">
                  {createMutation.isPending ? "Creating..." : "Create Deal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Capital Required"
          value={formatCurrency(totalRequired)}
          icon={Handshake}
          testId="stat-total-required"
        />
        <StatCard
          title="Total Capital Raised"
          value={formatCurrency(totalRaised)}
          subtitle={`${totalRequired > 0 ? Math.round((totalRaised / totalRequired) * 100) : 0}% of target`}
          icon={TrendingUp}
          testId="stat-total-raised"
        />
        <StatCard
          title="Active Deals"
          value={deals?.filter(d => d.status === "Active").length || 0}
          icon={Handshake}
          testId="stat-active-deals"
        />
      </div>

      <div className="space-y-4">
        {deals?.map((deal) => {
          const project = projects?.find(p => p.id === deal.projectId);
          const asset = project ? assets?.find(a => a.id === project.assetId) : undefined;
          const dealAllocations = allocations?.filter(a => a.dealId === deal.id) || [];
          const progress = deal.capitalRequired > 0 ? Math.round((deal.capitalRaised / deal.capitalRequired) * 100) : 0;

          return (
            <Card key={deal.id} data-testid={`card-deal-${deal.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Handshake className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{(deal as any).projectName || asset?.name || "Unknown"} - {deal.phase}</CardTitle>
                    <p className="text-xs text-muted-foreground">{asset?.location || ""} {asset?.location ? "|" : ""} {deal.returnProfile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={getStatusColor(deal.status)}>
                    {deal.status}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(deal.riskLevel)}>
                    {deal.riskLevel} Risk
                  </Badge>
                  {user && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-delete-deal-${deal.id}`} aria-label="Delete deal">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove the deal and cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(deal.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Required</p>
                    <p className="text-sm font-semibold">{formatCurrency(deal.capitalRequired)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Raised</p>
                    <p className="text-sm font-semibold text-chart-2">{formatCurrency(deal.capitalRaised)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{deal.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Complexity</p>
                    <p className="text-sm font-medium">{deal.complexity}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Investors</p>
                    <p className="text-sm font-medium">{dealAllocations.length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">Capital Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {dealAllocations.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Allocations</p>
                    <div className="space-y-2">
                      {dealAllocations.map((alloc) => {
                        const investor = investors?.find(i => i.id === alloc.investorId);
                        return (
                          <div key={alloc.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-accent/30" data-testid={`deal-allocation-${alloc.id}`}>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{investor?.name || "Unknown"}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Soft: {formatCurrency(alloc.softCommitAmount)} | Hard: {formatCurrency(alloc.hardCommitAmount)}
                              </p>
                            </div>
                            <Badge variant="secondary" className={getStatusColor(alloc.status)}>
                              {alloc.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
