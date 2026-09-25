"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

type Theme = "light" | "dark";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    sync();
    window.addEventListener("pagecraft-theme", sync);
    return () => {
      window.removeEventListener("pagecraft-theme", sync);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    window.dispatchEvent(new Event("pagecraft-theme"));
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";
  const label = isDark ? "Light mode" : "Dark mode";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4.5" />
    </button>
  );
}
