"use client";

import {
  COOKIE_HUB_CTAS,
  COOKIE_POLICY_SECTIONS,
  COOKIE_POLICY_UPDATED_AT,
} from "@engli-tutor/legal";
import { CardTitle, CookieConsentManageButton } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "@/features/settings";
import { WorkspaceLegalDocument } from "../legal-document";
import { useWorkspaceI18n } from "@/features/i18n";

export function CookiesPage() {
  const t = useWorkspaceI18n();
  return (
    <WorkspaceLegalDocument
      title={t("legal.cookiePolicy")}
      description={t("legal.cookieIntro", { date: COOKIE_POLICY_UPDATED_AT })}
      hubLabel={t("legal.relatedPrivacyPages")}
      hubCtas={COOKIE_HUB_CTAS}
      extra={
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle>{t("legal.yourCookieChoice")}</CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent>
            <CookieConsentManageButton />
          </SettingsCardContent>
        </SettingsCard>
      }
      sections={COOKIE_POLICY_SECTIONS}
    />
  );
}

