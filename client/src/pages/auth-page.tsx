import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const { toast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const googleError = urlParams.get("error");

  if (googleError && googleError === "google_failed") {
    Promise.resolve().then(() => {
      toast({ title: "Google sign-in failed", description: "Please try again or use username/password.", variant: "destructive" });
      window.history.replaceState({}, "", "/auth");
    });
  }

  if (user) {
    Promise.resolve().then(() => setLocation("/"));
    return null;
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
            <CardTitle className="text-2xl" data-testid="text-auth-title">
              {mode === "login" ? "Sign in to CapitalOps" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access the platform"
                : "Register a new account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleSignInButton />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-primary font-medium hover:underline"
                    data-testid="button-switch-register"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                    data-testid="button-switch-login"
                  >
                    Sign in
                  </button>
                </p>
              )}
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
          <div className="space-y-4">
            <Feature title="Capital Engine" desc="Deal pipeline, investor matching, and allocation tracking" />
            <Feature title="Execution Control" desc="Project milestones, budgets, and risk management" />
            <Feature title="Asset & Vendor Control" desc="Vendor management, work orders, and performance" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function GoogleSignInButton() {
  const backendUrl = (import.meta.env as any).VITE_BACKEND_URL || "";
  const googleClientId = (import.meta.env as any).VITE_GOOGLE_CLIENT_ID || "";
  const { login } = useAuth();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!ready) {
      toast({ title: "Google not ready", description: "Please wait and refresh", variant: "destructive" });
      return;
    }
    
    try {
      const { google } = window as any;
      alert("About to call prompt...");
      google.accounts.id.prompt();
      alert("Prompt called");
    } catch (e) {
      alert("Error: " + e);
      toast({ title: "Google sign-in error", description: String(e), variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!googleClientId || !backendUrl) {
      console.log("Missing config:", { googleClientId, backendUrl });
      return;
    }
    
    const checkGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (!response.credential) {
              toast({ title: "No credential received", variant: "destructive" });
              return;
            }
            try {
              const res = await fetch(`${backendUrl}/api/v1/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("user", JSON.stringify(data.user));
                login(data.user, data.accessToken);
                window.location.href = "/";
              } else if (data.error) {
                toast({ title: "Sign-in failed", description: data.error, variant: "destructive" });
              }
            } catch (e) {
              toast({ title: "Network error", description: String(e), variant: "destructive" });
            }
          },
        });
        setReady(true);
      }
    };
    
    checkGoogle();
    const interval = setInterval(checkGoogle, 500);
    return () => clearInterval(interval);
  }, [googleClientId, backendUrl, login, toast]);

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      data-testid="button-google-signin"
      onClick={handleGoogleSignIn}
      disabled={!ready}
    >
      <SiGoogle className="h-4 w-4" />
      {ready ? "Sign in with Google" : "Loading..."}
    </Button>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          data-testid="input-username"
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          data-testid="input-password"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register(username, password);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-username">Username</Label>
        <Input
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          data-testid="input-register-username"
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password (min 6 characters)"
          data-testid="input-register-password"
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirm Password</Label>
        <Input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          data-testid="input-register-confirm"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading} data-testid="button-register">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
