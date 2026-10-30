/** Past tense and past participle → base form, for verbs that do not follow -ed. */
const IRREGULAR: Record<string, string> = {
  am: "be",
  are: "be",
  is: "be",
  was: "be",
  were: "be",
  been: "be",
  being: "be",
  has: "have",
  had: "have",
  does: "do",
  did: "do",
  done: "do",
  went: "go",
  gone: "go",
  goes: "go",
  ate: "eat",
  eaten: "eat",
  beat: "beat",
  beaten: "beat",
  became: "become",
  began: "begin",
  begun: "begin",
  bent: "bend",
  bit: "bite",
  bitten: "bite",
  blew: "blow",
  blown: "blow",
  broke: "break",
  broken: "break",
  brought: "bring",
  built: "build",
  bought: "buy",
  caught: "catch",
  chose: "choose",
  chosen: "choose",
  came: "come",
  cost: "cost",
  cut: "cut",
  dealt: "deal",
  dug: "dig",
  drew: "draw",
  drawn: "draw",
  drank: "drink",
  drunk: "drink",
  drove: "drive",
  driven: "drive",
  fell: "fall",
  fallen: "fall",
  fed: "feed",
  felt: "feel",
  fought: "fight",
  found: "find",
  fled: "flee",
  flew: "fly",
  flown: "fly",
  forgot: "forget",
  forgotten: "forget",
  froze: "freeze",
  frozen: "freeze",
  got: "get",
  gotten: "get",
  gave: "give",
  given: "give",
  grew: "grow",
  grown: "grow",
  hung: "hang",
  heard: "hear",
  hid: "hide",
  hidden: "hide",
  hit: "hit",
  held: "hold",
  hurt: "hurt",
  kept: "keep",
  knew: "know",
  known: "know",
  laid: "lay",
  led: "lead",
  left: "leave",
  lent: "lend",
  let: "let",
  lay: "lie",
  lain: "lie",
  lost: "lose",
  made: "make",
  meant: "mean",
  met: "meet",
  paid: "pay",
  put: "put",
  quit: "quit",
  read: "read",
  rode: "ride",
  ridden: "ride",
  rang: "ring",
  rung: "ring",
  rose: "rise",
  risen: "rise",
  ran: "run",
  said: "say",
  saw: "see",
  seen: "see",
  sought: "seek",
  sold: "sell",
  sent: "send",
  set: "set",
  shook: "shake",
  shaken: "shake",
  shone: "shine",
  shot: "shoot",
  showed: "show",
  shown: "show",
  shut: "shut",
  sang: "sing",
  sung: "sing",
  sank: "sink",
  sunk: "sink",
  sat: "sit",
  slept: "sleep",
  slid: "slide",
  spoke: "speak",
  spoken: "speak",
  spent: "spend",
  split: "split",
  spread: "spread",
  stood: "stand",
  stole: "steal",
  stolen: "steal",
  stuck: "stick",
  struck: "strike",
  swept: "sweep",
  swore: "swear",
  sworn: "swear",
  swam: "swim",
  swum: "swim",
  took: "take",
  taken: "take",
  taught: "teach",
  tore: "tear",
  torn: "tear",
  told: "tell",
  thought: "think",
  threw: "throw",
  thrown: "throw",
  understood: "understand",
  woke: "wake",
  woken: "wake",
  wore: "wear",
  worn: "wear",
  wept: "weep",
  won: "win",
  wound: "wind",
  wrote: "write",
  written: "write",
  men: "man",
  women: "woman",
  people: "person",
  children: "child",
  feet: "foot",
  teeth: "tooth",
};

const VOWEL = /[aeiouy]/;

/**
 * Possible base forms of an English word (always includes the lowercase word itself).
 * Rules are deliberately loose: callers only accept a base that is also in a known list,
 * so an extra wrong candidate costs nothing while a missing one loses a match.
 */
export function lemmaCandidates(word: string): Set<string> {
  const lower = word.toLowerCase().replace(/’/g, "'");
  const out = new Set<string>([lower]);
  const irregular = IRREGULAR[lower];
  if (irregular) out.add(irregular);

  const add = (stem: string) => {
    if (stem.length >= 2 && VOWEL.test(stem)) out.add(stem);
  };
  const undouble = (stem: string) => {
    // stopped → stop, running → run
    const last = stem[stem.length - 1] ?? "";
    if (stem.length >= 3 && last === stem[stem.length - 2] && !VOWEL.test(last)) {
      add(stem.slice(0, -1));
    }
  };

  if (lower.endsWith("ies") && lower.length > 4) add(`${lower.slice(0, -3)}y`);
  if (lower.endsWith("es") && lower.length > 3) add(lower.slice(0, -2));
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 2) add(lower.slice(0, -1));

  if (lower.endsWith("ied") && lower.length > 4) add(`${lower.slice(0, -3)}y`);
  if (lower.endsWith("ed") && lower.length > 3) {
    const stem = lower.slice(0, -2);
    add(stem);
    add(`${stem}e`);
    undouble(stem);
  }

  if (lower.endsWith("ying") && lower.length > 4) add(`${lower.slice(0, -4)}ie`);
  if (lower.endsWith("ing") && lower.length > 4) {
    const stem = lower.slice(0, -3);
    add(stem);
    add(`${stem}e`);
    undouble(stem);
  }
  return out;
}
