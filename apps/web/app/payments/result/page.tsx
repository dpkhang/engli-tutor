import { Suspense } from "react";
import { PaymentResultPage } from "@/features/payments";

export default function PaymentResultRoutePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading payment result…</div>}>
      <PaymentResultPage />
    </Suspense>
  );
}
