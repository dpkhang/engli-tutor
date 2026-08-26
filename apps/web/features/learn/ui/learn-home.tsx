"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, Lightbulb, MessageCircle, Timer } from "lucide-react";
import { Button } from "@landing-page-generator/ui";
import { LESSON_PACKS, MINI_GAMES, QUICK_TIPS } from "../model/curriculum";
import { useSession } from "@/lib/auth-client";

export function LearnHome() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.trim()?.split(/\s+/)[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";

  const featured = LESSON_PACKS.slice(0, 3);

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
          EngliTutor · Learn every day
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Hi {firstName} — which skill will you practice today?
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Chat with AI, work through listening · speaking · reading · writing drills, get quick tips, and play
          mini-games so practice stays engaging.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-full px-6 text-[15px] font-medium">
            <Link href="/speaking">Speaking conversation</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 text-[15px] font-medium">
            <Link href="/skills">Practice 4 skills</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 text-[15px] font-medium">
            <Link href="/practice">
              <MessageCircle className="size-4" />
              AI Chat
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { label: "Listening", href: "/skills/listening" },
            { label: "Speaking", href: "/speaking" },
            { label: "Reading", href: "/skills/reading" },
            { label: "Writing", href: "/skills/writing" },
          ] as const
        ).map((skill) => (
          <Link
            key={skill.label}
            href={skill.href}
            className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <p className="text-lg font-semibold tracking-tight">{skill.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Content and question sets for {skill.label.toLowerCase()}.
            </p>
          </Link>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Suggested for today</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tap to open chat for that scenario.</p>
          </div>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            All lessons
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {lesson.level}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3.5" />
                  {lesson.duration}
                </span>
              </div>
              <p className="mt-4 text-base font-semibold tracking-tight group-hover:text-primary">
                {lesson.title}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lesson.focus}</p>
              <p className="mt-4 text-xs font-medium text-accent">{lesson.skills.join(" · ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight">Quick tips</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {QUICK_TIPS.map((tip) => (
              <li key={tip} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="text-accent">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight">Games in your session</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {MINI_GAMES.map((game) => (
              <li key={game.title}>
                <p className="text-sm font-semibold text-foreground">{game.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{game.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
