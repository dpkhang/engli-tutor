import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TranslateDirection = "en-vi";
export type ExplanationLocale = "en" | "vi";
export type TranslateKind = "word" | "sentence";

export type TranslateSense = {
  meaningVi: string;
  meaningEn: string;
  example: string;
};

export type TranslateChunk = {
  phrase: string;
  meaningVi: string;
  role: string;
};

export type TranslateResult = {
  kind: TranslateKind;
  query: string;
  translation: string;
  paraphrase: string;
  alternatives: Array<{ label: string; text: string; note: string }>;
  usageNote: string;
  word: {
    headword: string;
    phonetic: string;
    partOfSpeech: string;
    level: string;
    senses: TranslateSense[];
    collocations: string[];
  } | null;
  sentence: {
    meaningVi: string;
    breakdown: string;
    tone: string;
    chunks: TranslateChunk[];
    moreNatural: string;
  } | null;
  tips: string[];
  demo: boolean;
  source?: "dictionary" | "ai" | "demo";
};

export const translateApi = {
  lookup: (input: { text: string; direction: TranslateDirection; focusWord?: string; mode?: "full" | "dictionary"; explanationLocale?: ExplanationLocale }) =>
    workspaceApiClient.post<TranslateResult>("/api/tutor/translate", {
      text: input.text,
      direction: input.direction,
      ...(input.focusWord ? { focusWord: input.focusWord } : {}),
      ...(input.mode ? { mode: input.mode } : {}),
      ...(input.explanationLocale ? { explanationLocale: input.explanationLocale } : {}),
    }),
  prefetch: (input: { direction: TranslateDirection; words: string[]; explanationLocale?: ExplanationLocale }) =>
    workspaceApiClient.post<{ results: Record<string, TranslateResult> }>("/api/tutor/translate/batch", {
      direction: input.direction,
      words: input.words,
      ...(input.explanationLocale ? { explanationLocale: input.explanationLocale } : {}),
    }),
};
