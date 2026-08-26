"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@landing-page-generator/ui";
import { LESSON_PACKS } from "../model/curriculum";

const SCENARIOS = [
  { id: "interview", label: "Interview", body: "Behavioral, project, self-intro" },
  { id: "standup", label: "Stand-up", body: "Yesterday / today / blockers" },
  { id: "smalltalk", label: "Small talk", body: "Light office conversation" },
  { id: "email", label: "Email", body: "Read & write short emails" },
  { id: "free", label: "Free form", body: "You choose the topic" },
] as const;

export function StartPracticePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
          Start practice
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose a chat scenario with AI
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          No more landing-page builder. Pick a scenario or a lesson pack — EngliTutor will converse and give
          feedback.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">By scenario</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCENARIOS.map((item) => (
            <Link
              key={item.id}
              href={`/practice?scenario=${item.id}`}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
            >
              <p className="font-semibold tracking-tight">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <MessageCircle className="size-4" />
                Open chat
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h2 className="text-lg font-semibold tracking-tight">Or pick a ready lesson pack</h2>
        </div>
        <ul className="divide-y divide-border border-y border-border">
          {LESSON_PACKS.slice(0, 4).map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold">{lesson.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lesson.level} · {lesson.duration} · {lesson.skills.join(" · ")}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary">Practice</span>
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/lessons">View full path</Link>
        </Button>
      </section>
    </div>
  );
}
