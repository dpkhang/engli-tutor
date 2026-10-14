"use client";

import { useMarketingI18n } from "@/features/i18n";

export function RouteFallback({ messageKey }: { messageKey: string }) {
  const t = useMarketingI18n();
  return (
    <main className="flex min-h-svh items-center justify-center px-5 pt-24 text-sm text-muted-foreground">
      {t(messageKey)}
    </main>
  );
}
