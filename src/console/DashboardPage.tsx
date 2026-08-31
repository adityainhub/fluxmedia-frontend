import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, CheckCircle2, Clapperboard, HardDrive, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyVideos, getUsage, Video } from "@/lib/api";
import { formatBytes, timeAgo } from "@/lib/format";
import { StatusBadge, isActiveStatus } from "./StatusBadge";
import { useAuth } from "@/context/AuthContext";

function uploadsPerDay(videos: Video[], days = 14) {
  const buckets = new Map<string, number>();
  const labels: { key: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
    labels.push({ key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
  }
  for (const v of videos) {
    if (!v.uploadedAt) continue;
    const key = v.uploadedAt.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return labels.map(({ key, label }) => ({ day: label, uploads: buckets.get(key) ?? 0 }));
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-xl">
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-semibold">
        {payload[0].value} upload{payload[0].value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const videosQuery = useQuery({
    queryKey: ["videos", "mine"],
    queryFn: getMyVideos,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((v) => isActiveStatus(v.status)) ? 5000 : false,
  });
  const usageQuery = useQuery({ queryKey: ["usage"], queryFn: getUsage });

  const videos = useMemo(() => videosQuery.data ?? [], [videosQuery.data]);
  const usage = usageQuery.data;
  const chartData = useMemo(() => uploadsPerDay(videos), [videos]);
  const recent = videos.slice(0, 5);
  const activeCount = videos.filter((v) => isActiveStatus(v.status)).length;

  const stats = [
    {
      title: "Videos this month",
      icon: Clapperboard,
      value: usage ? `${usage.videosThisMonth}` : null,
      sub: usage ? `of ${usage.monthlyVideoLimit} on ${usage.planDisplayName}` : null,
      progress: usage ? Math.min(100, (usage.videosThisMonth / usage.monthlyVideoLimit) * 100) : null,
    },
    {
      title: "Storage used",
      icon: HardDrive,
      value: usage ? formatBytes(usage.storageUsedBytes) : null,
      sub: usage ? `of ${formatBytes(usage.storageLimitBytes)}` : null,
      progress: usage ? Math.min(100, (usage.storageUsedBytes / usage.storageLimitBytes) * 100) : null,
    },
    {
      title: "Ready to stream",
      icon: CheckCircle2,
      value: usage ? `${usage.processedVideos}` : null,
      sub: usage ? `of ${usage.totalVideos} total videos` : null,
      progress: null,
    },
    {
      title: "In the pipeline",
      icon: UploadCloud,
      value: videosQuery.isLoading ? null : `${activeCount}`,
      sub: activeCount > 0 ? "processing right now" : "all caught up",
      progress: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your media library.
          </p>
        </div>
        <Link to="/console/upload">
          <Button>
            <UploadCloud className="h-4 w-4 mr-2" /> Upload a video
          </Button>
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-5 bg-card/60 border-border/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {stat.value === null ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
            )}
            {stat.sub && <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>}
            {stat.progress !== null && stat.progress !== undefined && (
              <Progress value={stat.progress} className="h-1.5 mt-3" />
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Uploads chart */}
        <Card className="p-5 bg-card/60 border-border/50 lg:col-span-3">
          <div className="mb-4">
            <h3 className="font-semibold">Uploads — last 14 days</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Videos submitted to the transcoding pipeline per day
            </p>
          </div>
          <div className="h-56">
            {videosQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
                  <Bar
                    dataKey="uploads"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Recent videos */}
        <Card className="p-5 bg-card/60 border-border/50 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent videos</h3>
            <Link
              to="/console/videos"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {videosQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Clapperboard className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No videos yet</p>
              <Link to="/console/upload">
                <Button size="sm" variant="outline">Upload your first video</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-1 -mx-2">
              {recent.map((video) => (
                <li key={video.id}>
                  <Link
                    to={`/console/videos/${video.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {video.fileName || video.originalFileName || `Video ${video.id}`}
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
