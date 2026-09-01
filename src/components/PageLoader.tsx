import { Loader2 } from "lucide-react";

/** Suspense fallback for lazily-loaded routes. */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
