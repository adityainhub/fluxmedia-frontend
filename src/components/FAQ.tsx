import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What video formats can I upload?",
    answer:
      "Anything FFmpeg can decode — MP4, MOV, AVI, MKV and most common containers/codecs. Output is always standardized to an HLS ladder across 1440p, 1080p, 720p, 480p and 360p.",
  },
  {
    question: "How long does transcoding take?",
    answer:
      "It depends on source length and resolution. Each job runs on its own ARM64 Fargate task, with up to 5 running concurrently — extra uploads queue in SQS and start as capacity frees up.",
  },
  {
    question: "What happens to my raw upload after processing?",
    answer:
      "Once the HLS variants are confirmed and saved, the original raw file is deleted from S3. Only the transcoded output remains, served through short-lived signed URLs.",
  },
  {
    question: "Is fluxmedia a hosted commercial product?",
    answer:
      "Not yet — it's an actively developed learning project exploring how real transcoding pipelines are built end to end. The architecture on this page is the pipeline that actually runs. Read more on the About page.",
  },
  {
    question: "Can I self-host or reuse the pipeline?",
    answer:
      "The design is intentionally boring and portable: presigned S3 uploads, SQS for backpressure, Lambda for orchestration, Fargate for the heavy lifting. Nothing here is proprietary infrastructure.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-muted-foreground text-lg">
            Straight answers about how the pipeline actually works.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm px-6"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`} className="border-border/60">
                <AccordionTrigger className="text-left hover:no-underline hover:text-primary text-base font-medium py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Still curious?{" "}
          <Link to="/contact" className="text-primary hover:underline font-medium">
            Get in touch
          </Link>{" "}
          — questions and feedback are welcome.
        </p>
      </div>
    </section>
  );
};
