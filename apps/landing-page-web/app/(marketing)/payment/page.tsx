import { Suspense } from "react";
import { PaymentPackagesPage } from "@/features/payment";

export default function PaymentRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center px-5 pt-24 text-sm text-muted-foreground">
          Đang tải danh sách gói...
        </main>
      }
    >
      <PaymentPackagesPage />
    </Suspense>
  );
}
