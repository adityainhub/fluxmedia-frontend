import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { useAuth } from "@/context/AuthContext";

const faqs = [
  {
    q: "What counts as a video?",
    a: "Each source file you upload counts once toward your monthly quota, regardless of how many renditions the pipeline produces.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes — upgrades apply immediately from the console's billing page, and your quota adjusts for the current month.",
  },
  {
    q: "What formats do you accept?",
    a: "Anything FFmpeg can read: MP4, MOV, MKV, AVI, WebM and more. Output is always HLS with an adaptive quality ladder up to 1440p.",
  },
  {
    q: "Where are videos stored?",
    a: "Renditions are stored in AWS S3 and served through short-lived signed URLs, so your content is never publicly listable.",
  },
];

const Pricing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-28 pb-20 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black_20%,transparent_75%)]" />

      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple, usage-based pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-brand">
            Pricing that scales with you
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when your library grows. Every plan runs the same
            production pipeline — S3, SQS, Fargate, and adaptive HLS.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative p-8 h-full flex flex-col bg-card/60 backdrop-blur-xl transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-primary/60 shadow-xl shadow-primary/10"
                    : "border-border/50"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={user ? "/console/billing" : "/signup"}>
                  <Button
                    size="lg"
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    {user ? "Manage plan" : plan.priceMonthly === 0 ? "Start free" : "Get started"}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.q} className="p-6 bg-card/50 border-border/50">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
