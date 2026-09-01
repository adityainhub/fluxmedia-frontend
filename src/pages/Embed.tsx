import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Hls from "hls.js";
import { getPublicWatch } from "@/lib/api";

/**
 * Chromeless player for <iframe> embeds: fills the viewport, native controls,
 * a small fluxmedia watermark. Deliberately no app chrome, nav, or cards.
 */
const Embed = () => {
  const { token } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const watchQuery = useQuery({
    queryKey: ["public-watch", token],
    queryFn: () => getPublicWatch(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const info = watchQuery.data;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !info?.masterUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(info.masterUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else setError("Playback failed");
        }
      });
      return () => hls.destroy();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = info.masterUrl;
      return;
    }
    setError("HLS is not supported in this browser");
  }, [info?.masterUrl]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {watchQuery.isLoading ? (
        <div className="w-10 h-10 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
      ) : !info || error ? (
        <p className="text-white/70 text-sm px-6 text-center">
          {error ?? "This video isn't available. The link may be wrong, or sharing was turned off."}
        </p>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            poster={info.thumbnailUrl ?? undefined}
            className="w-full h-full object-contain"
            title={info.title ?? "fluxmedia video"}
          />
          <a
            href={`${window.location.origin}/watch/${token}`}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-3 text-[11px] font-semibold tracking-wide text-white/60 hover:text-white bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 transition-colors"
          >
            fluxmedia
          </a>
        </>
      )}
    </div>
  );
};

export default Embed;
