import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided. Please request a new password reset link.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("No reset token provided. Please request a new password reset link.");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Password reset complete</CardTitle>
              <CardDescription>
                Your password has been successfully reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setLocation("/auth")}>
                Go to Sign In
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

  if (!token) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Invalid reset link</CardTitle>
              <CardDescription>
                {error || "This password reset link is invalid or has expired."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setLocation("/auth/forgot-password")}>
                Request New Link
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setLocation("/auth")}>
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
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reset Password
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