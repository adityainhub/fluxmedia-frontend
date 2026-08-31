import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MailWarning, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resendVerification } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/** Shown across the console until the account's email is confirmed. */
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () =>
      toast({
        title: "Verification email sent",
        description: `Check ${user?.email} for the link.`,
      }),
    onError: (err) =>
      toast({
        title: "Couldn't send the email",
        description: err instanceof Error ? err.message : "Please try again later",
        variant: "destructive",
      }),
  });

  if (!user || user.emailVerified || dismissed) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-sm">
      <MailWarning className="h-4 w-4 text-warning shrink-0" />
      <p className="flex-1 min-w-[200px]">
        Confirm your email address to secure your account.{" "}
        <span className="text-muted-foreground">We sent a link to {user.email}.</span>
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={resendMutation.isPending}
        onClick={() => resendMutation.mutate()}
      >
        {resendMutation.isPending ? "Sending…" : "Resend email"}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
