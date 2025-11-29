import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Video, Layers, Cloud, Settings } from "lucide-react";

const services = [
  {
    icon: Video,
    title: "Multi-Resolution Transcoding",
    description: "Convert your videos into 1080p, 720p, 480p, and 360p formats automatically. Each resolution is optimized for quality and file size.",
    features: [
      "Adaptive bitrate encoding",
      "H.264 and H.265 codec support",
      "Custom resolution presets",
      "Automatic quality optimization",
    ],
  },
  {
    icon: Layers,
    title: "HLS Packaging",
    description: "Package your transcoded videos into HTTP Live Streaming (HLS) format for seamless adaptive streaming across all devices and platforms.",
    features: [
      "Multiple bitrate variants",
      "Master playlist generation",
      "Segment optimization",
      "DRM support available",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud Processing",
    description: "Leverage our distributed cloud infrastructure for fast, reliable processing. No local rendering required - upload and let us handle the rest.",
    features: [
      "Parallel processing",
      "Auto-scaling infrastructure",
      "Global edge locations",
      "99.9% uptime SLA",
    ],
  },
  {
    icon: Settings,
    title: "Advanced Controls",
    description: "Fine-tune your transcoding with advanced parameters. Custom bitrates, frame rates, codec settings, and more for power users.",
    features: [
      "Custom encoding parameters",
      "Watermarking options",
      "Thumbnail generation",
      "Webhook notifications",
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-foreground">Our Services</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Professional Video Transcoding Solutions
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We design, develop, and implement transcoding tools that help you deliver video content efficiently and reliably
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
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
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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
          className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Before vs After</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-destructive">Without fluxmedia</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  <span className="text-muted-foreground">Single large video file</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  <span className="text-muted-foreground">Slow loading on poor connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  <span className="text-muted-foreground">No quality adaptation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  <span className="text-muted-foreground">Manual processing required</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">With fluxmedia</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Multiple optimized quality levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Instant playback on any connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Adaptive bitrate streaming</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Fully automated cloud processing</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
