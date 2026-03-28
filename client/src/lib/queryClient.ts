/**
 * CapitalOps API Query Client Configuration
 * 
 * Purpose: Provides standardized API request handling and TanStack Query configuration
 * for all data fetching operations in the application.
 * 
 * Security:
 * - Auth tokens are stored in httpOnly cookies (set by backend on login)
 * - Tokens are read from document.cookie for API requests
 * - Global 401 handler clears auth state and redirects to /auth
 * 
 * Approach: 
 * - apiRequest() - Wrapper around fetch with automatic cookie-based auth and 401 handling
 * - getQueryFn() - Creates query functions with automatic 401 handling for authentication
 * - queryClient - Global TanStack Query instance with caching and retry configuration
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { uploadToS3 } from "./s3";

const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Get auth token from localStorage (primary) or cookie (fallback).
 * 
 * Note: For httpOnly cookies, the browser sends them automatically with fetch
 * when credentials: 'include' is set. However, we use localStorage for the
 * Bearer token approach since we need to read the token in JavaScript.
 * 
 * The httpOnly cookie approach would require the backend to read the cookie
 * directly, but flask-jwt-extended's cookie mode requires specific setup.
 */
function getAuthToken(): string | null {
  // Primary: read from localStorage (where we store after login)
  const localStorageToken = localStorage.getItem("auth_token");
  if (localStorageToken) {
    return localStorageToken;
  }
  // Fallback: try to read from non-httpOnly cookie (if backend set one)
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("capitalops_token="));
  if (tokenCookie) {
    // Split only on first "=" to handle tokens containing "=" characters
    const eqIndex = tokenCookie.indexOf("=");
    const value = tokenCookie.substring(eqIndex + 1);
    return decodeURIComponent(value || "");
  }
  return null;
}

/**
 * Clear auth token from both cookie and localStorage.
 * Called when 401 is received to fully clear auth state.
 */
export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
  document.cookie = "capitalops_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

/**
 * Throw error if response status is not OK (2xx)
 * Extracts error message from response body for better debugging
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes HTTP request to API with consistent configuration and cookie-based auth.
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param url - API endpoint URL
 * @param data - Optional request body for POST/PUT/PATCH
 * @returns Promise that resolves to Response object
 * @throws Error if response status is not OK, with detailed error message
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  const fullUrl = API_BASE + url;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export { uploadToS3 };

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates TanStack Query function factory with authentication handling
 * 
 * @param options.on401 - Behavior when 401 (unauthorized) response received
 * @returns QueryFunction that fetches data with credentials and handles auth errors
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (API_KEY) headers["X-API-Key"] = API_KEY;
    const fullUrl = API_BASE + queryKey.join("/");
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      // Clear auth state on 401 but DON'T auto-redirect - let AuthProvider handle this
      // to avoid window.location.href causing full page reloads and render cycles
      clearAuthToken();
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Global TanStack Query client instance
 * 
 * Configuration:
 * - queries: Infinite stale time (manual refetch only), no retry on failure
 * - mutations: No retry to avoid duplicate operations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
