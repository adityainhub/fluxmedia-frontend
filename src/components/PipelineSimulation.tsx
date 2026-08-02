import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Server,
  Database,
  Layers,
  Zap,
  Cpu,
  MonitorPlay,
  Play,
  Pause,
  Film,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { pipelineStages } from "@/components/pipeline-stages";
import { cn } from "@/lib/utils";

const TRAVEL_MS = 1500;
/**
 * Per-stage dwell. SQS and Lambda run scripted sub-sequences (a message
 * queueing up, then an ECS task booting), so they need longer on screen.
 */
const DWELL_MS = [2000, 2000, 3600, 3400, 2800, 2400];
/** After this stage the payload has become an HLS ladder. */
const TRANSCODE_STEP = 4;

const BOX_W = 340;
/** Where the payload card hovers relative to a service, so it never covers the box. */
const HOVER_DY = -152;

/**
 * Services float far apart in world space — further than the viewport is wide —
 * so the camera can only ever frame one of them at a time.
 */
const WORLD = { w: 10200, h: 1300 };
const nodes = [
  { x: 800, y: 700 },
  { x: 2400, y: 420 },
  { x: 4000, y: 780 },
  { x: 5600, y: 400 },
  { x: 7200, y: 760 },
  { x: 8800, y: 480 },
];

type Phase = "travel" | "process";

interface BodyProps {
  active: boolean;
  animate: boolean;
  live: boolean;
}

/* ------------------------------------------------------------------ */
/* Service internals — each box shows what that service actually does  */
/* ------------------------------------------------------------------ */

const ApiBody = ({ active }: BodyProps) => (
  <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
    <div className="text-muted-foreground">POST /api/video/upload-url</div>
    <motion.div animate={{ opacity: active ? 1 : 0.3 }} transition={{ duration: 0.3 }} className="text-primary">
      200 → presignedUrl
    </motion.div>
    <motion.div
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="text-muted-foreground"
    >
      status = UPLOADED
    </motion.div>
  </div>
);

const S3Body = ({ active, animate }: BodyProps) => (
  <div className="flex h-full flex-col justify-center gap-2.5">
    <div className="flex items-end gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          animate={{
            height: active && i === 2 ? 30 : 16,
            backgroundColor: active && i === 2 ? "hsl(var(--primary))" : "hsl(var(--secondary))",
          }}
          transition={{ duration: animate ? 0.35 : 0 }}
        />
      ))}
    </div>
    <div className="truncate font-mono text-[11px] text-muted-foreground">
      raw-videos/1042-keynote.mp4
    </div>
    <motion.div
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
      className="font-mono text-[11px] text-primary"
    >
      ObjectCreated → EventBridge
    </motion.div>
  </div>
);

/**
 * A real queue: a cylinder seen side-on. Messages drop into the open mouth on
 * the left, line up along the tube, and are pulled out of the right rim by Lambda.
 */
const SqsBody = ({ active, animate, live }: BodyProps) => {
  const [items, setItems] = useState([1, 2, 3]);
  const nextId = useRef(4);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setItems((prev) => [nextId.current++, ...prev.slice(0, -1)]);
    }, 1400);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>enqueue ↓</span>
        <span className={cn(active && "text-primary")}>ReceiveMessage →</span>
      </div>

      {/* The cylinder */}
      <div className="relative h-[54px] w-full">
        {/* Tube barrel, shaded top-to-bottom so it reads as round */}
        <div
          className="absolute inset-y-0 left-3 right-4 border-y border-border/70"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--secondary)/0.75) 26%, hsl(var(--secondary)/0.5) 52%, hsl(var(--background)) 100%)",
          }}
        />
        {/* Specular highlight along the top of the barrel */}
        <div className="pointer-events-none absolute left-3 right-4 top-[7px] h-px bg-foreground/15" />

        {/* Far (left) end — where messages drop in */}
        <div className="absolute inset-y-0 left-0 w-6 rounded-[50%] border border-border/70 bg-background" />

        {/* Messages lined up inside the barrel */}
        <div className="absolute inset-y-0 left-6 right-6 flex items-center gap-1.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((id) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.65 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.6 }}
                transition={{ duration: animate ? 0.4 : 0, ease: "easeOut" }}
                className="flex h-8 flex-1 items-center justify-center rounded border border-primary/40 bg-primary/20 shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.6)]"
              >
                <Film className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Near (right) rim — the open mouth Lambda reads from */}
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-7 rounded-[50%] border-2 transition-colors",
            active ? "border-primary/70 bg-background" : "border-border/70 bg-background/80",
          )}
        />

        {/* Lambda reaching in to take the front message */}
        {active && (
          <motion.div
            className="absolute -right-1 top-1/2 z-10 -translate-y-1/2"
            animate={animate ? { x: [6, -2, 6], opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="h-4 w-4 fill-primary text-primary" strokeWidth={2} />
          </motion.div>
        )}
      </div>

      <div className="font-mono text-[11px] text-muted-foreground">
        ApproximateNumberOfMessages: {items.length}
      </div>
    </div>
  );
};

