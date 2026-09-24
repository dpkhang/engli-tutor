import {
  COOKIE_HUB_CTAS,
  COOKIE_POLICY_SECTIONS,
  COOKIE_POLICY_UPDATED_AT,
} from "@engli-tutor/legal";
import { CardTitle, CookieConsentManageButton } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "@/features/settings/ui/shared";
import { WorkspaceLegalDocument } from "../legal-document";

export function CookiesPage() {
  return (
    <WorkspaceLegalDocument
      backHref="/policy"
      backLabel="privacy policy"
      title="Cookie Policy"
      description={`Last updated ${COOKIE_POLICY_UPDATED_AT}. Which cookies and browser storage EngliTutor uses, and how you can control them.`}
      hubLabel="Related privacy pages"
      hubCtas={COOKIE_HUB_CTAS}
      extra={
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle>Your cookie choice</CardTitle>
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

