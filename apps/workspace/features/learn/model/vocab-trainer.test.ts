import assert from "node:assert/strict";
import test from "node:test";
import type { VocabProgressItem } from "../api/vocab-api";
import { applyReview, needsReview } from "./vocab-trainer";

const NOW = Date.parse("2026-01-01T00:00:00Z");
const item = (over: Partial<VocabProgressItem>): VocabProgressItem => ({
  wordId: "w",
  box: 2,
  dueAt: new Date(NOW + 86_400_000).toISOString(),
  lastCorrect: true,
  lastSeenAt: new Date(NOW - 1000).toISOString(),
  saved: false,
  ...over,
});

test("needsReview follows the server definition (seen and dueAt <= now)", () => {
  assert.equal(needsReview(undefined, NOW), false);
  assert.equal(needsReview(item({ lastSeenAt: null, dueAt: new Date(NOW - 1).toISOString() }), NOW), false);
  assert.equal(needsReview(item({ lastCorrect: false }), NOW), false);
  assert.equal(needsReview(item({ dueAt: new Date(NOW).toISOString() }), NOW), true);
});

test("applyReview again schedules 10 minutes out; legacy boolean maps to again/good", () => {
  const again = applyReview(item({ box: 4 }), "w", { grade: "again" }, NOW);
  assert.equal(again.box, 1);
  assert.equal(Date.parse(again.dueAt), NOW + 10 * 60_000);
  assert.equal(again.lastGrade, "again");
  const wrong = applyReview(item({}), "w", { correct: false }, NOW);
  assert.equal(wrong.lastCorrect, false);
  assert.equal(applyReview(item({ box: 2 }), "w", { correct: true }, NOW).box, 3);
});

test("isVocabGrade accepts only the three grades", async () => {
  const { isVocabGrade } = await import("./vocab-trainer");
  assert.equal(isVocabGrade("hard"), true);
  assert.equal(isVocabGrade("know"), false);
});
