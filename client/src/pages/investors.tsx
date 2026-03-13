import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, MapPin, Shield, Star, Plus, Trash2, Pencil, TrendingUp, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, getStatusColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Investor, Allocation } from "@shared/schema";

const emptyForm = {
  name: "", accreditationStatus: "Accredited", checkSizeMin: "", checkSizeMax: "",
  assetPreference: "", geographyPreference: "", riskTolerance: "Moderate",
  structurePreference: "", timelinePreference: "", strategicInterest: "",
  tierLevel: "Tier 1", status: "Active",
};

function InvestorAvatar({ name, tier }: { name: string; tier: string }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const isTier2 = tier === "Tier 2";
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${isTier2 ? "bg-chart-4/20 text-chart-4 ring-2 ring-chart-4/20" : "bg-primary/15 text-primary ring-2 ring-primary/10"}`}>
      {initials}
    </div>
  );
}

function RiskBadge({ tolerance }: { tolerance: string }) {
  const map: Record<string, string> = {
    Conservative: "bg-chart-2/15 text-chart-2",
    Moderate: "bg-chart-3/15 text-chart-3",
    Aggressive: "bg-destructive/15 text-destructive",
  };
  return <Badge variant="secondary" className={`text-[9px] ${map[tolerance] || "bg-muted text-muted-foreground"}`}>{tolerance}</Badge>;
}

export default function Investors() {
  const { data: investors, isLoading } = useQuery<Investor[]>({ queryKey: ["/api/investors"] });
  const { data: allocations } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Investor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (investor: Investor) => {
    setEditing(investor);
    setForm({ name: investor.name, accreditationStatus: investor.accreditationStatus, checkSizeMin: String(investor.checkSizeMin), checkSizeMax: String(investor.checkSizeMax), assetPreference: investor.assetPreference, geographyPreference: investor.geographyPreference, riskTolerance: investor.riskTolerance, structurePreference: investor.structurePreference, timelinePreference: investor.timelinePreference, strategicInterest: investor.strategicInterest, tierLevel: investor.tierLevel, status: investor.status });
    setOpen(true);
  };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/investors", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/investors"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Investor created" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to create investor", description: err.message, variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/investors/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/investors"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Investor updated" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to update investor", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/investors/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/investors"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Investor deleted" }); },
    onError: (err: Error) => { toast({ title: "Failed to delete", description: err.message, variant: "destructive" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, checkSizeMin: Number(form.checkSizeMin) || 0, checkSizeMax: Number(form.checkSizeMax) || 0 };
    if (editing) { updateMutation.mutate({ id: editing.id, data: payload }); } else { createMutation.mutate(payload); }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52" />)}</div>
      </div>
    );
  }

  const activeInvestors = investors?.filter(i => i.status === "Active").length || 0;
  const tier2Investors = investors?.filter(i => i.tierLevel === "Tier 2").length || 0;
  const totalCommittedAll = allocations?.reduce((sum, a) => sum + a.hardCommitAmount, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Investor Profiles" description="Investor alignment and relationship management">
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-investor">
            <Plus className="h-4 w-4 mr-1" /> New Investor
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Investors" value={investors?.length || 0} icon={Users} testId="stat-total-investors" />
        <StatCard title="Active" value={activeInvestors} icon={Shield} variant="success" testId="stat-active-investors" />
        <StatCard title="Priority (Tier 2)" value={tier2Investors} icon={Star} variant="warning" testId="stat-tier2" />
        <StatCard title="Total Committed" value={formatCurrency(totalCommittedAll)} icon={TrendingUp} variant="highlight" testId="stat-total-committed" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investors?.map((investor) => {
          const investorAllocations = allocations?.filter(a => a.investorId === investor.id) || [];
          const totalCommitted = investorAllocations.reduce((sum, a) => sum + a.hardCommitAmount, 0);
          const isTier2 = investor.tierLevel === "Tier 2";

          return (
            <Card key={investor.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.005] overflow-hidden" data-testid={`card-investor-${investor.id}`}>
              {/* Tier accent bar */}
              <div className={`h-1 w-full ${isTier2 ? "bg-gradient-to-r from-chart-4 via-amber-400 to-chart-3" : "bg-gradient-to-r from-primary via-blue-400 to-chart-1"}`} />

              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <InvestorAvatar name={investor.name} tier={investor.tierLevel} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate" data-testid={`text-investor-name-${investor.id}`}>{investor.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary" className={`text-[10px] ${getStatusColor(investor.status)}`}>{investor.status}</Badge>
                          <Badge variant="secondary" className={`text-[10px] ${isTier2 ? "bg-chart-4/15 text-chart-4" : "bg-primary/10 text-primary"}`}>
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />{investor.tierLevel}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] bg-muted text-muted-foreground">{investor.accreditationStatus}</Badge>
                        </div>
                      </div>
                      {user && (
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(investor)} aria-label="Edit investor" data-testid={`button-edit-investor-${investor.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-delete-investor-${investor.id}`} aria-label="Delete investor">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {investor.name}?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(investor.id)} data-testid="button-confirm-delete">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Check size visual */}
                <div className="p-3 rounded-xl bg-accent/40 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-wider font-medium">Investment Range</span>
                    <RiskBadge tolerance={investor.riskTolerance} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{formatCurrency(investor.checkSizeMin)}</span>
                    <div className="flex-1 mx-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${isTier2 ? "bg-gradient-to-r from-chart-4 to-amber-400" : "bg-gradient-to-r from-primary to-chart-1"}`} style={{ width: "60%" }} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(investor.checkSizeMax)}</span>
                  </div>
                </div>

                {/* Key preferences */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Strategy</p>
                      <p className="text-xs font-semibold">{investor.strategicInterest}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Geography</p>
                      <p className="text-xs font-semibold truncate">{investor.geographyPreference}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Structure</p>
                      <p className="text-xs font-semibold">{investor.structurePreference}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Timeline</p>
                      <p className="text-xs font-semibold">{investor.timelinePreference}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Asset Preference</p>
                    <p className="text-xs font-semibold">{investor.assetPreference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Hard Committed</p>
                    <p className={`text-sm font-bold ${totalCommitted > 0 ? "text-chart-2" : "text-muted-foreground"}`}>{formatCurrency(totalCommitted)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Investor" : "Add New Investor"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Investor name" data-testid="input-investor-name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Accreditation</Label>
                <Select value={form.accreditationStatus} onValueChange={(v) => setField("accreditationStatus", v)}>
                  <SelectTrigger data-testid="select-accreditation"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accredited">Accredited</SelectItem>
                    <SelectItem value="Qualified Purchaser">Qualified Purchaser</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier Level</Label>
                <Select value={form.tierLevel} onValueChange={(v) => setField("tierLevel", v)}>
                  <SelectTrigger data-testid="select-tier"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Check Size</Label>
                <Input type="number" value={form.checkSizeMin} onChange={(e) => setField("checkSizeMin", e.target.value)} placeholder="0" data-testid="input-check-min" required />
              </div>
              <div className="space-y-2">
                <Label>Max Check Size</Label>
                <Input type="number" value={form.checkSizeMax} onChange={(e) => setField("checkSizeMax", e.target.value)} placeholder="0" data-testid="input-check-max" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Preference</Label>
                <Input value={form.assetPreference} onChange={(e) => setField("assetPreference", e.target.value)} placeholder="e.g. Mixed-Use" data-testid="input-asset-pref" required />
              </div>
              <div className="space-y-2">
                <Label>Geography</Label>
                <Input value={form.geographyPreference} onChange={(e) => setField("geographyPreference", e.target.value)} placeholder="e.g. Sun Belt" data-testid="input-geo-pref" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <Select value={form.riskTolerance} onValueChange={(v) => setField("riskTolerance", v)}>
                  <SelectTrigger data-testid="select-risk"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conservative">Conservative</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger data-testid="select-investor-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Structure Preference</Label>
                <Input value={form.structurePreference} onChange={(e) => setField("structurePreference", e.target.value)} placeholder="e.g. LP Equity" data-testid="input-structure" required />
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Input value={form.timelinePreference} onChange={(e) => setField("timelinePreference", e.target.value)} placeholder="e.g. 24–48 months" data-testid="input-timeline" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Strategic Interest</Label>
              <Input value={form.strategicInterest} onChange={(e) => setField("strategicInterest", e.target.value)} placeholder="e.g. Value-Add" data-testid="input-strategic" required />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-investor">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Add Investor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
