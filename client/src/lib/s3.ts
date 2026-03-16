export interface UploadConfig {
  bucketUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

export async function uploadToS3(file: File, path: string, config?: Partial<UploadConfig>): Promise<{ url: string; key: string }> {
  const bucketUrl = config?.bucketUrl || process.env.VITE_AWS_BUCKET_URL || "";
  
  if (!bucketUrl) {
    throw new Error("AWS S3 bucket URL not configured");
  }

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
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return { url: data.url, key: data.key };
}
