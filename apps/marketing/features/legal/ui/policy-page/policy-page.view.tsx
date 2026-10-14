"use client";

import { LegalDocumentView } from "../legal-document";
import { PRIVACY_HUB_CTAS } from "../../model/legal-ctas";
import { POLICY_SECTIONS, POLICY_UPDATED_AT } from "../../model/policy";
import { useMarketingI18n } from "@/features/i18n";

export function PolicyPageView() {
  const t = useMarketingI18n();
  return (
    <LegalDocumentView
      eyebrow={t("legal.eyebrow")}
      title={t("legal.privacyPolicy")}
      intro={t("legal.privacyIntro", { date: POLICY_UPDATED_AT })}
      hubLabel={t("legal.jumpToTopic")}
      hubCtas={PRIVACY_HUB_CTAS}
      sections={POLICY_SECTIONS}
    />
  );
}
