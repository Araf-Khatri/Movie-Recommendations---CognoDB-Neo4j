import type { ReactNode } from "react";
import { AlertTriangle, Loader2, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface/40 px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface-strong text-muted-foreground">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-16 text-center"
    >
      <AlertTriangle className="mb-4 h-8 w-8 text-destructive" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <Button className="mt-6 rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
