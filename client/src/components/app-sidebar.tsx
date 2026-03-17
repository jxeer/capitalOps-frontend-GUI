import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Handshake,
  Users,
  Milestone,
  Truck,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Network,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const capitalEngineItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Deals", url: "/deals", icon: Handshake },
  { title: "Investors", url: "/investors", icon: Users },
  { title: "Allocations", url: "/allocations", icon: TrendingUp },
  { title: "Investor Portal", url: "/investor-portal", icon: BarChart3 },
  { title: "Connections", url: "/connections", icon: Network },
];

const executionItems = [
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Milestones", url: "/milestones", icon: Milestone },
  { title: "Risk Flags", url: "/risk-flags", icon: AlertTriangle },
];

const assetVendorItems = [
  { title: "Assets", url: "/assets", icon: Building2 },
  { title: "Vendors", url: "/vendors", icon: Truck },
  { title: "Work Orders", url: "/work-orders", icon: ClipboardList },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const renderGroup = (label: string, items: typeof capitalEngineItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                data-active={location === item.url}
                className="transition-all duration-200 hover-elevate-2 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
              >
                <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight" data-testid="text-app-title">CapitalOps</h2>
            <p className="text-[10px] text-muted-foreground">Built on Coral8</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Capital Engine", capitalEngineItems)}
        {renderGroup("Execution Control", executionItems)}
        {renderGroup("Asset & Vendor", assetVendorItems)}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-md bg-accent/50 p-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={user?.profileImage ?? undefined} alt={user?.username ?? "User"} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate" data-testid="sidebar-username">{user?.username ?? "User"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.role ?? "Investor"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8 flex-shrink-0" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
