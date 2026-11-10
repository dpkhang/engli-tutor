export const queryKeys = {
  account: ["account"] as const,
  billing: {
    me: ["billing", "me"] as const,
    credits: ["credits", "me"] as const,
  },
  learning: {
    all: ["learning"] as const,
    meta: ["learning", "meta"] as const,
    exercises: (skill: string) => ["learning", "exercises", skill] as const,
    exercise: (skill: string, id: string) => ["learning", "exercise", skill, id] as const,
    lessons: ["learning", "lessons"] as const,
    games: ["learning", "games"] as const,
    game: (slug: string, lesson?: string | null) =>
      ["learning", "game", slug, lesson ?? ""] as const,
    vocabProgress: ["learning", "vocab-progress"] as const,
    vocabToday: ["learning", "vocab-today"] as const,
  },
  notifications: ["notifications", "preferences"] as const,
  referrals: {
    me: ["referrals", "me"] as const,
  },
} as const;

export const CACHE_TIMES = {
  catalog: 5 * 60_000,
  session: 60_000,
  gc: 30 * 60_000,
} as const;
