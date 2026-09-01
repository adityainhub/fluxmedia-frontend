import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Lock, Mail, MessageCircle, Server, Twitter, Wallet } from "lucide-react";

const values = [
  {
    icon: Server,
    title: "Real infrastructure, not a wrapper",
    description:
      "Presigned uploads to S3, SQS for backpressure, and FFmpeg on Fargate. Every account runs on the same pipeline — there is no cut-down tier.",
  },
  {
    icon: Lock,
    title: "Private by default",
    description:
      "Your videos are visible only to you until you explicitly share them. Playback runs on short-lived signed URLs, and raw uploads are deleted once processing succeeds.",
  },
  {
    icon: MessageCircle,
    title: "You talk to the person who built it",
    description:
      "Support isn't a ticket queue. Email goes to me, and answers come from whoever actually wrote the code — because that's the same person.",
  },
  {
    icon: Wallet,
    title: "Start free, upgrade when it matters",
    description:
      "The free plan is a real plan, not a trial that expires. Move up only when your volume genuinely outgrows it.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black_15%,transparent_70%)]" />
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-foreground">About</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            A small product, built carefully
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            fluxmedia exists because getting adaptive streaming right shouldn't require
            standing up an encoding pipeline of your own.
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
                      alt="Kumar Aditya"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
                </div>
                <h3 className="text-xl font-semibold mt-4">Kumar Aditya</h3>
                <p className="text-sm text-muted-foreground mb-4">Founder &amp; Engineer</p>

                {/* Social Links */}
                <div className="flex gap-3">
                  <a
                    href="https://github.com/adityainhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com/in/aditya1502"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com/k07aditya"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="mailto:k.aditya9599@gmail.com"
                    aria-label="Email"
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Story Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">Why I built this</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Hey — I'm Aditya. I build distributed systems, and{" "}
                    <span className="text-foreground font-medium">fluxmedia</span> came out
                    of wanting to understand video delivery properly: what actually happens
                    between a raw upload and a stream that plays smoothly on a patchy
                    connection.
                  </p>
                  <p>
                    It turned out the hard part isn't the encoding. It's everything around
                    it — getting large files off the client without melting your API,
                    absorbing bursts without dropping jobs, cleaning up storage, and keeping
                    every playback URL scoped and expiring. Once that was working, it seemed
                    a waste to keep it to myself.
                  </p>
                  <p>
                    So this is a real product now: you can sign up, upload, share, and pay
                    for a bigger plan. It's also still small, and I'd rather say that plainly
                    than pretend otherwise. I'm one person, the roadmap moves in the order
                    people ask for things, and every feature described on this site is one
                    that actually ships today.
                  </p>
                  <p>
                    If something breaks or you need a capability that isn't here yet,{" "}
                    <Link to="/contact" className="text-primary hover:underline">
                      tell me
                    </Link>
                    . That feedback is genuinely what decides what I build next.
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
          <h2 className="text-3xl font-bold text-center mb-12">How fluxmedia works differently</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
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

        {/* Concrete numbers — each one is a fact about the product, not a projection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm border-border/50">
            <h2 className="text-3xl font-bold mb-8 text-center">The shape of it</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5</div>
                <p className="text-muted-foreground">Quality levels per video, 1440p down to 360p</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10</div>
                <p className="text-muted-foreground">Free videos every month, no card required</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Servers for you to run or maintain</p>
              </div>
            </div>
            <div className="text-center">
              <Link to="/signup">
                <Button size="lg">Create a free account</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
