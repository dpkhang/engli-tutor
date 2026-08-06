import type { LayoutTokens } from "../layout/tokens";

export function SectionShell({
  id,
  children,
  className = "",
  style,
  tokens,
  narrow = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tokens: LayoutTokens;
  narrow?: boolean;
}) {
  return (
    <section id={id} className={`px-5 sm:px-8 ${tokens.sectionPad} ${className}`} style={style}>
      <div className={`mx-auto w-full ${narrow ? "max-w-3xl" : tokens.maxWidth}`}>{children}</div>
    </section>
  );
}
