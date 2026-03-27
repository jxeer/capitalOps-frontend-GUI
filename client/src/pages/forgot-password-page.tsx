import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast({ title: "Please enter your username or email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const body = isEmail
        ? { email: identifier }
        : { username: identifier };

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.reset_link) {
        setResetLink(data.reset_link);
      }
      setSubmitted(true);
    } catch {
      toast({ title: "Network error", description: "Could not connect to server", variant: "destructive" });
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                If an account exists with that username or email, we've sent a password reset link.
                The link will expire in 30 minutes.
              </CardDescription>
            </CardHeader>
            {resetLink && (
              <CardContent className="space-y-4">
                <div className="p-3 rounded-md bg-muted text-sm break-all">
                  <p className="font-medium mb-1">Debug - Reset Link:</p>
                  <a href={resetLink} className="text-primary hover:underline">{resetLink}</a>
                </div>
              </CardContent>
            )}
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/auth")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-center bg-primary/5 p-12">
          <div className="max-w-md space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">CapitalOps</h2>
            <p className="text-lg text-muted-foreground">
              Capital + Governance operating layer for real estate development, built on Coral8.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your username or email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => setLocation("/auth")}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-primary/5 p-12">
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">CapitalOps</h2>
          <p className="text-lg text-muted-foreground">
            Capital + Governance operating layer for real estate development, built on Coral8.
          </p>
        </div>
      </div>
    </div>
  );
}