import { Suspense } from "react";
import { PaymentCheckoutPage } from "@/features/payment";

export default function PaymentCheckoutRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center px-5 pt-24 text-sm text-muted-foreground">
          Đang tải trang thanh toán...
        </main>
      }
    >
      <PaymentCheckoutPage />
    </Suspense>
  );
}
