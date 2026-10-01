import { workspaceApiClient } from "@/lib/workspace-api-client";
import type { LearningGameId } from "./types";

export type VocabProgressItem = {
  wordId: string;
  box: number;
  dueAt: string;
  lastCorrect: boolean | null;
  lastSeenAt: string | null;
  saved: boolean;
};

export type VocabProgressList = { items: VocabProgressItem[] };

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
  review: (wordId: string, correct: boolean) =>
    workspaceApiClient.post<VocabProgressItem>(`${BASE}/vocab/review`, { wordId, correct }),
  setSaved: (wordId: string, saved: boolean) =>
    workspaceApiClient.put<VocabProgressItem>(`${BASE}/vocab/saved/${encodeURIComponent(wordId)}`, { saved }),
  import: (marks: LegacyFlashcardMarks) =>
    workspaceApiClient.post<VocabProgressList>(`${BASE}/vocab/import`, marks),
};

export const gameSessionsApi = {
  record: (input: GameSessionInput) => workspaceApiClient.post<{ ok: true }>(`${BASE}/games/sessions`, input),
};
