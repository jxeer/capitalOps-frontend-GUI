/**
 * S3 File Upload Configuration
 * 
 * Purpose: Handles file uploads to AWS S3 or local mock storage for development
 * 
 * Approach:
 * - Uses environment variables for configuration
 * - Attempts upload via Express proxy first
 * - Falls back to Flask backend directly on port 3001 if proxy fails
 * - Returns mock URLs for local dev (images are not actually persisted)
 */

// Configuration interface for S3 upload settings
export interface UploadConfig {
  bucketUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

/**
 * Environment variable for S3 bucket URL base (e.g., http://localhost:3001/api)
 * Upload endpoint will be bucketUrl + /upload
 */
const AWS_BUCKET_URL = (import.meta.env as any).VITE_AWS_BUCKET_URL || "";

/**
 * API Key for authentication with the backend
 * Matches COMPAT_API_KEY in backend .env
 */
const COMPAT_API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Flask backend URL for direct fallback (port 3001)
 */
const FLASK_BACKEND_URL = "http://localhost:3001";

/**
 * Asynchronously uploads a file to the configured storage backend
 * 
 * @param file - The File object to upload
 * @param path - The destination path in storage (e.g., "avatars/user-id/filename.jpg")
 * @param config - Optional override configuration for bucketUrl, region, etc.
 * @returns Promise resolving to { url: string, key: string } where url is the accessible URL
 * @throws Error if upload fails or no bucket URL is configured
 */
export async function uploadToS3(file: File, path: string, config?: Partial<UploadConfig>): Promise<{ url: string; key: string }> {
  console.log("[s3.ts] VITE_AWS_BUCKET_URL from env:", AWS_BUCKET_URL);
  
  const bucketUrl = config?.bucketUrl || AWS_BUCKET_URL;
  
  if (!bucketUrl) {
    console.error("[s3.ts] ERROR: No bucketUrl configured!");
    console.error("[s3.ts] config:", config);
    console.error("[s3.ts] AWS_BUCKET_URL:", AWS_BUCKET_URL);
    throw new Error("AWS S3 bucket URL not configured - check .env file in frontend root");
  }
  
  console.log("[s3.ts] Uploading to:", bucketUrl);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  formData.append("contentType", file.type);
  formData.append("fileName", file.name);

  const headers: Record<string, string> = {};
  if (COMPAT_API_KEY) {
    headers["X-API-Key"] = COMPAT_API_KEY;
  }

  let res: Response;
  let data: { url: string; key: string };

  try {
    res = await fetch(`${bucketUrl}/upload`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[s3.ts] Upload via proxy failed: ${res.statusText} - ${errorText}`);
      throw new Error(`Proxy failed`);
    }

    data = await res.json();
    return { url: data.url, key: data.key };
  } catch (error) {
    console.warn("[s3.ts] Proxy upload failed, falling back to Flask backend directly...");
    
    const flaskRes = await fetch(`${FLASK_BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    });

    if (!flaskRes.ok) {
      const errorText = await flaskRes.text();
      throw new Error(`Upload failed: ${flaskRes.statusText} - ${errorText}`);
    }

    const flaskData = await flaskRes.json();
    console.log("[s3.ts] Successfully uploaded via Flask backend fallback");
    return { url: flaskData.url, key: flaskData.key };
  }
}
