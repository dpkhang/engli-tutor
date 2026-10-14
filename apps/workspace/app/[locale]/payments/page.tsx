import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { PaymentsPage } from "@/features/payments";

export default function PaymentsRoutePage() {
  return (
    <Suspense
      fallback={<RouteFallback messageKey="shell.loadingPayments" className="p-8" />}
    >
      <PaymentsPage />
    </Suspense>
  );
}
