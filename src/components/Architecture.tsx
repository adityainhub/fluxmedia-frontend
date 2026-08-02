import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PipelineSimulation } from "@/components/PipelineSimulation";
import { pipelineStages } from "@/components/pipeline-stages";

export const Architecture = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary font-mono">
            Pipeline
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            One upload, six real cloud services
          </h2>
          <p className="text-muted-foreground text-lg">
            This is the actual event-driven pipeline that runs on every video — not a diagram we made
            up for the sales page.
          </p>
        </motion.div>

        {/* Animated service simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20"
        >
          <PipelineSimulation />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {pipelineStages.map((stage, index) => {
            const isLastInRow = (index + 1) % 3 === 0;
            return (
              <motion.div
                key={stage.id}
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
                    <span className="font-mono text-xs text-primary">0{index + 1}</span>
                    <h3 className="text-lg font-semibold">{stage.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
                </div>

                {/* Connector: horizontal across desktop rows, vertical on mobile stack */}
                {index < pipelineStages.length - 1 && (
                  <>
                    <div
                      className={`hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 z-10 items-center justify-center w-6 ${
                        isLastInRow ? "lg:hidden" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-4 w-4 text-border" />
                    </div>
                    <div className="flex lg:hidden justify-center py-3" aria-hidden="true">
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
