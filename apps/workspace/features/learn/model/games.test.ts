import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_GAMES } from "./games-fallback";
import {
  evaluateHunt,
  evaluateOpen,
  huntPoints,
  longestStreak,
  pickGameRounds,
  pointsForRound,
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

type HuntQuestion = Extract<LearningQuestion, { kind: "hunt" }>;

const hunt = (overrides: Partial<HuntQuestion> = {}): HuntQuestion => ({
  id: "h",
  kind: "hunt",
  prompt: "Pick",
  options: ["a", "b", "c", "d", "e", "x", "y"],
  correctWords: ["a", "b", "c", "d", "e"],
  explanation: "",
  ...overrides,
});

const pick = (words: string[]) => JSON.stringify(words);

test("hunt: all hits is correct with the same points as roundPoints", () => {
  const q = hunt();
  const words = ["a", "b", "c", "d", "e"];
  assert.equal(scoreGameRound(q, pick(words)), true);
  assert.equal(pointsForRound(q, pick(words), true, 10, 20), roundPoints(true, 10, 20));
  assert.equal(huntPoints(evaluateHunt(q, words), 5, 10, 20), roundPoints(true, 10, 20));
});

test("hunt: missing 1 of 5 still passes at 0.8", () => {
  const q = hunt();
  const evaluation = evaluateHunt(q, ["a", "b", "c", "d"]);
  assert.deepEqual(evaluation.missed, ["e"]);
  assert.equal(evaluation.ratio, 0.8);
  assert.equal(scoreGameRound(q, pick(["a", "b", "c", "d"])), true);
});

test("hunt: one false pick passes with fewer points; two fail", () => {
  const q = hunt();
  const one = ["a", "b", "c", "d", "e", "x"];
  assert.equal(scoreGameRound(q, pick(one)), true);
  assert.ok(pointsForRound(q, pick(one), true, 10, 20) < roundPoints(true, 10, 20));
  const two = ["a", "b", "c", "d", "e", "x", "y"];
  assert.equal(scoreGameRound(q, pick(two)), false);
  assert.deepEqual(evaluateHunt(q, two).falsePicks, ["x", "y"]);
});

test("hunt: legacy payload without targets uses correctWords", () => {
  const q = hunt({ targets: undefined });
  assert.equal(evaluateHunt(q, ["A ", "b"]).hits.length, 2);
  assert.equal(scoreGameRound(q, pick(["a", "b"])), false);
});

test("hunt: accept alias counts as a hit, duplicates ignored", () => {
  const q = hunt({
    targets: [
      { word: "start", accept: ["started"] },
      { word: "end" },
    ],
  });
  const evaluation = evaluateHunt(q, ["Started", "started", "end"]);
  assert.deepEqual(evaluation.hits, ["start", "end"]);
  assert.equal(evaluation.falsePicks.length, 0);
});

test("hunt: invalid JSON is incorrect", () => {
  assert.equal(scoreGameRound(hunt(), "not json"), false);
  assert.equal(pointsForRound(hunt(), "not json", false, 10, 20), 0);
});

test("non-hunt scoring is unchanged", () => {
  const choice: LearningQuestion = {
    id: "c",
    kind: "choice",
    prompt: "p",
    options: ["a", "b"],
    correctIndex: 1,
    explanation: "",
  } as LearningQuestion;
  assert.equal(scoreGameRound(choice, "1"), true);
  assert.equal(scoreGameRound(choice, "0"), false);
  assert.equal(pointsForRound(choice, "1", true, 5, 10), roundPoints(true, 5, 10));
});
