import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  Server,
  Database,
  Layers,
  Zap,
  Cpu,
  Monitor,
  RadioTower,
  Play,
  Pause,
  Film,
  Loader2,
  CheckCircle2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRAVEL_MS = 900;
/** From this hop on, the media on the wire is the HLS ladder, not the source file. */
const TRANSCODE_STEP = 9;
/** Index of the final hop, after which the client holds a playable stream. */
const FINAL_STEP = 13;

const CANVAS = { w: 1200, h: 470 };
const CARD_W = 178;
const HUB_W = 196;

const flight: Transition = { duration: TRAVEL_MS / 1000, ease: [0.45, 0, 0.2, 1] };
const snappy: Transition = { type: "spring", stiffness: 260, damping: 26 };

const bodyVariants: Variants = {
  idle: {},
  active: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};
const rowVariants: Variants = {
  idle: { opacity: 0, y: 4 },
  active: { opacity: 1, y: 0, transition: snappy },
};

interface BodyProps {
  animate: boolean;
  live: boolean;
  status?: string;
}

/* -------------------------- machine internals --------------------------- */

const ClientBody = ({ status }: BodyProps) => (
  <div className="space-y-1.5">
    <motion.div
      variants={rowVariants}
      className="flex items-center gap-1.5 rounded border border-border/60 bg-background/60 px-1.5 py-1"
    >
      <Film className="h-3 w-3 shrink-0 text-primary" strokeWidth={2.5} />
      <span className="truncate font-mono text-[9px] text-foreground">
        {status === "done" ? "master.m3u8" : "keynote.mp4"}
      </span>
    </motion.div>
    <motion.p variants={rowVariants} className="truncate font-mono text-[10px] text-muted-foreground">
      {status === "done" ? "adaptive · 1080p" : "412 MB · ready"}
    </motion.p>
  </div>
);

/** The control plane: shows the status machine it owns. */
const STATUSES = ["UPLOADED", "QUEUED", "PROCESSING", "PROCESSED"];

const ApiBody = ({ status }: BodyProps) => {
  const at = STATUSES.indexOf(status ?? "");
  return (
    <div className="space-y-1.5">
      {STATUSES.map((s, i) => {
        const isNow = i === at;
        const passed = at >= 0 && i < at;
        return (
          <motion.div key={s} variants={rowVariants} className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300",
                isNow ? "bg-primary" : passed ? "bg-primary/40" : "bg-border",
              )}
            />
            <span
              className={cn(
                "truncate font-mono text-[9px] transition-colors duration-300",
                isNow ? "text-primary" : passed ? "text-muted-foreground" : "text-muted-foreground/50",
              )}
            >
              {s}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

const S3Body = (_p: BodyProps) => (
  <div className="space-y-1.5">
    <div className="flex h-5 items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className={cn("h-full flex-1 origin-bottom rounded-sm", i === 2 ? "bg-primary" : "bg-secondary")}
          initial={{ scaleY: 0.45 }}
          animate={{ scaleY: i === 2 ? 1 : 0.45 }}
          transition={snappy}
        />
      ))}
    </div>
    <motion.p variants={rowVariants} className="truncate font-mono text-[9px] text-muted-foreground">
      raw-videos/1042-…
    </motion.p>
    <motion.p variants={rowVariants} className="truncate font-mono text-[9px] text-primary">
      processed-videos/hls
    </motion.p>
  </div>
);

const EventBridgeBody = ({ animate }: BodyProps) => (
  <div className="space-y-1.5">
    <motion.p variants={rowVariants} className="truncate font-mono text-[9px] text-muted-foreground">
      source: aws.s3
    </motion.p>
    <motion.div
      variants={rowVariants}
      className="flex items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-1.5 py-1"
    >
      <motion.span
        animate={animate ? { scale: [1, 1.35, 1], opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
      />
      <span className="truncate font-mono text-[9px] text-primary">Object Created</span>
    </motion.div>
    <motion.p variants={rowVariants} className="truncate font-mono text-[9px] text-muted-foreground">
      → target: /videos/uploaded
    </motion.p>
  </div>
);

/** A real queue: a cylinder seen side-on, drained from the right by Lambda. */
const SqsBody = ({ animate, live }: BodyProps) => {
  const [items, setItems] = useState([1, 2, 3]);
  const nextId = useRef(4);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setItems((p) => [nextId.current++, ...p.slice(0, -1)]), 1300);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div className="space-y-1.5">
      <div className="relative h-[38px] w-full">
        <div
          className="absolute inset-y-0 left-2.5 right-3 border-y border-border/70"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--secondary)/0.8) 28%, hsl(var(--secondary)/0.45) 55%, hsl(var(--background)) 100%)",
          }}
        />
        <div className="pointer-events-none absolute left-2.5 right-3 top-[4px] h-px bg-foreground/15" />
        <div className="absolute inset-y-0 left-0 w-5 rounded-[50%] border border-border/70 bg-background" />
        <div className="absolute inset-y-0 left-5 right-5 flex items-center gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((id) => (
              <motion.span
                key={id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.5 }}
                transition={animate ? snappy : { duration: 0 }}
                className="flex h-5 flex-1 items-center justify-center rounded-sm border border-primary/40 bg-primary/20"
              >
                <Film className="h-2.5 w-2.5 text-primary" strokeWidth={2.5} />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute inset-y-0 right-0 w-6 rounded-[50%] border-2 border-primary/70 bg-background" />
        <motion.span
          className="absolute -right-0.5 top-1/2 z-10 -translate-y-1/2"
          animate={animate ? { x: [5, -2, 5], opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="h-3.5 w-3.5 fill-primary text-primary" strokeWidth={2} />
        </motion.span>
      </div>
      <motion.p variants={rowVariants} className="truncate font-mono text-[9px] text-muted-foreground">
        {items.length} messages waiting
      </motion.p>
    </div>
  );
};

