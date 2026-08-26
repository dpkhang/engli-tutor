import { Suspense } from "react";
import { PaymentsPage } from "@/features/payments";

export default function PaymentsRoutePage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-muted-foreground">Loading payments…</div>}
    >
      <PaymentsPage />
    </Suspense>
  );
}
