"use client";

import { CookieConsentManageButton } from "@engli-tutor/ui";
import { useMarketingI18n } from "@/features/i18n";
import { LegalDocumentView } from "../legal-document";
import { COOKIE_HUB_CTAS } from "../../model/legal-ctas";
import { COOKIE_POLICY_SECTIONS, COOKIE_POLICY_UPDATED_AT } from "../../model/cookies";

export function CookiesPageView() {
  const t = useMarketingI18n();
  return (
    <LegalDocumentView
      backHref="/policy"
      backLabel={t("legal.privacyPolicy")}
      eyebrow="Legal"
      title="Cookie Policy"
      intro={`Last updated ${COOKIE_POLICY_UPDATED_AT}. Which cookies and browser storage EngliTutor uses, and how you can control them.`}
      hubLabel="Related privacy pages"
      hubCtas={COOKIE_HUB_CTAS}
      extra={
        <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-sm backdrop-blur">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            {t("legal.yourCookieChoice")}
          </p>
          <div className="mt-4 [&_button]:min-h-11">
            <CookieConsentManageButton />
          </div>
        </div>
      }
      sections={COOKIE_POLICY_SECTIONS}
    />
  );
}
