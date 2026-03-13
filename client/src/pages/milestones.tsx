import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Milestone as MilestoneIcon, Calendar, AlertTriangle, CheckCircle2, Clock, Circle, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatDate, getStatusColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Milestone, Project, Asset } from "@shared/schema";

function MilestoneStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "Completed": case "Complete": return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
    case "In Progress": return <Clock className="h-4 w-4 text-chart-1" />;
    case "Delayed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default: return <Circle className="h-4 w-4 text-muted-foreground/50" />;
  }
}

function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? completed / total : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = pct * circ;
  const color = pct === 1 ? "hsl(var(--chart-2))" : pct >= 0.5 ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))";

  return (
    <div className="relative flex-shrink-0">
      <svg width="54" height="54" className="-rotate-90">
        <circle cx="27" cy="27" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" opacity="0.5" />
        <circle cx="27" cy="27" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${progress} ${circ}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold leading-none">{completed}</span>
        <span className="text-[8px] text-muted-foreground leading-none">/{total}</span>
      </div>
    </div>
  );
}

const MILESTONE_CATEGORIES = ["Pre-Construction", "Permitting", "Foundation", "Framing", "MEP", "Finishes", "Punch List", "CO", "Closeout"];
const CATEGORY_COLORS: Record<string, string> = {
  "Pre-Construction": "bg-chart-4/15 text-chart-4",
  "Permitting": "bg-chart-3/15 text-chart-3",
  "Foundation": "bg-chart-5/15 text-chart-5",
  "Framing": "bg-primary/10 text-primary",
  "MEP": "bg-chart-1/15 text-chart-1",
  "Finishes": "bg-chart-2/15 text-chart-2",
  "Punch List": "bg-destructive/10 text-destructive",
  "CO": "bg-chart-2/20 text-chart-2",
  "Closeout": "bg-muted text-muted-foreground",
};

const emptyForm = {
  projectId: "", name: "", category: MILESTONE_CATEGORIES[0],
  targetDate: "", completionDate: "", status: "Pending",
  delayExplanation: "", riskFlag: false,
};

