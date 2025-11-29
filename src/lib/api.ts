function normalizeBase(url?: string): string {
  if (!url || url.trim() === "") return "http://localhost:8080";
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    // Default to https for production hosts
    u = `https://${u}`;
  }
  return u.replace(/\/$/, "");
}

const BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL);

export type VideoStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "QUEUED" | "FAILED";

export interface VideoVariant {
  id?: number;
  resolution?: string;
  url?: string;
}

// Download DTOs (from VideoDownloadController)
export interface DownloadVariant {
  quality: string;
  url: string; // presigned temporary URL
  contentType: string;
}

export interface VideoDownloadResponse {
  videoId: number;
  status: string; // Processing state
  message: string;
  variants: DownloadVariant[] | null;
}

export interface Video {
  id: number;
  originalFileName: string;
  s3Key: string;
  contentType: string;
  status: VideoStatus;
  variants?: VideoVariant[];
}

interface PresignedUploadResponse {
  presignedUrl: string;
  s3key: string;
  videoId: string; // backend sends string
}

export async function healthCheck(): Promise<string> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.text();
}

export async function requestPresignedUpload(file: File): Promise<PresignedUploadResponse> {
  const body = { fileName: file.name, contentType: file.type };
  const res = await fetch(`${BASE_URL}/api/video/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`Failed to get upload URL (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function putFileToPresignedUrl(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });
  if (!res.ok) throw new Error(`Upload to S3 failed (${res.status})`);
}

export async function getVideo(id: number): Promise<Video | null> {
  const res = await fetch(`${BASE_URL}/api/videos/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch video (${res.status})`);
  return res.json();
}

export async function getVideosByStatus(status: VideoStatus): Promise<Video[]> {
  const res = await fetch(`${BASE_URL}/api/videos/status/${status}`);
  if (!res.ok) throw new Error(`Failed to fetch videos by status (${res.status})`);
  return res.json();
}

export async function deleteVideo(s3Key: string): Promise<void> {
  const params = new URLSearchParams({ s3Key });
  const res = await fetch(`${BASE_URL}/api/video/delete?${params.toString()}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete video (${res.status})`);
}

// Fetch download links for transcoded variants
export async function getVideoDownloadLinks(id: number): Promise<VideoDownloadResponse | null> {
  const res = await fetch(`${BASE_URL}/api/video/${id}/download`);
  if (res.status === 404) return null; // not found
  if (res.status === 204) {
    return {
      videoId: id,
      status: "NO_CONTENT",
      message: "No variants yet",
      variants: null
    };
  }
  if (res.status === 202) {
    return await res.json(); // processing response body
  }
  if (!res.ok) throw new Error(`Failed to get download links (${res.status})`);
  return await res.json();
}

// Poll helper: resolves when status becomes PROCESSED or FAILED or timeout
export async function pollVideoStatus(id: number, intervalMs = 5000, timeoutMs = 5 * 60 * 1000): Promise<Video | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const video = await getVideo(id);
    if (!video) return null;
    if (video.status === "PROCESSED" || video.status === "FAILED") return video;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error("Polling timed out");
}
