import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileVideo, Loader2, UploadCloud, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  getMyVideos,
  getUsage,
  putFileToPresignedUrl,
  requestPresignedUpload,
} from "@/lib/api";
import { formatBytes, timeAgo } from "@/lib/format";
import { StatusBadge, isActiveStatus } from "./StatusBadge";

interface ActiveUpload {
  fileName: string;
  size: number;
  progress: number;
  phase: "requesting" | "uploading" | "done" | "error";
  error?: string;
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<ActiveUpload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usageQuery = useQuery({ queryKey: ["usage"], queryFn: getUsage });
  const videosQuery = useQuery({
    queryKey: ["videos", "mine"],
    queryFn: getMyVideos,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((v) => isActiveStatus(v.status)) ? 5000 : false,
  });

  const usage = usageQuery.data;
  const quotaExhausted = usage ? usage.videosThisMonth >= usage.monthlyVideoLimit : false;
  const activeJobs = (videosQuery.data ?? []).filter((v) => isActiveStatus(v.status));

  const pickFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose a video file",
        variant: "destructive",
      });
      return;
    }
    if (usage && file.size > usage.maxFileSizeBytes) {
      toast({
        title: "File too large",
        description: `Your plan allows files up to ${formatBytes(usage.maxFileSizeBytes)}. Upgrade to raise the limit.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    pickFile(e.dataTransfer.files[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usage]);

  const startUpload = async () => {
    if (!selectedFile || upload?.phase === "uploading" || upload?.phase === "requesting") return;
    const file = selectedFile;
    setUpload({ fileName: file.name, size: file.size, progress: 0, phase: "requesting" });

    try {
      const presigned = await requestPresignedUpload(file);
      setUpload((u) => u && { ...u, phase: "uploading" });

      await putFileToPresignedUrl(presigned.presignedUrl, file, (percent) => {
        setUpload((u) => u && { ...u, progress: percent });
      });

      setUpload((u) => u && { ...u, progress: 100, phase: "done" });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["videos", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      toast({
        title: "Upload complete",
        description: "Your video is queued for transcoding.",
      });
      navigate(`/console/videos/${presigned.videoId}`);
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 402
          ? err.message // plan limit message from the backend
          : err instanceof Error
            ? err.message
            : "Please try again";
      setUpload((u) => u && { ...u, phase: "error", error: message });
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Files go straight to encrypted cloud storage, then through the transcoding pipeline.
        </p>
      </div>

      {usage && (
        <Card
          className={`p-4 border ${
            quotaExhausted ? "border-destructive/40 bg-destructive/5" : "border-border/50 bg-card/60"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-medium">
                {usage.videosThisMonth} of {usage.monthlyVideoLimit}
              </span>{" "}
              <span className="text-muted-foreground">
                videos used this month on the {usage.planDisplayName} plan · max file size{" "}
                {formatBytes(usage.maxFileSizeBytes)}
              </span>
            </div>
            {quotaExhausted && (
              <Link to="/console/billing">
                <Button size="sm" variant="outline">Upgrade plan</Button>
              </Link>
            )}
          </div>
          <Progress
            value={Math.min(100, (usage.videosThisMonth / usage.monthlyVideoLimit) * 100)}
            className="h-1.5 mt-3"
          />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/60 border-border/50">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/50 hover:bg-secondary/30"
            }`}
          >
            <UploadCloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-semibold mb-1">Drag & drop your video here</p>
            <p className="text-sm text-muted-foreground mb-5">MP4, MOV, MKV, AVI, WebM and more</p>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              Browse files
            </Button>
          </div>

          {selectedFile && (
            <div className="mt-5 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
              <div className="p-2.5 bg-primary/15 rounded-lg shrink-0">
                <FileVideo className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {upload && upload.phase !== "done" && upload.phase !== "error" && (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {upload.phase === "requesting" ? "Preparing upload…" : "Uploading to cloud…"}
                </span>
                <span className="font-semibold text-primary tabular-nums">{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">Keep this tab open until the upload finishes</p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full mt-6"
            disabled={
              !selectedFile ||
              quotaExhausted ||
              upload?.phase === "uploading" ||
              upload?.phase === "requesting"
            }
            onClick={startUpload}
          >
            {upload?.phase === "uploading" || upload?.phase === "requesting" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…
              </>
            ) : quotaExhausted ? (
              "Monthly limit reached"
            ) : (
              "Start upload"
            )}
          </Button>
        </Card>

        <Card className="p-6 bg-card/60 border-border/50">
          <h3 className="font-semibold mb-4">Pipeline activity</h3>
          {videosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">
                Nothing processing right now. Uploads appear here while they move through the
                pipeline.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {activeJobs.map((video) => (
                <li key={video.id}>
                  <Link
                    to={`/console/videos/${video.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {video.fileName || video.originalFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(video.uploadedAt)}</p>
                    </div>
                    <StatusBadge status={video.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
