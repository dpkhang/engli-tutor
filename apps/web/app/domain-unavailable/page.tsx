"use client";

import { Alert, AlertDescription, Button } from "@landing-page-generator/ui";

/** Shown when a custom domain Host has no VERIFIED + PUBLISHED page mapping. */
export default function DomainUnavailablePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg items-center px-5 py-16">
      <Alert>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span className="font-[family-name:var(--font-display)] text-lg text-foreground">
            Domain chưa sẵn sàng
          </span>
          <span>
            Hostname này chưa được xác minh hoặc chưa gắn landing page đã xuất bản. Trong workspace:
            Domains → chọn page (slug) → Xác minh DNS.
          </span>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href="https://app.pagecraft-ai.site/domains">Mở Domains</a>
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
