import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileVideo, Download, Clock, CheckCircle2, XCircle, Sparkles, Zap, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { requestPresignedUpload, putFileToPresignedUrl, getVideo, getVideoDownloadLinks, DownloadVariant } from "@/lib/api";

type FrontendStatus = "UPLOADING" | "UPLOADED" | "QUEUED" | "PROCESSING" | "PROCESSED" | "FAILED";

interface Job {
  id: string;
  fileName: string;
  status: FrontendStatus;
  timestamp: string;
  progress?: number;
  variants?: DownloadVariant[];
  variantsState?: "loading" | "none" | "ready" | "error";
}

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const pollingRefs = useRef<Record<string, number>>({});
  const { toast } = useToast();

  // Simulate upload progress for better UX
  useEffect(() => {
    if (isUploading) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [isUploading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);

    const tempId = `temp-${Date.now()}`;
    setJobs((prev) => [
      {
        id: tempId,
        fileName: selectedFile.name,
        status: "UPLOADING",
        timestamp: "Just now",
      },
      ...prev,
    ]);

    try {
      const presigned = await requestPresignedUpload(selectedFile);
      toast({ title: "Presigned URL received", description: "Uploading your file…" });

      await putFileToPresignedUrl(presigned.presignedUrl, selectedFile);
      setUploadProgress(100);
      toast({ title: "Upload complete", description: "Waiting for processing to start" });

      const realVideoId = presigned.videoId;
      setJobs((prev) => prev.map(job => job.id === tempId ? { ...job, id: realVideoId, status: "UPLOADED" } : job));
      setSelectedFile(null);

      startPolling(realVideoId);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
      setJobs((prev) => prev.map(job => job.id === tempId ? { ...job, status: "FAILED" } : job));
    } finally {
      setIsUploading(false);
    }
  };

  const fetchVariants = async (videoId: string) => {
    setJobs(prev => prev.map(j => j.id === videoId ? { ...j, variantsState: "loading" } : j));
    try {
      const numericId = Number(videoId);
      if (Number.isNaN(numericId)) throw new Error("Invalid video id");
      const resp = await getVideoDownloadLinks(numericId);
      if (!resp) {
        setJobs(prev => prev.map(j => j.id === videoId ? { ...j, variantsState: "error" } : j));
        return;
      }
      if (!resp.variants || resp.variants.length === 0) {
        setJobs(prev => prev.map(j => j.id === videoId ? { ...j, variantsState: "none" } : j));
        return;
      }
      setJobs(prev => prev.map(j => j.id === videoId ? { ...j, variantsState: "ready", variants: resp.variants ?? undefined } : j));
    } catch (e: any) {
      console.error(e);
      setJobs(prev => prev.map(j => j.id === videoId ? { ...j, variantsState: "error" } : j));
    }
  };

  const handleManualRefresh = (videoId: string) => {
    fetchVariants(videoId);
  };

  const startPolling = (videoId: string) => {
    if (pollingRefs.current[videoId]) return;
    const interval = window.setInterval(async () => {
      try {
        const numericId = Number(videoId);
        if (Number.isNaN(numericId)) return;
        const video = await getVideo(numericId);
        if (!video) return;
        const status = video.status as FrontendStatus;
        setJobs(prev => prev.map(j => j.id === videoId ? { ...j, status } : j));
        if (status === "PROCESSED") {
          fetchVariants(videoId);
        }
        if (status === "PROCESSED" || status === "FAILED") {
          clearInterval(interval);
          delete pollingRefs.current[videoId];
          toast({ title: status === "PROCESSED" ? "Processing complete" : "Processing failed" });
        }
      } catch (err) {
        console.warn("Polling error", err);
      }
    }, 5000);
    pollingRefs.current[videoId] = interval;
  };

  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(id => clearInterval(id));
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Transcoding</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Upload & Transform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your video and watch as we transcode it into multiple formats with lightning speed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer"></div>
              <style>{`
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                  animation: shimmer 3s infinite;
                }
              `}</style>

              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Upload Video</h2>
              </div>
              
              {/* Drag & Drop Zone */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                animate={{
                  scale: isDragging ? 1.02 : 1,
                  borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border) / 0.5)",
                }}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all relative group ${
                  isDragging
                    ? "bg-primary/10"
                    : "hover:border-primary/50 hover:bg-secondary/30"
                }`}
              >
                <motion.div
                  animate={{ y: isDragging ? -10 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative inline-block">
                    <UploadIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                  
                  <p className="text-xl font-semibold mb-2">
                    Drag & drop your video here
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Supports MP4, MOV, AVI, and more
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer group-hover:border-primary group-hover:text-primary transition-all" asChild>
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Browse Files
                      </span>
                    </Button>
                  </label>
                </motion.div>
              </motion.div>

              {/* Selected File */}
              <AnimatePresence>
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mt-6 p-5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <FileVideo className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{selectedFile.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                            Ready to process
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Uploading to cloud...</span>
                      <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={uploadProgress} className="h-2.5" />
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/4"
                        animate={{ x: ["0%", "400%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Please don't close this window
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Process Button */}
              <Button
                onClick={handleProcess}
                disabled={!selectedFile || isUploading}
                className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ scale: isUploading ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 1, repeat: isUploading ? Infinity : 0 }}
                >
                  <Zap className="h-5 w-5" />
                  {isUploading ? "Processing..." : "Start Processing"}
                </motion.div>
              </Button>
            </Card>
          </motion.div>

          {/* Job History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Processing Queue</h2>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {jobs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <FileVideo className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No videos yet</p>
                      <p className="text-sm text-muted-foreground/70">Upload a video to get started</p>
                    </motion.div>
                  ) : (
                    jobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="flex-shrink-0 mt-1 p-2 rounded-lg bg-background/50"
                            animate={{
                              rotate: (job.status === "PROCESSING" || job.status === "QUEUED" || job.status === "UPLOADED" || job.status === "UPLOADING") ? 360 : 0
                            }}
                            transition={{ duration: 2, repeat: (job.status === "PROCESSING" || job.status === "QUEUED" || job.status === "UPLOADED" || job.status === "UPLOADING") ? Infinity : 0, ease: "linear" }}
                          >
                            {job.status === "PROCESSED" && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {(job.status === "PROCESSING" || job.status === "QUEUED" || job.status === "UPLOADED" || job.status === "UPLOADING") && (
                              <Clock className="h-5 w-5 text-primary" />
                            )}
                            {job.status === "FAILED" && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </motion.div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate group-hover:text-primary transition-colors">{job.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{job.timestamp}</p>
                            
                            {/* Status messages with animated dots */}
                            {job.status === "UPLOADING" && (
                              <motion.p 
                                className="text-xs text-primary mt-2 flex items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                Uploading to storage
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >...</motion.span>
                              </motion.p>
                            )}
                            {job.status === "UPLOADED" && (
                              <p className="text-xs text-muted-foreground mt-2">✓ Uploaded. Awaiting queue.</p>
                            )}
                            {job.status === "QUEUED" && (
                              <motion.p 
                                className="text-xs text-primary mt-2 flex items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                Queued for processing
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >...</motion.span>
                              </motion.p>
                            )}
                            {job.status === "PROCESSING" && (
                              <motion.p 
                                className="text-xs text-primary mt-2 flex items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <Zap className="h-3 w-3" />
                                Transcoding in progress
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >...</motion.span>
                              </motion.p>
                            )}
                            {job.status === "FAILED" && (
                              <p className="text-xs text-destructive mt-2">✗ Processing failed.</p>
                            )}
                            {job.status === "PROCESSED" && (
                              <p className="text-xs text-green-500 mt-2">✓ Ready for download</p>
                            )}

                            {/* Variants section */}
                            {job.status === "PROCESSED" && (
                              <div className="mt-3">
                                {job.variantsState === undefined && (
                                  <Button size="sm" variant="outline" onClick={() => fetchVariants(job.id)} className="hover:bg-primary/10">
                                    <Download className="h-4 w-4 mr-1" /> Load Downloads
                                  </Button>
                                )}
                                {job.variantsState === "loading" && (
                                  <p className="text-xs text-muted-foreground">Loading variants...</p>
                                )}
                                {job.variantsState === "none" && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">No variants yet</p>
                                    <Button size="sm" variant="outline" onClick={() => handleManualRefresh(job.id)}>Refresh</Button>
                                  </div>
                                )}
                                {job.variantsState === "error" && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-destructive">Failed to load variants</p>
                                    <Button size="sm" variant="outline" onClick={() => handleManualRefresh(job.id)}>Retry</Button>
                                  </div>
                                )}
                                {job.variantsState === "ready" && job.variants && (
                                  <div className="flex flex-wrap gap-2">
                                    {job.variants.map(v => (
                                      <motion.a
                                        key={v.quality}
                                        href={v.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button size="sm" variant="outline" className="hover:bg-primary/10 hover:border-primary">
                                          <Download className="h-4 w-4 mr-1" /> {v.quality}
                                        </Button>
                                      </motion.a>
                                    ))}
                                    <Button size="sm" variant="ghost" onClick={() => handleManualRefresh(job.id)} className="hover:bg-primary/10">
                                      ↻
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: hsl(var(--secondary));
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: hsl(var(--primary) / 0.5);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: hsl(var(--primary));
                }
              `}</style>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;