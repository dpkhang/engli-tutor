import { SiteShell } from "@/features/layout";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
