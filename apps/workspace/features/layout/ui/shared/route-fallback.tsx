"use client";

import { cn } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";

export function RouteFallback({ messageKey, className }: { messageKey: string; className?: string }) {
  const t = useWorkspaceI18n();
  return <div className={cn("p-6 text-sm text-muted-foreground", className)}>{t(messageKey)}</div>;
}
