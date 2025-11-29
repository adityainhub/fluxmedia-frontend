import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Users, Zap, Globe } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Making professional video transcoding accessible to everyone, from indie creators to enterprise platforms.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Building tools that solve real problems with intuitive interfaces and stellar support.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Constantly pushing the boundaries of what's possible with cloud video processing.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Serving creators and businesses worldwide with low-latency, high-availability infrastructure.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-foreground">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transforming Video Delivery
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            fluxmedia was born from a simple idea: video transcoding should be fast, reliable, and accessible to everyone
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We transcode your video into multiple quality levels and HLS streams, optimized for modern devices and networks. Our platform was built by developers who were frustrated with expensive, complex video processing pipelines.
                
              </p>
              <p>
                Today, fluxmedia powers video delivery for thousands of creators and businesses worldwide. From small startups to large enterprises, our customers trust us to handle their most critical video workflows.
              </p>
              <p>
                Our cloud-native architecture ensures scalability and reliability, while our developer-first design makes integration a breeze. Whether you're building a video platform, streaming service, or content management system, fluxmedia has you covered.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* What Makes Us Different */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm border-border/50">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Developers Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5 min</div>
                <p className="text-muted-foreground">Average processing time</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Service uptime SLA</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Developer support</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
