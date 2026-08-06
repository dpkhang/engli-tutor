import type { GeneratedSection } from "../../../model/generated-content";
import type { LayoutTokens } from "../layout/tokens";

export type SectionRenderProps = {
  section: GeneratedSection;
  primaryColor: string;
  secondaryColor: string;
  landingPageId: string;
  slug: string;
  tokens: LayoutTokens;
  preset: string;
  heroImageUrl?: string;
};
