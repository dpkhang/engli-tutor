"use client";

import {
  resolveLayout,
  resolveSectionVariant,
  type GeneratedLandingContent,
  type SectionType,
} from "../../model/generated-content";
import { buildLayoutTokens } from "./layout/tokens";
import { getSectionComponent } from "./sections/registry";

type Props = {
  content: GeneratedLandingContent;
  landingPageId: string;
  slug: string;
};

export function DemoLandingRenderer({ content, landingPageId, slug }: Props) {
  const layout = resolveLayout(content, landingPageId);
  const tokens = buildLayoutTokens(content, layout);
  const { primaryColor, secondaryColor } = content.theme;

  return (
    <div className="bg-background text-foreground" style={tokens.style} data-layout-preset={layout.preset}>
      {content.sections.map((section, index) => {
        const variant = resolveSectionVariant(layout, section, index);
        const Component = getSectionComponent(section.type as SectionType, variant);
        return (
          <Component
            key={`${section.type}-${index}-${variant}`}
            section={section}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            landingPageId={landingPageId}
            slug={slug}
            tokens={tokens}
            preset={layout.preset}
            heroImageUrl={section.type === "hero" ? content.media?.heroImageUrl : undefined}
          />
        );
      })}
    </div>
  );
}
