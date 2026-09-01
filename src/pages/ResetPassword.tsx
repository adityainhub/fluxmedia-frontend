import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPassword, setToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setToken(res.token);
      await refreshUser();
      toast({ title: "Password updated", description: "You're signed in with your new password." });
      navigate("/console", { replace: true });
    } catch (err) {
      toast({
        title: "Reset failed",
        description: err instanceof Error ? err.message : "Please request a new link",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,black_10%,transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="text-center mb-8">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Choose a new password</h1>
            <p className="text-muted-foreground text-sm">
              You'll be signed in right after it's saved.
            </p>
          </div>

          {!token ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                This page needs the link from your reset email.
              </p>
              <Link to="/forgot-password">
                <Button variant="outline" className="w-full">Request a reset link</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Repeat the password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save new password"
                )}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
