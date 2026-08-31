import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { disableShare, enableShare, Video } from "@/lib/api";

function buildEmbedSnippet(embedUrl: string): string {
  return `<iframe src="${embedUrl}" width="640" height="360" style="border:0;border-radius:8px;overflow:hidden" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="fluxmedia video player"></iframe>`;
}

export function ShareCard({ video }: { video: Video }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const shared = !!video.shareToken;
  const origin = window.location.origin;
  const watchUrl = video.shareToken ? `${origin}/watch/${video.shareToken}` : null;
  const embedUrl = video.shareToken ? `${origin}/embed/${video.shareToken}` : null;

  const toggleMutation = useMutation({
    mutationFn: async (enable: boolean) => {
      if (enable) return enableShare(video.id);
      await disableShare(video.id);
      return null;
    },
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ["video", video.id] });
      queryClient.invalidateQueries({ queryKey: ["videos", "mine"] });
      toast(
        token
          ? { title: "Sharing enabled", description: "Anyone with the link can watch this video." }
          : { title: "Sharing disabled", description: "The public link no longer works." },
      );
    },
    onError: (err) => {
      toast({
        title: "Couldn't update sharing",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const copy = async (value: string, which: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select and copy manually", variant: "destructive" });
    }
  };

  return (
    <Card className="p-5 bg-card/60 border-border/50">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          {shared ? (
            <Globe className="h-4 w-4 text-success" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="font-semibold">Share</h3>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="share-toggle" className="text-xs text-muted-foreground">
            {shared ? "Public" : "Private"}
          </Label>
          <Switch
            id="share-toggle"
            checked={shared}
            disabled={toggleMutation.isPending}
            onCheckedChange={(checked) => toggleMutation.mutate(checked)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {shared
          ? "Anyone with the link can watch. Turn off to revoke access instantly."
          : "Only you can watch this video. Turn on to get a public link and embed code."}
      </p>

      {shared && watchUrl && embedUrl && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium mb-1.5">Public link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate font-mono text-xs bg-secondary rounded-lg px-3 py-2.5">
                {watchUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copy(watchUrl, "link")}
              >
                {copied === "link" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" className="shrink-0" asChild>
                <a href={watchUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-1.5">Embed on your site</p>
            <div className="relative">
              <pre className="font-mono text-xs bg-secondary rounded-lg px-3 py-2.5 whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
                {buildEmbedSnippet(embedUrl)}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 h-7 px-2"
                onClick={() => copy(buildEmbedSnippet(embedUrl), "embed")}
              >
                {copied === "embed" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
