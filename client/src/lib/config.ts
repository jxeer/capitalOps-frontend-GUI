/**
 * Centralized backend API URL configuration.
 * 
 * This module provides a single source of truth for the backend API URL
 * used throughout the frontend application. It validates that the URL is
 * configured in production environments.
 * 
 * IMPORTANT SECURITY:
 * - In production (Vercel), VITE_BACKEND_URL must be set as an environment variable
 * - If not set in production, throws an error to fail fast rather than silently using wrong URL
 * - In development, defaults to empty string (uses relative URLs to localhost)
 * 
 * Environment Variables:
 * - VITE_BACKEND_URL: Full URL to backend API (e.g., https://api.example.com)
 *   Set in client/.env.production for Vercel deployment
 * 
 * Usage:
 *   import { API_BASE_URL } from "@/lib/config";
 *   fetch(`${API_BASE_URL}/api/v1/auth/login`, ...)
 */

// Get backend URL from environment variable (Vite exposes VITE_* vars to client)
const backendUrl = (import.meta.env as any).VITE_BACKEND_URL;

// Production safety check: fail if backend URL is not configured in production
// This prevents the app from silently making requests to wrong/missing backend
if (!backendUrl && import.meta.env.NODE_ENV === "production") {
  throw new Error("VITE_BACKEND_URL is not set in production. Set this environment variable in Vercel project settings.");
}

// Export for use throughout the application
// Defaults to empty string in development (relative URLs to same origin)
export const API_BASE_URL = backendUrl || "";
