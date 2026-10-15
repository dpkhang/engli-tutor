"use client";

import {
  POLICY_SECTIONS,
  POLICY_UPDATED_AT,
  PRIVACY_HUB_CTAS,
} from "@engli-tutor/legal";
import { WorkspaceLegalDocument } from "../legal-document";
import { useWorkspaceI18n } from "@/features/i18n";

export function PolicyPage() {
  const t = useWorkspaceI18n();
  return (
    <WorkspaceLegalDocument
      title={t("legal.privacyPolicy")}
      description={t("legal.privacyIntro", { date: POLICY_UPDATED_AT })}
      hubLabel={t("legal.jumpToTopic")}
      hubCtas={PRIVACY_HUB_CTAS}
      sections={POLICY_SECTIONS}
    />
  );
}