const TASK_STATES = ["PROVISIONING", "PENDING", "RUNNING"] as const;

const LambdaBody = ({ animate }: BodyProps) => {
  const [taskState, setTaskState] = useState(animate ? -1 : 2);

  useEffect(() => {
    if (!animate) return;
    const timers = [
      setTimeout(() => setTaskState(0), 420),
      setTimeout(() => setTaskState(1), 1150),
      setTimeout(() => setTaskState(2), 1950),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const started = taskState >= 0;
  const running = taskState === 2;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "relative h-3 flex-1 overflow-hidden rounded-sm border bg-secondary",
              started && i === 3 ? "border-primary" : "border-border",
            )}
          >
            <motion.span
              className="absolute inset-0 bg-primary/45"
              initial={false}
              animate={{ opacity: i < 3 || (started && i === 3) ? 1 : 0 }}
              transition={snappy}
            />
          </span>
        ))}
      </div>
      <motion.p variants={rowVariants} className="font-mono text-[9px] text-muted-foreground">
        capacity {started ? "4" : "3"}/5
      </motion.p>
      <motion.div
        className={cn(
          "flex items-center gap-1.5 rounded border px-1.5 py-1 transition-colors duration-300",
          running ? "border-success/50 bg-success/10" : "border-border/60 bg-background/60",
        )}
        initial={false}
        animate={{ opacity: started ? 1 : 0.35 }}
        transition={snappy}
      >
        {running ? (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-success" strokeWidth={2.5} />
        ) : (
          <motion.span
            className="shrink-0"
            animate={animate && started ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: started ? Infinity : 0, ease: "linear" }}
          >
            <Loader2 className="h-3 w-3 text-muted-foreground" strokeWidth={2.5} />
          </motion.span>
        )}
        <span
          className={cn(
            "truncate font-mono text-[9px]",
            running ? "text-success" : "text-muted-foreground",
          )}
        >
          {started ? TASK_STATES[taskState] : "RunTask →"}
        </span>
      </motion.div>
    </div>
  );
};

const QUALITIES = ["1440", "1080", "720", "480", "360"];

const FargateBody = ({ animate }: BodyProps) => (
  <div className="space-y-1">
    {QUALITIES.map((q, i) => (
      <div key={q} className="flex items-center gap-1.5">
        <span className="w-6 shrink-0 font-mono text-[9px] text-muted-foreground">{q}p</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.span
            className="block h-full w-full origin-left rounded-full bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: animate ? 0.45 : 0, delay: animate ? i * 0.1 : 0 }}
          />
        </span>
      </div>
    ))}
  </div>
);

