import {
  POLICY_SECTIONS,
  POLICY_UPDATED_AT,
  PRIVACY_HUB_CTAS,
} from "@engli-tutor/legal";
import { WorkspaceLegalDocument } from "../legal-document";

export function PolicyPage() {
  return (
    <WorkspaceLegalDocument
      backHref="/settings"
      backLabel="settings"
      title="Privacy Policy"
      description={`Last updated ${POLICY_UPDATED_AT}. How EngliTutor collects, uses, and protects your personal data.`}
      hubLabel="Jump to a privacy topic"
      hubCtas={PRIVACY_HUB_CTAS}
      sections={POLICY_SECTIONS}
    />
  );
}
