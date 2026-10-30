import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compoundCandidates,
  detectExpression,
  locatePhrase,
  pickExpressionForWord,
} from "./detect-expression";
import { lemmaCandidates } from "./lemmatize";
import { PHRASE_LEXICON } from "./phrase-lexicon";
import { sentenceBounds } from "./sentence-at";
import { tokenizeWords } from "./tokenize-words";

/** Detects the expression around the `nth` occurrence of `word`, scoped to its sentence like a click. */
function detect(text: string, word: string, nth = 0) {
  const tokens = tokenizeWords(text);
  const matches = tokens.filter(
    (token) => token.kind === "word" && token.value.toLowerCase() === word.toLowerCase(),
  );
  const token = matches[nth];
  assert.ok(token && token.kind === "word", `"${word}" not found`);
  const sentence = sentenceBounds(text, token.start);
  return detectExpression(text, tokens, token.wordIndex, sentence);
}

test("lemmaCandidates covers regular and irregular verb forms and plurals", () => {
  for (const [form, base] of [
    ["looked", "look"],
    ["looking", "look"],
    ["looks", "look"],
    ["making", "make"],
    ["stopped", "stop"],
    ["running", "run"],
    ["studies", "study"],
    ["tried", "try"],
    ["lying", "lie"],
    ["took", "take"],
    ["gave", "give"],
    ["went", "go"],
    ["boxes", "box"],
    ["Turned", "turn"],
  ]) {
    assert.ok(lemmaCandidates(form!).has(base!), `${form} → ${base}`);
  }
});

test("lexicon entries are unique and well formed", () => {
  const seen = new Set<string>();
  assert.ok(PHRASE_LEXICON.length >= 300, `only ${PHRASE_LEXICON.length} entries`);
  for (const entry of PHRASE_LEXICON) {
    assert.ok(entry.words.length >= 2, `"${entry.base}" is a single word`);
    assert.ok(!seen.has(entry.base), `duplicate "${entry.base}"`);
    seen.add(entry.base);
    if (entry.separable) assert.equal(entry.type, "phrasal_verb");
  }
});

test("phrasal verb: clicking either word of 'looked up' finds 'look up'", () => {
  const text = "She looked up the word in a dictionary.";
  for (const word of ["looked", "up"]) {
    const found = detect(text, word);
    assert.equal(found?.base, "look up");
    assert.equal(found?.type, "phrasal_verb");
    assert.equal(found?.phrase, "looked up");
    assert.equal(text.slice(found!.start, found!.end), "looked up");
  }
});

test("separable phrasal verb with an object in between", () => {
  const text = "Please turn the light off before you leave.";
  for (const word of ["turn", "light", "off"]) {
    const found = detect(text, word);
    assert.equal(found?.base, "turn off", word);
    assert.equal(found?.phrase, "turn the light off");
    assert.equal(found?.separable, true);
  }
  assert.equal(detect("Can you pick it up later?", "up")?.base, "pick up");
  assert.equal(detect("We need to set the meeting up.", "meeting")?.base, "set up");
});

test("a long or prepositional gap is not treated as a separable object", () => {
  // "turn ... off" with a prepositional phrase in between is not the phrasal verb.
  assert.equal(detect("Turn to the left and the lights go off.", "off"), null);
  assert.equal(detect("They turned the big old heavy machine off.", "off"), null);
});

test("prepositional verb, adjective + preposition, noun + preposition", () => {
  const look = detect("Look at the board, please.", "at");
  assert.equal(look?.base, "look at");
  assert.equal(look?.type, "prepositional_verb");

  const interested = detect("I am interested in the role.", "in");
  assert.equal(interested?.type, "adj_prep");

  const reason = detect("The reason for the delay is simple.", "for");
  assert.equal(reason?.type, "noun_prep");
});

test("the longest lexicon entry wins", () => {
  assert.equal(detect("She came up with a better plan.", "came")?.base, "come up with");
  assert.equal(detect("I look forward to meeting you.", "forward")?.base, "look forward to");
  assert.equal(detect("Please pay attention to the details.", "attention")?.base, "pay attention to");
});

test("idioms, collocations and prepositional phrases", () => {
  assert.equal(detect("Let's break the ice with a quick game.", "ice")?.type, "idiom");
  assert.equal(detect("We made a decision yesterday.", "decision")?.base, "make a decision");
  assert.equal(detect("We will finish it on time.", "time")?.type, "prepositional_phrase");
});

test("compound nouns: lexicon and hyphenated", () => {
  const ice = detect("We had ice cream after lunch.", "ice");
  assert.equal(ice?.base, "ice cream");
  assert.equal(ice?.type, "compound_noun");

  const checkIn = detect("The check-in opens at noon.", "check-in");
  assert.equal(checkIn?.source, "hyphen");
  assert.equal(checkIn?.type, "compound_noun");

  const wellKnown = detect("She is a well-known author.", "well-known");
  assert.equal(wellKnown?.type, "compound_adj");
});

test("plain words and literal prepositions are not labelled", () => {
  assert.equal(detect("The book on the table is mine.", "on"), null);
  assert.equal(detect("The book on the table is mine.", "book"), null);
  assert.equal(detect("The team shipped the release.", "release"), null);
});

test("expressions never cross punctuation or the sentence boundary", () => {
  assert.equal(detect("Look, at least try.", "Look")?.base, undefined);
  assert.equal(detect("I gave. Up the hill we went.", "Up"), null);
});

test("compoundCandidates offers two-word neighbours and skips function words", () => {
  const text = "The coffee machine is broken.";
  const tokens = tokenizeWords(text);
  const coffee = tokens.find((token) => token.kind === "word" && token.value === "coffee");
  assert.ok(coffee && coffee.kind === "word");
  const candidates = compoundCandidates(text, tokens, coffee.wordIndex, sentenceBounds(text, coffee.start));
  assert.deepEqual(
    candidates.map((item) => item.phrase),
    ["coffee machine"],
  );
});

test("locatePhrase finds the AI phrase covering the click, with flexible spaces and case", () => {
  const text = "First. Please Turn  the light off now.";
  const clicked = { start: text.indexOf("light"), end: text.indexOf("light") + 5 };
  const range = locatePhrase(text, "turn the light off", clicked, sentenceBounds(text, clicked.start));
  assert.ok(range);
  assert.equal(text.slice(range.start, range.end), "Turn  the light off");
  assert.equal(locatePhrase(text, "first", clicked), null);
});

test("pickExpressionForWord picks the longest AI expression containing the word", () => {
  const sentence = "We came up with a plan to cut costs.";
  const expressions = [
    { phrase: "came up", type: "phrasal_verb" },
    { phrase: "came up with", type: "phrasal_verb" },
    { phrase: "cut costs", type: "collocation" },
  ];
  assert.equal(pickExpressionForWord(sentence, "up", expressions)?.phrase, "came up with");
  assert.equal(pickExpressionForWord(sentence, "costs", expressions)?.phrase, "cut costs");
  assert.equal(pickExpressionForWord(sentence, "plan", expressions), null);
});
