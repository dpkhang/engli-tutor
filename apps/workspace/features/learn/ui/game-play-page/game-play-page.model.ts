import type { LearningGameRound, LearningQuestion } from "../../api/types";
import { evaluateHunt } from "../../model/games";
import type { VocabGrade } from "../../api/vocab-api";

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function explanationOf(question: LearningQuestion) {
  return question.explanation;
}

/** Initial answer value for a round, by question kind. */
export function initialRoundValue(question: LearningQuestion): string {
  return question.kind === "order" || question.kind === "match" || question.kind === "hunt"
    ? question.kind === "match"
      ? JSON.stringify(question.pairs.map(() => null))
      : "[]"
    : "";
}

export function parseOrderValue(value: string) {
  return parseJson(value || "[]", [] as number[]);
}

export function parseMatchValue(value: string, question: LearningQuestion) {
  return parseJson(
    value || "[]",
    (question.kind === "match" ? question.pairs : []).map(() => null) as Array<number | null>,
  );
}

export function parseHuntValue(value: string) {
  return parseJson(value || "[]", [] as string[]);
}

/** Whether the current answer value is complete enough to submit. */
export function isRoundReady(question: LearningQuestion, value: string): boolean {
  return question.kind === "order"
    ? parseJson(value || "[]", [] as number[]).length === question.items.length
    : question.kind === "match"
      ? parseJson(value || "[]", [] as Array<number | null>).every((item) => item !== null)
      : question.kind === "hunt"
        ? parseJson(value || "[]", [] as string[]).length >= 1
        : question.kind === "spell"
          ? value.trim().length === question.answer.length
          : value.trim().length > 0;
}

export const FLASH_GRADE_SHORTCUTS: Array<{ grade: VocabGrade; shortcut: string }> = [
  { grade: "again", shortcut: "1" },
  { grade: "hard", shortcut: "2" },
  { grade: "good", shortcut: "3" },
];

/** Maps a keydown to a flashcard grade (Enter = good); null when the key should be ignored. */
export function flashGradeForKey(event: KeyboardEvent): VocabGrade | null {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return null;
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
  ) {
    return null;
  }
  const grade = FLASH_GRADE_SHORTCUTS.find(
    (item) => item.shortcut.toLowerCase() === event.key.toLowerCase(),
  )?.grade;
  if (grade) return grade;
  if (event.key === "Enter") return "good";
  return null;
}

export type HuntQuestion = Extract<LearningQuestion, { kind: "hunt" }>;

export type HuntTarget = {
  word: string;
  meaningVi?: string;
  ipa?: string;
  accept?: string[];
};

const norm = (value: string) => value.trim().toLowerCase();

export function getHuntTargets(question: HuntQuestion): HuntTarget[] {
  return question.targets?.length
    ? question.targets
    : question.correctWords.map((word) => ({ word }));
}

export function formsOf(target: HuntTarget): string[] {
  return [target.word, ...(target.accept ?? [])].map(norm).filter(Boolean);
}

export function parsePicks(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export type ChipStatus = "hit" | "false" | "missed" | "neutral";

/** Status of each option chip once the round is locked. */
export function huntChipStatus(question: HuntQuestion, picked: string[], word: string): ChipStatus {
  const targets = getHuntTargets(question);
  const evaluation = evaluateHunt(question, picked);
  const key = norm(word);
  const owner = targets.find((target) => formsOf(target).includes(key));
  const isPicked = picked.some((pick) => norm(pick) === key);
  if (isPicked) return owner ? "hit" : "false";
  if (owner && evaluation.missed.includes(owner.word)) return "missed";
  return "neutral";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type Segment = { text: string; target?: HuntTarget };

export function splitTranscript(text: string, targets: HuntTarget[]): Segment[] {
  const lookup = new Map<string, HuntTarget>();
  for (const target of targets) for (const form of formsOf(target)) lookup.set(form, target);
  const forms = [...lookup.keys()].sort((a, b) => b.length - a.length);
  if (!forms.length) return [{ text }];
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(${forms.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}])`,
    "giu",
  );
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: text.slice(last, start) });
    segments.push({ text: match[0], target: lookup.get(norm(match[0])) });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

type Answer = { value: string } | undefined;

export type HuntSummaryRow = { id: string; prompt: string; hits: number; total: number };

/** Per-round hits/total plus the most frequently missed words across the session. */
export function summarizeHuntResults(session: LearningGameRound[], answers: Answer[]) {
  const counts = new Map<string, number>();
  const rowList: HuntSummaryRow[] = [];
  session.forEach((round, i) => {
    const question = round.question;
    if (question.kind !== "hunt") return;
    const evaluation = evaluateHunt(question, parsePicks(answers[i]?.value ?? "[]"));
    rowList.push({
      id: `${round.id}-${i}`,
      prompt: question.prompt,
      hits: evaluation.hits.length,
      total: getHuntTargets(question).length,
    });
    for (const word of evaluation.missed) counts.set(word, (counts.get(word) ?? 0) + 1);
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { rows: rowList, frequent: sorted };
}
