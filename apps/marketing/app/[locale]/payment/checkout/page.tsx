import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { PaymentCheckoutPage } from "@/features/payments";

export default function PaymentCheckoutRoutePage() {
  return (
    <Suspense fallback={<RouteFallback messageKey="workspace.loadingCheckout" />}>
      <PaymentCheckoutPage />
    </Suspense>
  );
}
