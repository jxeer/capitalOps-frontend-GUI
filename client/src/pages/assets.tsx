import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Building2, MapPin, Maximize2, Plus, Trash2, Pencil, Layers, Home, Briefcase, ShoppingBag } from "lucide-react";
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
import { getStatusColor, formatNumber } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Asset } from "@shared/schema";

const emptyForm = {
  name: "", location: "", assetType: "", squareFootage: "", status: "Active", assetManager: "",
};

function getAssetMeta(type: string): { icon: typeof Building2; gradient: string; iconBg: string; iconColor: string } {
  const t = type.toLowerCase();
  if (t.includes("mixed")) return { icon: Layers, gradient: "from-chart-1/20 to-chart-4/10", iconBg: "bg-chart-1/15", iconColor: "text-chart-1" };
  if (t.includes("multi") || t.includes("resid")) return { icon: Home, gradient: "from-chart-2/20 to-chart-1/10", iconBg: "bg-chart-2/15", iconColor: "text-chart-2" };
  if (t.includes("office") || t.includes("comm")) return { icon: Briefcase, gradient: "from-chart-4/20 to-chart-1/10", iconBg: "bg-chart-4/15", iconColor: "text-chart-4" };
  if (t.includes("retail")) return { icon: ShoppingBag, gradient: "from-chart-3/20 to-chart-1/10", iconBg: "bg-chart-3/15", iconColor: "text-chart-3" };
  return { icon: Building2, gradient: "from-primary/20 to-primary/5", iconBg: "bg-primary/10", iconColor: "text-primary" };
}

function getStatusDot(status: string) {
  if (status === "Active") return "bg-chart-2";
  if (status === "Stabilized") return "bg-chart-1";
  if (status === "Pre-dev") return "bg-chart-3";
  return "bg-muted-foreground";
}

export default function Assets() {
  const { data: assets, isLoading } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setForm({ name: asset.name, location: asset.location, assetType: asset.assetType, squareFootage: String(asset.squareFootage), status: asset.status, assetManager: asset.assetManager });
    setOpen(true);
  };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/assets", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/assets"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Asset created" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to create asset", description: err.message, variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/assets/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/assets"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Asset updated" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to update asset", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/assets/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/assets"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); toast({ title: "Asset deleted" }); },
    onError: (err: Error) => { toast({ title: "Failed to delete asset", description: err.message, variant: "destructive" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, portfolioId: "port-001", squareFootage: Number(form.squareFootage) || 0 };
    if (editing) { updateMutation.mutate({ id: editing.id, data: payload }); } else { createMutation.mutate(payload); }
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

  const active = assets?.filter(a => a.status === "Active").length || 0;
  const stabilized = assets?.filter(a => a.status === "Stabilized").length || 0;
  const totalSqFt = assets?.reduce((sum, a) => sum + a.squareFootage, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Assets" description="Portfolio asset management and property overview">
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-asset">
            <Plus className="h-4 w-4 mr-1" /> New Asset
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={assets?.length || 0} icon={Building2} testId="stat-total-assets" />
        <StatCard title="Active" value={active} icon={Building2} variant="success" testId="stat-active-assets" />
        <StatCard title="Stabilized" value={stabilized} icon={Building2} variant="highlight" testId="stat-stabilized-assets" />
        <StatCard title="Total Sq Ft" value={`${formatNumber(totalSqFt)} SF`} icon={Maximize2} testId="stat-total-sqft" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets?.map((asset) => {
          const meta = getAssetMeta(asset.assetType);
          const AssetIcon = meta.icon;
          return (
            <Card key={asset.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden" data-testid={`card-asset-${asset.id}`}>
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${meta.gradient} px-5 pt-5 pb-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ring-1 ring-white/10`}>
                      <AssetIcon className={`h-5 w-5 ${meta.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold truncate" data-testid={`text-asset-name-${asset.id}`}>{asset.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`h-2 w-2 rounded-full ${getStatusDot(asset.status)}`} />
                    <Badge variant="secondary" className={`${getStatusColor(asset.status)} text-[10px]`}>
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="p-5 pt-4 space-y-4">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-accent/40 space-y-0.5 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Type</p>
                    <p className="text-xs font-semibold leading-tight">{asset.assetType}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-accent/40 space-y-0.5 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Sq Ft</p>
                    <div className="flex items-center justify-center gap-0.5">
                      <Maximize2 className="h-2.5 w-2.5 text-muted-foreground" />
                      <p className="text-xs font-semibold">{formatNumber(asset.squareFootage)}</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-accent/40 space-y-0.5 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Manager</p>
                    <p className="text-xs font-semibold leading-tight truncate">{asset.assetManager.split(" ")[0]}</p>
                  </div>
                </div>

                {/* Footer with manager and actions */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Managed by <span className="text-foreground font-medium">{asset.assetManager}</span>
                  </p>
                  {user && (
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(asset)} aria-label="Edit asset" data-testid={`button-edit-asset-${asset.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-delete-asset-${asset.id}`} aria-label="Delete asset">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {asset.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(asset.id)} data-testid="button-confirm-delete">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Asset" : "Create New Asset"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Asset name" data-testid="input-asset-name" required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="City, State" data-testid="input-asset-location" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Input value={form.assetType} onChange={(e) => setField("assetType", e.target.value)} placeholder="e.g. Mixed-Use" data-testid="input-asset-type" required />
              </div>
              <div className="space-y-2">
                <Label>Square Footage</Label>
                <Input type="number" value={form.squareFootage} onChange={(e) => setField("squareFootage", e.target.value)} placeholder="0" data-testid="input-asset-sqft" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger data-testid="select-asset-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-dev">Pre-dev</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Stabilized">Stabilized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Asset Manager</Label>
                <Input value={form.assetManager} onChange={(e) => setField("assetManager", e.target.value)} placeholder="Manager name" data-testid="input-asset-manager" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-asset">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Create Asset"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
