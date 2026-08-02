import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Layers3, Cpu, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const highlights = [
  { icon: Layers3, text: "5 adaptive HLS renditions" },
  { icon: Cpu, text: "Auto-scaling Fargate workers" },
  { icon: ShieldCheck, text: "HMAC-signed callbacks" },
];

const stats = [
  { value: "5", label: "HLS renditions per upload" },
  { value: "ARM64", label: "Fargate transcoding workers" },
  { value: "100%", label: "Event-driven, no polling loops" },
];

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Track the hero's own scroll progress, not absolute pixels: an absolute
  // range fades the content out while the full-height section is still on
  // screen, leaving a blank viewport. 0 = hero top at viewport top,
  // 1 = hero fully scrolled past.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  // Fade across the window where the content is actually leaving the viewport:
  // early enough that the fade is visible, late enough that it never empties
  // the hero while it still fills the screen.
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.8], [1, 1, 0]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 16,
        y: (e.clientY / window.innerHeight - 0.5) * 16,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28"
    >
      {/* Cloud-console backdrop: grid + two restrained glows, not decorative confetti */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black_10%,transparent_80%)]" />

        <motion.div
          style={{ x: mousePosition.x, y: mousePosition.y }}
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-primary/20 rounded-full blur-[140px]"
        />
        <motion.div
          style={{ x: -mousePosition.x * 0.6, y: -mousePosition.y * 0.6 }}
          animate={{ opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] bg-orange-600/15 rounded-full blur-[140px]"
        />
      </div>

      <motion.div
        className="container mx-auto px-4"
        style={reduceMotion ? undefined : { y, opacity }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/60 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="text-sm font-mono text-muted-foreground">
              S3 → SQS → Lambda → Fargate → HLS
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
          >
            <span className="block">Video transcoding,</span>
            <span className="block mt-1 text-gradient-brand">built like real infrastructure.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            <span className="font-semibold text-foreground">fluxmedia</span> is an event-driven pipeline —
            not a spinner and a promise. Upload once, and a fleet of Fargate workers turns it into an
            adaptive HLS stream ready for any device.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/upload">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all px-8 py-6 text-base"
                >
                  <span className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Upload a video
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <a href="#architecture">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 bg-background/50 backdrop-blur-sm hover:bg-secondary/50 hover:border-primary/40 transition-all px-8 py-6 text-base"
                >
                  See the pipeline
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 pt-6"
          >
            {highlights.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 hover:border-primary/40 transition-all"
              >
                <item.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto pt-12 border-t border-border/50"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 + index * 0.1, type: "spring", stiffness: 200 }}
                className="text-center pt-8"
              >
                <div className="text-2xl md:text-3xl font-bold font-mono text-primary mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
