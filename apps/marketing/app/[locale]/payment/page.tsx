import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { PaymentPackagesPage } from "@/features/payments";

export default function PaymentRoutePage() {
  return (
    <Suspense fallback={<RouteFallback messageKey="workspace.loadingPlans" />}>
      <PaymentPackagesPage />
    </Suspense>
  );
}
