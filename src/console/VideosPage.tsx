import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clapperboard,
  MoreHorizontal,
  Play,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { deleteVideo, getMyVideos, Video, VideoStatus } from "@/lib/api";
import { formatBytes, formatDuration, formatDateTime } from "@/lib/format";
import { StatusBadge, isActiveStatus } from "./StatusBadge";

type StatusFilter = "ALL" | VideoStatus;

export default function VideosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [pendingDelete, setPendingDelete] = useState<Video | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const videosQuery = useQuery({
    queryKey: ["videos", "mine"],
    queryFn: getMyVideos,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((v) => isActiveStatus(v.status)) ? 5000 : false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVideo(id),
    onSuccess: () => {
      toast({ title: "Video deleted" });
      queryClient.invalidateQueries({ queryKey: ["videos", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (err) => {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const videos = useMemo(() => videosQuery.data ?? [], [videosQuery.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return videos.filter((v) => {
      const name = (v.fileName || v.originalFileName || "").toLowerCase();
      if (q && !name.includes(q)) return false;
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      return true;
    });
  }, [videos, search, statusFilter]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Videos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {videos.length} video{videos.length === 1 ? "" : "s"} in your library
          </p>
        </div>
        <Link to="/console/upload">
          <Button>
            <UploadCloud className="h-4 w-4 mr-2" /> Upload
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by file name…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PROCESSED">Ready</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="QUEUED">Queued</SelectItem>
            <SelectItem value="UPLOADED">Uploaded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/60 border-border/50 overflow-hidden">
        {videosQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Clapperboard className="h-12 w-12 text-muted-foreground/40 mb-4" />
            {videos.length === 0 ? (
              <>
                <p className="font-medium mb-1">Your library is empty</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video and it will land here, transcoded and ready to stream.
                </p>
                <Link to="/console/upload">
                  <Button variant="outline">Upload your first video</Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No videos match your filters.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((video) => (
                  <TableRow
                    key={video.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/console/videos/${video.id}`)}
                  >
                    <TableCell className="max-w-[280px]">
                      <p className="font-medium truncate">
                        {video.fileName || video.originalFileName || `Video ${video.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {formatBytes(video.sizeBytes)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={video.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground tabular-nums">
                      {formatDuration(video.durationSeconds)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground tabular-nums">
                      {formatBytes(video.sizeBytes)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDateTime(video.uploadedAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/console/videos/${video.id}`)}>
                            <Play className="h-4 w-4 mr-2" />
                            {video.status === "PROCESSED" ? "Watch" : "View details"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setPendingDelete(video)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.fileName || pendingDelete?.originalFileName}" and all of its
              transcoded renditions will be permanently removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
