/**
 * CapitalOps Forgot Password Page
 * 
 * Purpose: Allows users to request a password reset by entering their username or email.
 * 
 * Approach:
 * - Single form accepting username or email (auto-detected by @ symbol)
 * - POSTs to /api/v1/auth/forgot-password endpoint
 * - On success, shows confirmation message with reset link (shown on-screen for debugging)
 * 
 * SECURITY FEATURES:
 * - Backend returns same message regardless of whether account exists (prevents enumeration)
 * - Only users with password_hash can reset (Google OAuth users cannot reset password)
 * - Reset tokens expire after 30 minutes
 * - Tokens are single-use
 * 
 * DEBUG MODE:
 * - When email sending fails (domain not verified), backend returns reset_link in response
 * - This allows testing the full reset flow without working email
 * - In production, user would receive email with link instead
 * 
 * Related Pages:
 * - ResetPasswordPage: Actual password reset form with token
 * - AuthPage: Login page with "Forgot password?" link
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";

/**
 * ForgotPasswordPage Component
 * 
 * Two states:
 * 1. Form state: User enters username/email
 * 2. Submitted state: Shows confirmation and reset link (if debug mode)
 */
export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  
  // Form state
  const [identifier, setIdentifier] = useState("");  // Username or email
  const [loading, setLoading] = useState(false);
  
  // Post-submission state
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);  // Debug: direct reset link
  
  const { toast } = useToast();

  /**
   * Handle form submission
   * 
   * Determines if input is email or username, then sends to appropriate endpoint.
   * On success (200), shows confirmation screen with debug reset link if available.
   * 
   * SECURITY:
   * - Backend always returns 200 to prevent username enumeration
   * - Only users with password_hash can receive reset links
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input provided
    if (!identifier) {
      toast({ title: "Please enter your username or email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Detect if input is email or username (email contains @)
      const isEmail = identifier.includes("@");
      const body = isEmail
        ? { email: identifier }
        : { username: identifier };

      // Call backend forgot password endpoint
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      // Debug: Store reset link if returned (when email sending fails)
      if (data.reset_link) {
        setResetLink(data.reset_link);
      }
      
      // Always show success screen (even if account doesn't exist - security)
      setSubmitted(true);
    } catch {
      // Network error - couldn't reach backend
      toast({ title: "Network error", description: "Could not connect to server", variant: "destructive" });
      setLoading(false);
    }
  };

  // ============================================
  // SUBMITTED STATE: Show confirmation screen
  // ============================================
  if (submitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left side: Confirmation card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              {/* CapitalOps branding */}
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
            
            {/* Debug: Show reset link when email sending fails */}
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
  // FORM STATE: Show input form
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
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your username or email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or email input - auto-detects which */}
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
              
              {/* Submit button with loading state */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Reset Link
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
