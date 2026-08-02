import { motion } from "framer-motion";
import { Gauge, RefreshCw, Lock, ScalingIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Gauge,
    title: "No upload bottleneck",
    description: "Files go straight from your browser to S3 via a presigned URL — the API server never buffers your video.",
  },
  {
    icon: ScalingIcon,
    title: "Backpressure-aware scaling",
    description: "SQS absorbs upload bursts and the Lambda launcher caps concurrent Fargate tasks, so load never overwhelms the fleet.",
  },
  {
    icon: RefreshCw,
    title: "Built to fail safely",
    description: "Over-capacity jobs are returned to SQS as batch failures and redelivered automatically — no custom retry logic to babysit.",
  },
  {
    icon: Lock,
    title: "Signed at every boundary",
    description: "Uploads use presigned S3 URLs, worker callbacks are HMAC-signed, and playback links are short-lived and scoped per video.",
  },
];

export const Benefits = () => {
  return (
    <section className="py-24 relative bg-card/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineered like production infra</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every design decision here mirrors how a real video platform handles scale, failure, and trust boundaries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
