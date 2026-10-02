import { Suspense } from "react";
import { PaymentPackagesPage } from "@/features/payment";

export default function PaymentRoutePage() {
  return (
    <Suspense fallback={<main className="flex min-h-svh items-center justify-center px-5 pt-24 text-sm text-muted-foreground">Loading plans...</main>}>
      <PaymentPackagesPage />
    </Suspense>
  );
}