/* ------------------------------ topology ------------------------------- */

interface Service {
  id: string;
  name: string;
  tag: string;
  icon: LucideIcon;
  x: number;
  y: number;
  hub?: boolean;
  Body: (p: BodyProps) => JSX.Element;
}

/**
 * Hexagonal ring of AWS services around the Spring Boot control plane. The
 * backend sits at the centre because it genuinely is the hub: the client, the
 * event bus and the transcoding workers all call back into it.
 */
const services: Service[] = [
  { id: "client", name: "Client", tag: "Browser", icon: Monitor, x: 200, y: 290, Body: ClientBody },
  { id: "s3", name: "Amazon S3", tag: "Object storage", icon: Database, x: 400, y: 160, Body: S3Body },
  { id: "events", name: "EventBridge", tag: "Event bus", icon: RadioTower, x: 800, y: 160, Body: EventBridgeBody },
  { id: "sqs", name: "Amazon SQS", tag: "Job queue", icon: Layers, x: 1000, y: 290, Body: SqsBody },
  { id: "lambda", name: "AWS Lambda", tag: "Launcher", icon: Zap, x: 800, y: 420, Body: LambdaBody },
  { id: "fargate", name: "ECS Fargate", tag: "FFmpeg worker", icon: Cpu, x: 400, y: 420, Body: FargateBody },
  { id: "api", name: "Spring Boot", tag: "Control plane", icon: Server, x: 600, y: 290, hub: true, Body: ApiBody },
];

const byId = Object.fromEntries(services.map((s) => [s.id, s]));

/** Every physical link in the architecture, drawn permanently. */
const wires: [string, string][] = [
  ["client", "s3"],
  ["s3", "events"],
  ["sqs", "lambda"],
  ["lambda", "fargate"],
  ["fargate", "s3"],
  // spokes into the control plane
  ["client", "api"],
  ["events", "api"],
  ["api", "sqs"],
  ["fargate", "api"],
  ["api", "s3"],
];

const wireKey = (a: string, b: string) => [a, b].sort().join("~");

interface Step {
  from: string;
  to: string;
  label: string;
  status?: string;
  dwell: number;
  /**
   * What is physically on the wire. Defaults to the video payload; set for
   * hops that carry a request or command rather than media, so the packet
   * never claims to be a 412 MB file when it's a DELETE.
   */
  cargo?: { icon: LucideIcon; title: string; sub: string };
}

const CARGO = {
  event: { icon: RadioTower, title: "ObjectCreated", sub: "event · 2 KB" },
  message: { icon: Layers, title: "{ videoId, s3Key }", sub: "SQS message" },
  invoke: { icon: Zap, title: "RunTask", sub: "task definition" },
  callback: { icon: Server, title: "HMAC callback", sub: "X-ECS-Signature" },
  uploadUrlRequest: { icon: Monitor, title: "POST /upload-url", sub: "request · JSON" },
  request: { icon: Monitor, title: "GET /download", sub: "poll · JSON" },
  del: { icon: Trash2, title: "DELETE raw", sub: "reclaim storage" },
} satisfies Record<string, { icon: LucideIcon; title: string; sub: string }>;

/**
 * The full call graph, traced from the source:
 * videoUploadController → S3/EventBridge → SQS → lambda-launcher/index.js →
 * ecs_transcoder/index.js → VideoCallbackController → VideoDownloadController.
 */
