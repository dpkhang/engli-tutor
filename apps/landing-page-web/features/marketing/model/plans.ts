export type PlanId = "starter" | "growth" | "scale";

export type BillingPeriod = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "0đ",
    priceValue: 0,
    period: "mãi mãi",
    description: "Dùng thử và launch trang đầu tiên — phù hợp cá nhân khám phá Pagecraft.",
    features: [
      "1 landing page đang hoạt động",
      "Template cơ bản, publish nhanh",
      "Domain phụ Pagecraft",
      "Không cần thẻ để bắt đầu",
    ],
    cta: "Bắt đầu miễn phí",
    featured: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "299.000đ",
    priceValue: 299_000,
    period: "/ tháng",
    description: "Cho team marketing chạy nhiều chiến dịch và tối ưu chuyển đổi.",
    features: [
      "Tới 10 landing page",
      "A/B headline & variant copy",
      "Custom domain riêng",
      "Analytics cơ bản theo chiến dịch",
      "Hỗ trợ ưu tiên trong giờ hành chính",
    ],
    cta: "Chọn Growth",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "799.000đ",
    priceValue: 799_000,
    period: "/ tháng",
    description: "Cho agency và brand cần kiểm soát sâu, nhiều workspace.",
    features: [
      "Không giới hạn landing page",
      "Workspace team & phân quyền",
      "Priority support 24/7",
      "SSO & audit log cơ bản",
      "Onboarding riêng với CS",
    ],
    cta: "Chọn Scale",
    featured: false,
  },
];

export const BILLING_PERIODS: {
  id: BillingPeriod;
  label: string;
  hint: string;
}[] = [
  { id: "monthly", label: "Theo tháng", hint: "Thanh toán hàng tháng" },
  { id: "yearly", label: "Theo năm", hint: "Tiết kiệm ~2 tháng" },
];

export function getPlanById(id: string | null | undefined): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS.find((plan) => plan.featured)!;
}

export function formatVnd(value: number): string {
  if (value === 0) return "0đ";
  return `${value.toLocaleString("vi-VN")}đ`;
}

/** Yearly = 10× monthly (2 months free). */
export function getBillingTotal(plan: Plan, period: BillingPeriod): {
  total: number;
  label: string;
  periodLabel: string;
} {
  if (plan.priceValue === 0) {
    return { total: 0, label: "0đ", periodLabel: "mãi mãi" };
  }

  if (period === "yearly") {
    const total = plan.priceValue * 10;
    return {
      total,
      label: formatVnd(total),
      periodLabel: "/ năm",
    };
  }

  return {
    total: plan.priceValue,
    label: formatVnd(plan.priceValue),
    periodLabel: "/ tháng",
  };
}
