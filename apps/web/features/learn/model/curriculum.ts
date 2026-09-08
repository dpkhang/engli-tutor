export type LessonPack = {
  id: string;
  title: string;
  level: string;
  duration: string;
  skills: Array<"Listening" | "Speaking" | "Reading" | "Writing">;
  tip: string;
  game: string;
  gameSlug?: string;
  scenario: "interview" | "standup" | "smalltalk" | "email" | "free";
  focus: string;
};

export const LESSON_PACKS: LessonPack[] = [
  {
    id: "interview-frontend",
    title: "Frontend interview",
    level: "A2+",
    duration: "25 min",
    skills: ["Listening", "Speaking", "Reading", "Writing"],
    tip: "Describe projects with Past Simple: worked / built / fixed.",
    game: "Speed reply — answer behavioral questions in 15 seconds",
    gameSlug: "speed-reply",
    scenario: "interview",
    focus: "Self-intro, tough projects, and follow-up questions.",
  },
  {
    id: "daily-standup",
    title: "Daily stand-up",
    level: "A2",
    duration: "15 min",
    skills: ["Listening", "Speaking"],
    tip: "Structure: Yesterday / Today / Blockers — one sentence each.",
    game: "Listen & order — arrange the 3 points you just heard",
    gameSlug: "listen-order",
    scenario: "standup",
    focus: "Short morning meeting updates.",
  },
  {
    id: "office-smalltalk",
    title: "Office small talk",
    level: "A2–B1",
    duration: "20 min",
    skills: ["Listening", "Speaking"],
    tip: "Open with: How was your weekend? then add one detail.",
    game: "Fix the sentence — pick the more natural line",
    gameSlug: "fix-sentence",
    scenario: "smalltalk",
    focus: "Light chat before meetings or by the water cooler.",
  },
  {
    id: "work-email",
    title: "Short work email",
    level: "B1",
    duration: "25 min",
    skills: ["Reading", "Writing"],
    tip: "1 email = 1 purpose + 1 clear CTA (Please confirm / Could you…).",
    game: "Rewrite race — rewrite the email in 2 minutes",
    gameSlug: "rewrite-race",
    scenario: "email",
    focus: "Read a sample email, then write a shorter, clearer version.",
  },
  {
    id: "meeting-followup",
    title: "Post-meeting follow-up",
    level: "B1",
    duration: "20 min",
    skills: ["Listening", "Reading", "Writing"],
    tip: "Summarize in 3 bullets: decided / owner / deadline.",
    game: "Keyword hunt — listen and note 5 key words",
    gameSlug: "keyword-hunt",
    scenario: "free",
    focus: "Hear a meeting summary, read notes, write a follow-up.",
  },
  {
    id: "customer-call",
    title: "Customer call",
    level: "B1",
    duration: "30 min",
    skills: ["Listening", "Speaking", "Reading"],
    tip: "Clarify before you answer: Just to confirm…",
    game: "Speed reply — handle 3 customer questions in a row",
    gameSlug: "speed-reply",
    scenario: "free",
    focus: "Practice hearing requests and answering politely and clearly.",
  },
];

export const QUICK_TIPS = [
  "Spaced repetition: review 5–10 words before opening chat",
  "Shadow one strong AI sentence right after you hear it",
  "Rewrite the error → say it aloud → send the new version",
  "One topic per session — don’t jump around",
];

export { MINI_GAMES } from "./games";
