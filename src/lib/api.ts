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

// ---------------------------------------------------------------------------
// Auth token storage
// ---------------------------------------------------------------------------

const TOKEN_KEY = "fluxmedia.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Fetch wrapper that attaches the JWT and surfaces backend error messages. */
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    // Session expired — clear it so the app returns to the login screen
    setToken(null);
    window.dispatchEvent(new Event("fluxmedia:unauthorized"));
  }
  return res;
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.clone().json();
    if (data && typeof data.message === "string") return data.message;
  } catch {
    /* not json */
  }
  try {
    const text = await res.text();
    if (text) return text;
  } catch {
    /* ignore */
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VideoStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "QUEUED" | "FAILED";

export interface VideoVariant {
  quality?: string;
  s3Key?: string;
  contentType?: string;
}

export interface DownloadVariant {
  quality: string;
  url: string; // presigned temporary URL
  contentType: string;
}

export interface VideoDownloadResponse {
  videoId: number;
  status: string;
  message: string;
  variants: DownloadVariant[] | null;
}

export interface Video {
  id: number;
  fileName?: string;
  originalFileName?: string;
  s3Key: string;
  contentType: string;
  status: VideoStatus;
  variants?: VideoVariant[];
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  sourceResolution?: string | null;
  shareToken?: string | null;
  uploadedAt?: string | null;
  processedAt?: string | null;
}

export interface PublicWatchInfo {
  title: string | null;
  durationSeconds: number | null;
  sourceResolution: string | null;
  masterUrl: string;
  thumbnailUrl: string | null;
  urlExpiresInSeconds: number;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  plan: "FREE" | "CREATOR" | "SCALE";
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UsageResponse {
  plan: string;
  planDisplayName: string;
  videosThisMonth: number;
  monthlyVideoLimit: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  maxFileSizeBytes: number;
  totalVideos: number;
  processedVideos: number;
  failedVideos: number;
}

export interface ApiKeyInfo {
  id: number;
  name: string;
  prefix: string;
  revoked: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
  plaintextKey: string | null; // only present right after creation
}

interface PresignedUploadResponse {
  presignedUrl: string;
  s3key: string;
  videoId: string; // backend sends string
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const res = await authFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Sign up failed"));
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await authFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Invalid email or password"));
  return res.json();
}

export async function getMe(): Promise<AuthUser> {
  const res = await authFetch("/api/auth/me");
  if (!res.ok) throw new ApiError(res.status, "Not signed in");
  return res.json();
}

export async function verifyEmail(token: string): Promise<void> {
  const res = await authFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Verification failed"));
}

export async function resendVerification(): Promise<void> {
  const res = await authFetch("/api/auth/resend-verification", { method: "POST" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Couldn't send the email"));
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await authFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Request failed"));
}

/** Consumes the emailed reset token; returns a fresh signed-in session. */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  const res = await authFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Reset failed"));
  return res.json();
}

// ---------------------------------------------------------------------------
// Account / usage / API keys
// ---------------------------------------------------------------------------

export async function getUsage(): Promise<UsageResponse> {
  const res = await authFetch("/api/account/usage");
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to load usage"));
  return res.json();
}

export async function listApiKeys(): Promise<ApiKeyInfo[]> {
  const res = await authFetch("/api/account/api-keys");
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to load API keys"));
  return res.json();
}

export async function createApiKey(name: string): Promise<ApiKeyInfo> {
  const res = await authFetch("/api/account/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to create API key"));
  return res.json();
}

export async function revokeApiKey(id: number): Promise<void> {
  const res = await authFetch(`/api/account/api-keys/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to revoke API key"));
}

// ---------------------------------------------------------------------------
// Billing (Razorpay)
// ---------------------------------------------------------------------------

export interface BillingStatus {
  plan: string;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  paymentsConfigured: boolean;
}

export interface CheckoutInfo {
  subscriptionId: string;
  keyId: string;
  plan: string;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const res = await authFetch("/api/billing/status");
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to load billing status"));
  return res.json();
}

export async function createCheckout(plan: string): Promise<CheckoutInfo> {
  const res = await authFetch("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to start checkout"));
  return res.json();
}

export async function verifyPayment(payload: {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}): Promise<BillingStatus> {
  const res = await authFetch("/api/billing/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Payment verification failed"));
  return res.json();
}

export async function cancelSubscription(): Promise<BillingStatus> {
  const res = await authFetch("/api/billing/cancel", { method: "POST" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to cancel subscription"));
  return res.json();
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export async function healthCheck(): Promise<string> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.text();
}

export async function requestPresignedUpload(file: File): Promise<PresignedUploadResponse> {
  const body = { fileName: file.name, contentType: file.type, sizeBytes: String(file.size) };
  const res = await authFetch("/api/video/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readError(res, `Failed to get upload URL (${res.status})`));
  }
  return res.json();
}

/** PUT the file straight to S3 with real progress reporting (XHR exposes upload progress). */
export function putFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload to S3 failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload to S3 failed (network error)"));
    xhr.send(file);
  });
}

export async function getVideo(id: number): Promise<Video | null> {
  const res = await authFetch(`/api/videos/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, await readError(res, `Failed to fetch video (${res.status})`));
  return res.json();
}

export async function getMyVideos(): Promise<Video[]> {
  const res = await authFetch("/api/videos/mine");
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to load videos"));
  return res.json();
}

export async function deleteVideo(id: number): Promise<void> {
  const res = await authFetch(`/api/video/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, `Failed to delete video (${res.status})`));
}

export async function getVideoDownloadLinks(id: number): Promise<VideoDownloadResponse | null> {
  const res = await authFetch(`/api/video/${id}/download`);
  if (res.status === 404) return null;
  if (res.status === 204) {
    return { videoId: id, status: "NO_CONTENT", message: "No variants yet", variants: null };
  }
  if (res.status === 202) {
    return await res.json(); // still processing
  }
  if (!res.ok) throw new ApiError(res.status, await readError(res, `Failed to get download links (${res.status})`));
  return await res.json();
}

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

export async function enableShare(id: number): Promise<string> {
  const res = await authFetch(`/api/video/${id}/share`, { method: "POST" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to enable sharing"));
  const data: { shareToken: string } = await res.json();
  return data.shareToken;
}

export async function disableShare(id: number): Promise<void> {
  const res = await authFetch(`/api/video/${id}/share`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to disable sharing"));
}

/** Public, unauthenticated — powers the /watch and /embed pages. */
export async function getPublicWatch(token: string): Promise<PublicWatchInfo | null> {
  const res = await fetch(`${BASE_URL}/api/public/watch/${encodeURIComponent(token)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, await readError(res, "Failed to load video"));
  return res.json();
}

// ---------------------------------------------------------------------------
// Contact form (public)
// ---------------------------------------------------------------------------

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitContactForm(data: ContactFormData): Promise<ContactFormResponse> {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response: ContactFormResponse = await res.json();
  return response;
}
