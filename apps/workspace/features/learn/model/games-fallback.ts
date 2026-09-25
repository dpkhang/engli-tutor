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
    id: "fix-sentence",
    title: "Fix the sentence",
    body: "Pick the more natural line.",
    skill: "writing",
    durationMinutes: 2,
    howToPlay: "Compare two sentences and choose the one a colleague would actually say or write.",
    relatedSkill: "writing",
    rounds: [
      round("fx-experience", "A2", 20, fix("fx-experience-q", "Pick the more natural sentence.", ["I am have two years experience.", "I have two years of experience."], 1, "Use have + period + of experience."), { lessonIds: ["interview-frontend"] }),
      round("fx-weekend", "A2", 20, fix("fx-weekend-q", "Office small talk — which line sounds friendly?", ["Weekend good?", "How was your weekend?"], 1, "How was your weekend? is the usual opener."), { lessonIds: ["office-smalltalk"] }),
      round("fx-accept", "A2", 20, fix("fx-accept-q", "Someone asks to meet tomorrow at 3 PM. Which reply is polite and clear?", ["Maybe.", "Sure, that works for me."], 1, "This phrase clearly accepts the request."), { lessonIds: ["office-smalltalk", "work-email"] }),
      round("fx-question", "A2", 20, fix("fx-question-q", "Which question is grammatically correct?", ["Meeting is online?", "Is the meeting online?"], 1, "Use be before the subject in a question."), { lessonIds: ["work-email"] }),
      round("fx-review", "TOEIC", 20, fix("fx-review-q", "Which request sounds natural in chat?", ["Please to review the PR.", "Could you review the PR before 4 PM?"], 1, "Could you is a polite request form."), { lessonIds: ["work-email"] }),
      round("fx-ask", "B1", 20, fix("fx-ask-q", "Which sentence best asks for a decision?", ["Tell me later.", "Could you approve Option A by Wednesday?"], 1, "Name the option and the deadline."), { lessonIds: ["work-email"] }),
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
    id: "rewrite-race",
    title: "Rewrite race",
    body: "Rewrite one sentence shorter in 60–120 seconds.",
    skill: "writing",
    durationMinutes: 3,
    howToPlay: "Cut extra words. Keep the facts and a clear next step.",
    relatedSkill: "writing",
    rounds: [
      round(
        "rr-meeting",
        "A2",
        90,
        open("rr-meeting-q", "Rewrite this reply so it is short and clear.", ["3 PM", "online"], "Sure, tomorrow at 3 PM works for me. Will the meeting be online or in the office?", "Confirm the time and ask one missing detail."),
        {
          lessonIds: ["work-email"],
          maxWords: 32,
          material: {
            title: "Too long",
            body: "Hello, I just wanted to take a moment to say that I think that tomorrow at 3 PM could maybe possibly work for me if that is still okay with you, and I was also wondering if you could perhaps let me know whether we are meeting online or maybe in the office if that is not too much trouble.",
          },
        },
      ),
      round(
        "rr-leave",
        "A2",
        90,
        open("rr-leave-q", "Rewrite this leave request in fewer words.", ["Friday", "Lan"], "Could I take leave on Friday from 08:30 to 12:00? I'll be back after lunch. For urgent questions, please contact Lan.", "Request + time + coverage."),
        {
          maxWords: 40,
          material: {
            title: "Too long",
            body: "I am writing because I was hoping that it might be possible for me to maybe not come to the office on Friday morning due to the fact that I have a medical appointment, and if anyone needs something maybe they can ask someone else on the team.",
          },
        },
      ),
      round(
        "rr-status",
        "TOEIC",
        90,
        open("rr-status-q", "Rewrite this status update. Keep the facts, cut the noise.", ["fixed", "review", "4 PM"], "I fixed the login bug and tested it on two mobile devices. Could you review the PR before 4 PM?", "Status + evidence + request."),
        {
          lessonIds: ["work-email"],
          maxWords: 36,
          material: {
            title: "Too long",
            body: "I just wanted to quickly let you know that I think I have probably finished fixing that login issue, and I also did some testing on a couple of phones, so if you have some time it would be really great if you could maybe take a look at the pull request before it gets too late today.",
          },
        },
      ),
      round(
        "rr-followup",
        "B1",
        120,
        open("rr-followup-q", "Rewrite this follow-up so each sentence has one job.", ["Thursday", "Minh", "Linh"], "Thanks for joining. We will finish the mobile review by Thursday 5 PM. Minh will open the payment-form PR after that. Add blockers on Notion and mention Linh.", "Decisions, owner, deadline."),
        {
          lessonIds: ["meeting-followup", "work-email"],
          maxWords: 55,
          material: {
            title: "Too long",
            body: "I just wanted to follow up after our meeting today which I thought went pretty well and also remind everyone about a few things we kind of discussed including the mobile layout which someone should probably look at before the end of the week and also Minh might do a PR at some point.",
          },
        },
      ),
      round(
        "rr-proposal",
        "B1",
        120,
        open("rr-proposal-q", "Rewrite this proposal. Keep Option A, the reason, and the ask.", ["Option A", "Wednesday"], "I recommend Option A: a progress checklist on day 1, because it can ship in one week. Could you approve Option A by Wednesday?", "Goal + recommendation + deadline."),
        {
          lessonIds: ["work-email"],
          maxWords: 48,
          material: {
            title: "Too long",
            body: "There are a number of different ways we could possibly try to improve onboarding and I have been thinking that maybe we should consider a smaller change first although a full rebuild could also be interesting later, so let me know your thoughts whenever you have time.",
          },
        },
      ),
    ],
  },
  {
    id: "word-match",
    title: "Word match",
    body: "Match words to the sentences they belong in.",
    skill: "reading",
    durationMinutes: 2,
    howToPlay: "Tap a word, then tap its sentence. English in English — no translation.",
    relatedSkill: "reading",
    rounds: [
      round(
        "wm-cafe",
        "A2",
        60,
        match("wm-cafe-q", "Match each word to the sentence it belongs in.", [
          { left: "owner", right: "Mrs Lan is the ______ of Green Cup Café." },
          { left: "map", right: "Minh uses a ______ on his phone for directions." },
          { left: "tourist", right: "A ______ from Canada wanted the old market." },
          { left: "break", right: "He eats a sandwich during his ______." },
          { left: "tips", right: "Minh and Trang share the ______ at the end of the day." },
          { left: "confident", right: "Extra practice will make him more ______ with customers." },
        ], "These words come from the Green Cup Café reading."),
      ),
      round(
        "wm-class",
        "A2",
        60,
        match("wm-class-q", "Match each word to its sentence.", [
          { left: "evenings", right: "Hoa attends English class three ______ a week." },
          { left: "shy", right: "She still feels ______ during speaking practice." },
          { left: "borrow", right: "Students can ______ graded readers from the library." },
          { left: "notebook", right: "She writes new words in a yellow ______." },
          { left: "fee", right: "Her company pays half of the course ______." },
          { left: "suppliers", right: "She writes simple emails to ______ in Malaysia." },
        ], "Office-life vocabulary from the evening English class passage."),
      ),
      round(
        "wm-office",
        "TOEIC",
        60,
        match("wm-office-q", "Match each word to its sentence.", [
          { left: "shuttle", right: "The company will offer a ______ bus from the metro." },
          { left: "pantry", right: "Hot food is only allowed in the ______." },
          { left: "badge", right: "Visitors need a ______ from reception." },
          { left: "lease", right: "The directors signed a ______ for a larger office." },
          { left: "studio", right: "The second floor includes a small recording ______." },
        ], "Relocation vocabulary from the riverside office passage."),
      ),
      round(
        "wm-health",
        "B1",
        60,
        match("wm-health-q", "Match each word to its meaning in context.", [
          { left: "moderate", right: "A ______ walk counts toward the weekly target." },
          { left: "sedentary", right: "A ______ day at a desk is linked with poorer health." },
          { left: "target", right: "Adults should reach a weekly ______ of 150 minutes." },
          { left: "routine", right: "Begin with a ______ you can maintain." },
        ], "Health vocabulary you will see in the WHO lesson."),
      ),
      round(
        "wm-email",
        "B1",
        60,
        match("wm-email-q", "Match each word to the sentence.", [
          { left: "deadline", right: "Monday noon is the ______ for the preview." },
          { left: "owner", right: "Minh is the ______ of the payment-form PR." },
          { left: "blocker", right: "Put each ______ on the Notion page." },
          { left: "approve", right: "Could you ______ Option A by Wednesday?" },
        ], "Work-email words from the writing path."),
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
    id: "picture-word",
    title: "Picture word",
    body: "Look at the picture and choose the English word.",
    skill: "reading",
    durationMinutes: 2,
    howToPlay: "Look at the image. Tap the matching English word before the timer ends.",
    relatedSkill: "reading",
    rounds: [
      round("pw-laptop", "A2", 20, choice("pw-laptop-q", "What is this? Choose the English word.", ["printer", "laptop", "tablet", "camera"], 1, "A laptop is a portable computer you can take to meetings."), { material: { title: "Picture", body: "", imageEmoji: "💻", imageUrl: "/games/pictures/laptop.svg" } }),
      round("pw-calendar", "A2", 20, choice("pw-calendar-q", "What is this? Choose the English word.", ["calendar", "notebook", "ticket", "poster"], 0, "A calendar shows dates, meetings and deadlines."), { material: { title: "Picture", body: "", imageEmoji: "📅", imageUrl: "/games/pictures/calendar.svg" } }),
      round("pw-coffee", "A2", 20, choice("pw-coffee-q", "What is this? Choose the English word.", ["water", "soup", "coffee", "juice"], 2, "Coffee is a common drink at the office."), { material: { title: "Picture", body: "", imageEmoji: "☕", imageUrl: "/games/pictures/coffee.svg" } }),
      round("pw-phone", "A2", 20, choice("pw-phone-q", "What is this? Choose the English word.", ["radio", "phone", "clock", "speaker"], 1, "A phone is used to call, message and join video meetings."), { material: { title: "Picture", body: "", imageEmoji: "📱", imageUrl: "/games/pictures/phone.svg" } }),
      round("pw-email", "A2", 20, choice("pw-email-q", "What is this? Choose the English word.", ["letter", "package", "email", "invoice"], 2, "The envelope stands for email — a message you send at work."), { material: { title: "Picture", body: "", imageEmoji: "✉️", imageUrl: "/games/pictures/email.svg" } }),
      round("pw-handshake", "TOEIC", 25, choice("pw-handshake-q", "What is this? Choose the English word.", ["argument", "handshake", "meeting", "contract"], 1, "A handshake is a common greeting in business."), { material: { title: "Picture", body: "", imageEmoji: "🤝", imageUrl: "/games/pictures/handshake.svg" } }),
    ],
  },
  {
    id: "word-unscramble",
    title: "Word scramble",
    body: "Rearrange the letters to make a real English word.",
    skill: "writing",
    durationMinutes: 2,
    howToPlay: "Tap letters in order to spell a workplace word. Tap a letter in the word to undo.",
    relatedSkill: "writing",
    rounds: [
      round("wu-team", "A2", 30, spell("wu-team-q", "Tap the letters to make a real English word.", "team", "TEAM — the people you work with.")),
      round("wu-email", "A2", 30, spell("wu-email-q", "Tap the letters to make a real English word.", "email", "EMAIL — a message you send at work.")),
      round("wu-office", "A2", 35, spell("wu-office-q", "Tap the letters to make a real English word.", "office", "OFFICE — the place where the team works.")),
      round("wu-meeting", "TOEIC", 40, spell("wu-meeting-q", "Tap the letters to make a real English word.", "meeting", "MEETING — people talking together about work.")),
      round("wu-deadline", "B1", 45, spell("wu-deadline-q", "Tap the letters to make a real English word.", "deadline", "DEADLINE — the time when work must be finished.")),
      round("wu-commute", "IELTS", 40, spell("wu-commute-q", "Tap the letters to make a real English word.", "commute", "COMMUTE — the daily trip between home and work.")),
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
