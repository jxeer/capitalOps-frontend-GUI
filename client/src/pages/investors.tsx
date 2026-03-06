import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, DollarSign, MapPin, Shield, Star, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Investor, Allocation } from "@shared/schema";

export default function Investors() {
  const { data: investors, isLoading } = useQuery<Investor[]>({ queryKey: ["/api/investors"] });
  const { data: allocations } = useQuery<Allocation[]>({ queryKey: ["/api/allocations"] });
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "", accreditationStatus: "Accredited", checkSizeMin: "", checkSizeMax: "",
    assetPreference: "", geographyPreference: "", riskTolerance: "Moderate",
    structurePreference: "", timelinePreference: "", strategicInterest: "",
    tierLevel: "Tier 1", status: "Active",
  });

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/investors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Investor created successfully" });
      setForm({ name: "", accreditationStatus: "Accredited", checkSizeMin: "", checkSizeMax: "", assetPreference: "", geographyPreference: "", riskTolerance: "Moderate", structurePreference: "", timelinePreference: "", strategicInterest: "", tierLevel: "Tier 1", status: "Active" });
      setOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create investor", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/investors/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Investor deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      checkSizeMin: Number(form.checkSizeMin) || 0,
      checkSizeMax: Number(form.checkSizeMax) || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      </div>
    );
  }

  const activeInvestors = investors?.filter(i => i.status === "Active").length || 0;
  const tier2Investors = investors?.filter(i => i.tierLevel === "Tier 2").length || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Investor Profiles"
        description="Investor alignment and relationship management"
      >
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-new-investor">
                <Plus className="h-4 w-4 mr-1" /> New Investor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Investor</DialogTitle>
              </DialogHeader>
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
                    <Input value={form.timelinePreference} onChange={(e) => setField("timelinePreference", e.target.value)} placeholder="e.g. 24-48 months" data-testid="input-timeline" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Strategic Interest</Label>
                  <Input value={form.strategicInterest} onChange={(e) => setField("strategicInterest", e.target.value)} placeholder="e.g. Value-Add" data-testid="input-strategic" required />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-investor">
                  {createMutation.isPending ? "Creating..." : "Add Investor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Investors" value={investors?.length || 0} icon={Users} testId="stat-total-investors" />
        <StatCard title="Active" value={activeInvestors} icon={Shield} testId="stat-active-investors" />
        <StatCard title="Priority (Tier 2)" value={tier2Investors} icon={Star} testId="stat-tier2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investors?.map((investor) => {
          const investorAllocations = allocations?.filter(a => a.investorId === investor.id) || [];
          const totalCommitted = investorAllocations.reduce((sum, a) => sum + a.hardCommitAmount, 0);

          return (
            <Card key={investor.id} className="hover-elevate" data-testid={`card-investor-${investor.id}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate" data-testid={`text-investor-name-${investor.id}`}>{investor.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className={getStatusColor(investor.status)}>
                          {investor.status}
                        </Badge>
                        <Badge variant="secondary" className={investor.tierLevel === "Tier 2" ? "bg-chart-4/15 text-chart-4" : "bg-accent text-accent-foreground"}>
                          {investor.tierLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {user && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" data-testid={`button-delete-investor-${investor.id}`} aria-label="Delete investor">
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
                          <AlertDialogAction onClick={() => deleteMutation.mutate(investor.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Check Size</p>
                    <p className="text-sm font-medium">{formatCurrency(investor.checkSizeMin)} - {formatCurrency(investor.checkSizeMax)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Tolerance</p>
                    <p className="text-sm font-medium">{investor.riskTolerance}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Asset Pref</p>
                    <p className="text-sm font-medium">{investor.assetPreference}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Geography</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{investor.geographyPreference}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Structure</p>
                    <p className="text-sm font-medium">{investor.structurePreference}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Timeline</p>
                    <p className="text-sm font-medium">{investor.timelinePreference}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Strategic Interest</p>
                    <p className="text-xs font-medium">{investor.strategicInterest}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Total Committed</p>
                    <p className="text-xs font-semibold text-chart-2">{formatCurrency(totalCommitted)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
