export type PayMethod = "card" | "transfer" | "momo" | "zalopay" | "shopeepay";

export const PAY_METHODS: {
  id: PayMethod;
  label: string;
  hint: string;
  tone: string;
}[] = [
  {
    id: "card",
    label: "International card",
    hint: "Visa / Mastercard",
    tone: "bg-[#0f766e]/12 text-[#0f766e]",
  },
  {
    id: "transfer",
    label: "Bank transfer",
    hint: "Domestic bank",
    tone: "bg-[#1d4ed8]/12 text-[#1d4ed8]",
  },
  {
    id: "momo",
    label: "MoMo",
    hint: "E-wallet",
    tone: "bg-[#d82d8b]/12 text-[#a81966]",
  },
  {
    id: "zalopay",
    label: "ZaloPay",
    hint: "E-wallet",
    tone: "bg-[#0068ff]/12 text-[#0052cc]",
  },
  {
    id: "shopeepay",
    label: "ShopeePay",
    hint: "E-wallet",
    tone: "bg-[#ee4d2d]/12 text-[#c9341a]",
  },
];

export const WALLET_COPY: Record<
  Extract<PayMethod, "momo" | "zalopay" | "shopeepay">,
  { title: string; body: string; action: string }
> = {
  momo: {
    title: "Pay with MoMo",
    body: "You'll be redirected to the MoMo app or gateway to confirm your payment securely.",
    action: "Continue with MoMo",
  },
  zalopay: {
    title: "Pay with ZaloPay",
    body: "Open ZaloPay to scan a code or confirm your EngliTutor plan payment.",
    action: "Continue with ZaloPay",
  },
  shopeepay: {
    title: "Pay with ShopeePay",
    body: "Use your balance or linked bank account in ShopeePay to complete the order.",
    action: "Continue with ShopeePay",
  },
};

export function isWallet(method: PayMethod): method is "momo" | "zalopay" | "shopeepay" {
  return method === "momo" || method === "zalopay" || method === "shopeepay";
}
