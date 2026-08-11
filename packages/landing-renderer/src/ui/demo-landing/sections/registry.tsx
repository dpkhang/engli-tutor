import type { ComponentType } from "react";
import type { SectionType } from "../../../model/generated-content";
import { CtaCenteredBand, CtaSplitForm } from "./cta";
import { FaqAccordion, FaqTwoColumn } from "./faq";
import { FeaturesBento, FeaturesGrid3, FeaturesListCheck } from "./features";
import { FooterColumns, FooterSimple } from "./footer";
import { HeroAsymmetric, HeroCenteredCta, HeroSplitForm } from "./hero";
import {
  SocialProofLogoStrip,
  SocialProofQuoteBanner,
  SocialProofStatRow,
} from "./social-proof";
import { TestimonialsCards2, TestimonialsCarouselStack } from "./testimonials";
import type { SectionRenderProps } from "./types";

type Registry = Record<SectionType, Record<string, ComponentType<SectionRenderProps>>>;

export const SECTION_VARIANT_REGISTRY: Registry = {
  hero: {
    "split-form": HeroSplitForm,
    "centered-cta": HeroCenteredCta,
    asymmetric: HeroAsymmetric,
  },
  features: {
    "grid-3": FeaturesGrid3,
    "list-check": FeaturesListCheck,
    bento: FeaturesBento,
  },
  "social-proof": {
    "stat-row": SocialProofStatRow,
    "logo-strip": SocialProofLogoStrip,
    "quote-banner": SocialProofQuoteBanner,
  },
  testimonials: {
    "cards-2": TestimonialsCards2,
    "carousel-stack": TestimonialsCarouselStack,
  },
  faq: {
    accordion: FaqAccordion,
    "two-column": FaqTwoColumn,
  },
  cta: {
    "split-form": CtaSplitForm,
    "centered-band": CtaCenteredBand,
  },
  footer: {
    simple: FooterSimple,
    columns: FooterColumns,
  },
};

export function getSectionComponent(
  type: SectionType,
  variant: string,
): ComponentType<SectionRenderProps> {
  const map = SECTION_VARIANT_REGISTRY[type];
  return map[variant] ?? Object.values(map)[0]!;
}
