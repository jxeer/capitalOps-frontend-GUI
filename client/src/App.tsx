import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Assets from "@/pages/assets";
import Projects from "@/pages/projects";
import Deals from "@/pages/deals";
import Investors from "@/pages/investors";
import Allocations from "@/pages/allocations";
import Milestones from "@/pages/milestones";
import RiskFlags from "@/pages/risk-flags";
import Vendors from "@/pages/vendors";
import WorkOrders from "@/pages/work-orders";
import InvestorPortal from "@/pages/investor-portal";
import Profile from "@/pages/profile";
import Connections from "@/pages/connections";
import AuthPage from "@/pages/auth-page";
import Splash from "@/pages/splash";



function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const icons = { light: <Sun className="h-4 w-4" />, dark: <Moon className="h-4 w-4" /> };
  const labels = { light: "Switch to dark mode", dark: "Switch to light mode" };
  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle" aria-label={labels[theme as keyof typeof labels]}>
      {icons[theme as keyof typeof icons]}
    </Button>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const avatarFallback = user.username.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-ring/20" aria-label="Open profile menu">
          {user.profileImage ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage} alt={user.username} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center gap-2 p-2 border-b">
          {user.profileImage ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage} alt={user.username} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.username}</p>
            <p className="text-[10px] text-muted-foreground truncate capitalize">{user.role}</p>
          </div>
        </div>
        <div className="p-3 space-y-2 border-b">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Profile Type</Label>
          <p className="text-sm font-medium capitalize">{user.profileType || "Investor"}</p>
        </div>
        <div className="p-3 space-y-2 border-b">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Status</Label>
          <Badge variant="secondary" className="capitalize">
            {user.profileStatus || "pending"}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span className="text-sm">View Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()} className="text-destructive cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user) {
    Promise.resolve().then(() => setLocation("/auth"));
    return null;
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-1 p-2 border-b h-12 shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-1">
              <UserMenu />
              <ThemeToggle />
            </div>
          </header>
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/assets" component={Assets} />
                <Route path="/projects" component={Projects} />
                <Route path="/deals" component={Deals} />
                <Route path="/investors" component={Investors} />
                <Route path="/allocations" component={Allocations} />
                <Route path="/milestones" component={Milestones} />
                <Route path="/risk-flags" component={RiskFlags} />
                <Route path="/vendors" component={Vendors} />
                <Route path="/work-orders" component={WorkOrders} />
                <Route path="/investor-portal" component={InvestorPortal} />
                <Route path="/profile" component={Profile} />
                <Route path="/connections" component={Connections} />
                <Route component={NotFound} />
              </Switch>
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Switch>
              <Route path="/" component={Splash} />
              <Route path="/auth" component={AuthPage} />
              <Route>
                <ProtectedLayout />
              </Route>
            </Switch>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
