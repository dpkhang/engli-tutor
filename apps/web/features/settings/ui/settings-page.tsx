"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Moon, Sun, Target } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  cn,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";

const LEVEL_STORAGE_KEY = "englitutor-preferred-level";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("pagecraft-theme", theme);
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [level, setLevel] = useState<SkillLevel>("A2+");

  useEffect(() => {
    setTheme(readTheme());
    const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
    if (stored === "A2" || stored === "A2+" || stored === "B1") setLevel(stored);
  }, []);

  const chooseTheme = (next: Theme) => {
    applyTheme(next);
    setTheme(next);
  };

  const chooseLevel = (next: SkillLevel) => {
    localStorage.setItem(LEVEL_STORAGE_KEY, next);
    setLevel(next);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal"
        title="Settings"
        description="Appearance and learning preferences for your EngliTutor workspace."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="size-5 text-primary" />
              ) : (
                <Sun className="size-5 text-primary" />
              )}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Theme</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                ] as const
              ).map((option) => {
                const Icon = option.icon;
                const active = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseTheme(option.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" /> Preferred level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Used as a default hint for practice filters. You can still open any level from Skills.
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((item) => {
                const active = level === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseLevel(item.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.id}
                    <span className="ml-1.5 opacity-70">· {item.labelVi}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Plan & billing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage subscription, credits, and payment methods.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/payments">Open plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
