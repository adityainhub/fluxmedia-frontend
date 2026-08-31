import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getPublicWatch } from "@/lib/api";
import { formatDuration } from "@/lib/format";

/** Public watch page — no auth, reachable by anyone with a share link. */
const Watch = () => {
  const { token } = useParams();

  const watchQuery = useQuery({
    queryKey: ["public-watch", token],
    queryFn: () => getPublicWatch(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const info = watchQuery.data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header — no marketing nav, just brand + CTA */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <VideoIcon className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30" />
            </div>
            <span className="text-lg font-bold">fluxmedia</span>
          </Link>
          <Link to="/signup">
            <Button size="sm" variant="outline">
              Host your videos <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl w-full">
        {watchQuery.isLoading ? (
          <div className="aspect-video flex items-center justify-center rounded-xl border border-border/50 bg-card/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !info ? (
          <div className="aspect-video flex flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-card/50 text-center px-6">
            <VideoIcon className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-semibold">This video isn't available</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              The link may be wrong, or the owner turned sharing off.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <VideoPlayer
              masterUrl={info.masterUrl}
              title={info.title ?? "Shared video"}
              poster={info.thumbnailUrl ?? undefined}
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground px-1">
              {info.durationSeconds != null && <span>{formatDuration(info.durationSeconds)}</span>}
              {info.sourceResolution && <span>Source {info.sourceResolution}</span>}
              <span>Adaptive HLS streaming</span>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Streamed with</span>
          <Link to="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            fluxmedia
          </Link>
          <span>—</span>
          <Link to="/signup" className="text-primary hover:underline">
            transcode and share your own videos free
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Watch;
