import type { QueryClient } from "@tanstack/react-query";
import type { SkillLevel } from "@/features/learn/model/skill-exercises";
import { accountApi, type AccountProfile } from "@/features/accounts/api";
import { notifyAccountChanged } from "@/features/accounts/model/account-sync";
import { queryKeys } from "@/lib/query";

export const ONBOARDING_PATH = "/onboarding";
export const WELCOME_PATH = "/welcome";
export const WELCOME_DURATION_MS = 3200;
export const WELCOME_PENDING_KEY = "englitutor-welcome-pending";

export function setWelcomePending(dest: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(WELCOME_PENDING_KEY, dest);
  } catch {
    // Checkout can still complete without a pending welcome destination.
  }
}

export function peekWelcomePending() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(WELCOME_PENDING_KEY);
  } catch {
    return null;
  }
}

export function takeWelcomePending() {
  const dest = peekWelcomePending();
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(WELCOME_PENDING_KEY);
    } catch {
      // Ignore storage failures when consuming the flag.
    }
  }
  return dest;
}

export function clearWelcomePending() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(WELCOME_PENDING_KEY);
  } catch {
    // Ignore.
  }
}

export const INTRO_HIGHLIGHTS = [
  {
    title: "Speak with AI",
    hint: "Live conversation with corrections explained in Vietnamese.",
  },
  {
    title: "Four skills, one path",
    hint: "Listening, speaking, reading and writing in short daily sessions.",
  },
  {
    title: "Games in minutes",
    hint: "Quick rounds that lock in vocabulary without a long study block.",
  },
  {
    title: "From A2 to IELTS",
    hint: "Pick a track now. Switch anytime as you grow.",
  },
] as const;

export const NATIVE_LANGUAGE = "Vietnamese";

export const LEARNING_GOALS = [
  {
    id: "speak",
    label: "Speak more confidently",
    hint: "Meetings, interviews, and everyday talk",
  },
  {
    id: "exam",
    label: "Pass an exam",
    hint: "TOEIC, IELTS, or a placement test",
  },
  {
    id: "work",
    label: "Work English",
    hint: "Emails, stand-ups, and workplace chat",
  },
  {
    id: "daily",
    label: "Travel & daily life",
    hint: "Order, ask, and understand around you",
  },
  {
    id: "custom",
    label: "Something else",
    hint: "Write a short goal in your own words",
  },
] as const;

export type LearningGoalId = (typeof LEARNING_GOALS)[number]["id"];

const GOAL_TEXT: Record<Exclude<LearningGoalId, "custom">, string> = {
  speak: "I want to speak more confidently in conversations and meetings.",
  exam: "I want to prepare for an English exam such as TOEIC or IELTS.",
  work: "I want to write and speak better English at work.",
  daily: "I want English for travel and everyday situations.",
};

export function goalText(id: LearningGoalId, custom: string) {
  if (id === "custom") return custom.trim();
  return GOAL_TEXT[id];
}

export function needsOnboarding(
  profile: { targetLevel: SkillLevel | string | null } | null | undefined,
) {
  return profile != null && !profile.targetLevel;
}

export function hasSeenWelcome(profile: { welcomeSeenAt?: string | null } | null | undefined) {
  return Boolean(profile?.welcomeSeenAt);
}

export async function persistWelcomeSeen(queryClient: QueryClient) {
  queryClient.setQueryData(queryKeys.account, (current: AccountProfile | undefined) =>
    current && !current.welcomeSeenAt
      ? { ...current, welcomeSeenAt: new Date().toISOString() }
      : current,
  );
  notifyAccountChanged(queryClient.getQueryData<AccountProfile>(queryKeys.account));
  try {
    const profile = await accountApi.update({ welcomeSeen: true });
    queryClient.setQueryData(queryKeys.account, profile);
  } catch {
    // Optimistic cache already prevents a welcome redirect loop this session.
  }
}

export function safeOnboardingReturnTo(raw: string | null | undefined) {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (
    raw === ONBOARDING_PATH ||
    raw.startsWith(`${ONBOARDING_PATH}?`) ||
    raw === WELCOME_PATH ||
    raw.startsWith(`${WELCOME_PATH}?`) ||
    raw === "/login"
  ) {
    return "/";
  }
  return raw;
}

export function formatVnd(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export function planPriceVnd(priceVndMonthly: number, period: "monthly" | "yearly") {
  if (priceVndMonthly <= 0) return 0;
  return period === "yearly" ? priceVndMonthly * 10 : priceVndMonthly;
}
