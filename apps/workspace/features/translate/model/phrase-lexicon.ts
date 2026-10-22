export type ExpressionType =
  | "phrasal_verb"
  | "prepositional_verb"
  | "verb_phrase"
  | "compound_noun"
  | "compound_adj"
  | "noun_phrase"
  | "adj_prep"
  | "noun_prep"
  | "prepositional_phrase"
  | "idiom"
  | "collocation";

export const EXPRESSION_TYPES: ReadonlySet<string> = new Set<ExpressionType>([
  "phrasal_verb",
  "prepositional_verb",
  "verb_phrase",
  "compound_noun",
  "compound_adj",
  "noun_phrase",
  "adj_prep",
  "noun_prep",
  "prepositional_phrase",
  "idiom",
  "collocation",
]);

export type LexiconEntry = {
  /** Dictionary form, e.g. "turn off". */
  base: string;
  words: string[];
  type: ExpressionType;
  /** The object may sit between the verb and its particle: "turn the light off". */
  separable: boolean;
};

// Comma-separated, dictionary form. A trailing "+" marks a separable phrasal verb.
// Keep entries common at CEFR A2–B2 and in workplace English; when unsure, leave it out:
// a wrong highlight is worse than none (the AI analysis still covers the sentence).
const SOURCE: Record<ExpressionType, string> = {
  phrasal_verb: `
    back up+, back off, blow up+, break down, break out, break up, bring about+, bring back+,
    bring in+, bring up+, call back+, call off+, calm down+, carry on, carry out+, carry over+,
    catch up, check in, check out+, cheer up+, clean up+, come across, come back, come up,
    come up with, cut back, cut down, cut down on, cut off+, drop by, drop off+, end up,
    fall apart, fall behind, fall through, figure out+, fill in+, fill out+, fill up+, find out+,
    follow up, follow up on, get along, get along with, get away, get back, get back to, get by,
    get over, get through, get up, give away+, give back+, give in, give up+, go ahead, go on,
    go over, go through, grow up, hand in+, hand out+, hand over+, hang on, hang out, hang up+,
    hold on, hold up+, keep on, keep up, keep up with, kick off+, lay off+, leave out+, let down+,
    log in, log out, look back, look forward to, look out, look over+, look up+, look up to,
    look down on, make out+, make up+, mix up+, move in, move on, move out, opt in, opt out,
    pass away, pass on+, pay back+, pay off+, phase out+, pick up+, point out+, put away+,
    put back+, put off+, put on+, put out+, put up with, reach out, roll out+, run out,
    run out of, scale up+, set aside+, set up+, settle down, show up, shut down+, shut off+,
    sign in, sign up, sign up for, sit down, slow down+, sort out+, speak up, stand out,
    stand up, start over, stay up, step down, sum up+, switch off+, switch on+, take away+,
    take back+, take off+, take on+, take out+, take over+, take up+, talk over+, think over+,
    throw away+, throw out+, top up+, try on+, try out+, turn around+, turn down+, turn in+,
    turn off+, turn on+, turn out, turn up+, wake up+, warm up+, wear out+, work out+,
    wrap up+, write down+, catch up with, catch up on, run into
  `,
  prepositional_verb: `
    account for, agree with, apologize for, apply for, approve of, ask for, believe in,
    belong to, benefit from, care about, comment on, complain about, concentrate on,
    consist of, contribute to, cope with, count on, deal with, decide on, depend on, focus on,
    insist on, invest in, laugh at, lead to, listen to, look after, look at, look for, look into,
    object to, participate in, pay for, prepare for, react to, recover from, refer to, rely on,
    reply to, report to, respond to, result in, search for, specialize in, subscribe to,
    succeed in, suffer from, talk about, talk to, think about, think of, wait for, worry about,
    write to
  `,
  verb_phrase: ``,
  compound_noun: `
    action item, annual leave, bank account, best practice, board meeting, bus stop,
    business card, case study, cash flow, cell phone, code review, coffee break,
    conference call, credit card, customer service, data center, due date, email address,
    focus group, front desk, health insurance, high school, ice cream, job interview,
    job title, living room, lunch break, market share, meeting room, mobile phone,
    parking lot, pay rise, phone call, post office, press release, project manager,
    pull request, real estate, release notes, sales team, sick leave, status report,
    supply chain, swimming pool, task force, team leader, time zone, trade show, unit test,
    use case, user interface, work experience
  `,
  compound_adj: ``,
  noun_phrase: ``,
  adj_prep: `
    afraid of, angry about, angry with, aware of, bad at, busy with, capable of, committed to,
    compatible with, concerned about, dependent on, different from, eligible for,
    excited about, familiar with, famous for, fond of, full of, good at, happy with,
    interested in, involved in, jealous of, keen on, late for, proud of, ready for,
    related to, responsible for, satisfied with, similar to, sorry about, sure about,
    surprised at, tired of, worried about
  `,
  noun_prep: `
    access to, approach to, attitude towards, cause of, connection with, damage to,
    decrease in, demand for, difference between, effect on, impact on, increase in,
    interest in, lack of, need for, problem with, reason for, relationship with, request for,
    response to, rise in, solution to
  `,
  prepositional_phrase: `
    according to, ahead of, as a result, as long as, as soon as, as well as, at first, at last,
    at least, at once, at the moment, because of, by accident, by mistake, by the way, due to,
    even though, for example, for instance, in addition, in advance, in case, in charge of,
    in fact, in front of, in general, in order to, in spite of, in terms of, in time,
    instead of, on behalf of, on purpose, on the other hand, on time, out of date,
    rather than, regardless of, so that, up to date
  `,
  idiom: `
    at the end of the day, back to square one, ballpark figure, break the ice, by and large,
    call it a day, cut corners, fair enough, get rid of, get the ball rolling, give it a try,
    hit the road, in the long run, in the loop, keep an eye on, keep in mind, make sense,
    on the same page, once in a while, out of the blue, piece of cake, sooner or later,
    take advantage of, take care of, take part in, take place, the bottom line,
    think outside the box, touch base, under the weather, up in the air
  `,
  collocation: `
    break a promise, catch a cold, do business, do research, fast food, give a presentation,
    give feedback, have a look, have a meeting, heavy traffic, high quality, keep a promise,
    low cost, make a call, make a decision, make a difference, make a mistake,
    make an appointment, make an effort, make money, make progress, meet a deadline,
    miss a deadline, pay attention, pay attention to, raise a question, reach an agreement,
    run a meeting, save time, set a goal, solve a problem, spend time, strong coffee,
    take a break, take a look, take a risk, take a seat, take action, take notes,
    take responsibility, waste time
  `,
};

function parse(): LexiconEntry[] {
  const entries: LexiconEntry[] = [];
  for (const [type, list] of Object.entries(SOURCE) as Array<[ExpressionType, string]>) {
    for (const raw of list.split(",")) {
      const item = raw.trim().toLowerCase();
      if (!item) continue;
      const separable = item.endsWith("+");
      const base = separable ? item.slice(0, -1).trim() : item;
      entries.push({ base, words: base.split(/\s+/), type, separable });
    }
  }
  return entries;
}

export const PHRASE_LEXICON: readonly LexiconEntry[] = parse();

/** Entries grouped by their first word, so a lookup only scans a handful of candidates. */
export const LEXICON_BY_FIRST_WORD: ReadonlyMap<string, readonly LexiconEntry[]> = (() => {
  const map = new Map<string, LexiconEntry[]>();
  for (const entry of PHRASE_LEXICON) {
    const first = entry.words[0] ?? "";
    const list = map.get(first);
    if (list) list.push(entry);
    else map.set(first, [entry]);
  }
  return map;
})();
