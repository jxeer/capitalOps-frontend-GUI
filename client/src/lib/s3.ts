/**
 * Avatar / file upload helper
 *
 * POSTs directly to the local /api/upload endpoint.
 * No S3 credentials or environment variables required.
 */

const COMPAT_API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Upload a file to the backend's /api/upload endpoint.
 *
 * @param file   - The File object to upload
 * @param path   - Storage path hint, e.g. "avatar" (optional)
 * @param userId - Current user's ID (optional)
 * @returns { url, key } where url is the base64 data URL to use as image src
 */
export async function uploadToS3(
  file: File,
  path = "avatar",
  userId?: string
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  if (userId) formData.append("userId", userId);

  const headers: Record<string, string> = {};
  if (COMPAT_API_KEY) headers["X-API-Key"] = COMPAT_API_KEY;

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.statusText} — ${errorText}`);
  }

  const data = await res.json();
  return { url: data.url, key: data.key ?? "avatar" };
}
