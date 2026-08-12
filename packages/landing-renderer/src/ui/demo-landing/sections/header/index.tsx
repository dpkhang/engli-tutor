import { Button } from "@landing-page-generator/ui";
import type { SectionRenderProps } from "../types";

const NAV_HREF: Array<[RegExp, string]> = [
  [/(tính năng|features|benefits|ưu điểm|giải pháp)/i, "#features"],
  [/(faq|câu hỏi|hỏi đáp)/i, "#faq"],
  [/(đánh giá|testimonial|feedback|khách nói)/i, "#testimonials"],
  [/(đối tác|social|bằng chứng|thống kê|con số)/i, "#social-proof"],
  [/(giá|pricing|gói|cta|đăng ký|bắt đầu|liên hệ|nhận)/i, "#cta"],
  [/(trang chủ|home|hero)/i, "#hero"],
];

function navHref(item: string): string {
  const raw = item.trim();
  const explicit = raw.match(/#([a-z0-9-]+)/i);
  if (explicit) return `#${explicit[1]!.toLowerCase()}`;
  const label = raw.replace(/\s*#.*$/, "").trim();
  for (const [pattern, href] of NAV_HREF) {
    if (pattern.test(label)) return href;
  }
  return "#cta";
}

function navLabel(item: string): string {
  return item.replace(/\s*#.*$/, "").trim() || item;
}

function NavLinks({ items, className = "hidden md:flex" }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav className={`items-center gap-6 text-sm text-muted-foreground ${className}`}>
      {items.map((item) => (
        <a key={item} href={navHref(item)} className="transition-colors hover:text-foreground">
          {navLabel(item)}
        </a>
      ))}
    </nav>
  );
}

function HeaderCta({ label, primaryColor }: { label: string | null; primaryColor: string }) {
  if (!label) return <span className="hidden w-px sm:block" />;
  return (
    <Button asChild size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: primaryColor }}>
      <a href="#cta">{label}</a>
    </Button>
  );
}

export function HeaderSimple(props: SectionRenderProps) {
  const { section, primaryColor } = props;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#hero" className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-tight">
          {section.heading}
        </a>
        <NavLinks items={section.items} />
        <HeaderCta label={section.ctaLabel} primaryColor={primaryColor} />
      </div>
    </header>
  );
}

export function HeaderCentered(props: SectionRenderProps) {
  const { section, primaryColor } = props;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 py-4 sm:px-8">
        <a href="#hero" className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          {section.heading}
        </a>
        <div className="flex w-full flex-wrap items-center justify-center gap-4">
          <NavLinks items={section.items} className="flex flex-wrap justify-center" />
          <HeaderCta label={section.ctaLabel} primaryColor={primaryColor} />
        </div>
      </div>
    </header>
  );
}
