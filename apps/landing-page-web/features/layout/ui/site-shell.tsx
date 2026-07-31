import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
