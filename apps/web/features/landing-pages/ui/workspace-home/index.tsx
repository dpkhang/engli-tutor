"use client";

import { LandingPageForm } from "../landing-page-form";
import { LandingPageList } from "../landing-page-list";

export function WorkspaceHome() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Workspace</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground sm:text-5xl">
          Quản lý landing page
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Tạo slug, theo dõi trạng thái draft/published, rồi mở rộng nội dung chiến dịch khi sẵn sàng.
        </p>
      </header>

      <LandingPageForm />
      <LandingPageList />
    </div>
  );
}
