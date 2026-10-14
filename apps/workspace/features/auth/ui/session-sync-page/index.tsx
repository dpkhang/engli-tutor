"use client";

import { useEffect } from "react";
import { completeSessionSync } from "@engli-tutor/auth";
import { authClient, getMarketingUrl } from "@/lib/auth-client";
import { withCurrentLocale } from "@/lib/locale-path";
import { AuthSplash } from "@/providers/auth-gate";
import { useWorkspaceI18n } from "@/features/i18n";

export function SessionSyncPage() {
  const t = useWorkspaceI18n();
  useEffect(() => {
    void completeSessionSync(authClient, {
      allowedOrigins: [window.location.origin, getMarketingUrl()],
      fallback: withCurrentLocale("/"),
    }).then((next) => window.location.replace(next));
  }, []);

  return <AuthSplash message={t("shell.signingIn")} />;
}