/** ECS task lifecycle the launcher drives after it wins a capacity slot. */
const TASK_STATES = ["PROVISIONING", "PENDING", "RUNNING"] as const;

const LambdaBody = ({ active, animate }: BodyProps) => {
  const [taskState, setTaskState] = useState(-1);

  useEffect(() => {
    if (!active) {
      setTaskState(-1);
      return;
    }
    if (!animate) {
      setTaskState(2);
      return;
    }
    const timers = [
      setTimeout(() => setTaskState(0), 500),
      setTimeout(() => setTaskState(1), 1400),
      setTimeout(() => setTaskState(2), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active, animate]);

  const started = taskState >= 0;
  const running = taskState === 2;

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {/* Concurrency check — the launcher only starts a task if a slot is free */}
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>capacity</span>
        <span className={cn(started && "text-primary")}>{started ? "4" : "3"}/5 tasks</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < 3 || (started && i === 3);
          return (
            <motion.div
              key={i}
              className="h-4 flex-1 rounded-sm border"
              animate={{
                backgroundColor: filled ? "hsl(var(--primary) / 0.3)" : "hsl(var(--secondary))",
                borderColor: started && i === 3 ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              transition={{ duration: animate ? 0.3 : 0 }}
            />
          );
        })}
      </div>

      {/* The ECS task booting up */}
      <motion.div
        className={cn(
          "flex items-center gap-2 rounded-md border px-2.5 py-2 transition-colors",
          running ? "border-success/50 bg-success/10" : "border-border/60 bg-background/60",
        )}
        animate={{
          opacity: started ? 1 : 0.3,
          scale: started ? 1 : 0.96,
        }}
        transition={{ duration: animate ? 0.3 : 0 }}
      >
        {running ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
        ) : (
          <motion.div
            animate={animate && started ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: started ? Infinity : 0, ease: "linear" }}
            className="shrink-0"
          >
            <Loader2 className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          </motion.div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[11px] text-foreground">video-transcoder-task</p>
          <p
            className={cn(
              "truncate font-mono text-[10px]",
              running ? "text-success" : "text-muted-foreground",
            )}
          >
            {started ? TASK_STATES[taskState] : "RunTask →"}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const QUALITIES = ["1440p", "1080p", "720p", "480p", "360p"];

const FargateBody = ({ active, animate }: BodyProps) => (
  <div className="flex h-full flex-col justify-center gap-1.5">
    {QUALITIES.map((q, i) => (
      <div key={q} className="flex items-center gap-2">
        <span className="w-10 shrink-0 font-mono text-[10px] text-muted-foreground">{q}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: active ? "100%" : "0%" }}
            transition={{ duration: animate ? 0.5 : 0, delay: animate && active ? i * 0.12 : 0, ease: "easeOut" }}
          />
        </div>
      </div>
    ))}
  </div>
);

