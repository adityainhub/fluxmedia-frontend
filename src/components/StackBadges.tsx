import { motion } from "framer-motion";
import { Database, Workflow, Zap, Box, Film, Layers, Server } from "lucide-react";

const stack = [
  { icon: Server, label: "Spring Boot 3.5" },
  { icon: Database, label: "Amazon S3" },
  { icon: Workflow, label: "Amazon SQS" },
  { icon: Zap, label: "AWS Lambda" },
  { icon: Box, label: "ECS Fargate (ARM64)" },
  { icon: Film, label: "FFmpeg" },
  { icon: Layers, label: "HLS Adaptive Bitrate" },
];

export const StackBadges = () => {
  return (
    <div className="border-y border-border/60 bg-card/20 py-8">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6">
          The real infrastructure behind every upload
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {stack.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <item.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span className="font-mono text-xs tracking-tight">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
