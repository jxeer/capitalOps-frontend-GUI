/**
 * Avatar / file upload helper
 *
 * POSTs to the backend's /api/upload endpoint.
 * No S3 credentials or environment variables required.
 */

const API_BASE = (import.meta.env as any).VITE_BACKEND_URL || "";
const API_KEY = (import.meta.env as any).VITE_COMPAT_API_KEY || "";

/**
 * Upload a file to the backend's /api/upload endpoint.
 * Converts file to base64 and sends as JSON.
 *
 * @param file - The File object to upload
 * @returns { url, key } where url is the base64 data URL to use as image src
 */
export async function uploadToS3(
  file: File,
): Promise<{ url: string; key: string }> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (API_KEY) headers["X-API-Key"] = API_KEY;
        const token = localStorage.getItem("auth_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ imageData: base64, name: file.name }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          reject(new Error(`Upload failed: ${res.statusText} — ${errorText}`));
          return;
        }

        const data = await res.json();
        resolve({ url: data.url, key: data.key ?? file.name });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
