import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  cancelSubscription,
  createCheckout,
  getBillingStatus,
  getUsage,
  verifyPayment,
} from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { formatBytes } from "@/lib/format";
import { PLANS, PlanInfo } from "@/lib/plans";
import { useAuth } from "@/context/AuthContext";

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  const usageQuery = useQuery({ queryKey: ["usage"], queryFn: getUsage });
  const billingQuery = useQuery({ queryKey: ["billing"], queryFn: getBillingStatus });
  const usage = usageQuery.data;
  const billing = billingQuery.data;

  const afterPlanChange = async () => {
    await refreshUser();
    queryClient.invalidateQueries({ queryKey: ["usage"] });
    queryClient.invalidateQueries({ queryKey: ["billing"] });
  };

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: async (status) => {
      await afterPlanChange();
      toast({
        title: "Payment successful",
        description: `You're now on the ${status.plan.charAt(0)}${status.plan.slice(1).toLowerCase()} plan.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Payment verification failed",
        description:
          err instanceof Error
            ? err.message
            : "If you were charged, your plan will activate automatically within a few minutes.",
        variant: "destructive",
      });
    },
  });

  const startCheckout = async (plan: PlanInfo) => {
    if (checkoutPlan) return;
    setCheckoutPlan(plan.id);
    try {
      const info = await createCheckout(plan.id);
      await openRazorpayCheckout({
        keyId: info.keyId,
        subscriptionId: info.subscriptionId,
        planName: plan.name,
        userName: user?.fullName,
        userEmail: user?.email,
        onSuccess: (response) => {
          setCheckoutPlan(null);
          verifyMutation.mutate(response);
        },
        onDismiss: () => setCheckoutPlan(null),
      });
    } catch (err) {
      setCheckoutPlan(null);
      toast({
        title: "Couldn't start checkout",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      await afterPlanChange();
      toast({
        title: "Downgrade scheduled",
        description:
          "Your subscription is cancelled. You keep your current plan until the end of the billing period, then move to Free.",
      });
    },
    onError: (err) => {
      toast({
        title: "Cancellation failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const paymentsConfigured = billing?.paymentsConfigured ?? true;
  const onPaidPlan = user?.plan !== "FREE";
  const cancelScheduled = billing?.subscriptionStatus === "cancel_scheduled";

  const meters = usage
    ? [
        {
          label: "Videos this month",
          value: usage.videosThisMonth,
          limit: usage.monthlyVideoLimit,
          display: `${usage.videosThisMonth} / ${usage.monthlyVideoLimit}`,
        },
        {
          label: "Storage",
          value: usage.storageUsedBytes,
          limit: usage.storageLimitBytes,
          display: `${formatBytes(usage.storageUsedBytes)} / ${formatBytes(usage.storageLimitBytes)}`,
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Usage & Billing</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track this month's consumption and manage your subscription.
        </p>
      </div>

      {!paymentsConfigured && (
        <Card className="p-4 border-warning/40 bg-warning/5 text-sm">
          Payments aren't configured on this environment yet — upgrades are disabled until the
          Razorpay keys are set.
        </Card>
      )}

      <Card className="p-6 bg-card/60 border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current plan</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{usage?.planDisplayName ?? "—"}</span>
              {user?.plan === "FREE" && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Free forever
                </Badge>
              )}
              {cancelScheduled && (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  Cancels at period end
                </Badge>
              )}
            </div>
            {onPaidPlan && billing?.subscriptionId && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Subscription {billing.subscriptionId}
                {billing.subscriptionStatus ? ` · ${billing.subscriptionStatus}` : ""}
              </p>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Max file size: {usage ? formatBytes(usage.maxFileSizeBytes) : "—"}</p>
            <p>
              {usage
                ? `${usage.processedVideos} processed · ${usage.failedVideos} failed · ${usage.totalVideos} total`
                : ""}
            </p>
          </div>
        </div>

        {usageQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {meters.map((meter) => {
              const pct = Math.min(100, (meter.value / meter.limit) * 100);
              return (
                <div key={meter.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{meter.label}</span>
                    <span className="font-medium tabular-nums">{meter.display}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  {pct >= 90 && (
                    <p className="text-xs text-warning mt-1.5">
                      Almost at your limit — consider upgrading
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            const isFreeTier = plan.id === "FREE";
            const busy = checkoutPlan === plan.id || verifyMutation.isPending;
            return (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col bg-card/60 ${
                  isCurrent ? "border-primary/60 shadow-lg shadow-primary/10" : "border-border/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {isCurrent && <Badge className="bg-primary text-primary-foreground">Current</Badge>}
                </div>
                <p className="mb-4">
                  <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" disabled>
                    Current plan
                  </Button>
                ) : isFreeTier ? (
                  <Button
                    variant="outline"
                    disabled={!onPaidPlan || cancelScheduled || cancelMutation.isPending}
                    onClick={() => setConfirmCancel(true)}
                  >
                    {cancelScheduled ? "Downgrade scheduled" : "Downgrade to Free"}
                  </Button>
                ) : (
                  <Button
                    disabled={!paymentsConfigured || busy}
                    onClick={() => startCheckout(plan)}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Opening checkout…
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" /> Upgrade to {plan.name}
                      </>
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Subscriptions are billed monthly through Razorpay. Upgrades apply as soon as payment is
          confirmed; downgrades take effect at the end of the current billing period.
        </p>
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll keep your current plan until the end of the billing period, then move to the
              Free tier. Existing videos stay stored, but new uploads follow Free quotas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelMutation.mutate()}
            >
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