export default function Milestones() {
  const { data: milestones, isLoading } = useQuery<Milestone[]>({ queryKey: ["/api/milestones"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const setField = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (ms: Milestone) => {
    setEditing(ms);
    setForm({ projectId: ms.projectId, name: ms.name, category: ms.category, targetDate: ms.targetDate, completionDate: ms.completionDate || "", status: ms.status, delayExplanation: ms.delayExplanation || "", riskFlag: ms.riskFlag });
    setOpen(true);
  };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/milestones", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }); toast({ title: "Milestone created" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to create milestone", description: err.message, variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/milestones/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }); queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); toast({ title: "Milestone updated" }); closeDialog(); },
    onError: (err: Error) => { toast({ title: "Failed to update milestone", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/milestones/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }); toast({ title: "Milestone deleted" }); },
    onError: (err: Error) => { toast({ title: "Failed to delete", description: err.message, variant: "destructive" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, completionDate: form.completionDate || undefined, delayExplanation: form.delayExplanation || undefined };
    if (editing) { updateMutation.mutate({ id: editing.id, data: payload }); } else { createMutation.mutate(payload); }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      </div>
    );
  }

  const completed = milestones?.filter(m => m.status === "Completed" || m.status === "Complete").length || 0;
  const delayed = milestones?.filter(m => m.status === "Delayed").length || 0;
  const flagged = milestones?.filter(m => m.riskFlag).length || 0;

  const groupedByProject = projects?.map((project) => ({
    project,
    asset: assets?.find(a => a.id === project.assetId),
    milestones: milestones?.filter(m => m.projectId === project.id) || [],
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Milestones" description="Project milestone tracking and progress monitoring">
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-milestone">
            <Plus className="h-4 w-4 mr-1" /> New Milestone
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Completed" value={completed} icon={CheckCircle2} variant="success" testId="stat-completed-milestones" />
        <StatCard title="Delayed" value={delayed} icon={AlertTriangle} variant="danger" testId="stat-delayed-milestones" />
        <StatCard title="Risk Flagged" value={flagged} icon={AlertTriangle} variant="warning" testId="stat-flagged-milestones" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap px-1">
        {[
          { icon: CheckCircle2, color: "text-chart-2", label: "Completed" },
          { icon: Clock, color: "text-chart-1", label: "In Progress" },
          { icon: Circle, color: "text-muted-foreground", label: "Pending" },
          { icon: AlertTriangle, color: "text-destructive", label: "Delayed" },
        ].map(({ icon: Icon, color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {groupedByProject.map(({ project, asset, milestones: projectMilestones }) => {
          const done = projectMilestones.filter(m => m.status === "Completed" || m.status === "Complete").length;
          return (
            <Card key={project.id} className="overflow-hidden" data-testid={`card-milestones-${project.id}`}>
              {/* Project header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  <CompletionRing completed={done} total={projectMilestones.length} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">{asset?.name || "Unknown Project"}</h3>
                    <p className="text-xs text-muted-foreground">{project.phase} · {asset?.location || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">
                    {done}/{projectMilestones.length} done
                  </Badge>
                  {projectMilestones.some(m => m.status === "Delayed") && (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Delays
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-1">
                  {projectMilestones.map((ms, index) => (
                    <div key={ms.id} className="flex items-start gap-3 group/ms" data-testid={`milestone-row-${ms.id}`}>
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center gap-0 pt-2 shrink-0">
                        <MilestoneStatusIcon status={ms.status} />
                        {index < projectMilestones.length - 1 && (
                          <div className={`w-px h-8 mt-0.5 ${ms.status === "Completed" || ms.status === "Complete" ? "bg-chart-2/30" : "bg-border"}`} />
                        )}
                      </div>

                      {/* Milestone content */}
                      <div className={`flex-1 min-w-0 rounded-lg p-3 mb-1 transition-colors ${ms.status === "Delayed" ? "bg-destructive/5 border border-destructive/20" : ms.riskFlag ? "bg-chart-3/5 border border-chart-3/20" : "bg-accent/20 hover:bg-accent/40"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="text-sm font-medium">{ms.name}</span>
                            <Badge variant="secondary" className={`text-[9px] shrink-0 ${CATEGORY_COLORS[ms.category] || "bg-muted text-muted-foreground"}`}>
                              {ms.category}
                            </Badge>
                            {ms.riskFlag && (
                              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-chart-3">
                                <AlertTriangle className="h-2.5 w-2.5" />RISK
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="secondary" className={`text-[10px] ${getStatusColor(ms.status)}`}>{ms.status}</Badge>
                            {user && (
                              <>
                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover/ms:opacity-100 transition-opacity" onClick={() => openEdit(ms)} aria-label="Edit milestone" data-testid={`button-edit-milestone-${ms.id}`}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover/ms:opacity-100 transition-opacity" aria-label="Delete milestone" data-testid={`button-delete-milestone-${ms.id}`}>
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete "{ms.name}"?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMutation.mutate(ms.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {formatDate(ms.targetDate)}
                          </span>
                          {ms.completionDate && (
                            <span className="text-chart-2">✓ {formatDate(ms.completionDate)}</span>
                          )}
                        </div>
                        {ms.delayExplanation && (
                          <p className="text-xs text-destructive mt-1.5 font-medium">⚠ {ms.delayExplanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {projectMilestones.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No milestones tracked for this project</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Milestone" : "New Milestone"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => setField("projectId", v)}>
                <SelectTrigger data-testid="select-milestone-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map(p => { const a = assets?.find(a => a.id === p.assetId); return <SelectItem key={p.id} value={p.id}>{a?.name || p.phase}</SelectItem>; })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Milestone name" data-testid="input-milestone-name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger data-testid="select-milestone-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{MILESTONE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger data-testid="select-milestone-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={form.targetDate} onChange={(e) => setField("targetDate", e.target.value)} data-testid="input-milestone-target" required />
              </div>
              <div className="space-y-2">
                <Label>Completion Date</Label>
                <Input type="date" value={form.completionDate} onChange={(e) => setField("completionDate", e.target.value)} data-testid="input-milestone-completion" />
              </div>
            </div>
            {(form.status === "Delayed" || form.delayExplanation) && (
              <div className="space-y-2">
                <Label>Delay Explanation</Label>
                <Textarea value={form.delayExplanation} onChange={(e) => setField("delayExplanation", e.target.value)} placeholder="Explain the delay..." data-testid="input-delay-explanation" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <Switch checked={form.riskFlag} onCheckedChange={(v) => setField("riskFlag", v)} id="risk-flag-toggle" data-testid="toggle-risk-flag" />
              <Label htmlFor="risk-flag-toggle" className="cursor-pointer">Mark as Risk Flag</Label>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-milestone">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Create Milestone"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
