"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getAppUrl } from "@/features/auth/model/session";
import {
  getBillingTotal,
  getPlanById,
  type BillingPeriod,
} from "@/features/marketing/model/plans";
import {
  isWallet,
  WALLET_COPY,
  type PayMethod,
} from "@/features/payment/model/pay-methods";
import { PaymentCheckoutPageView } from "./payment-checkout-page.view";

export function PaymentCheckoutPage() {
  const searchParams = useSearchParams();
  const plan = useMemo(() => getPlanById(searchParams.get("plan")), [searchParams]);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [method, setMethod] = useState<PayMethod>("momo");
  const [submitted, setSubmitted] = useState(false);

  const billing = useMemo(() => getBillingTotal(plan, period), [plan, period]);
  const isFree = plan.priceValue === 0;
  const wallet = isWallet(method) ? WALLET_COPY[method] : null;

  const successMessage = (() => {
    if (isFree) return "Bạn có thể bắt đầu tạo landing page ngay trong workspace.";
    if (method === "card") {
      return "Chúng tôi đang xử lý giao dịch thẻ. Bạn sẽ nhận email xác nhận trong vài phút.";
    }
    if (method === "transfer") {
      return "Vui lòng chuyển khoản theo thông tin bên phải. Gói sẽ kích hoạt sau khi đối soát.";
    }
    if (method === "momo") {
      return "Đơn đã tạo trên MoMo. Hoàn tất trên app để kích hoạt gói.";
    }
    if (method === "zalopay") {
      return "Đơn đã tạo trên ZaloPay. Xác nhận thanh toán để kích hoạt gói.";
    }
    return "Đơn đã tạo trên ShopeePay. Thanh toán xong gói sẽ được mở khóa.";
  })();

  const submitLabel = (() => {
    if (isFree) return "Kích hoạt miễn phí";
    if (wallet) return `${wallet.action} · ${billing.label}`;
    if (method === "transfer") return `Xác nhận chuyển khoản · ${billing.label}`;
    return `Thanh toán ${billing.label}`;
  })();

  const onPeriodChange = (next: BillingPeriod) => {
    setPeriod(next);
    setSubmitted(false);
  };

  const onMethodChange = (next: PayMethod) => {
    setMethod(next);
    setSubmitted(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <PaymentCheckoutPageView
      plan={plan}
      period={period}
      method={method}
      submitted={submitted}
      billing={billing}
      isFree={isFree}
      wallet={wallet}
      successMessage={successMessage}
      submitLabel={submitLabel}
      workspaceUrl={getAppUrl()}
      onPeriodChange={onPeriodChange}
      onMethodChange={onMethodChange}
      onSubmit={onSubmit}
    />
  );
}
