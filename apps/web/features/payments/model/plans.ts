import type { BillingMe, SubscriptionPlan } from "../api/billing";

export type WorkspacePlanId = "starter" | "growth" | "scale";

export const STARTER_PLAN = {
  id: "starter" as const,
  name: "Starter",
  description: "Miễn phí — dùng thử và launch trang đầu tiên.",
  features: [
    "50 credit đăng ký (một lần)",
    "1 landing page đang hoạt động",
    "Template cơ bản, publish nhanh",
    "Domain phụ Pagecraft",
  ],
};

export const STATUS_LABEL: Record<string, string> = {
  active: "Đang hoạt động",
  ACTIVE: "Đang hoạt động",
  past_due: "Quá hạn thanh toán",
  PAST_DUE: "Quá hạn thanh toán",
  canceled: "Đã hủy",
  CANCELED: "Đã hủy",
  incomplete: "Chưa hoàn tất",
  INCOMPLETE: "Chưa hoàn tất",
};

export const PERIOD_LABEL: Record<string, string> = {
  monthly: "Theo tháng",
  yearly: "Theo năm",
};

export function currentPlanId(data: BillingMe | undefined): WorkspacePlanId {
  if (!data?.hasPaidPlan) return "starter";
  return data.subscription.planId === "free" ? "starter" : data.subscription.planId;
}

export function currentPlanDetails(data: BillingMe | undefined): {
  id: WorkspacePlanId;
  name: string;
  description: string;
  features: string[];
} {
  const id = currentPlanId(data);
  if (id === "starter") return STARTER_PLAN;

  const fromApi = data?.subscriptionPlans.find((p) => p.id === id);
  if (fromApi) {
    return {
      id,
      name: fromApi.name,
      description: fromApi.description,
      features: fromApi.features,
    };
  }

  return { id, name: id, description: "", features: [] };
}

export function allPlansForCompare(
  subscriptionPlans: SubscriptionPlan[],
): Array<{
  id: WorkspacePlanId;
  name: string;
  description: string;
  priceVndMonthly: number;
  creditsPerPeriod: number;
  features: string[];
  featured?: boolean;
  isFree: boolean;
}> {
  return [
    {
      id: "starter",
      name: STARTER_PLAN.name,
      description: STARTER_PLAN.description,
      priceVndMonthly: 0,
      creditsPerPeriod: 0,
      features: STARTER_PLAN.features,
      isFree: true,
    },
    ...subscriptionPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceVndMonthly: plan.priceVndMonthly,
      creditsPerPeriod: plan.creditsPerPeriod,
      features: plan.features,
      featured: plan.featured,
      isFree: false,
    })),
  ];
}
