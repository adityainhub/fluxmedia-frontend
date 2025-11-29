import { motion } from "framer-motion";
import { Shield, Zap, Code, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Cloud-native infrastructure ensures rapid processing with average turnaround under 5 minutes.",
  },
  {
    icon: Shield,
    title: "Enterprise Grade",
    description: "99.9% uptime SLA with redundant systems and automatic failover for mission-critical workflows.",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "RESTful API with comprehensive SDKs in multiple languages. Integrate in minutes, not days.",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "CDN-optimized delivery ensures your streams load instantly anywhere in the world.",
  },
];

export const Benefits = () => {
  return (
    <section className="py-24 relative bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose fluxmedia</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for scale, designed for developers, trusted by creators worldwide
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
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
