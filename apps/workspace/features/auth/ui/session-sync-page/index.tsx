"use client";

import { useEffect } from "react";
import { finishSessionSync } from "@engli-tutor/auth";
import { authClient, getMarketingUrl } from "@/lib/auth-client";
import { withCurrentLocale } from "@/lib/locale-path";
import { AuthSplash } from "@/providers/auth-gate";
import { useWorkspaceI18n } from "@/features/i18n";

export function SessionSyncPage() {
  const t = useWorkspaceI18n();
  useEffect(() => {
    void finishSessionSync(authClient, {
      allowedOrigins: [window.location.origin, getMarketingUrl()],
      fallback: withCurrentLocale("/"),
    });
  }, []);

  return <AuthSplash message={t("shell.signingIn")} />;
}
