"use client";

import { memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import type { Plan, PlanId } from "../../model/plans";

const LEARNER_NEEDS = [
  {
    title: "Nervous speaking in meetings",
    body: "You know the words but freeze in stand-ups or client calls.",
  },
  {
    title: "Upcoming IT interview",
    body: "You need to practice answering about experience, projects, and behavioral questions in English.",
  },
  {
    title: "Learn, then forget",
    body: "You've taken courses but lack a daily speaking loop to keep skills sharp.",
  },
  {
    title: "Want feedback in Vietnamese",
    body: "You grasp mistakes faster when AI explains errors and better phrasing in Vietnamese.",
  },
];

const SESSION_BEATS = [
  { time: "0–5′", title: "Short listen", detail: "Workplace / interview clip — catch the main idea" },
  { time: "5–10′", title: "Quick read", detail: "Email, job description, or short passage on the session topic" },
  { time: "10–22′", title: "Speak with AI", detail: "Voice conversation matching the situation you just heard and read" },
  { time: "22–30′", title: "Write + VI feedback", detail: "Write 2–4 summary / answer sentences; AI corrects and suggests more natural phrasing" },
];

const SKILL_PATH = [
  {
    skill: "Listening",
    en: "Listening",
    focus: "Comprehension in meetings & calls",
    practice: "Short clips, stand-ups, customer Q&A — catch keywords and the main idea.",
    outcome: "A2–B1: follow meeting requirements without constantly pausing.",
  },
  {
    skill: "Speaking",
    en: "Speaking",
    focus: "Speaking in meetings & interviews",
    practice: "AI conversations by scenario: intro, project, behavioral.",
    outcome: "A2–B1: clear answers for 10–15 minutes, with pronunciation & grammar feedback in Vietnamese.",
  },
  {
    skill: "Reading",
    en: "Reading",
    focus: "Emails, JDs, short docs",
    practice: "Real workplace passages — skim for meaning, vocabulary in context.",
    outcome: "A2–B1: understand job requirements / briefs without translating word by word.",
  },
  {
    skill: "Writing",
    en: "Writing",
    focus: "Short answers & emails",
    practice: "Write 2–5 reply sentences; AI flags errors and rewrites a more natural version.",
    outcome: "A2–B1: send updates / interview answers in clear writing with correct tense.",
  },
];

const WHY_IT_WORKS = [
  {
    title: "Four skills in one study loop",
    body: "Each session cycles listening → reading → speaking → writing around the same workplace topic — not isolated drills.",
  },
  {
    title: "Vietnamese feedback after you practice",
    body: "AI explains listening, pronunciation, reading, and writing mistakes — plus better sentences and phrasing.",
  },
  {
    title: "Remembers your weak spots",
    body: "Your error profile (tense, s/es, collocation, listening keywords…) carries into the next session so you review what matters.",
  },
];

const STORIES = [
  {
    quote: "Before interviews I practiced 20 minutes every night. Feedback in Vietnamese helped me lock it in fast.",
    name: "Minh Lê",
    role: "Frontend · targeting B1",
  },
  {
    quote: "Short enough after work. AI flags exactly what I keep forgetting — I don't have to relearn whole lessons.",
    name: "Hà Phạm",
    role: "Product Ops · B1",
  },
];

const FAQS = [
  {
    q: "I'm A2 and weak at speaking — can I start?",
    a: "Yes. The placement test covers listening, speaking, reading, and writing, then your path starts at the right level — you still practice all four skills, including the weak ones.",
  },
  {
    q: "Can I only practice speaking?",
    a: "No. Every session includes listening, reading, speaking, and writing on the same topic. Speaking gets the most time, but it's always tied to listening–reading input and a short writing output.",
  },
  {
    q: "How many minutes a day?",
    a: "About 20–30 minutes for a full four-skill loop: listen → read → speak with AI → write + Vietnamese feedback.",
  },
  {
    q: "How is Free different from Standard / Premium?",
    a: "Free limits practice minutes per day. Standard/Premium unlock more time, a deeper path, and interview / workplace scenario practice.",
  },
];

const viewport = { once: true, amount: 0.18, margin: "0px 0px -6% 0px" } as const;
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export type MainBodyViewProps = {
  entryLabel: string;
  plans: Plan[];
  onEntryClick: () => void;
  onPlanClick: (planId: PlanId) => void;
};

export const MainBodyView = memo(function MainBodyView({
  entryLabel,
  plans,
  onEntryClick,
  onPlanClick,
}: MainBodyViewProps) {
  return (
    <div className="bg-background">
      {/* 1. Recognition — for English learners */}
      <section
        id="for-you"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            Built for you
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            If you&apos;re learning English to use it — not just to pass a test.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            EngliTutor is for A2–B1 working professionals who need to speak at work — not another long theory course.
          </p>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {LEARNER_NEEDS.map((item, index) => (
              <article key={item.title} className="space-y-2 border-t border-border pt-6">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{item.body}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 2. Practice session preview */}
      <section id="practice" className="section-snap border-y border-border bg-surface/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-12 px-5 py-24 lg:flex-row lg:items-center lg:gap-16 sm:px-8">
          <motion.div className="flex-1" {...fadeUp}>
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              Sample session
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              20–30 minutes a day — listening, speaking, reading, writing.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              One workplace topic throughout. Input (listen–read) first, output (speak–write) next, then Vietnamese feedback.
            </p>
            <ol className="mt-10 space-y-5">
              {SESSION_BEATS.map((beat) => (
                <li key={beat.time} className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <span className="pt-0.5 text-sm font-medium text-accent">{beat.time}</span>
                  <div>
                    <p className="font-semibold text-foreground">{beat.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{beat.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            className="w-full max-w-md flex-1 lg:max-w-lg"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Session · 4 skills</p>
                  <p className="text-xs text-muted-foreground">Listen → Read → Speak → Write · TOEIC · IELTS</p>
                </div>
                <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                  Live AI
                </span>
              </div>

              <div className="space-y-4 px-4 py-5">
                <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Listen / read
                  </span>
                  Clip + JD: “Tell me about a challenging project you worked on recently.”
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wide text-primary-foreground/65 uppercase">
                    Speak
                  </span>
                  Last year I work on payment feature. It was difficult because deadline is short…
                </div>
                <div className="rounded-xl border border-accent/25 bg-accent/8 px-3.5 py-3">
                  <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
                    Write + Vietnamese feedback
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                    Rewrite: use <span className="font-medium">worked</span> (past tense). Try: “Last year I{" "}
                    <em>worked</em> on a payment feature…” — then say the corrected sentence aloud.
                  </p>
                </div>
              </div>

              <div className="border-t border-border px-4 py-3">
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
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            Four-skill path
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Listening · Speaking · Reading · Writing — one A2–B1 path.
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Placement measures all four skills. Each week you see what&apos;s strong or weak and which lessons to practice next.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SKILL_PATH.map((item, index) => (
              <article
                key={item.skill}
                className="relative flex flex-col border-t-2 border-primary pt-6"
              >
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} · {item.en}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {item.skill}
                </p>
                <p className="mt-3 text-sm font-medium text-accent">{item.focus}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.practice}</p>
                <p className="mt-auto pt-4 text-sm leading-relaxed text-foreground/80">
                  {item.outcome}
                </p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Why it works for learners */}
      <section id="why" className="section-snap border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <motion.div {...fadeUp}>
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              Why it works
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed around English learners — not around “AI features”.
            </h2>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {WHY_IT_WORKS.map((item) => (
                <article key={item.title} className="space-y-3">
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">{item.body}</p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Stories */}
      <section
        id="stories"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div {...fadeUp}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            Learners like you
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            They practice speaking to use it at work right away.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            {STORIES.map((story) => (
              <blockquote key={story.name} className="space-y-5">
                <p className="text-xl leading-snug font-medium tracking-tight text-foreground sm:text-2xl">
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

      {/* 6. Pricing */}
      <section id="pricing" className="section-snap border-y border-border bg-surface/60">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <motion.div {...fadeUp}>
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              Pricing
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Start free — upgrade when you need more speaking time.
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Pricing follows practice time and path depth — not a generic “AI package”.
            </p>

            <div
              className={`mt-12 grid gap-5 ${
                plans.length === 2 ? "mx-auto w-full max-w-190 lg:grid-cols-2" : "lg:grid-cols-3"
              }`}
            >
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`flex flex-col gap-5 rounded-2xl border p-6 ${
                    plan.featured
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground"
                  }`}
                >
                  <div className="space-y-1 border-b border-current/12 pb-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                      {plan.featured ? (
                        <span className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <p className="text-3xl font-semibold tracking-tight">
                      {plan.price}
                      <span
                        className={`ml-1 text-xs font-normal ${
                          plan.featured ? "text-primary-foreground/65" : "text-muted-foreground"
                        }`}
                      >
                        {plan.period}
                      </span>
                    </p>
                    <p
                      className={`pt-2 text-sm ${
                        plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5">
                        <span className="text-accent">·</span>
                        <span
                          className={
                            plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"
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
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="section-snap w-full">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <motion.div {...fadeUp}>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
                  FAQ
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Before your first speaking session.
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                  Focused on level, study time, and how EngliTutor gives feedback.
                </p>
              </div>
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

      {/* 8. Final CTA */}
      <section
        id="start"
        className="section-snap mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground sm:px-12"
          {...fadeUp}
        >
          <div className="relative max-w-lg space-y-5">
            <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
              Start today
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your first speaking session takes just a few minutes to begin.
            </h2>
            <p className="text-base text-primary-foreground/72">
              Create an account, take a quick placement, then practice a situation you need now — a meeting or an interview.
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