const steps: Step[] = [
  { from: "client", to: "api", label: "POST /api/video/upload-url", status: "UPLOADED", dwell: 2000, cargo: CARGO.uploadUrlRequest },
  { from: "client", to: "s3", label: "PUT raw bytes · presigned", dwell: 1900 },
  { from: "s3", to: "events", label: "ObjectCreated", dwell: 2000, cargo: CARGO.event },
  { from: "events", to: "api", label: "POST /videos/uploaded", status: "QUEUED", dwell: 2000, cargo: CARGO.event },
  { from: "api", to: "sqs", label: "publish { videoId, s3Key }", dwell: 3000, cargo: CARGO.message },
  { from: "sqs", to: "lambda", label: "invoke · batch of messages", dwell: 2900, cargo: CARGO.message },
  { from: "lambda", to: "fargate", label: "RunTask · ARM64 · 4/5 slots", dwell: 2600, cargo: CARGO.invoke },
  // The worker signals PROCESSING before it does anything else (index.js:16),
  // then pulls the raw object down — RunTask only carried the S3 key.
  { from: "fargate", to: "api", label: "POST /{id}/processing · HMAC", status: "PROCESSING", dwell: 2000, cargo: CARGO.callback },
  { from: "s3", to: "fargate", label: "GET raw object → /tmp", dwell: 2200 },
  { from: "fargate", to: "s3", label: "PUT hls/ segments + master.m3u8", dwell: 3000 },
  { from: "fargate", to: "api", label: "POST /{id}/completed · variants", status: "PROCESSED", dwell: 2200, cargo: CARGO.callback },
  // Raw upload is deleted once variants are safely persisted (VideoService:97).
  { from: "api", to: "s3", label: "DELETE raw object · reclaim", dwell: 2000, cargo: CARGO.del },
  { from: "client", to: "api", label: "GET /{id}/download", dwell: 2000, cargo: CARGO.request },
  { from: "api", to: "client", label: "presigned master.m3u8", dwell: 2300 },
];

/* -------------------------------- card --------------------------------- */

interface CardProps {
  svc: Service;
  isActive: boolean;
  isVisited: boolean;
  animate: boolean;
  live: boolean;
  status?: string;
  onSelect: (id: string) => void;
}

/** Module scope: defining this inline would remount the subtree every render. */
const ServiceCard = ({ svc, isActive, isVisited, animate, live, status, onSelect }: CardProps) => (
  <motion.button
    layout
    onClick={() => onSelect(svc.id)}
    aria-label={`${svc.name} — ${svc.tag}`}
    aria-current={isActive ? "step" : undefined}
    initial={false}
    animate={{ y: isActive ? -12 : 0 }}
    transition={snappy}
    whileHover={{ y: isActive ? -16 : -4 }}
    className={cn(
      "w-full rounded-lg border bg-card/95 text-left backdrop-blur-sm transition-colors duration-300",
      isActive
        ? "border-primary/70 shadow-[0_18px_44px_-14px_hsl(var(--primary)/0.9)]"
        : svc.hub
          ? "border-primary/35 shadow-[0_12px_34px_-16px_hsl(var(--primary)/0.5)]"
          : "border-border/60 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.95)]",
    )}
  >
    <div className="flex items-center gap-2 px-2.5 py-2">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors duration-300",
          isActive || isVisited || svc.hub
            ? "border-primary/40 bg-primary/15"
            : "border-border/60 bg-secondary/60",
        )}
      >
        <svc.icon
          className={cn(
            "h-3 w-3 transition-colors duration-300",
            isActive || isVisited || svc.hub ? "text-primary" : "text-muted-foreground",
          )}
          strokeWidth={2}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold leading-tight">{svc.name}</span>
        <span className="block truncate font-mono text-[9px] text-muted-foreground">{svc.tag}</span>
      </span>
      {svc.hub && (
        <span className="shrink-0 rounded-full border border-primary/40 px-1.5 py-px font-mono text-[8px] text-primary">
          HUB
        </span>
      )}
    </div>

    <AnimatePresence initial={false}>
      {isActive && (
        <motion.div
          key="body"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: animate ? 0.28 : 0, ease: "easeOut" }}
          className="overflow-hidden border-t border-border/60"
        >
          <motion.div className="px-2.5 py-2" variants={bodyVariants} initial="idle" animate="active">
            <svc.Body animate={animate} live={live} status={status} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

/* ------------------------------ component ------------------------------ */

