import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LEGAL } from "@/lib/legal";

export interface LegalSection {
  heading: string;
  /** Paragraphs of body copy. */
  body?: ReactNode[];
  /** Optional bulleted points rendered after the paragraphs. */
  bullets?: ReactNode[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/** Shared shell for Terms, Privacy and Refund pages. */
export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,black_10%,transparent_70%)]" />

      <div className="container mx-auto px-4 max-w-3xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
          <p className="text-muted-foreground leading-relaxed">{intro}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {LEGAL.lastUpdated}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold mb-3">
                <span className="text-primary mr-2 tabular-nums">{index + 1}.</span>
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {section.body?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                {section.bullets && (
                  <ul className="space-y-2 pl-1">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </motion.div>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground">
          <p className="mb-2">
            Questions about this policy? Email{" "}
            <a href={`mailto:${LEGAL.supportEmail}`} className="text-primary hover:underline">
              {LEGAL.supportEmail}
            </a>{" "}
            or call{" "}
            <a href={`tel:${LEGAL.phoneHref}`} className="text-primary hover:underline">
              {LEGAL.phoneDisplay}
            </a>
            .
          </p>
          <p>
            See also{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>,{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,{" "}
            <Link to="/refund-policy" className="text-primary hover:underline">Refund &amp; Cancellation</Link>{" "}
            and our{" "}
            <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
