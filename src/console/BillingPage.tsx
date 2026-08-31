import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
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
import { changePlan, getUsage } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { PLANS, PlanInfo } from "@/lib/plans";
import { useAuth } from "@/context/AuthContext";

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingPlan, setPendingPlan] = useState<PlanInfo | null>(null);

  const usageQuery = useQuery({ queryKey: ["usage"], queryFn: getUsage });
  const usage = usageQuery.data;

  const planMutation = useMutation({
    mutationFn: (plan: string) => changePlan(plan),
    onSuccess: async (updatedUser) => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      toast({
        title: "Plan updated",
        description: `You're now on the ${updatedUser.plan.charAt(0)}${updatedUser.plan.slice(1).toLowerCase()} plan.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Plan change failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

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
          Track this month's consumption and manage your plan.
        </p>
      </div>

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
            </div>
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
                <Button
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent || planMutation.isPending}
                  onClick={() => setPendingPlan(plan)}
                >
                  {isCurrent ? "Current plan" : `Switch to ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Card payments are coming soon — plan changes apply immediately and paid tiers are billed
          at the end of the month.
        </p>
      </div>

      <AlertDialog open={!!pendingPlan} onOpenChange={(open) => !open && setPendingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to the {pendingPlan?.name} plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPlan?.priceMonthly === 0
                ? "You'll move to the Free tier immediately. Videos over the Free limits stay stored, but new uploads follow Free quotas."
                : `You'll be billed $${pendingPlan?.priceMonthly}/month. New quotas apply immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingPlan) planMutation.mutate(pendingPlan.id);
                setPendingPlan(null);
              }}
            >
              Confirm switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
