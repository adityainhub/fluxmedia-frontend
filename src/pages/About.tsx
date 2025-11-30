import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Users, Zap, Globe, Github, Linkedin, Twitter, Mail } from "lucide-react";

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
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Photo and Socials */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <img 
                      src="/profile.jpg" 
                      alt="Aditya" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
                </div>
                <h3 className="text-xl font-semibold mt-4">Kumar Aditya</h3>
                <p className="text-sm text-muted-foreground mb-4">Creator & Developer</p>
                
                {/* Social Links */}
                <div className="flex gap-3">
                  <a 
                    href="https://github.com/adityainhub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/aditya1502" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://twitter.com/k07aditya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="mailto:k.aditya9599@gmail.com"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Story Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">My Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Hey there! 👋 I'm a college student passionate about cloud computing, distributed systems, and video streaming technologies. <span className="text-foreground font-medium">fluxmedia</span> is my attempt to dive deep into this fascinating domain and learn by building something real.
                  </p>
                  <p>
                    This project started as a way to understand how video transcoding pipelines work — from uploading raw videos to processing them into multiple quality levels and HLS streams for adaptive playback. Every line of code here is a learning experience, and I'm excited to share this journey with you.
                  </p>
                  <p>
                    <span className="text-foreground font-medium">A quick heads up:</span> Some features mentioned on this site are still in development and haven't rolled out yet. The impressive stats? They're aspirational — something to work towards! I've just started, and I'm building this step by step.
                  </p>
                  <p>
                    I'd love for you to try out fluxmedia and share your feedback. Whether it's a bug report, feature suggestion, or just a hello — your input helps me learn and improve. Let's build something awesome together! 🚀
                  </p>
                </div>
              </div>
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
