import { Link } from "react-router-dom";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/adityainhub", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/aditya1502", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/k07aditya", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@fluxmedia.com", label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="fluxmedia" className="h-6 w-6 object-contain" />
              <span className="text-xl font-bold">fluxmedia</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              A cloud-native transcoding pipeline: presigned S3 uploads, SQS-buffered orchestration, and
              ARM64 Fargate workers producing adaptive HLS.
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span className="text-xs font-mono text-muted-foreground">Pipeline operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Upload a video
                </Link>
              </li>
              <li>
                <a href="/#architecture" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pipeline architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/adityainhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={link.label}
                  className="p-2 rounded-lg bg-secondary/40 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <link.icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} fluxmedia. All rights reserved.</p>
          <p className="text-xs font-mono text-muted-foreground/70">
            Spring Boot · AWS Lambda · SQS · ECS Fargate · FFmpeg · HLS
          </p>
        </div>
      </div>
    </footer>
  );
};
