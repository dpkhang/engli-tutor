import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { PaymentResultPage } from "@/features/payments";

export default function PaymentResultRoutePage() {
  return (
    <Suspense fallback={<RouteFallback messageKey="shell.loadingPaymentResult" className="p-8" />}>
      <PaymentResultPage />
    </Suspense>
  );
}
