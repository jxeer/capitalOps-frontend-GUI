const backendUrl = (import.meta.env as any).VITE_BACKEND_URL;
if (!backendUrl && import.meta.env.NODE_ENV === "production") {
  throw new Error("VITE_BACKEND_URL is not set in production");
}
export const API_BASE_URL = backendUrl || "";
