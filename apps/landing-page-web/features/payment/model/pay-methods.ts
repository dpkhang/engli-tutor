export type PayMethod = "card" | "transfer" | "momo" | "zalopay" | "shopeepay";

export const PAY_METHODS: {
  id: PayMethod;
  label: string;
  hint: string;
  tone: string;
}[] = [
  {
    id: "card",
    label: "Thẻ quốc tế",
    hint: "Visa / Mastercard",
    tone: "bg-[#0f766e]/12 text-[#0f766e]",
  },
  {
    id: "transfer",
    label: "Chuyển khoản",
    hint: "Ngân hàng nội địa",
    tone: "bg-[#1d4ed8]/12 text-[#1d4ed8]",
  },
  {
    id: "momo",
    label: "MoMo",
    hint: "Ví điện tử",
    tone: "bg-[#d82d8b]/12 text-[#a81966]",
  },
  {
    id: "zalopay",
    label: "ZaloPay",
    hint: "Ví điện tử",
    tone: "bg-[#0068ff]/12 text-[#0052cc]",
  },
  {
    id: "shopeepay",
    label: "ShopeePay",
    hint: "Ví điện tử",
    tone: "bg-[#ee4d2d]/12 text-[#c9341a]",
  },
];

export const WALLET_COPY: Record<
  Extract<PayMethod, "momo" | "zalopay" | "shopeepay">,
  { title: string; body: string; action: string }
> = {
  momo: {
    title: "Thanh toán MoMo",
    body: "Bạn sẽ được chuyển sang ứng dụng / cổng MoMo để xác nhận giao dịch an toàn.",
    action: "Tiếp tục với MoMo",
  },
  zalopay: {
    title: "Thanh toán ZaloPay",
    body: "Mở ZaloPay để quét mã hoặc xác nhận thanh toán gói Pagecraft.",
    action: "Tiếp tục với ZaloPay",
  },
  shopeepay: {
    title: "Thanh toán ShopeePay",
    body: "Dùng số dư hoặc liên kết ngân hàng trong ShopeePay để hoàn tất đơn.",
    action: "Tiếp tục với ShopeePay",
  },
};

export function isWallet(method: PayMethod): method is "momo" | "zalopay" | "shopeepay" {
  return method === "momo" || method === "zalopay" || method === "shopeepay";
}