export const PipelineSimulation = () => {
  const [idx, setIdx] = useState(0);
  // Travel first, then process: a hop must be *delivered* before the receiving
  // service wakes up. Running process first lit up the destination before the
  // payload had left the source.
  const [phase, setPhase] = useState<"travel" | "process">("travel");
  const [playing, setPlaying] = useState(true);
  const [scale, setScale] = useState(1);

  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });

  const animate = !reduceMotion;
  const running = playing && animate && inView;
  const step = steps[idx];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / CANVAS.w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(
      () => {
        if (phase === "travel") setPhase("process");
        else {
          setIdx((i) => (i + 1) % steps.length);
          setPhase("travel");
        }
      },
      phase === "travel" ? TRAVEL_MS : step.dwell,
    );
    return () => clearTimeout(t);
  }, [running, phase, idx, step.dwell]);

  const goToService = (id: string) => {
    const found = steps.findIndex((s) => s.to === id);
    if (found >= 0) setIdx(found);
    setPhase("process");
    setPlaying(false);
  };

  const transcoded = idx >= TRANSCODE_STEP;
  const cargo = step.cargo;
  const CargoIcon = cargo?.icon ?? Film;

  /** A hop only "counts" once the payload has actually landed. */
  const arrived = phase === "process";
  const done = steps.slice(0, arrived ? idx + 1 : idx);

  /** Latest status the control plane has reached, so the hub keeps its state. */
  const currentStatus = [...done].reverse().find((s) => s.status)?.status;
  const visited = new Set(done.map((s) => s.to));
  const litWires = new Set(done.map((s) => wireKey(s.from, s.to)));

  const bodyStatus = (svc: Service) =>
    svc.id === "api"
      ? currentStatus
      : svc.id === "client" && idx >= FINAL_STEP && arrived
        ? "done"
        : undefined;

  return (
    <div ref={rootRef}>
      {/* ------------- isometric board (md+) ------------- */}
      <div
        className="relative mx-auto hidden md:block"
        style={{ width: CANVAS.w * scale, height: CANVAS.h * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: CANVAS.w,
            height: CANVAS.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <svg
            className="absolute inset-0"
            width={CANVAS.w}
            height={CANVAS.h}
            viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="isoFade" cx="50%" cy="58%" r="62%">
                <stop offset="30%" stopColor="white" stopOpacity="0.45" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="isoMask">
                <rect width={CANVAS.w} height={CANVAS.h} fill="url(#isoFade)" />
              </mask>
            </defs>

            {/* Isometric ground grid, 2:1 axes */}
            <g mask="url(#isoMask)" stroke="hsl(var(--grid-line))" strokeWidth={1}>
              {Array.from({ length: 26 }, (_, i) => {
                const c = -700 + i * 60;
                return <line key={`a${i}`} x1={0} y1={c} x2={CANVAS.w} y2={c + CANVAS.w / 2} />;
              })}
              {Array.from({ length: 26 }, (_, i) => {
                const c = i * 60;
                return <line key={`b${i}`} x1={0} y1={c} x2={CANVAS.w} y2={c - CANVAS.w / 2} />;
              })}
            </g>

            {/* Every architectural link */}
            {wires.map(([a, b]) => {
              const k = wireKey(a, b);
              const lit = litWires.has(k);
              const isSpoke = a === "api" || b === "api";
              return (
                <line
                  key={k}
                  x1={byId[a].x}
                  y1={byId[a].y}
                  x2={byId[b].x}
                  y2={byId[b].y}
                  stroke={lit ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={lit ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={isSpoke && !lit ? "4 7" : undefined}
                  opacity={lit ? 0.6 : 0.85}
                  style={{ transition: "stroke 400ms ease-out, stroke-width 400ms ease-out" }}
                />
              );
            })}

            {/* The hop being made right now, drawn in step with the packet */}
            {phase === "travel" && (
              <motion.line
                key={`live-${idx}`}
                x1={byId[step.from].x}
                y1={byId[step.from].y}
                x2={byId[step.to].x}
                y2={byId[step.to].y}
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={animate ? flight : { duration: 0 }}
                style={{ filter: "drop-shadow(0 0 5px hsl(var(--primary)/0.9))" }}
              />
            )}

            {/* Isometric pads the cards stand on */}
            {services.map((s) => {
              const on = visited.has(s.id) || s.hub;
              const w = s.hub ? 84 : 68;
              return (
                <polygon
                  key={`pad-${s.id}`}
                  points={`${s.x},${s.y - w / 2} ${s.x + w},${s.y} ${s.x},${s.y + w / 2} ${s.x - w},${s.y}`}
                  fill={on ? "hsl(var(--primary)/0.13)" : "hsl(var(--secondary)/0.5)"}
                  stroke={on ? "hsl(var(--primary)/0.6)" : "hsl(var(--border))"}
                  strokeWidth={1.5}
                  style={{ transition: "fill 400ms ease-out, stroke 400ms ease-out" }}
                />
              );
            })}
          </svg>

          {/* Cards — screen-aligned so the mono text stays crisp */}
          {services.map((s) => (
            <div
              key={s.id}
              className="absolute"
              style={{
                left: s.x - (s.hub ? HUB_W : CARD_W) / 2,
                bottom: CANVAS.h - (s.y - 6),
                width: s.hub ? HUB_W : CARD_W,
                zIndex: s.id === step.to ? 30 : s.hub ? 20 : 10,
              }}
            >
              <ServiceCard
                svc={s}
                isActive={phase === "process" && s.id === step.to}
                isVisited={visited.has(s.id)}
                animate={animate}
                live={running}
                status={bodyStatus(s)}
                onSelect={goToService}
              />
            </div>
          ))}

          {/* The payload riding the wires */}
          <motion.div
            // Remount per hop so the payload starts at the sender instead of
            // sliding back across the board from the previous destination.
            key={idx}
            className="pointer-events-none absolute left-0 top-0 z-40"
            style={{ marginLeft: -58, marginTop: -17, willChange: "transform" }}
            initial={{ x: byId[step.from].x, y: byId[step.from].y, opacity: 0, scale: 0.6 }}
            animate={{
              x: byId[step.to].x,
              y: byId[step.to].y,
              opacity: phase === "travel" ? 1 : 0,
              scale: phase === "travel" ? 1 : 0.5,
            }}
            transition={{
              x: animate ? flight : { duration: 0 },
              y: animate ? flight : { duration: 0 },
              opacity: { duration: animate ? 0.25 : 0 },
              scale: { duration: animate ? 0.25 : 0 },
            }}
            aria-hidden="true"
          >
            <div className="flex w-[132px] items-center gap-1.5 rounded-md border border-primary/60 bg-card px-2 py-1.5 shadow-[0_8px_26px_-4px_hsl(var(--primary)/0.9)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20">
                <CargoIcon className="h-3 w-3 text-primary" strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[10px] font-medium">
                  {cargo ? cargo.title : transcoded ? "master.m3u8" : "keynote.mp4"}
                </span>
                <span className="block truncate font-mono text-[9px] text-muted-foreground">
                  {cargo ? cargo.sub : transcoded ? "5 renditions" : "412 MB"}
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ------------- stacked fallback (< md) ------------- */}
      <div className="space-y-2 md:hidden">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            svc={s}
            isActive={phase === "process" && s.id === step.to}
            isVisited={visited.has(s.id)}
            animate={animate}
            live={running}
            status={bodyStatus(s)}
            onSelect={goToService}
          />
        ))}
      </div>

      {/* ------------- current hop caption ------------- */}
      <div className="mt-6 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: animate ? 0.25 : 0 }}
            className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="font-mono text-[11px] text-muted-foreground">
              {byId[step.from].name} → {byId[step.to].name}
            </span>
            <span className="font-mono text-[11px] text-primary">{step.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ------------- controls ------------- */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          className="gap-2 border-border/60"
          disabled={reduceMotion}
        >
          {playing && animate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing && animate ? "Pause" : "Play"}
        </Button>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <motion.button
              key={`${s.from}-${s.to}-${i}`}
              onClick={() => {
                setIdx(i);
                setPhase("process");
                setPlaying(false);
              }}
              aria-label={`Step ${i + 1}: ${s.label}`}
              aria-current={i === idx ? "step" : undefined}
              className="group grid h-11 w-5 place-items-center"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              transition={snappy}
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === idx ? "w-5 bg-primary" : "w-1.5 bg-border group-hover:bg-muted-foreground",
                )}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
