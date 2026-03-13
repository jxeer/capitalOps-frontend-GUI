import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FolderKanban, Calendar, User, AlertTriangle, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Project, Asset, Milestone } from "@shared/schema";

const emptyForm = {
  assetId: "", phase: "", startDate: "", targetCompletion: "",
  budgetTotal: "", budgetActual: "0", status: "Planning", pmAssigned: "",
};

export default function Projects() {
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: assets } = useQuery<Asset[]>({ queryKey: ["/api/assets"] });
  const { data: milestones } = useQuery<Milestone[]>({ queryKey: ["/api/milestones"] });
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      assetId: project.assetId,
      phase: project.phase,
      startDate: project.startDate,
      targetCompletion: project.targetCompletion,
      budgetTotal: String(project.budgetTotal),
      budgetActual: String(project.budgetActual),
      status: project.status,
      pmAssigned: project.pmAssigned,
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
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Project created" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create project", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Project updated" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update project", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/projects/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Project deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      portfolioId: "port-001",
      budgetTotal: Number(form.budgetTotal) || 0,
      budgetActual: Number(form.budgetActual) || 0,
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
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter(p => ["In Progress", "On Track", "At Risk"].includes(p.status)).length || 0;
  const totalBudget = projects?.reduce((sum, p) => sum + p.budgetTotal, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Projects"
        description="Active development projects and execution tracking"
      >
        {user && (
          <Button size="sm" onClick={openCreate} data-testid="button-new-project">
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Projects" value={projects?.length || 0} icon={FolderKanban} testId="stat-total-projects" />
        <StatCard title="Active" value={activeProjects} icon={FolderKanban} variant="success" testId="stat-active-projects" />
        <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={FolderKanban} variant="highlight" testId="stat-total-budget" />
      </div>

      <div className="space-y-4">
        {projects?.map((project) => {
          const asset = assets?.find(a => a.id === project.assetId);
          const projectMilestones = milestones?.filter(m => m.projectId === project.id) || [];
          const completedMilestones = projectMilestones.filter(m => m.status === "Completed").length;
          const milestoneProgress = projectMilestones.length > 0
            ? Math.round((completedMilestones / projectMilestones.length) * 100)
            : 0;
          const budgetProgress = project.budgetTotal > 0 ? Math.round((project.budgetActual / project.budgetTotal) * 100) : 0;
          const riskMilestones = projectMilestones.filter(m => m.riskFlag);

          return (
            <Card key={project.id} data-testid={`card-project-${project.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{(project as any).assetName || asset?.name || "Unknown Asset"}</CardTitle>
                    <p className="text-xs text-muted-foreground">{project.phase} | {asset?.location || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {user && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(project)} data-testid={`button-edit-project-${project.id}`} aria-label="Edit project">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-delete-project-${project.id}`} aria-label="Delete project">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(project.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-semibold">{formatCurrency(project.budgetActual)}</p>
                    <p className="text-[10px] text-muted-foreground">of {formatCurrency(project.budgetTotal)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{formatDate(project.targetCompletion)}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PM Assigned</p>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{project.pmAssigned}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Flags</p>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`h-3 w-3 ${riskMilestones.length > 0 ? "text-chart-5" : "text-muted-foreground"}`} />
                      <p className="text-sm font-medium">{riskMilestones.length}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">Budget Usage</span>
                    <span className="font-medium">{budgetProgress}%</span>
                  </div>
                  <Progress value={budgetProgress} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">Milestone Progress ({completedMilestones}/{projectMilestones.length})</span>
                    <span className="font-medium">{milestoneProgress}%</span>
                  </div>
                  <Progress value={milestoneProgress} className="h-1.5" />
                </div>

                {projectMilestones.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Milestones</p>
                    <div className="flex flex-wrap gap-2">
                      {projectMilestones.map((ms) => (
                        <Badge key={ms.id} variant="secondary" className={getStatusColor(ms.status)}>
                          {ms.riskFlag && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {ms.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Create New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={form.assetId} onValueChange={(v) => setField("assetId", v)}>
                <SelectTrigger data-testid="select-project-asset"><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  {assets?.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {a.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Input value={form.phase} onChange={(e) => setField("phase", e.target.value)} placeholder="e.g. Construction" data-testid="input-project-phase" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} data-testid="input-project-start" required />
              </div>
              <div className="space-y-2">
                <Label>Target Completion</Label>
                <Input type="date" value={form.targetCompletion} onChange={(e) => setField("targetCompletion", e.target.value)} data-testid="input-project-target" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Budget</Label>
                <Input type="number" value={form.budgetTotal} onChange={(e) => setField("budgetTotal", e.target.value)} placeholder="0" data-testid="input-budget-total" required />
              </div>
              <div className="space-y-2">
                <Label>Actual Spend</Label>
                <Input type="number" value={form.budgetActual} onChange={(e) => setField("budgetActual", e.target.value)} placeholder="0" data-testid="input-budget-actual" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger data-testid="select-project-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PM Assigned</Label>
                <Input value={form.pmAssigned} onChange={(e) => setField("pmAssigned", e.target.value)} placeholder="Name" data-testid="input-pm-assigned" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-project">
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Save Changes" : "Create Project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
