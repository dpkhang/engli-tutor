"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@engli-tutor/ui";
import { motion, useReducedMotion } from "motion/react";
import type { Plan, PlanId } from "../../model/plans";
import { useMarketingI18n } from "@/features/i18n";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { usePathname } from "next/navigation";

const LEARNER_NEEDS = [
  {
    title: "Speak clearly when work gets real",
    body: "Practice the exact moments that matter: stand-ups, client calls, interviews, and project updates.",
  },
  {
    title: "Get useful feedback fast",
    body: "See what to fix after you try: grammar, pronunciation, vocabulary, and a more natural answer.",
  },
  {
    title: "Build a daily habit",
    body: "Short sessions keep English active without asking you to sit through a long course after work.",
  },
  {
    title: "Understand mistakes in Vietnamese",
    body: "Vietnamese explanations help you notice why a sentence sounds wrong and how to say it better next time.",
  },
];

const SESSION_BEATS = [
  {
    step: "01",
    time: "0–5′",
    title: "Listen for the situation",
    detail: "Hear a short workplace or interview prompt and catch the main task, keywords, and tone.",
  },
  {
    step: "02",
    time: "5–10′",
    title: "Read the context",
    detail: "Scan an email, job description, or short brief so your answer has the right details.",
  },
  {
    step: "03",
    time: "10–22′",
    title: "Speak with the AI tutor",
    detail: "Answer follow-up questions out loud, then retry with clearer grammar and pronunciation.",
  },
  {
    step: "04",
    time: "22–30′",
    title: "Write and review",
    detail: "Write a short summary or reply; get Vietnamese feedback and a natural rewrite to practice aloud.",
  },
];

const SKILL_PATH = [
  {
    skill: "Listening",
    focus: "Catch meaning in meetings and calls",
    practice: "Short clips, stand-ups, customer questions, and interview prompts.",
    outcome: "Follow the main idea, key requirements, and next actions with less pausing.",
  },
  {
    skill: "Speaking",
    focus: "Answer with structure and confidence",
    practice: "Scenario conversations for introductions, projects, decisions, and behavioral questions.",
    outcome: "Give clearer A2–B1 answers and retry after pronunciation and grammar feedback.",
  },
  {
    skill: "Reading",
    focus: "Understand workplace text faster",
    practice: "Emails, job descriptions, short docs, and lesson notes with vocabulary in context.",
    outcome: "Find the useful details without translating every word.",
  },
  {
    skill: "Writing",
    focus: "Send simple, natural replies",
    practice: "Write short updates, summaries, and interview answers after each speaking task.",
    outcome: "Use better tense, word choice, and sentence order in practical writing.",
  },
];

const WHY_IT_WORKS = [
  {
    title: "One topic, four skills",
    body: "Listening, reading, speaking, and writing reinforce the same situation instead of becoming separate drills.",
  },
  {
    title: "Feedback after action",
    body: "You try first, then receive Vietnamese explanations and improved phrasing you can immediately repeat.",
  },
  {
    title: "Practice follows weak spots",
    body: "Common errors such as tense, s/es, collocation, or missed keywords can carry into the next session.",
  },
];

const USE_CASES = [
  {
    title: "Before a project interview",
    body: "Practice explaining your role, the problem, your solution, and what you learned — then tighten the answer.",
  },
  {
    title: "Before a weekly meeting",
    body: "Rehearse a status update, answer follow-up questions, and turn your notes into a short written summary.",
  },
];

function PolicyFaqLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-fit items-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

const FAQS: Array<{ id: string; link?: { href: string; labelKey: string } }> = [
  { id: "start" },
  { id: "speaking" },
  { id: "minutes" },
  { id: "plans" },
  { id: "audio", link: { href: "/policy#voice-and-ai", labelKey: "home.faqVoiceLink" } },
  { id: "cookies", link: { href: "/policy/cookies", labelKey: "home.faqCookieLink" } },
];

const viewport = { once: true, amount: 0.18, margin: "0px 0px -6% 0px" } as const;

type PricingStatus = "loading" | "error" | "ready";

export type MainBodyViewProps = {
  entryLabel: string;
  plans: Plan[];
  pricingStatus: PricingStatus;
  pricingError: string | null;
  onEntryClick: () => void;
  onPlanClick: (planId: PlanId) => void;
  onRetryPricing: () => void;
};

