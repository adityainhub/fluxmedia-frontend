import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Settings, Wifi, WifiOff, Maximize, Minimize } from "lucide-react";

interface Level {
  height: number;
  width: number;
  bitrate: number;
}

interface VideoPlayerProps {
  masterUrl: string;
  title?: string;
  poster?: string;
}

export const VideoPlayer = ({ masterUrl, title, poster }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = auto
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(masterUrl);
      hls.attachMedia(video);

      // When manifest/levels loaded
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        setIsLoading(false);
      });

      // Track resolution changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error - trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error - trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("Fatal error occurred");
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = masterUrl;
      setIsLoading(false);
    } else {
      setError("HLS is not supported in this browser");
      setIsLoading(false);
    }
  }, [masterUrl]);

  const changeQuality = (level: string) => {
    if (!hlsRef.current) return;
    const levelNum = parseInt(level, 10);
    hlsRef.current.currentLevel = levelNum;
    setCurrentLevel(levelNum);
  };

  const formatBitrate = (bitrate: number) => {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  };

  const getCurrentQualityLabel = () => {
    if (currentLevel === -1) return "Auto";
    const level = levels[currentLevel];
    return level ? `${level.height}p` : "Unknown";
  };

  return (
    <Card ref={containerRef} className={`overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl ${isFullscreen ? 'rounded-none border-none' : ''}`}>
      {/* Video Container */}
      <div className={`relative bg-black ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'aspect-video'}`}>
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"
              />
              <p className="text-white/70 text-sm">Loading video...</p>
            </div>
          </motion.div>
        )}

        {/* Error Overlay */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-10"
          >
            <div className="text-center p-4">
              <WifiOff className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-white/90 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          poster={poster}
        />

        {/* Quality Badge Overlay */}
        {!isLoading && !error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-20"
          >
            <Badge 
              variant="secondary" 
              className="bg-black/60 backdrop-blur-sm text-white border-none flex items-center gap-1.5"
            >
              <Wifi className="h-3 w-3" />
              {getCurrentQualityLabel()}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Controls Section */}
      <div className={`p-4 bg-gradient-to-b from-card to-card/80 ${isFullscreen ? 'bg-black/90' : ''}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`font-semibold truncate ${isFullscreen ? 'text-white' : 'text-foreground'}`}>{title}</h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              {isPlaying ? (
                <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                  <Play className="h-3 w-3 mr-1 fill-current" />
                  Playing
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Paused
                </Badge>
              )}
            </div>
          </div>

          {/* Quality Selector & Fullscreen */}
          <div className="flex items-center gap-3">
            {levels.length > 0 && (
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={currentLevel.toString()} 
                  onValueChange={changeQuality}
                >
                  <SelectTrigger className="w-[140px] bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">
                      <div className="flex items-center gap-2">
                        <span>Auto</span>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                    </SelectItem>
                    {levels.map((level, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{level.height}p</span>
                          <span className="text-xs text-muted-foreground">
                            {formatBitrate(level.bitrate)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Fullscreen Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-secondary/50 border-border/50 hover:bg-primary/20 hover:border-primary/50"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Available Qualities */}
        {levels.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Available qualities:</p>
            <div className="flex flex-wrap gap-2">
              {levels.map((level, index) => (
                <motion.button
                  key={index}
                  onClick={() => changeQuality(index.toString())}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    currentLevel === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {level.height}p
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;
