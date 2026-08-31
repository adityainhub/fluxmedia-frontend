import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { VideoPlayer } from "@/components/VideoPlayer";
import { deleteVideo, getVideo, getVideoDownloadLinks } from "@/lib/api";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/format";
import { StatusBadge, isActiveStatus } from "./StatusBadge";

export default function VideoDetailPage() {
  const { id } = useParams();
  const videoId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const videoQuery = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId),
    enabled: Number.isFinite(videoId),
    refetchInterval: (query) =>
      query.state.data && isActiveStatus(query.state.data.status) ? 5000 : false,
  });

  const video = videoQuery.data;

  const linksQuery = useQuery({
    queryKey: ["video", videoId, "links"],
    queryFn: () => getVideoDownloadLinks(videoId),
    enabled: !!video && video.status === "PROCESSED",
    staleTime: 30 * 60 * 1000, // presigned URLs live for an hour
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteVideo(videoId),
    onSuccess: () => {
      toast({ title: "Video deleted" });
      queryClient.invalidateQueries({ queryKey: ["videos", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      navigate("/console/videos");
    },
    onError: (err) => {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const variants = linksQuery.data?.variants ?? [];
  const masterUrl = variants.find(
    (v) =>
      v.quality.toLowerCase().includes("hls") ||
      v.quality.toLowerCase().includes("master") ||
      v.contentType.includes("mpegurl") ||
      v.url.includes("master.m3u8"),
  )?.url;
  const thumbnailUrl = variants.find(
    (v) => v.quality.toLowerCase().includes("thumbnail") || v.contentType.includes("image"),
  )?.url;

  if (videoQuery.isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-lg font-medium mb-2">Video not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          It may have been deleted, or the link is wrong.
        </p>
        <Link to="/console/videos">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to videos
          </Button>
        </Link>
      </div>
    );
  }

  const name = video.fileName || video.originalFileName || `Video ${video.id}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/console/videos">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{name}</h2>
            <p className="text-xs text-muted-foreground">Uploaded {formatDateTime(video.uploadedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={video.status} />
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/60 border-border/50 overflow-hidden">
            {video.status === "PROCESSED" ? (
              linksQuery.isLoading ? (
                <div className="aspect-video flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : masterUrl ? (
                <VideoPlayer masterUrl={masterUrl} title={name} poster={thumbnailUrl} />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  No playable stream found
                  <Button size="sm" variant="outline" onClick={() => linksQuery.refetch()}>
                    Retry
                  </Button>
                </div>
              )
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3">
                {isActiveStatus(video.status) ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {video.status === "PROCESSING"
                        ? "Transcoding in progress — this page updates automatically"
                        : "Waiting in the pipeline — this page updates automatically"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-destructive">
                    Processing failed. Delete this video and try uploading again.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 bg-card/60 border-border/50">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={video.status} /></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="tabular-nums">{formatDuration(video.durationSeconds)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Source size</dt>
                <dd className="tabular-nums">{formatBytes(video.sizeBytes)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Source resolution</dt>
                <dd>{video.sourceResolution ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Processed</dt>
                <dd>{formatDateTime(video.processedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Video ID</dt>
                <dd className="font-mono text-xs">{video.id}</dd>
              </div>
            </dl>
          </Card>

          {video.status === "PROCESSED" && variants.length > 0 && (
            <Card className="p-5 bg-card/60 border-border/50">
              <h3 className="font-semibold mb-1">Streams & files</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Signed links, valid for 1 hour
              </p>
              <ul className="space-y-2">
                {variants.map((variant) => (
                  <li key={variant.quality}>
                    <a
                      href={variant.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2 text-sm hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                    >
                      <span className="font-medium capitalize">{variant.quality}</span>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              "{name}" and all of its transcoded renditions will be permanently removed.
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
