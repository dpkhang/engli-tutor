import type { LearningGame, LearningGameRound, LearningQuestion } from "../api/types";

const open = (
  id: string,
  prompt: string,
  keywords: string[],
  sampleAnswer: string,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "open",
  prompt,
  keywords,
  sampleAnswer,
  explanation,
});

const fix = (
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "fix",
  prompt,
  options,
  correctIndex,
  explanation,
});

const order = (
  id: string,
  prompt: string,
  items: string[],
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "order",
  prompt,
  items,
  correctOrder: items.map((_, index) => index),
  explanation,
});

const match = (
  id: string,
  prompt: string,
  pairs: Array<{ left: string; right: string }>,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "match",
  prompt,
  pairs,
  explanation,
});

const hunt = (
  id: string,
  prompt: string,
  options: string[],
  correctWords: string[],
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "hunt",
  prompt,
  options,
  correctWords,
  explanation,
});

const choice = (
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "choice",
  prompt,
  options,
  correctIndex,
  explanation,
});

const flash = (
  id: string,
  word: string,
  ipa: string,
  meaningVi: string,
  gloss: string,
  example: string,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "flash",
  prompt: "Tap the card to see the IPA and the Vietnamese meaning.",
  word,
  ipa,
  meaningVi,
  gloss,
  example,
  explanation,
});

function flashArt(file: string) {
  return {
    title: "Picture",
    body: "",
    imageUrl: `/games/pictures/flashcards/${file}.png`,
  };
}

const spell = (
  id: string,
  prompt: string,
  answer: string,
  explanation: string,
): LearningQuestion => ({
  id,
  kind: "spell",
  prompt,
  letters: [...answer.toUpperCase().replace(/[^A-Z]/g, "")],
  answer: answer.trim().toLowerCase(),
  explanation,
});

function round(
  id: string,
  level: LearningGameRound["level"],
  seconds: number,
  question: LearningQuestion,
  extra?: Omit<LearningGameRound, "id" | "level" | "seconds" | "question">,
): LearningGameRound {
  return { id, level, seconds, question, ...extra };
}

