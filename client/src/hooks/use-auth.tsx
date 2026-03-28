/**
 * use-auth.tsx - Frontend Authentication Hook
 * 
 * Provides authentication state and actions throughout the React application.
 * This module handles:
 * - User authentication state (logged in user info)
 * - Login/logout/register mutations via React Query
 * - JWT token storage in httpOnly cookies (with localStorage fallback during migration)
 * 
 * IMPORTANT: This file uses the OLD /api/login endpoint (compat layer).
 * The NEW /api/v1/auth/login endpoint is used directly in auth-page.tsx
 * for the MFA flow. This file is kept for backwards compatibility
 * with other parts of the app that may still use login/register.
 * 
 * AUTHENTICATION FLOW:
 * 1. User credentials sent to /api/login
 * 2. Server validates and returns JWT + user data
 * 3. JWT stored in httpOnly cookie AND localStorage for migration period
 * 4. AuthContext provides user state to entire app
 * 5. All authenticated requests include Bearer token (from cookie or localStorage)
 * 
 * DEPRECATION NOTE:
 * The login/register mutations here do NOT support MFA.
 * MFA is handled directly in auth-page.tsx via direct fetch calls
 * to /api/v1/auth/login and /api/v1/auth/login/verify-mfa.
 */

import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, clearAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Backend URL and API key for authentication requests
// VITE_BACKEND_URL: Production backend URL (set in Vercel env vars)
// VITE_COMPAT_API_KEY: Shared secret for /api/* compat layer routes
const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Get auth token from cookie or localStorage fallback.
 * Cookies are httpOnly and more secure; localStorage is a migration fallback.
 */
function getAuthToken(): string | null {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("capitalops_token="));
  if (tokenCookie) {
    return tokenCookie.split("=")[1];
  }
  return localStorage.getItem("auth_token");
}

/**
 * Store auth token in localStorage.
 * 
 * Note: httpOnly cookies cannot be set from JavaScript - they're set by the backend.
 * The backend sets httpOnly; Secure; SameSite=Lax cookie on login response.
 * This function stores the token in localStorage for Bearer token authentication.
 * 
 * @param token - The JWT access token to store
 */
function storeAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

/**
 * Build headers for authenticated API requests.
 * 
 * Includes Content-Type for JSON and optionally the API key header
 * for routes that require it (compat layer).
 */
function getAuthHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

/**
 * User data type returned from authenticated endpoints.
 * 
 * Contains all user profile information including role-based access
 * permissions and profile-specific fields.
 */
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

/**
 * Authentication context type definition.
 * 
 * Provides user state and authentication actions to consuming components.
 */
type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create React context for auth state
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication state.
 * Uses React Query to fetch and cache user data.
 * 
 * State Management:
 * - Queries /api/user on mount to validate JWT and get user data
 * - Stores JWT in localStorage under 'auth_token' key
 * - Provides login/logout/register actions via mutations
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  /**
   * Query to fetch current user from /api/user endpoint.
   * 
   * Called on mount to validate existing JWT and load user profile.
   * - Returns null on 401 (invalid/expired token) and clears cookies/localStorage
   * - staleTime: Infinity prevents unnecessary refetches
   * - retry: false to fail fast on auth errors
   */
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const token = getAuthToken();
      const headers = getAuthHeaders();
      
      // Attach Bearer token if available (from cookie or localStorage)
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${API_BASE}/api/user`, { 
        headers,
        credentials: "include" 
      });
      
      // Handle 401: token invalid or expired - clear all auth state
      // Let the AuthProvider's normal flow handle the redirect
      // (when user becomes null, ProtectedLayout's useEffect will redirect)
      if (res.status === 401) {
        clearAuthToken();
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  /**
   * Login mutation (DEPRECATED - does not support MFA)
   * 
   * Use auth-page.tsx directly for MFA-enabled login.
   * This mutation is kept for backwards compatibility.
   */
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
      // Store JWT in localStorage on successful login
      if (data.accessToken) {
        storeAuthToken(data.accessToken);
      }
      // Update React Query cache and redirect to dashboard
      queryClient.setQueryData(["/api/user"], data.user || data);
      queryClient.invalidateQueries();
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });

  /**
   * Register mutation
   * 
   * Creates new user account and automatically logs them in.
   */
  const registerMutation = useMutation({
    mutationFn: async ({ username, password, email }: { username: string; password: string; email: string }) => {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({ username, password, email }),
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Store JWT in localStorage on successful registration
      if (data.accessToken) {
        storeAuthToken(data.accessToken);
      }
      // Update React Query cache and redirect to dashboard
      queryClient.setQueryData(["/api/user"], data.user || data);
      queryClient.invalidateQueries();
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });

  /**
   * Logout mutation
   * 
   * Clears local auth state and calls /api/logout endpoint.
   * Clears both cookie and localStorage regardless of API success.
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clear all auth state first (cookie and localStorage)
      clearAuthToken();
      try {
        // Call logout endpoint (ignore errors - we still want to clear local state)
        await apiRequest("POST", "/api/logout");
      } catch (e) {
        // Ignore logout API errors
      }
    },
    onSuccess: () => {
      // Clear React Query cache and use client-side navigation to auth page
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      setLocation("/auth");
    },
  });

  // Public login function (wraps mutation)
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Public register function (wraps mutation, includes email)
  const register = async (username: string, password: string, email: string) => {
    await registerMutation.mutateAsync({ username, password, email });
  };

  // Public logout function (wraps mutation)
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * Access authentication state and actions from any component.
 * Must be used within an AuthProvider.
 * 
 * Usage:
 *   const { user, isLoading, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
