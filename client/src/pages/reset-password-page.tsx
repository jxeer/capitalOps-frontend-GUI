/**
 * CapitalOps Reset Password Page
 * 
 * Purpose: Allows users to set a new password after clicking a reset link in their email.
 * 
 * Flow:
 * 1. User clicks reset link from email (contains token in URL query param)
 * 2. Token is extracted from ?token= query parameter on page load
 * 3. User enters new password and confirms it
 * 4. Backend validates token and updates password
 * 
 * SECURITY FEATURES:
 * - Tokens are single-use (marked used after successful reset)
 * - Tokens expire after 30 minutes
 * - Password must be at least 6 characters
 * - Client-side validation before submission
 * 
 * States:
 * - Loading: Checking for token in URL
 * - No token: Invalid/missing token error screen
 * - Form: Password entry form
 * - Success: Confirmation screen after password changed
 * 
 * Related Pages:
 * - ForgotPasswordPage: Initial password reset request
 * - AuthPage: Login page after successful reset
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";

/**
 * ResetPasswordPage Component
 * 
 * THREE STATES:
 * 1. success=true: Password successfully changed - show confirmation
 * 2. token is null: No token in URL - show error screen  
 * 3. Form state: Show password entry form
 */
export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  
  // Token extracted from URL query parameter
  const [token, setToken] = useState<string | null>(null);
  
  // Form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");  // Error message to display
  
  const { toast } = useToast();

  /**
   * Extract reset token from URL on mount
   * 
   * Token comes from email link as ?token=xxx query parameter.
   * If no token in URL, show error state.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided. Please request a new password reset link.");
    }
  }, []);

  /**
   * Handle password reset form submission
   * 
   * Validates:
   * - Token exists
   * - Password is not empty
   * - Password is at least 6 characters
   * - Passwords match
   * 
   * Then sends to backend which:
   * - Validates token (exists, not expired, not used)
   * - Updates user's password
   * - Marks token as used (single-use)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");  // Clear previous errors

    // Validation checks
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
      // Call backend reset-password endpoint
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success - password was reset
        setSuccess(true);
      } else {
        // Server error (invalid/expired token)
        setError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      // Network error
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SUCCESS STATE: Password changed successfully
  // ============================================
  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left side: Success card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              {/* Green checkmark icon */}
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

        {/* Right side: Branding panel */}
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

  // ============================================
  // ERROR STATE: No token in URL
  // ============================================
  if (!token) {
    return (
      <div className="min-h-screen flex">
        {/* Left side: Error card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              {/* Red X icon */}
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
              {/* Link to request new reset */}
              <Button variant="outline" className="w-full" onClick={() => setLocation("/auth/forgot-password")}>
                Request New Link
              </Button>
              {/* Back to login */}
              <Button variant="ghost" className="w-full" onClick={() => setLocation("/auth")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Branding panel */}
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

  // ============================================
  // FORM STATE: Enter new password
  // ============================================
  return (
    <div className="min-h-screen flex">
      {/* Left side: Form card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            {/* CapitalOps branding */}
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
              {/* Error message display */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}
              
              {/* New password input */}
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
              
              {/* Confirm password input */}
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
              
              {/* Submit button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reset Password
              </Button>
            </form>
            
            {/* Back to login link */}
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

      {/* Right side: Branding panel */}
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
