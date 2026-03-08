import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Milestone as MilestoneIcon, Calendar, AlertTriangle, CheckCircle2, Clock, Circle, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    default: return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

const MILESTONE_CATEGORIES = ["Pre-Construction", "Permitting", "Foundation", "Framing", "MEP", "Finishes", "Punch List", "CO", "Closeout"];

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
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (ms: Milestone) => {
    setEditing(ms);
    setForm({
      projectId: ms.projectId,
      name: ms.name,
      category: ms.category,
      targetDate: ms.targetDate,
      completionDate: ms.completionDate || "",
      status: ms.status,
      delayExplanation: ms.delayExplanation || "",
      riskFlag: ms.riskFlag,
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
      const res = await apiRequest("POST", "/api/milestones", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone created" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create milestone", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/milestones/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Milestone updated" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update milestone", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/milestones/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      completionDate: form.completionDate || undefined,
      delayExplanation: form.delayExplanation || undefined,
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
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
      <PageHeader
        title="Milestones"
        description="Project milestone tracking and progress monitoring"
      >
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-milestone">
            <Plus className="h-4 w-4 mr-1" /> New Milestone
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Completed" value={completed} icon={CheckCircle2} testId="stat-completed-milestones" />
        <StatCard title="Delayed" value={delayed} icon={AlertTriangle} testId="stat-delayed-milestones" />
        <StatCard title="Risk Flagged" value={flagged} icon={AlertTriangle} testId="stat-flagged-milestones" />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" /> Completed
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-chart-1" /> In Progress
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className="h-3.5 w-3.5 text-muted-foreground" /> Pending
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Delayed
        </div>
      </div>

      <div className="space-y-4">
        {groupedByProject.map(({ project, asset, milestones: projectMilestones }) => (
          <Card key={project.id} data-testid={`card-milestones-${project.id}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <MilestoneIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm truncate">{asset?.name || "Unknown"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{project.phase}</p>
                </div>
              </div>
              <Badge variant="secondary">
                {projectMilestones.filter(m => m.status === "Completed" || m.status === "Complete").length}/{projectMilestones.length}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectMilestones.map((ms, index) => (
                  <div key={ms.id} className="flex items-start gap-3" data-testid={`milestone-row-${ms.id}`}>
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <MilestoneStatusIcon status={ms.status} />
                      {index < projectMilestones.length - 1 && (
                        <div className="w-px h-8 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">{ms.name}</span>
                          {ms.riskFlag && (
                            <AlertTriangle className="h-3.5 w-3.5 text-chart-5 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="secondary" className={getStatusColor(ms.status)}>
                            {ms.status}
                          </Badge>
                          {user && (
                            <>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(ms)} aria-label="Edit milestone" data-testid={`button-edit-milestone-${ms.id}`}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Delete milestone" data-testid={`button-delete-milestone-${ms.id}`}>
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
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Target: {formatDate(ms.targetDate)}
                        </span>
                        {ms.completionDate && (
                          <span>Completed: {formatDate(ms.completionDate)}</span>
                        )}
                        <Badge variant="secondary" className="text-[10px]">{ms.category}</Badge>
                      </div>
                      {ms.delayExplanation && (
                        <p className="text-xs text-chart-5 mt-1">{ms.delayExplanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Milestone" : "New Milestone"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => setField("projectId", v)}>
                <SelectTrigger data-testid="select-milestone-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map(p => {
                    const a = assets?.find(a => a.id === p.assetId);
                    return <SelectItem key={p.id} value={p.id}>{a?.name || p.phase}</SelectItem>;
                  })}
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
                  <SelectContent>
                    {MILESTONE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
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
              <Switch
                checked={form.riskFlag}
                onCheckedChange={(v) => setField("riskFlag", v)}
                id="risk-flag-toggle"
                data-testid="toggle-risk-flag"
              />
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
