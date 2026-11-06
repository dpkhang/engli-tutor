import { workspaceApiClient } from "@/lib/workspace-api-client";
import type { LearningGameId } from "./types";

export type VocabProgressItem = {
  wordId: string;
  box: number;
  dueAt: string;
  lastCorrect: boolean | null;
  lastSeenAt: string | null;
  saved: boolean;
  /** SRS fields; absent on payloads from older servers. */
  ease?: number;
  streak?: number;
  intervalDays?: number;
  lastGrade?: VocabGrade | null;
};

export type VocabGrade = "again" | "hard" | "good";

/** Exactly one of grade (counts toward vocab_review quota) or correct (does not). */
export type VocabReviewInput = { grade: VocabGrade } | { correct: boolean };

export type VocabProgressList = { items: VocabProgressItem[]; dueCount?: number };

export type VocabToday = {
  dueCount: number;
  wordIds: string[];
  reviewsUsed: number;
  reviewsLimit: number | null;
  resetAt: string;
};

export type LegacyFlashcardMarks = { unlearned: string[]; saved: string[] };

export type GameSessionInput = {
  gameId: LearningGameId;
  mode?: string;
  deckId?: string;
  correct: number;
  total: number;
  durationMs: number;
};

const BASE = "/api/learning";

export const vocabApi = {
  progress: () => workspaceApiClient.get<VocabProgressList>(`${BASE}/vocab/progress`),
  today: () => workspaceApiClient.get<VocabToday>(`${BASE}/vocab/today`),
  review: (wordId: string, input: VocabReviewInput) =>
    workspaceApiClient.post<VocabProgressItem>(`${BASE}/vocab/review`, { wordId, ...input }),
  setSaved: (wordId: string, saved: boolean) =>
    workspaceApiClient.put<VocabProgressItem>(`${BASE}/vocab/saved/${encodeURIComponent(wordId)}`, { saved }),
  import: (marks: LegacyFlashcardMarks) =>
    workspaceApiClient.post<VocabProgressList>(`${BASE}/vocab/import`, marks),
};

export const gameSessionsApi = {
  record: (input: GameSessionInput) => workspaceApiClient.post<{ ok: true }>(`${BASE}/games/sessions`, input),
};
