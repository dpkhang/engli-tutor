import { Suspense } from "react";
import { DomainsPage } from "@/features/domains";

export default function DomainsRoutePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Đang tải domains…</div>}>
      <DomainsPage />
    </Suspense>
  );
}
