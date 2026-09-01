import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VideoStatus } from "@/lib/api";
import { CheckCircle2, Clock, Loader2, UploadCloud, XCircle } from "lucide-react";

const config: Record<VideoStatus, { label: string; className: string; Icon: typeof Clock; spin?: boolean }> = {
  UPLOADED: {
    label: "Uploaded",
    className: "bg-secondary text-secondary-foreground border-border",
    Icon: UploadCloud,
  },
  QUEUED: {
    label: "Queued",
    className: "bg-warning/15 text-warning border-warning/30",
    Icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-primary/15 text-primary border-primary/30",
    Icon: Loader2,
    spin: true,
  },
  PROCESSED: {
    label: "Ready",
    className: "bg-success/15 text-success border-success/30",
    Icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    Icon: XCircle,
  },
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const c = config[status] ?? config.UPLOADED;
  const { Icon } = c;
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", c.className)}>
      <Icon className={cn("h-3 w-3", c.spin && "animate-spin")} />
      {c.label}
    </Badge>
  );
}

/** True while the pipeline is still working on the video. */
export function isActiveStatus(status: VideoStatus): boolean {
  return status === "UPLOADED" || status === "QUEUED" || status === "PROCESSING";
}
