import { motion } from "framer-motion";
import { UploadCloud, Database, Workflow, Rocket, Cpu, PlayCircle, ArrowRight, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stages = [
  {
    icon: UploadCloud,
    tag: "Frontend",
    title: "Presigned upload",
    description: "Your browser PUTs the file directly to S3 — the raw bytes never touch our servers.",
  },
  {
    icon: Database,
    tag: "S3 + EventBridge",
    title: "Object lands in S3",
    description: "An S3 event confirms the upload and the video row moves to QUEUED.",
  },
  {
    icon: Workflow,
    tag: "Amazon SQS",
    title: "Queued for capacity",
    description: "Jobs wait in SQS so bursts of uploads never overwhelm the worker fleet.",
  },
  {
    icon: Rocket,
    tag: "Lambda Launcher",
    title: "Fargate task launched",
    description: "A Lambda checks running task count and starts an ECS Fargate task within capacity.",
  },
  {
    icon: Cpu,
    tag: "ECS Fargate (ARM64)",
    title: "FFmpeg transcodes",
    description: "Five quality tiers (1440p → 360p) are encoded into HLS segments + a master playlist.",
  },
  {
    icon: PlayCircle,
    tag: "Signed playback",
    title: "Stream anywhere",
    description: "Outputs land in the processed bucket; we mint short-lived URLs for adaptive playback.",
  },
];

export const Architecture = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary font-mono">
            Pipeline
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            One upload, six real cloud services
          </h2>
          <p className="text-muted-foreground text-lg">
            This is the actual event-driven pipeline that runs on every video — not a diagram we made up for the sales page.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {stages.map((stage, index) => {
            const isLastInRow = (index + 1) % 3 === 0;
            return (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className="relative"
              >
                <div className="h-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                      <stage.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {stage.tag}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-mono text-xs text-primary/70">0{index + 1}</span>
                    <h3 className="text-lg font-semibold">{stage.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
                </div>

                {/* Connector: horizontal on desktop rows, vertical on mobile stack */}
                {index < stages.length - 1 && (
                  <>
                    <div
                      className={`hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 z-10 items-center justify-center w-6 ${
                        isLastInRow ? "lg:hidden" : ""
                      }`}
                    >
                      <ArrowRight className="h-4 w-4 text-border" />
                    </div>
                    <div className="flex lg:hidden justify-center py-3">
                      <ArrowDown className="h-4 w-4 text-border" />
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
