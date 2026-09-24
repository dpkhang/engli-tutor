import { CookieConsentManageButton } from "@engli-tutor/ui";
import { LegalDocumentView } from "../legal-document";
import { COOKIE_HUB_CTAS } from "../../model/legal-ctas";
import { COOKIE_POLICY_SECTIONS, COOKIE_POLICY_UPDATED_AT } from "../../model/cookies";

export function CookiesPageView() {
  return (
    <LegalDocumentView
      backHref="/policy"
      backLabel="privacy policy"
      eyebrow="Legal"
      title="Cookie Policy"
      intro={`Last updated ${COOKIE_POLICY_UPDATED_AT}. Which cookies and browser storage EngliTutor uses, and how you can control them.`}
      hubLabel="Related privacy pages"
      hubCtas={COOKIE_HUB_CTAS}
      extra={
        <div className="rounded-sm border border-border bg-background p-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            Your cookie choice
          </p>
          <div className="mt-3">
            <CookieConsentManageButton />
          </div>
        </div>
      }
      sections={COOKIE_POLICY_SECTIONS}
    />
  );
}
