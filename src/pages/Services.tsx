import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, LayoutDashboard, Share2, Video } from "lucide-react";

// Every claim below maps to shipped behaviour. If a capability isn't built yet,
// it doesn't belong on this page — see the About page for what's still coming.
const services = [
  {
    icon: Video,
    title: "Adaptive HLS transcoding",
    description:
      "Upload any format FFmpeg can read. Every video comes back as an HLS stream with a full quality ladder, so playback adapts to whatever connection your viewer is on.",
    features: [
      "1440p, 1080p, 720p, 480p and 360p renditions",
      "H.264 video with AAC audio, ~10s segments",
      "Master playlist generated per video",
      "Never upscales — small sources skip the higher rungs",
      "Automatic thumbnail extraction",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "A console for your library",
    description:
      "Track every upload from queue to ready, watch renditions back in the browser, and see exactly where you stand against your plan.",
    features: [
      "Live status as jobs move through the pipeline",
      "Built-in player with manual quality switching",
      "Usage and storage meters against your plan",
      "Signed download links for every rendition",
      "Delete a video and its renditions in one action",
    ],
  },
  {
    icon: Share2,
    title: "Sharing and embeds",
    description:
      "Turn any processed video into a public link or drop it into your own site with an iframe. Sharing is off by default and revocable the moment you change your mind.",
    features: [
      "Public watch links with an unguessable token",
      "Copy-paste iframe embed snippet",
      "Revoke access instantly — old links stop working",
      "Private by default; you opt in per video",
    ],
  },
  {
    icon: Code2,
    title: "Developer API",
    description:
      "Drive the same pipeline from your own backend. Files upload straight from your users' browsers to storage, so your servers never touch the bytes.",
    features: [
      "API keys via the X-Api-Key header",
      "Presigned direct-to-storage uploads",
      "REST endpoints for status and playback URLs",
      "Included on Creator and Scale plans",
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black_15%,transparent_70%)]" />
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-foreground">What you get</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upload a video. Get a stream.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            fluxmedia handles transcoding, packaging, storage and delivery, so you can
            ship video without building an encoding pipeline first.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/10">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>

                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Before vs After Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50 mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Before vs After</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-destructive">Without fluxmedia</h3>
              <ul className="space-y-3">
                {[
                  "One large file served to every viewer",
                  "Buffering on slower connections",
                  "No quality adaptation mid-playback",
                  "You run and babysit the encoding servers",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-xs">✕</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">With fluxmedia</h3>
              <ul className="space-y-3">
                {[
                  "Up to five renditions per video, picked automatically",
                  "Playback starts fast on any connection",
                  "Adaptive bitrate switching built in",
                  "Fully managed — upload and you're done",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Start on the free plan</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ten videos a month, the full quality ladder, no card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="group">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                Compare plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
