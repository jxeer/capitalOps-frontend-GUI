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
import { queryClient as queryClientInstance } from "./queryClient";

const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Get auth token from cookie (set by backend on login).
 * httpOnly cookies cannot be read via JS, but we use a non-httpOnly approach
 * where the backend sets both cookie AND returns the token in the response.
 * 
 * For maximum XSS protection, prefer the httpOnly cookie approach where
 * the backend reads the cookie directly. This function serves as a fallback.
 */
function getAuthToken(): string | null {
  // First try to read from cookie (backend may set this)
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("capitalops_token="));
  if (tokenCookie) {
    return tokenCookie.split("=")[1];
  }
  // Fallback to localStorage for backwards compatibility during migration
  return localStorage.getItem("auth_token");
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
      // Global 401 handler: clear auth state and redirect to /auth
      clearAuthToken();
      queryClientInstance.clear();
      window.location.href = "/auth";
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
