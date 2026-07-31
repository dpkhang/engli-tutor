"use client";

import { useSearchParams } from "next/navigation";
import { getPlanById, PLANS } from "@/features/marketing/model/plans";
import { PaymentPackagesPageView } from "./payment-packages-page.view";

export function PaymentPackagesPage() {
  const searchParams = useSearchParams();
  const queriedPlan = searchParams.get("plan");
  const highlighted = getPlanById(queriedPlan).id;

  return (
    <PaymentPackagesPageView
      plans={PLANS}
      queriedPlan={queriedPlan}
      highlighted={highlighted}
    />
  );
}
