import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, Shield, ArrowRight, DollarSign, Target, BarChart3 } from "lucide-react";

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CapitalOps</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
              Capital Strategy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10 leading-relaxed">
            A comprehensive operating layer for real estate development. 
            Monitor portfolios, manage deals, and engage stakeholders with precision and clarity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <a href="/auth">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
              <Link href="#features">
                Explore Features
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-primary/5 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Assets Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2B+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Capital Under Management</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Active Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Real-Time Visibility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Platform Capabilities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage real estate development from capital raising through execution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Capital Engine */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Capital Engine</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <h4 className="font-medium">Deal Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor capital requirements, commitments, and funding progress</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <h4 className="font-medium">Investor Management</h4>
                  <p className="text-sm text-muted-foreground">Track investor profiles, allocations, and communication</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <h4 className="font-medium">Portfolio Analytics</h4>
                  <p className="text-sm text-muted-foreground">Real-time dashboards with interactive charts and metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Control */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-2/10 text-chart-2 group-hover:bg-chart-2 group-hover:text-primary-foreground transition-colors">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Execution Control</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-2" />
                <div>
                  <h4 className="font-medium">Project Management</h4>
                  <p className="text-sm text-muted-foreground">Track project phases, milestones, and completion status</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-2" />
                <div>
                  <h4 className="font-medium">Risk Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Identify and track project risks with severity levels</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-2" />
                <div>
                  <h4 className="font-medium">Work Orders</h4>
                  <p className="text-sm text-muted-foreground">Manage maintenance, compliance deadlines, and vendor work</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset & Vendor */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-3/10 text-chart-3 group-hover:bg-chart-3 group-hover:text-primary-foreground transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Asset & Vendor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-3" />
                <div>
                  <h4 className="font-medium">Asset Management</h4>
                  <p className="text-sm text-muted-foreground">Central repository for all real estate assets with media galleries</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-3" />
                <div>
                  <h4 className="font-medium">Vendor Directory</h4>
                  <p className="text-sm text-muted-foreground">Pre-vetted vendors with performance scores and certifications</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-3" />
                <div>
                  <h4 className="font-medium">Geospatial Tracking</h4>
                  <p className="text-sm text-muted-foreground">Visualize project locations on interactive maps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investor Portal */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-4/10 text-chart-4 group-hover:bg-chart-4 group-hover:text-primary-foreground transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Investor Portal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-4" />
                <div>
                  <h4 className="font-medium">Secure Authentication</h4>
                  <p className="text-sm text-muted-foreground">Google OAuth with professional role-based access</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-4" />
                <div>
                  <h4 className="font-medium">Portfolio Views</h4>
                  <p className="text-sm text-muted-foreground">Customizable views for different investor tiers</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-4" />
                <div>
                  <h4 className="font-medium">Professional Networking</h4>
                  <p className="text-sm text-muted-foreground">Connect with other investors, vendors, and developers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Management */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-5/10 text-chart-5 group-hover:bg-chart-5 group-hover:text-primary-foreground transition-colors">
                  <DollarSign className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Media Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-5" />
                <div>
                  <h4 className="font-medium">Photo & Video Uploads</h4>
                  <p className="text-sm text-muted-foreground">Direct uploads to asset and project pages</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-5" />
                <div>
                  <h4 className="font-medium">Visual Documentation</h4>
                  <p className="text-sm text-muted-foreground">Track progress with date-stamped media galleries</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-5" />
                <div>
                  <h4 className="font-medium">Cloud Storage</h4>
                  <p className="text-sm text-muted-foreground">AWS S3 integration with local fallback for development</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Connections */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-1/10 text-chart-1 group-hover:bg-chart-1 group-hover:text-primary-foreground transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Professional Connections</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-1" />
                <div>
                  <h4 className="font-medium">User Discovery</h4>
                  <p className="text-sm text-muted-foreground">Search and connect with platform users by profile type</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-1" />
                <div>
                  <h4 className="font-medium">1-on-1 Messaging</h4>
                  <p className="text-sm text-muted-foreground">Direct communication with investors, vendors, and partners</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-chart-1" />
                <div>
                  <h4 className="font-medium">Connection Requests</h4>
                  <p className="text-sm text-muted-foreground">Professional networking workflow with accept/decline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/90 px-8 py-16 text-center shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] bg-[length:20px_20px] opacity-20" />
          
          <h2 className="relative text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Capital Operations?
          </h2>
          <p className="relative text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join institutional investors, developers, and vendors who trust CapitalOps for their real estate development needs.
          </p>
          <div className="relative flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary hover:bg-primary/10" asChild>
              <a href="/auth">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg text-white border-white/30 hover:bg-white/10 hover:text-white" asChild>
              <Link href="#features">
                View Features
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">CapitalOps</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                The operating layer for real estate development. Professional, transparent, and data-driven.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CapitalOps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
