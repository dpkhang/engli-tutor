import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@landing-page-generator/ui";
import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

function toFaqPairs(section: SectionRenderProps["section"]) {
  return section.items.map((item) => {
    const [q, ...rest] = item.split("?");
    if (rest.length) {
      return { q: `${q}?`, a: rest.join("?").trim() || section.body || "—" };
    }
    return { q: item, a: section.body || "Liên hệ để biết thêm chi tiết." };
  });
}

export function FaqAccordion(props: SectionRenderProps) {
  const { section, tokens } = props;
  const pairs = toFaqPairs(section);
  return (
    <SectionShell id="faq" tokens={tokens} className="bg-muted/30">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      <Accordion className="mt-8 space-y-2">
        {pairs.map((pair, index) => (
          <AccordionItem
            key={`${pair.q}-${index}`}
            value={`faq-${index}`}
            className="rounded-[var(--lp-radius)] border bg-background px-4"
          >
            <AccordionTrigger className="text-left text-sm font-semibold">{pair.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-muted-foreground">{pair.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}

export function FaqTwoColumn(props: SectionRenderProps) {
  const { section, tokens } = props;
  const pairs = toFaqPairs(section);
  return (
    <SectionShell id="faq" tokens={tokens}>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
          {section.subheading ? <p className="mt-3 text-muted-foreground">{section.subheading}</p> : null}
        </div>
        <div className="space-y-4">
          {pairs.map((pair, index) => (
            <div key={`${pair.q}-${index}`} className="rounded-[var(--lp-radius)] border bg-muted/20 px-4 py-4">
              <p className="text-sm font-semibold">{pair.q}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{pair.a}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
