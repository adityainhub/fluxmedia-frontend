import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Layers3 } from "lucide-react";

const points = [
  {
    icon: KeyRound,
    title: "Presigned, direct-to-S3 uploads",
    description: "Clients never proxy raw video bytes through our API — they PUT straight to object storage.",
  },
  {
    icon: ShieldCheck,
    title: "HMAC-signed worker callbacks",
    description: "Every status update from the transcoding fleet is signed and timestamp-verified before it's trusted.",
  },
  {
    icon: Layers3,
    title: "Adaptive HLS out of the box",
    description: "Every job produces a master playlist across five renditions — no manual packaging required.",
  },
];

export const CodeSample = () => {
  return (
    <section className="py-24 relative bg-card/20 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">API-first</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              Built the way your infra team would build it
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              A REST API in front of an event-driven pipeline — request an upload slot, push the file, poll for status.
            </p>
            <div className="space-y-6">
              {points.map((point) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <point.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: terminal mock */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="rounded-xl border border-border/60 bg-[hsl(var(--code-bg))] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-secondary/30">
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">request-upload.sh</span>
              </div>
              <pre className="p-5 text-[13px] leading-relaxed overflow-x-auto font-mono">
                <code>
                  <span className="text-muted-foreground"># 1. Request a presigned upload slot</span>{"\n"}
                  <span className="text-emerald-400">curl</span> <span className="text-sky-300">-X POST</span> https://api.fluxmedia.dev/api/video/upload-url \{"\n"}
                  {"  "}<span className="text-sky-300">-H</span> <span className="text-amber-300">"Content-Type: application/json"</span> \{"\n"}
                  {"  "}<span className="text-sky-300">-d</span> <span className="text-amber-300">{`'{"fileName":"keynote.mp4","contentType":"video/mp4"}'`}</span>
                  {"\n\n"}
                  <span className="text-muted-foreground"># → 200 OK</span>{"\n"}
                  {"{"}\n
                  {"  "}<span className="text-sky-300">"videoId"</span>: <span className="text-amber-300">"1042"</span>,{"\n"}
                  {"  "}<span className="text-sky-300">"presignedUrl"</span>: <span className="text-amber-300">"https://raw-videos.s3.amazonaws.com/..."</span>,{"\n"}
                  {"  "}<span className="text-sky-300">"s3key"</span>: <span className="text-amber-300">"raw-videos/1042-keynote.mp4"</span>{"\n"}
                  {"}"}
                  {"\n\n"}
                  <span className="text-muted-foreground"># 2. PUT the file, then poll status</span>{"\n"}
                  <span className="text-emerald-400">curl</span> https://api.fluxmedia.dev/api/video/1042{"\n\n"}
                  <span className="text-muted-foreground"># → status transitions</span>{"\n"}
                  <span className="text-muted-foreground">QUEUED</span> → <span className="text-muted-foreground">PROCESSING</span> → <span className="text-success">PROCESSED</span>
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
