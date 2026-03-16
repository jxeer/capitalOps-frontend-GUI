import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { User, Briefcase, Building2, Target, MapPin, Shield, Lock } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    profileType: "investor",
    profileStatus: "pending",
  });

  useEffect(() => {
    if (user) {
      setForm({
        profileType: user.profileType || "investor",
        profileStatus: user.profileStatus || "pending",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: { profileType?: string; profileStatus?: string }) => {
      const res = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditing(false);
      toast({ title: "Profile updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateMutation.mutate({
        profileType: form.profileType,
        profileStatus: form.profileStatus,
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const avatarFallback = user.username.substring(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and profile settings</p>
        </div>
        <Button onClick={() => setEditing(true)} disabled={editing || updateMutation.isPending}>
          {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {user.profileImage ? (
                <Avatar className="h-24 w-24 ring-4 ring-ring/10">
                  <AvatarImage src={user.profileImage} alt={user.username} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-24 w-24 bg-primary text-primary-foreground ring-4 ring-ring/10">
                  <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.profileStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {user.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-sm font-medium">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    {user.email || "Not provided"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Profile Type</CardTitle>
                <CardDescription>Determine your account type and visibility</CardDescription>
              </div>
              {editing && (
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Done
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileType">Account Type</Label>
                    <Select value={form.profileType} onValueChange={(v) => setForm(prev => ({ ...prev, profileType: v }))}>
                      <SelectTrigger id="profileType">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileStatus">Account Status</Label>
                    <Select value={form.profileStatus} onValueChange={(v) => setForm(prev => ({ ...prev, profileStatus: v }))}>
                      <SelectTrigger id="profileStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Role</p>
                      <p className="text-sm font-semibold capitalize">{form.profileType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                      <p className="text-sm font-semibold capitalize">{form.profileStatus}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {form.profileStatus}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Users</CardTitle>
              <CardDescription>People you're connected with</CardDescription>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Connect with other users to share opportunities and collaborate</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No connections yet</p>
                  <p className="text-xs mt-2">Connect with investors, vendors, or developers to collaborate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
