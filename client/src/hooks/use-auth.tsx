import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

function getAuthHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

type AuthUser = {
  id: string;
  username: string;
  role: string;
  profileType?: string;
  profileStatus?: string;
  profileImage?: string;
  email?: string;
  title?: string;
  organization?: string;
  linkedInUrl?: string;
  bio?: string;
  // General professional fields
  geographicFocus?: string;
  investmentStage?: string;
  targetReturn?: string;
  checkSizeMin?: number;
  checkSizeMax?: number;
  riskTolerance?: "Conservative" | "Moderate" | "Aggressive";
  strategicInterest?: string;
  // Vendor-specific fields
  serviceTypes?: string;
  geographicServiceArea?: string;
  yearsOfExperience?: string;
  certifications?: string;
  averageProjectSize?: number;
  // Developer-specific fields
  developmentFocus?: string;
  developmentType?: string;
  teamSize?: number;
  portfolioValue?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const headers = getAuthHeaders();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/user`, { 
        headers,
        credentials: "include" 
      });
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("auth_token", data.accessToken);
      }
      queryClient.setQueryData(["/api/user"], data.user || data);
      queryClient.invalidateQueries();
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("auth_token", data.accessToken);
      }
      queryClient.setQueryData(["/api/user"], data.user || data);
      queryClient.invalidateQueries();
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth_token");
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      setLocation("/auth");
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (username: string, password: string) => {
    await registerMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
