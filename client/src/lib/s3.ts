export interface UploadConfig {
  bucketUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

const AWS_BUCKET_URL = (import.meta.env as any).VITE_AWS_BUCKET_URL || "";

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

  const res = await fetch(`${bucketUrl}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.statusText} - ${errorText}`);
  }

  const data = await res.json();
  return { url: data.url, key: data.key };
}
