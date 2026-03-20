/**
 * CapitalOps API Query Client Configuration
 * 
 * Purpose: Provides standardized API request handling and TanStack Query configuration
 * for all data fetching operations in the application.
 * 
 * Approach: 
 * - apiRequest() - Wrapper around fetch with consistent error handling and credentials
 * - getQueryFn() - Creates query functions with automatic 401 handling for authentication
 * - queryClient - Global TanStack Query instance with caching and retry configuration
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { uploadToS3 } from "./s3";

const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Throws error if response status is not OK (2xx)
 * Extracts error message from response body for better debugging
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes HTTP request to API with consistent configuration
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
  const token = localStorage.getItem("auth_token");
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
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const fullUrl = API_BASE + queryKey.join("/");
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
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
