import assert from "node:assert/strict";
import { test } from "node:test";
import { sentenceBounds } from "./sentence-at";

function at(text: string, word: string) {
  return sentenceBounds(text, text.indexOf(word))?.sentence;
}

test("splits on . ! ? and keeps the closing mark", () => {
  const text = "Hello world. Is this two? Yes! Really";
  assert.equal(at(text, "world"), "Hello world.");
  assert.equal(at(text, "two"), "Is this two?");
  assert.equal(at(text, "Yes"), "Yes!");
  assert.equal(at(text, "Really"), "Really");
});

test("does not split after titles", () => {
  const text = "Mr. Smith and Dr. Lee met Prof. Tran. They talked.";
  assert.equal(at(text, "Smith"), "Mr. Smith and Dr. Lee met Prof. Tran.");
  assert.equal(at(text, "Lee"), "Mr. Smith and Dr. Lee met Prof. Tran.");
  assert.equal(at(text, "talked"), "They talked.");
});

test("does not split inside e.g., i.e., a.m., p.m., vs.", () => {
  assert.equal(
    at("We use tools, e.g. Jira. Then we ship.", "Jira"),
    "We use tools, e.g. Jira.",
  );
  assert.equal(
    at("It is fast, i.e. under a second. Good.", "second"),
    "It is fast, i.e. under a second.",
  );
  assert.equal(at("The call is at 9 a.m. today. Join us.", "today"), "The call is at 9 a.m. today.");
  assert.equal(at("Open 8 a.m. to 5 p.m. daily. Closed Sunday.", "daily"), "Open 8 a.m. to 5 p.m. daily.");
  assert.equal(at("Plan A vs. plan B is the question. Decide.", "plan B"), "Plan A vs. plan B is the question.");
});

test("does not split decimals or numbers with dots", () => {
  const text = "The rate is 3.5 percent. Revenue grew 1.200 units. Done.";
  assert.equal(at(text, "percent"), "The rate is 3.5 percent.");
  assert.equal(at(text, "units"), "Revenue grew 1.200 units.");
  assert.equal(at(text, "Done"), "Done.");
});

test("etc. only ends the sentence when a capital letter follows", () => {
  const text = "We bought pens, paper, etc. Then we left. Later, etc. is fine.";
  assert.equal(at(text, "paper"), "We bought pens, paper, etc.");
  assert.equal(at(text, "Then"), "Then we left.");
  assert.equal(at(text, "fine"), "Later, etc. is fine.");
});

test("a line break always ends the sentence", () => {
  const text = "First line\nSecond line. Third.";
  assert.equal(at(text, "First"), "First line");
  assert.equal(at(text, "Second"), "Second line.");
});

test("returns the range and skips leading quotes and spaces (existing behaviour)", () => {
  const text = 'He said. "Hello there." Bye.';
  const range = sentenceBounds(text, text.indexOf("there"));
  assert.ok(range);
  assert.equal(range.sentence, "Hello there.");
  assert.equal(text.slice(range.start, range.end), "Hello there.");
});

test("returns null for empty or blank text", () => {
  assert.equal(sentenceBounds("", 0), null);
  assert.equal(sentenceBounds("   ", 1), null);
});
