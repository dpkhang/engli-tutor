"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import type { Plan, PlanId } from "@/features/marketing/model/plans";

const FEATURES = [
  {
    title: "Bố cục sẵn sàng chạy ads",
    body: "Hero, form, social proof và CTA được sắp sẵn theo chuẩn conversion — chỉ việc điền nội dung chiến dịch.",
  },
  {
    title: "Xuất bản nhanh",
    body: "Một lần chỉnh, một lần publish. Đồng bộ slug, preview và trạng thái trang mà không cần deploy thủ công.",
  },
  {
    title: "Tập trung nội dung",
    body: "Bỏ qua boilerplate UI. Pagecraft giữ phần khung để team marketing chỉ lo message và hình ảnh.",
  },
];

const STEPS = [
  { step: "01", title: "Mô tả chiến dịch", body: "Nhập mục tiêu, audience và offer." },
  { step: "02", title: "Chọn khung trang", body: "Áp layout phù hợp funnel của bạn." },
  { step: "03", title: "Xuất bản", body: "Share link hoặc gắn domain riêng." },
];

const STORIES = [
  {
    quote:
      "Trước đây mỗi campaign mất gần một tuần dựng trang. Với Pagecraft, team copy xong là publish trong buổi chiều.",
    name: "Lan Nguyễn",
    role: "Growth Lead, Nova Commerce",
  },
  {
    quote:
      "Không còn chờ design-dev ping-pong. Chúng tôi iterate message trên landing thật, đo conversion ngay.",
    name: "Minh Trần",
    role: "Marketing Manager, Pulse SaaS",
  },
];

const FAQS = [
  {
    q: "Tôi có cần biết code không?",
    a: "Không. Pagecraft dành cho marketer: chọn khung, điền nội dung, xuất bản.",
  },
  {
    q: "Có gắn domain riêng được không?",
    a: "Có trên gói Growth trở lên. Starter dùng subdomain Pagecraft để launch nhanh.",
  },
  {
    q: "Dữ liệu form lead đi đâu?",
    a: "Bạn có thể nhận email thông báo hoặc webhook vào CRM / Google Sheet.",
  },
  {
    q: "Hủy gói bất cứ lúc nào?",
    a: "Có. Thanh toán theo tháng, hủy trước kỳ tiếp theo là dừng tính phí.",
  },
];

const viewport = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition: { duration: 0.35, ease: "easeOut" as const },
};

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}

export type MainBodyViewProps = {
  entryLabel: string;
  plans: Plan[];
  onEntryClick: () => void;
  onPlanClick: (planId: PlanId) => void;
};

export function MainBodyView({
  entryLabel,
  plans,
  onEntryClick,
  onPlanClick,
}: MainBodyViewProps) {
  return (
    <div className="bg-[radial-gradient(ellipse_at_top,hsl(var(--surface)),hsl(var(--background))_55%)]">
      <section
        id="features"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <SectionIntro
            eyebrow="Tính năng"
            title="Đủ để launch, không thừa cho team nhỏ."
            description="Mỗi phần trên trang phục vụ một việc: nói rõ giá trị, dẫn người xem tới hành động."
          />
          <div className="mt-14 divide-y divide-border border-y border-border">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="grid gap-3 py-8 md:grid-cols-[0.9fr_1.4fr] md:gap-10"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl text-foreground md:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      <section
        id="workflow"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <SectionIntro eyebrow="Quy trình" title="Ba bước từ brief tới link live." />
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="space-y-3">
                <span className="font-[family-name:var(--font-display)] text-4xl text-accent/80">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section id="pricing" className="section-snap w-full border-y border-border bg-background/70">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <motion.div {...fadeUp}>
            <SectionIntro
              eyebrow="Pricing"
              title="Giá rõ ràng theo quy mô chiến dịch."
              description="Bắt đầu miễn phí, nâng cấp khi cần thêm page, domain và workspace."
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`flex flex-col gap-6 rounded-2xl border p-7 ${
                    plan.featured
                      ? "border-accent bg-foreground text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {plan.featured ? (
                        <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                          Phổ biến
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`text-sm ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
                    {plan.price}
                    <span
                      className={`ml-1 text-sm font-sans font-normal ${
                        plan.featured ? "text-primary-foreground/65" : "text-muted-foreground"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </p>

                  <ul className="space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-accent">→</span>
                        <span
                          className={
                            plan.featured ? "text-primary-foreground/85" : "text-muted-foreground"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    className={`mt-auto w-full ${
                      plan.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""
                    }`}
                    variant={plan.featured ? "default" : "outline"}
                    onClick={() => {
                      onPlanClick(plan.id);
                    }}
                  >
                    {plan.cta}
                  </Button>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="stories"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <SectionIntro eyebrow="Khách hàng" title="Team marketing đang ship nhanh hơn." />
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            {STORIES.map((story) => (
              <blockquote key={story.name} className="space-y-6 border-l-2 border-accent pl-6">
                <p className="font-[family-name:var(--font-display)] text-xl leading-snug text-foreground sm:text-2xl">
                  “{story.quote}”
                </p>
                <footer className="text-sm">
                  <p className="font-semibold text-foreground">{story.name}</p>
                  <p className="text-muted-foreground">{story.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="faq" className="section-snap w-full border-t border-border bg-surface/60">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <motion.div {...fadeUp}>
            <SectionIntro
              eyebrow="FAQ"
              title="Câu hỏi thường gặp."
              description="Những thắc mắc phổ biến trước khi bắt đầu dùng Pagecraft."
            />
            <div className="mt-12">
              <Accordion type="single" collapsible defaultValue={FAQS[0]?.q}>
                {FAQS.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="cta"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#06352d,#0a4a3c_50%,#1f8a68)] px-8 py-14 text-primary-foreground sm:px-12"
          {...fadeUp}
        >
          <div
            aria-hidden
            className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full border border-white/15"
          />
          <div className="relative max-w-xl space-y-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
              Sẵn sàng launch trang tiếp theo?
            </h2>
            <p className="text-base text-primary-foreground/75">
              Tạo tài khoản miễn phí, chọn template và publish landing trong cùng một buổi.
            </p>
            <Button
              type="button"
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={onEntryClick}
            >
              {entryLabel}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