export const FALLBACK_GAMES: LearningGame[] = [
  {
    id: "speed-reply",
    title: "Speed reply",
    body: "Answer in 15 seconds to build reflexes.",
    skill: "speaking",
    durationMinutes: 3,
    howToPlay: "Read the prompt, then type (or speak) a short answer before the timer ends.",
    relatedSkill: "speaking",
    rounds: [
      round(
        "sr-intro",
        "A2",
        15,
        open(
          "sr-intro-q",
          "A hiring manager says: “Tell me about yourself.” Reply in 2–3 short sentences.",
          ["I", "experience"],
          "Hi, I'm Minh. I'm a frontend developer with two years of experience, and I'd like to grow in a product team.",
          "Name + role + one detail is enough at A2.",
        ),
        { lessonIds: ["interview-frontend"] },
      ),
      round(
        "sr-yesterday",
        "A2",
        15,
        open(
          "sr-yesterday-q",
          "Stand-up: What did you do yesterday?",
          ["yesterday"],
          "Yesterday I finished the login page and fixed a small CSS bug.",
          "Start with Yesterday + past verb.",
        ),
        { lessonIds: ["daily-standup"] },
      ),
      round(
        "sr-today",
        "A2",
        15,
        open(
          "sr-today-q",
          "Stand-up: What will you do today?",
          ["today"],
          "Today I will start the profile settings form and write two tests.",
          "Use Today I will + verb.",
        ),
        { lessonIds: ["daily-standup"] },
      ),
      round(
        "sr-weekend",
        "A2",
        15,
        open(
          "sr-weekend-q",
          "A colleague asks: “How was your weekend?” Add one detail.",
          ["weekend"],
          "It was good, thanks. I cooked dinner with friends and watched a film.",
          "Answer + one concrete detail.",
        ),
        { lessonIds: ["office-smalltalk"] },
      ),
      round(
        "sr-blocker",
        "TOEIC",
        15,
        open(
          "sr-blocker-q",
          "Stand-up: Any blockers?",
          ["blocker", "need"],
          "I have no blockers right now, but I may need the API document later.",
          "Say none, or name the one thing you are waiting for.",
        ),
        { lessonIds: ["daily-standup"] },
      ),
      round(
        "sr-confirm",
        "B1",
        15,
        open(
          "sr-confirm-q",
          "A customer asks for two changes before Tuesday. Start with a confirmation phrase.",
          ["confirm"],
          "Just to confirm, you want a new hero image and the signup form moved higher, with a preview by Monday noon.",
          "Repeat the request before you promise anything.",
        ),
        { lessonIds: ["customer-call"] },
      ),
    ],
  },
  {
    id: "listen-order",
    title: "Listen & order",
    body: "Recall the order of the points you just heard.",
    skill: "listening",
    durationMinutes: 3,
    howToPlay: "Listen first (no transcript). Then tap the cards in the order you heard them.",
    relatedSkill: "listening",
    rounds: [
      round(
        "lo-standup",
        "A2",
        90,
        order("lo-standup-q", "Listen, then tap the points in the order you heard them.", [
          "Yesterday I finished the login page and fixed one CSS bug on mobile.",
          "Today I will start the profile settings form and write two small tests.",
          "I have no blockers right now, but I may need the API document later.",
        ], "Stand-ups usually follow yesterday → today → blockers."),
        {
          lessonIds: ["daily-standup"],
          hearAgainMax: 2,
          material: {
            title: "Stand-up — An speaking",
            speakable: true,
            body: "Yesterday I finished the login page and fixed one CSS bug on mobile. Today I will start the profile settings form and write two small tests. I have no blockers right now, but I may need the API document from Hung later this afternoon.",
          },
        },
      ),
      round(
        "lo-interview",
        "TOEIC",
        90,
        order("lo-interview-q", "Listen, then order the three things the interviewer wants.", [
          "What the problem was",
          "What you did",
          "What the result was",
        ], "Problem, action, then result."),
        {
          lessonIds: ["interview-frontend"],
          hearAgainMax: 2,
          material: {
            title: "Interviewer question",
            speakable: true,
            body: "Please tell me about a challenging project you worked on recently. I want to know three things: what the problem was, what you did, and what the result was.",
          },
        },
      ),
      round(
        "lo-customer",
        "TOEIC",
        90,
        order("lo-customer-q", "Listen, then order the customer's requests.", [
          "Replace the hero image with the photo sent yesterday.",
          "Move the book club signup form higher, under the opening paragraph.",
          "Send a preview by Monday at noon.",
        ], "Two changes, then the deadline."),
        {
          lessonIds: ["customer-call"],
          hearAgainMax: 2,
          material: {
            title: "Customer call",
            speakable: true,
            body: "First, please replace the hero image with the photo I sent yesterday. Second, move the book club signup form higher, just under the opening paragraph. Can you send a preview by Monday at noon?",
          },
        },
      ),
      round(
        "lo-schedule",
        "B1",
        90,
        order("lo-schedule-q", "Listen, then order what you should do.", [
          "Update the calendar invite.",
          "Send the revised prototype before four.",
          "Ask people who cannot stay to leave written comments in Figma.",
        ], "The speaker will notify engineering — that is not your task."),
        {
          lessonIds: ["meeting-followup"],
          hearAgainMax: 3,
          material: {
            title: "Voice message",
            speakable: true,
            body: "Could you update the calendar invite and send the revised prototype before four? I will notify the engineering team. If anyone cannot stay until four thirty, ask them to leave written comments in Figma.",
          },
        },
      ),
      round(
        "lo-delay",
        "B1",
        90,
        order("lo-delay-q", "Listen, then order the speaker's asks.", [
          "Start the design review without them.",
          "Share the Figma link in the chat.",
          "If the client asks about payment, say it is in the second half.",
        ], "Cover the meeting, share the file, then handle the likely question."),
        {
          hearAgainMax: 3,
          material: {
            title: "Call from a teammate",
            speakable: true,
            body: "Could you start without me and share the Figma link in the chat? If the client asks about the payment screen, tell them we will cover it in the second half.",
          },
        },
      ),
    ],
  },
  {
    id: "keyword-hunt",
    title: "Keyword hunt",
    body: "Listen and catch the key words.",
    skill: "listening",
    durationMinutes: 2,
    howToPlay: "Listen once, then pick the 5 words that were actually in the audio.",
    relatedSkill: "listening",
    rounds: [
      round(
        "kh-standup",
        "A2",
        45,
        hunt("kh-standup-q", "Listen, then tap the 5 words you actually heard.", [
          "yesterday", "login", "profile", "blockers", "document",
          "invoice", "password", "sprint", "airport", "salary", "wedding", "printer",
        ], ["yesterday", "login", "profile", "blockers", "document"], "Listen for the stand-up keywords, not extra office words."),
        {
          lessonIds: ["daily-standup"],
          hearAgainMax: 2,
          material: {
            title: "Stand-up",
            speakable: true,
            body: "Yesterday I finished the login page. Today I will start the profile settings form. I have no blockers right now, but I may need the API document later.",
          },
        },
      ),
      round(
        "kh-customer",
        "TOEIC",
        45,
        hunt("kh-customer-q", "Listen, then tap the 5 words from the customer call.", [
          "landing", "hero", "signup", "preview", "Monday",
          "invoice", "refund", "airport", "salary", "wedding", "password", "stadium",
        ], ["landing", "hero", "signup", "preview", "Monday"], "The request is about the page, the form, and the deadline."),
        {
          lessonIds: ["customer-call"],
          hearAgainMax: 2,
          material: {
            title: "Customer call",
            speakable: true,
            body: "We like the new landing page. Please replace the hero image and move the signup form higher. Can you send a preview by Monday at noon?",
          },
        },
      ),
      round(
        "kh-meeting",
        "B1",
        45,
        hunt("kh-meeting-q", "Listen, then tap the 5 key words from the meeting note.", [
          "review", "calendar", "prototype", "engineering", "Figma",
          "invoice", "airport", "wedding", "password", "stadium", "refund", "salary",
        ], ["review", "calendar", "prototype", "engineering", "Figma"], "Catch the reason, the asks, and who owns engineering."),
        {
          lessonIds: ["meeting-followup"],
          hearAgainMax: 3,
          material: {
            title: "Voice message",
            speakable: true,
            body: "The client has moved our review to four thirty. Could you update the calendar invite and send the revised prototype before four? I will notify the engineering team. Ask people to leave written comments in Figma.",
          },
        },
      ),
      round(
        "kh-tour",
        "A2",
        45,
        hunt("kh-tour-q", "Listen, then tap 5 words from the office tour.", [
          "reception", "third", "kitchen", "badge", "security",
          "invoice", "airport", "wedding", "salary", "stadium", "refund", "password",
        ], ["reception", "third", "kitchen", "badge", "security"], "Places and times from the welcome tour."),
        {
          hearAgainMax: 2,
          material: {
            title: "Office tour",
            speakable: true,
            body: "The reception desk is on the ground floor. The product team sits on the third floor. Meeting Room B is opposite the kitchen. Ask security for a visitor badge before nine thirty.",
          },
        },
      ),
      round(
        "kh-delay",
        "B1",
        45,
        hunt("kh-delay-q", "Listen, then tap 5 words from the delay call.", [
          "traffic", "twenty", "Figma", "payment", "covering",
          "invoice", "airport", "wedding", "salary", "stadium", "refund", "password",
        ], ["traffic", "twenty", "Figma", "payment", "covering"], "Reason, delay length, and the two asks."),
        {
          hearAgainMax: 3,
          material: {
            title: "Delay call",
            speakable: true,
            body: "I'm stuck in traffic, so I'll be about twenty minutes late. Could you start without me and share the Figma link? If the client asks about the payment screen, tell them we will cover it later. Thanks for covering for me.",
          },
        },
      ),
    ],
  },
  {
    id: "flashcard",
    title: "Flashcards",
    body: "Flip a workplace word, then mark whether you know it.",
    skill: "reading",
    durationMinutes: 2,
    howToPlay: "Tap the card to see the IPA, the Vietnamese meaning, and an example. The X saves it for later. The check skips it.",
    relatedSkill: "reading",
    rounds: [
      round("fc-laptop", "A2", 0, flash("fc-laptop-q", "laptop", "/ˈlæp.tɑːp/", "máy tính xách tay", "A portable computer you can take to meetings.", "I left my laptop in the meeting room.", "LAPTOP — a computer you carry with you."), { material: flashArt("laptop") }),
      round("fc-email", "A2", 0, flash("fc-email-q", "email", "/ˈiː.meɪl/", "thư điện tử", "A written message you send at work.", "Please send me an email with the agenda.", "EMAIL — a message, not a paper letter."), { material: flashArt("email") }),
      round("fc-office", "A2", 0, flash("fc-office-q", "office", "/ˈɒf.ɪs/", "văn phòng", "The place where a team works.", "Our office is on the third floor.", "OFFICE — the workplace, not a job title."), { material: flashArt("office") }),
      round("fc-calendar", "A2", 0, flash("fc-calendar-q", "calendar", "/ˈkæl.ɪn.dər/", "lịch", "A chart of dates, meetings, and deadlines.", "Check the calendar before you book the room.", "CALENDAR — where you see dates and meetings."), { material: flashArt("calendar") }),
      round("fc-meeting", "TOEIC", 0, flash("fc-meeting-q", "meeting", "/ˈmiː.tɪŋ/", "cuộc họp", "People talking together about work.", "The meeting starts at nine.", "MEETING — a work conversation with a group."), { material: flashArt("meeting") }),
      round("fc-agenda", "TOEIC", 0, flash("fc-agenda-q", "agenda", "/əˈdʒen.də/", "chương trình họp", "The list of topics for a meeting.", "The first item on the agenda is the budget.", "AGENDA — the plan of what you will discuss."), { material: flashArt("agenda") }),
      round("fc-deadline", "B1", 0, flash("fc-deadline-q", "deadline", "/ˈded.laɪn/", "hạn chót", "The time when work must be finished.", "The deadline for the report is Friday.", "DEADLINE — the last moment the work can be done."), { material: flashArt("deadline") }),
      round("fc-feedback", "B1", 0, flash("fc-feedback-q", "feedback", "/ˈfiːd.bæk/", "phản hồi", "Comments that help someone improve.", "She gave clear feedback on the draft.", "FEEDBACK — useful comments, not only praise."), { material: flashArt("feedback") }),
      round("fc-commute", "IELTS", 0, flash("fc-commute-q", "commute", "/kəˈmjuːt/", "đi lại hàng ngày giữa nhà và nơi làm", "The regular trip between home and work.", "My commute takes forty minutes by train.", "COMMUTE — the daily journey, not a one-off trip."), { material: flashArt("commute") }),
      round("fc-invoice", "IELTS", 0, flash("fc-invoice-q", "invoice", "/ˈɪn.vɔɪs/", "hóa đơn", "A bill that asks a customer to pay.", "We sent the invoice after the project ended.", "INVOICE — a request for payment."), { material: flashArt("invoice") }),
    ],
  },
];
