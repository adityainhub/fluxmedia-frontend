import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type VerifyState = "verifying" | "success" | "error";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "error");
  const [message, setMessage] = useState<string | null>(
    token ? null : "This page needs the link from your verification email.",
  );
  const { user, refreshUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // React StrictMode double-invokes effects; the token is single-use
    verifyEmail(token)
      .then(async () => {
        setState("success");
        if (user) await refreshUser();
      })
      .catch((err) => {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,black_10%,transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
          {state === "verifying" && (
            <>
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Verifying your email…</h1>
              <p className="text-muted-foreground text-sm">This only takes a second.</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Email verified</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Your account is confirmed. You're all set.
              </p>
              <Link to={user ? "/console" : "/login"}>
                <Button size="lg" className="w-full">
                  {user ? "Go to console" : "Sign in"}
                </Button>
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <Link to={user ? "/console/settings" : "/login"}>
                <Button variant="outline" size="lg" className="w-full">
                  {user ? "Request a new email from Settings" : "Sign in"}
                </Button>
              </Link>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
