import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_GAMES } from "./games-fallback";
import {
  evaluateOpen,
  longestStreak,
  pickGameRounds,
  roundPoints,
  scoreGameRound,
  timeLimitFor,
} from "./games";
import type { LearningGameRound, LearningQuestion } from "../api/types";

type OpenQuestion = Extract<LearningQuestion, { kind: "open" }>;

const open = (overrides: Partial<OpenQuestion> = {}): OpenQuestion => ({
  id: "q",
  kind: "open",
  prompt: "Say hi",
  keywords: ["start"],
  sampleAnswer: "",
  explanation: "",
  ...overrides,
});

test("matches whole words, not substrings", () => {
  assert.equal(evaluateOpen("I restart it", open()).correct, false);
  assert.equal(evaluateOpen("I start now", open()).correct, true);
});

test("accepts inflected forms of a keyword", () => {
  assert.equal(evaluateOpen("We started late", open()).correct, true);
  assert.equal(evaluateOpen("Starting soon", open()).correct, true);
});

test("accepts synonyms from keywordGroups and reports missing groups", () => {
  const question = open({
    keywordGroups: [
      ["could", "can"],
      ["review", "check"],
    ],
  });
  const ok = evaluateOpen("Can you check my PR?", question);
  assert.equal(ok.correct, true);
  assert.deepEqual(ok.missing, []);

  const partial = evaluateOpen("Can you help?", question);
  assert.equal(partial.correct, false);
  assert.deepEqual(partial.matched, ["could"]);
  assert.deepEqual(partial.missing, ["review"]);
});

test("matches multi-word phrases and curly apostrophes", () => {
  const question = open({ keywordGroups: [["my name", "I'm"]] });
  assert.equal(evaluateOpen("Hi, I’m Minh", question).correct, true);
  assert.equal(evaluateOpen("My name is Minh", question).correct, true);
  assert.equal(evaluateOpen("Hello there", question).correct, false);
});

test("enforces maxWords", () => {
  const question = open({ keywords: [] });
  const result = evaluateOpen("one two three four five six seven eight", question, { maxWords: 5 });
  assert.equal(result.overLimit, true);
  assert.equal(result.correct, false);
  assert.equal(scoreGameRound(question, "one two three four five", { maxWords: 5 }), true);
});

test("empty answer lists every group as missing", () => {
  const result = evaluateOpen("  ", open({ keywords: ["a", "b"] }));
  assert.equal(result.correct, false);
  assert.deepEqual(result.missing, ["a", "b"]);
});

test("every speed-reply sample answer passes its own scoring", () => {
  const game = FALLBACK_GAMES.find((item) => item.id === "speed-reply");
  assert.ok(game);
  for (const round of game.rounds) {
    if (round.question.kind !== "open") continue;
    const result = evaluateOpen(round.question.sampleAnswer, round.question, { maxWords: round.maxWords });
    assert.equal(result.correct, true, `${round.id} missing: ${result.missing.join(", ")}`);
  }
});

test("timeLimitFor adds time for long prompts only", () => {
  const short = { seconds: 15, question: open({ prompt: "What did you do yesterday?" }) };
  assert.equal(timeLimitFor(short), 15);
  const long = {
    seconds: 15,
    question: open({
      prompt:
        "A teammate is 20 minutes late and they ask you to start the review so what do you say to the client right now?",
    }),
  };
  assert.ok(timeLimitFor(long) > 15 && timeLimitFor(long) <= 25);
  const flash = { seconds: 90, question: { ...open(), kind: "order" as const, items: [], correctOrder: [] } };
  assert.equal(timeLimitFor(flash as unknown as Pick<LearningGameRound, "seconds" | "question">), 90);
});

test("roundPoints and longestStreak", () => {
  assert.equal(roundPoints(false, 15, 15), 0);
  assert.equal(roundPoints(true, 0, 15), 100);
  assert.equal(roundPoints(true, 15, 15), 150);
  assert.equal(longestStreak([true, true, false, true, true, true]), 3);
  assert.equal(longestStreak([]), 0);
});

test("pickGameRounds prefers the learner level and keeps lesson priority", () => {
  const mk = (id: string, level: LearningGameRound["level"], lessonIds?: string[]): LearningGameRound => ({
    id,
    level,
    seconds: 15,
    lessonIds,
    question: open({ id: `${id}-q` }),
  });
  const rounds = [
    mk("a1", "A2"), mk("a2", "A2"), mk("a3", "A2"), mk("a4", "A2"), mk("a5", "A2"),
    mk("b1", "B1"), mk("b2", "B1"), mk("t1", "TOEIC"),
  ];
  for (let i = 0; i < 20; i += 1) {
    const picked = pickGameRounds(rounds, null, "B1");
    assert.equal(picked.length, 5);
    assert.equal(new Set(picked.map((item) => item.id)).size, 5);
    assert.equal(picked.filter((item) => item.level === "B1").length, 2);
    assert.ok(picked.some((item) => item.level === "TOEIC"));
  }
  const tagged = [mk("x", "TOEIC", ["lesson-1"]), ...rounds];
  assert.deepEqual(pickGameRounds(tagged, "lesson-1", "A2").map((item) => item.id), ["x"]);
});
