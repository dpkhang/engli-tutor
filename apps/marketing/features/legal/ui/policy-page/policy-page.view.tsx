import { LegalDocumentView } from "../legal-document";
import { PRIVACY_HUB_CTAS } from "../../model/legal-ctas";
import { POLICY_SECTIONS, POLICY_UPDATED_AT } from "../../model/policy";

export function PolicyPageView() {
  return (
    <LegalDocumentView
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`Last updated ${POLICY_UPDATED_AT}. How EngliTutor collects, uses, and protects your personal data.`}
      hubLabel="Jump to a privacy topic"
      hubCtas={PRIVACY_HUB_CTAS}
      sections={POLICY_SECTIONS}
    />
  );
}
