import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TranslateDirection = "en-vi" | "vi-en";
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
};

export const translateApi = {
  lookup: (input: { text: string; direction: TranslateDirection; focusWord?: string }) =>
    workspaceApiClient.post<TranslateResult>("/api/tutor/translate", {
      text: input.text,
      direction: input.direction,
      ...(input.focusWord ? { focusWord: input.focusWord } : {}),
    }),
};
