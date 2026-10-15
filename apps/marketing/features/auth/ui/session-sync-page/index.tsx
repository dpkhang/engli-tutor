"use client";

import { useEffect } from "react";
import { completeSessionSync } from "@engli-tutor/auth";
import { authClient } from "@/lib/auth-client";
import { useMarketingI18n } from "@/features/i18n";
import { getAppUrl, getSiteUrl } from "../../model/session";

export function SessionSyncPage() {
  const t = useMarketingI18n();
  useEffect(() => {
    void completeSessionSync(authClient, {
      allowedOrigins: [window.location.origin, getSiteUrl(), getAppUrl()],
      fallback: getAppUrl(),
    }).then((next) => window.location.replace(next));
  }, []);

  return (
    <main className="flex min-h-[50vh] items-center justify-center px-6" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">{t("auth.signingIn")}</p>
    </main>
  );
}
