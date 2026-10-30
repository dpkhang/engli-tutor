import assert from "node:assert/strict";
import { test } from "node:test";
import { isDraftDirty } from "./draft";

test("isDraftDirty is false for equal values", () => {
  assert.equal(isDraftDirty({ a: true, b: "x" }, { a: true, b: "x" }), false);
});

test("isDraftDirty detects a changed field", () => {
  assert.equal(isDraftDirty({ a: false, b: "x" }, { a: true, b: "x" }), true);
});

test("isDraftDirty detects added or removed keys", () => {
  assert.equal(isDraftDirty({ a: 1, b: 2 }, { a: 1 }), true);
  assert.equal(isDraftDirty({ a: 1 }, { a: 1, b: 2 }), true);
});

test("isDraftDirty is false while either side is not loaded", () => {
  assert.equal(isDraftDirty(null, { a: 1 }), false);
  assert.equal(isDraftDirty({ a: 1 }, null), false);
});

test("isDraftDirty treats toggling back to saved value as clean", () => {
  const saved = { a: true, level: null as string | null };
  assert.equal(isDraftDirty({ ...saved, a: false }, saved), true);
  assert.equal(isDraftDirty({ ...saved, a: true }, saved), false);
});