export const MainBodyView = memo(function MainBodyView({
  entryLabel,
  plans,
  pricingStatus,
  pricingError,
  onEntryClick,
  onPlanClick,
  onRetryPricing,
}: MainBodyViewProps) {
  const t = useMarketingI18n();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : "en";
  const localize = (href: string) => href.startsWith("/") ? `/${locale}${href}` : href;
  const prefersReducedMotion = useReducedMotion();
  const fadeUp = prefersReducedMotion
    ? {
        initial: false,
        whileInView: undefined,
        viewport,
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: { duration: 0.35, ease: "easeOut" as const },
      };
  const previewMotion = prefersReducedMotion
    ? {
        initial: false,
        whileInView: undefined,
        viewport,
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: { duration: 0.4, delay: 0.08, ease: "easeOut" as const },
      };

  return (
    <div className="bg-background">
      {/* 1. Recognition — for English learners */}
      <section
        id="for-you"
        className="section-snap marketing-container marketing-section"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            {t("home.builtForPractical")}
          </p>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
            <div>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("home.recognitionTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("home.recognitionDescription")}
              </p>
            </div>
            <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-sm sm:text-base">
              {t("home.recognitionNote")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNER_NEEDS.map((item, index) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-wide text-accent">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{t(`home.learnerNeeds.${index}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`home.learnerNeeds.${index}.body`)}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 2. Practice session preview */}
      <section id="practice" className="section-snap border-y border-border bg-surface/80">
        <div className="marketing-container marketing-section flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <motion.div className="flex-1" {...fadeUp}>
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              {t("home.sampleLesson")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("home.sampleTitle")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("home.sampleDescription")}
            </p>
            <ol className="mt-10 grid gap-4" aria-label={t("home.sampleSteps")}>
              {SESSION_BEATS.map((beat) => (
                <li key={beat.step} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/12 text-sm font-semibold text-accent">
                      {beat.step}
                    </span>
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground">{beat.time}</p>
                      <p className="mt-1 font-semibold text-foreground">{t(`home.sessionBeats.${SESSION_BEATS.indexOf(beat)}.title`)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`home.sessionBeats.${SESSION_BEATS.indexOf(beat)}.detail`)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            className="w-full max-w-md flex-1 lg:max-w-lg"
            {...previewMotion}
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("home.lessonPreview")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.loopSteps")}</p>
                </div>
                <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                  {t("home.aiTutor")}
                </span>
              </div>

              <div className="space-y-4 px-4 py-5">
                <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("home.listenRead")}
                  </span>
                  {t("home.promptLabel")} “Tell me about a challenging project you worked on recently.”
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wide text-primary-foreground/65 uppercase">
                    {t("workspace.speak")}
                  </span>
                  Last year I work on payment feature. It was difficult because deadline is short…
                </div>
                <div className="rounded-2xl border border-accent/25 bg-accent/8 px-3.5 py-3">
                  <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
                    {t("home.feedback")}
                  </p>
                  <p lang="vi" className="mt-1.5 text-sm leading-relaxed text-foreground">
                    Dùng <span className="font-medium">worked</span> thay vì “work” vì bạn đang nói về năm ngoái. Thử nói lại: <span lang="en">“Last year I worked on a payment feature…”</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-border px-4 py-3">
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t("home.illustrativePreview")}</p>
                <Button
                  type="button"
                  className="h-11 w-full rounded-full text-[15px] font-medium"
                  onClick={onEntryClick}
                >
                  {entryLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Four-skill path */}
      <section
        id="path"
        className="section-snap marketing-container marketing-section"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            {t("home.skills")}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("home.skillsTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("home.skillsDescription")}
          </p>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {SKILL_PATH.map((item, index) => (
              <article
                key={item.skill}
                className="flex min-h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <p className="text-xs font-semibold tracking-wide text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {t(`home.skillPath.${index}.skill`)}
                </h3>
                <p className="mt-3 text-sm font-medium text-foreground">{t(`home.skillPath.${SKILL_PATH.indexOf(item)}.focus`)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`home.skillPath.${SKILL_PATH.indexOf(item)}.practice`)}</p>
                <p className="mt-auto pt-5 text-sm leading-relaxed text-foreground/80">
                  {t(`home.skillPath.${SKILL_PATH.indexOf(item)}.outcome`)}
                </p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Why it works for learners */}
      <section id="why" className="section-snap border-y border-border bg-primary text-primary-foreground">
        <div className="marketing-container marketing-section">
          <motion.div {...fadeUp}>
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              {t("home.why")}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("home.whyTitle")}
            </h2>
            <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
              {WHY_IT_WORKS.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/14 bg-white/6 p-5">
                  <h3 className="text-lg font-semibold tracking-tight">{t(`home.whyItems.${WHY_IT_WORKS.indexOf(item)}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/72">{t(`home.whyItems.${WHY_IT_WORKS.indexOf(item)}.body`)}</p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Use cases */}
      <section
        id="stories"
        className="section-snap marketing-container marketing-section"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            {t("home.useCases")}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("home.useCasesTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            {t("home.useCasesDescription")}
          </p>
          <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2">
            {USE_CASES.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{t(`home.useCasesItems.${USE_CASES.indexOf(item)}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t(`home.useCasesItems.${USE_CASES.indexOf(item)}.body`)}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 6. Pricing */}
      <section id="pricing" className="section-snap border-y border-border bg-surface/60">
        <div className="marketing-container marketing-section">
          <motion.div {...fadeUp}>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-12">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
                  {t("home.pricing")}
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("home.pricingTitle")}
                </h2>
              </div>
              <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-sm sm:text-base">
                {t("home.pricingNote")}
              </p>
            </div>

            {pricingStatus === "loading" ? (
              <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:mt-10" role="status" aria-live="polite">
                <p className="text-lg font-semibold tracking-tight text-foreground">{t("home.loadingPlans")}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {t("home.checkingCatalog")}
                </p>
                <Button type="button" className="mt-5 rounded-full" onClick={onEntryClick}>
                  {entryLabel}
                </Button>
              </div>
            ) : pricingStatus === "error" ? (
              <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:mt-10" role="alert">
                <p className="text-lg font-semibold tracking-tight text-foreground">{t("workspace.plansCouldNotLoad")}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {pricingError ?? t("home.pricingUnavailable")}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button type="button" className="rounded-full" onClick={onEntryClick}>
                    {entryLabel}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={onRetryPricing}>
                    {t("home.retryPricing")}
                  </Button>
                  <Button asChild type="button" variant="outline" className="rounded-full">
                    <Link href="/payment">{t("home.openPayment")}</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`mt-8 grid gap-5 sm:mt-10 ${
                  plans.length === 2 ? "mx-auto w-full max-w-190 lg:grid-cols-2" : "lg:grid-cols-3"
                }`}
              >
                {plans.map((plan) => (
                  <article
                    key={plan.id}
                    className={`flex flex-col gap-5 rounded-3xl border p-6 shadow-sm ${
                      plan.featured
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_24px_60px_-36px_rgba(15,23,42,0.5)]"
                        : "border-border bg-card text-card-foreground"
                    }`}
                  >
                    <div className="space-y-1 border-b border-current/12 pb-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                        {plan.featured ? (
                          <span className="rounded-full bg-accent/16 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
                            {t("payment.popular")}
                          </span>
                        ) : null}
                      </div>
                      <p className="pt-3 text-4xl font-semibold tracking-tight">
                        {plan.price}
                        <span
                          className={`ml-1 text-sm font-normal ${
                            plan.featured ? "text-primary-foreground/65" : "text-muted-foreground"
                          }`}
                        >
                          {plan.period}
                        </span>
                      </p>
                      <p
                        className={`pt-2 text-sm leading-relaxed ${
                          plan.featured ? "text-primary-foreground/72" : "text-muted-foreground"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 text-sm" aria-label={`${plan.name} benefits`}>
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2.5">
                          <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                          <span
                            className={
                              plan.featured ? "text-primary-foreground/82" : "text-muted-foreground"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      className={`mt-auto h-11 w-full rounded-full text-[15px] font-medium ${
                        plan.featured
                          ? "bg-white text-[#0b1524] hover:bg-white/92"
                          : ""
                      }`}
                      variant={plan.featured ? "default" : "outline"}
                      onClick={() => onPlanClick(plan.id)}
                    >
                      {plan.cta}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="section-snap w-full">
        <div className="marketing-container marketing-section">
          <motion.div {...fadeUp}>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
                  {t("home.faq")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("home.faqTitle")}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {t("home.faqDescription")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={localize("/policy")} target="_blank" rel="noopener noreferrer">{t("home.privacy")}</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={localize("/policy/cookies")} target="_blank" rel="noopener noreferrer">{t("home.cookies")}</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-2 shadow-sm">
                <Accordion type="single" collapsible defaultValue={FAQS[0]?.id}>
                  {FAQS.map((item, index) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{t(`home.faqItems.${index}.q`)}</AccordionTrigger>
                      <AccordionContent>
                        {t(`home.faqItems.${index}.a`)}
                        {item.link ? (
                          <PolicyFaqLink href={item.link.href}>{t(item.link.labelKey)}</PolicyFaqLink>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section
        id="start"
        className="section-snap marketing-container pb-12 sm:pb-16 lg:pb-20"
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10 lg:px-12 lg:py-12"
          {...fadeUp}
        >
          <div className="relative max-w-lg space-y-5">
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              {t("home.finalEyebrow")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("home.finalTitle")}
            </h2>
            <p className="text-base leading-relaxed text-primary-foreground/72">
              {t("home.finalDescription")}
            </p>
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-full border-0 bg-white px-7 text-[15px] font-medium text-[#0b1524] hover:bg-white/92"
              onClick={onEntryClick}
            >
              {entryLabel}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
});