const PlaybackBody = ({ active, animate }: BodyProps) => (
  <div className="flex h-full flex-col justify-center gap-2.5">
    <div className="overflow-hidden rounded-md border border-border/60 bg-background/60 py-3.5">
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ scale: active && animate ? [1, 1.12, 1] : 1 }}
          transition={{ duration: 1.6, repeat: active && animate ? Infinity : 0 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20"
        >
          <Play className="h-3.5 w-3.5 fill-primary text-primary" />
        </motion.div>
      </div>
      <div className="mx-3 mt-2.5 h-1 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: active ? "68%" : "0%" }}
          transition={{ duration: animate ? 1.4 : 0, ease: "linear" }}
        />
      </div>
    </div>
    <div className="flex items-center justify-between font-mono text-[11px]">
      <span className="text-muted-foreground">master.m3u8</span>
      <span className={cn(active ? "text-primary" : "text-muted-foreground")}>auto · 1080p</span>
    </div>
  </div>
);

const machines = [
  { icon: Server, name: "Spring Boot API", Body: ApiBody },
  { icon: Database, name: "Amazon S3", Body: S3Body },
  { icon: Layers, name: "Amazon SQS", Body: SqsBody },
  { icon: Zap, name: "AWS Lambda", Body: LambdaBody },
  { icon: Cpu, name: "ECS Fargate", Body: FargateBody },
  { icon: MonitorPlay, name: "Signed playback", Body: PlaybackBody },
];

/** Deterministic scatter — a fresh Math.random() per render would make stars jitter. */
const useStars = () =>
  useMemo(() => {
    let seed = 20260802;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    return Array.from({ length: 90 }, () => ({
      x: rand() * WORLD.w,
      y: rand() * WORLD.h,
      r: 0.6 + rand() * 1.6,
      o: 0.06 + rand() * 0.16,
    }));
  }, []);

export const PipelineSimulation = () => {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("process");
  const [playing, setPlaying] = useState(true);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const stars = useStars();

  const animate = !reduceMotion;
  const running = playing && animate && inView;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setVp({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(
      () => {
        if (phase === "process") {
          setPhase("travel");
        } else {
          setStep((s) => (s + 1) % machines.length);
          setPhase("process");
        }
      },
      phase === "process" ? DWELL_MS[step] : TRAVEL_MS,
    );
    return () => clearTimeout(t);
  }, [running, phase, step]);

  const goTo = (i: number) => {
    setStep(i);
    setPhase("process");
    setPlaying(false);
  };

  const nextStep = (step + 1) % machines.length;
  const focusIndex = phase === "travel" ? nextStep : step;
  const focus = nodes[focusIndex];
  const transcoded = step >= TRANSCODE_STEP;

  const camera = {
    x: vp.w / 2 - focus.x,
    y: vp.h / 2 - focus.y,
  };
  const cameraTransition = {
    duration: animate ? (phase === "travel" ? TRAVEL_MS / 1000 : 0.5) : 0,
    ease: [0.45, 0, 0.2, 1] as const,
  };

  /** Wraps at the end of the loop, so don't draw a trail back to the start. */
  const drawActiveSegment = phase === "travel" && nextStep === step + 1;

  return (
    <div ref={rootRef}>
      <div
        ref={viewportRef}
        className="relative h-[400px] overflow-hidden rounded-2xl border border-border/60 bg-background/40 md:h-[460px]"
      >
        {/* Vignette so services fade into the dark rather than clipping at the edge */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(ellipse 62% 62% at 50% 50%, transparent 42%, hsl(var(--background)) 100%)",
          }}
          aria-hidden="true"
        />

        <motion.div
          className="absolute left-0 top-0"
          style={{ width: WORLD.w, height: WORLD.h }}
          animate={camera}
          transition={cameraTransition}
        >
          {/* Open space: drifting stars + the traced route */}
          <svg
            className="absolute left-0 top-0"
            width={WORLD.w}
            height={WORLD.h}
            aria-hidden="true"
          >
            {stars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="hsl(var(--foreground))" opacity={s.o} />
            ))}

            {/* Faint full route — the map of where the payload will go */}
            {nodes.slice(0, -1).map((n, i) => {
              const m = nodes[i + 1];
              return (
                <line
                  key={`route-${i}`}
                  x1={n.x}
                  y1={n.y + HOVER_DY}
                  x2={m.x}
                  y2={m.y + HOVER_DY}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 9"
                  opacity={0.13}
                />
              );
            })}

            {/* Already-travelled segments */}
            {nodes.slice(0, -1).map((n, i) => {
              if (i >= step) return null;
              const m = nodes[i + 1];
              return (
                <line
                  key={`done-${i}`}
                  x1={n.x}
                  y1={n.y + HOVER_DY}
                  x2={m.x}
                  y2={m.y + HOVER_DY}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  opacity={0.42}
                />
              );
            })}

            {/* The segment being traced right now, drawn in behind the card */}
            {drawActiveSegment && (
              <motion.line
                key={`live-${step}`}
                x1={nodes[step].x}
                y1={nodes[step].y + HOVER_DY}
                x2={nodes[nextStep].x}
                y2={nodes[nextStep].y + HOVER_DY}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.9 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: animate ? TRAVEL_MS / 1000 : 0, ease: cameraTransition.ease }}
                style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.8))" }}
              />
            )}
          </svg>

          {/* Floating service machines */}
          {machines.map((m, i) => {
            const stage = pipelineStages[i];
            const isActive = phase === "process" && i === step;
            const isDone = i < step;
            const n = nodes[i];
            return (
              <motion.div
                key={stage.id}
                className="absolute"
                style={{ left: n.x - BOX_W / 2, top: n.y - 110, width: BOX_W }}
                animate={{
                  y: animate ? [0, -9, 0] : 0,
                  opacity: isActive || i === focusIndex ? 1 : 0.55,
                }}
                transition={{
                  y: { duration: 7 + i, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5 },
                }}
              >
                <div
                  className={cn(
                    "rounded-xl border bg-card/70 backdrop-blur-md transition-colors duration-300",
                    isActive
                      ? "border-primary/70 shadow-[0_24px_70px_-18px_hsl(var(--primary)/0.75)]"
                      : "border-border/60 shadow-[0_20px_60px_-24px_rgb(0_0_0/0.9)]",
                  )}
                >
                  <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        isActive || isDone
                          ? "border-primary/40 bg-primary/15"
                          : "border-border/60 bg-secondary/60",
                      )}
                    >
                      <m.icon
                        className={cn(
                          "h-4 w-4",
                          isActive || isDone ? "text-primary" : "text-muted-foreground",
                        )}
                        strokeWidth={1.9}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.name}</p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground">{stage.tag}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                  </div>
                  <div className="h-[118px] px-4 py-3">
                    <m.Body active={isActive || isDone} animate={animate} live={running} />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* The payload, tracing its way between services */}
          <motion.div
            className="absolute z-10"
            style={{ left: -66, top: -26 }}
            animate={{
              x: focus.x,
              y: focus.y + HOVER_DY,
              opacity: phase === "travel" ? 1 : 0.35,
              scale: phase === "travel" ? 1 : 0.75,
            }}
            transition={{
              x: cameraTransition,
              y: cameraTransition,
              opacity: { duration: animate ? 0.35 : 0 },
              scale: { duration: animate ? 0.35 : 0 },
            }}
            aria-hidden="true"
          >
            <div className="flex w-[132px] items-center gap-2 rounded-lg border border-primary/60 bg-card px-2.5 py-2 shadow-[0_10px_34px_-6px_hsl(var(--primary)/0.8)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/20">
                <Film className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] font-medium text-foreground">
                  {transcoded ? "master.m3u8" : "keynote.mp4"}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {transcoded ? "5 renditions" : "412 MB"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Where we are in the journey */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
            {step + 1} / {machines.length} · {machines[step].name}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

        <div className="flex items-center gap-1.5">
          {machines.map((m, i) => (
            <button
              key={pipelineStages[i].id}
              onClick={() => goTo(i)}
              aria-label={`Step ${i + 1}: ${m.name}`}
              aria-current={i === step ? "step" : undefined}
              className="group grid h-11 w-6 place-items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-border group-hover:bg-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
