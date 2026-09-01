import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Copy, KeyRound, MailWarning, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ApiKeyInfo, createApiKey, listApiKeys, resendVerification, revokeApiKey } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyInfo | null>(null);

  const keysQuery = useQuery({ queryKey: ["api-keys"], queryFn: listApiKeys });

  const createMutation = useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: (key) => {
      setCreatedKey(key);
      setCreateOpen(false);
      setKeyName("");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err) => {
      toast({
        title: "Failed to create key",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

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

  const revokeMutation = useMutation({
    mutationFn: (id: number) => revokeApiKey(id),
    onSuccess: () => {
      toast({ title: "API key revoked" });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err) => {
      toast({
        title: "Failed to revoke key",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const copyKey = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Select and copy manually", variant: "destructive" });
    }
  };

  const keys = keysQuery.data ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Your profile and developer access.</p>
      </div>

      <Card className="p-6 bg-card/60 border-border/50">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={user?.fullName ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/50 px-4 py-3">
          {user?.emailVerified ? (
            <>
              <BadgeCheck className="h-4 w-4 text-success shrink-0" />
              <p className="text-sm flex-1">Email verified</p>
            </>
          ) : (
            <>
              <MailWarning className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm flex-1 min-w-[180px]">
                Email not verified yet
                <span className="text-muted-foreground"> — check your inbox for the link.</span>
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={resendMutation.isPending}
                onClick={() => resendMutation.mutate()}
              >
                {resendMutation.isPending ? "Sending…" : "Resend email"}
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Contact support to change your email address.
        </p>
      </Card>

      <Card className="p-6 bg-card/60 border-border/50">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">API keys</h3>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New key
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Authenticate server-to-server requests with the{" "}
          <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">X-Api-Key</code>{" "}
          header. Keys carry the same permissions as your account.
        </p>

        {keysQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/60 rounded-xl">
            <KeyRound className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No API keys yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{key.name}</p>
                    {key.revoked && (
                      <Badge variant="outline" className="text-destructive border-destructive/40">
                        Revoked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {key.prefix}•••• · created {formatDate(key.createdAt)}
                    {key.lastUsedAt ? ` · last used ${formatDate(key.lastUsedAt)}` : " · never used"}
                  </p>
                </div>
                {!key.revoked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => revokeMutation.mutate(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give the key a name so you can recognize it later (e.g. "production server").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              placeholder="production server"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              maxLength={60}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!keyName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(keyName.trim())}
            >
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show-once dialog for the new key */}
      <Dialog open={!!createdKey} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy it now — for security it is shown only once and can't be recovered.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-secondary rounded-lg px-3 py-2.5 break-all">
              {createdKey?.plaintextKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => createdKey?.plaintextKey && copyKey(createdKey.plaintextKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
