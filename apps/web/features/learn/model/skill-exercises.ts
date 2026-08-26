export type SkillId = "reading" | "listening" | "speaking" | "writing";

/** CEFR bands used across EngliTutor skill drills */
export type SkillLevel = "A2" | "A2+" | "B1";

export type LevelMeta = {
  id: SkillLevel;
  labelVi: string;
  blurb: string;
};

export const LEVELS: LevelMeta[] = [
  {
    id: "A2",
    labelVi: "Basic",
    blurb: "Short sentences, familiar vocabulary, clear tasks.",
  },
  {
    id: "A2+",
    labelVi: "Strong A2",
    blurb: "More detail, light office situations.",
  },
  {
    id: "B1",
    labelVi: "Intermediate",
    blurb: "Longer reading/listening, structured answers.",
  },
];

export type SkillMeta = {
  id: SkillId;
  labelVi: string;
  labelEn: string;
  blurb: string;
};

export const SKILLS: SkillMeta[] = [
  {
    id: "reading",
    labelVi: "Reading",
    labelEn: "Reading",
    blurb: "Read office notes / JDs / emails, then answer comprehension questions.",
  },
  {
    id: "listening",
    labelVi: "Listening",
    labelEn: "Listening",
    blurb: "Listen (or have AI read) a dialogue, then complete the question set.",
  },
  {
    id: "speaking",
    labelVi: "Speaking",
    labelEn: "Speaking",
    blurb: "Answer aloud or in short writing for a situation, then compare with a sample.",
  },
  {
    id: "writing",
    labelVi: "Writing",
    labelEn: "Writing",
    blurb: "Write short sentences / emails from a brief, with sample guidance.",
  },
];

export type ChoiceQuestion = {
  id: string;
  kind: "choice";
  prompt: string;
  options: string[];
  correctIndex: number;
  explainVi: string;
};

export type OpenQuestion = {
  id: string;
  kind: "open";
  prompt: string;
  /** Keywords that should appear (case-insensitive) for soft scoring */
  expectKeywords?: string[];
  sampleAnswer: string;
  explainVi: string;
};

export type SkillQuestion = ChoiceQuestion | OpenQuestion;

export type SkillExercise = {
  id: string;
  skill: SkillId;
  title: string;
  level: SkillLevel;
  duration: string;
  tip: string;
  /** Main learning material shown before questions */
  material: {
    title: string;
    body: string;
    /** For listening: spoken via speechSynthesis */
    speakable?: boolean;
  };
  questions: SkillQuestion[];
};

export const SKILL_EXERCISES: SkillExercise[] = [
  // ——— Reading ———
  {
    id: "read-office-note",
    skill: "reading",
    title: "Read an office note",
    level: "A2",
    duration: "8 min",
    tip: "Look for: day, time, place, and the action you need to take.",
    material: {
      title: "Office note on the kitchen door",
      body: `Team notice

Tomorrow (Tuesday) we have a short team lunch at 12:30 in Meeting Room B.
Please bring your laptop if you want to join the afternoon workshop after lunch.
If you cannot come, message An before 10:00.`,
    },
    questions: [
      {
        id: "r0q1",
        kind: "choice",
        prompt: "What day is the team lunch?",
        options: ["Monday", "Tuesday", "Wednesday", "Friday"],
        correctIndex: 1,
        explainVi: "“Tomorrow (Tuesday)”.",
      },
      {
        id: "r0q2",
        kind: "choice",
        prompt: "Where is the lunch?",
        options: ["Cafeteria", "Meeting Room B", "Outside the office", "Online"],
        correctIndex: 1,
        explainVi: "“in Meeting Room B”.",
      },
      {
        id: "r0q3",
        kind: "open",
        prompt: "What should you do if you cannot come?",
        expectKeywords: ["an", "10"],
        sampleAnswer: "Message An before 10:00.",
        explainVi: "“message An before 10:00”.",
      },
    ],
  },
  {
    id: "read-jd-frontend",
    skill: "reading",
    title: "Read a Frontend JD",
    level: "A2+",
    duration: "12 min",
    tip: "Skim the title and requirements first, then read the details.",
    material: {
      title: "Job description — Junior Frontend Developer",
      body: `We are looking for a Junior Frontend Developer to join our product team in Ho Chi Minh City.

Responsibilities:
- Build UI features with React and TypeScript
- Work with designers to improve usability
- Fix bugs and write simple unit tests
- Join daily stand-up and sprint planning

Requirements:
- 1+ year of experience with JavaScript
- Basic knowledge of React
- Good communication in English (A2–B1 is OK)
- Able to work on-site 3 days per week

Benefits:
- Competitive salary
- Learning budget for courses
- Flexible start time between 8:00 and 10:00`,
    },
    questions: [
      {
        id: "r1q1",
        kind: "choice",
        prompt: "Where is the role based?",
        options: ["Hanoi", "Ho Chi Minh City", "Remote only", "Da Nang"],
        correctIndex: 1,
        explainVi: "The opening says “in Ho Chi Minh City”.",
      },
      {
        id: "r1q2",
        kind: "choice",
        prompt: "Which stack is mentioned for UI work?",
        options: ["Vue and PHP", "React and TypeScript", "Angular only", "Flutter"],
        correctIndex: 1,
        explainVi: "Responsibilities: “Build UI features with React and TypeScript”.",
      },
      {
        id: "r1q3",
        kind: "choice",
        prompt: "How many on-site days are required each week?",
        options: ["1", "2", "3", "5"],
        correctIndex: 2,
        explainVi: "Requirements: “on-site 3 days per week”.",
      },
      {
        id: "r1q4",
        kind: "open",
        prompt: "In one sentence, summarize the main responsibilities.",
        expectKeywords: ["react", "ui", "bug"],
        sampleAnswer:
          "Build React/TypeScript UI features, work with designers, fix bugs, and join stand-ups.",
        explainVi: "Combine 2–3 main points from Responsibilities — don’t copy the whole list.",
      },
    ],
  },
  {
    id: "read-email-deadline",
    skill: "reading",
    title: "Read a deadline email",
    level: "B1",
    duration: "10 min",
    tip: "Find: who sent it, what to do, the deadline, and the CTA.",
    material: {
      title: "Email from Linh (PM)",
      body: `Hi team,

Quick update on the checkout redesign.

Please finish the mobile layout review by Thursday 5 PM. After that, Minh will open a PR for the payment form.

If you find any blocking issues, comment in the Notion page and mention @Linh.

Thanks,
Linh`,
    },
    questions: [
      {
        id: "r2q1",
        kind: "choice",
        prompt: "What is the deadline for the mobile layout review?",
        options: ["Wednesday noon", "Thursday 5 PM", "Friday morning", "Next Monday"],
        correctIndex: 1,
        explainVi: "“finish the mobile layout review by Thursday 5 PM”.",
      },
      {
        id: "r2q2",
        kind: "choice",
        prompt: "Who will open a PR for the payment form?",
        options: ["Linh", "The whole team", "Minh", "Not mentioned"],
        correctIndex: 2,
        explainVi: "“Minh will open a PR for the payment form”.",
      },
      {
        id: "r2q3",
        kind: "open",
        prompt: "What should you do if you find a blocking issue?",
        expectKeywords: ["notion", "linh", "comment"],
        sampleAnswer: "Comment in the Notion page and mention @Linh.",
        explainVi: "The CTA is in “comment in the Notion page and mention @Linh”.",
      },
    ],
  },

  // ——— Listening ———
  {
    id: "listen-standup",
    skill: "listening",
    title: "Listen to a daily stand-up",
    level: "A2",
    duration: "10 min",
    tip: "Listen once without the script; on the second pass, read along to check.",
    material: {
      title: "Stand-up — An speaking",
      speakable: true,
      body: `Yesterday I finished the login page and fixed one CSS bug on mobile.
Today I will start the profile settings form.
I have no blockers right now, but I may need the API document from Hung later.`,
    },
    questions: [
      {
        id: "l1q1",
        kind: "choice",
        prompt: "What did An finish yesterday?",
        options: ["Profile settings", "The login page", "API document", "Payment form"],
        correctIndex: 1,
        explainVi: "“finished the login page”.",
      },
      {
        id: "l1q2",
        kind: "choice",
        prompt: "What will An do today?",
        options: [
          "Fix CSS only",
          "Write tests",
          "Start the profile settings form",
          "Call a customer",
        ],
        correctIndex: 2,
        explainVi: "“Today I will start the profile settings form”.",
      },
      {
        id: "l1q3",
        kind: "choice",
        prompt: "Does An have a blocker now?",
        options: ["Yes, the API is down", "Yes, waiting for design", "No", "Not clear"],
        correctIndex: 2,
        explainVi: "“I have no blockers right now”.",
      },
      {
        id: "l1q4",
        kind: "open",
        prompt: "Who might An need a document from later?",
        expectKeywords: ["hung"],
        sampleAnswer: "Hung (API document).",
        explainVi: "“API document from Hung later”.",
      },
    ],
  },
  {
    id: "listen-interview-q",
    skill: "listening",
    title: "Listen to an interview question",
    level: "A2+",
    duration: "12 min",
    tip: "Listen for keywords: tell me about / challenging / recently.",
    material: {
      title: "Interviewer question",
      speakable: true,
      body: `Thanks for joining today. First, please tell me about a challenging project you worked on recently.
I want to know what the problem was, what you did, and what the result was.
Take about one or two minutes to answer.`,
    },
    questions: [
      {
        id: "l2q1",
        kind: "choice",
        prompt: "What kind of project does the interviewer ask about?",
        options: ["A school project", "A challenging recent project", "A hobby", "A failed exam"],
        correctIndex: 1,
        explainVi: "“a challenging project you worked on recently”.",
      },
      {
        id: "l2q2",
        kind: "choice",
        prompt: "Which three points should the answer include?",
        options: [
          "Salary, team size, tools",
          "Problem, actions, result",
          "City, company, age",
          "Only the result",
        ],
        correctIndex: 1,
        explainVi: "“what the problem was, what you did, and what the result was”.",
      },
      {
        id: "l2q3",
        kind: "open",
        prompt: "How long should the answer be?",
        expectKeywords: ["one", "two", "minute"],
        sampleAnswer: "About one or two minutes.",
        explainVi: "“Take about one or two minutes to answer”.",
      },
    ],
  },
  {
    id: "listen-delay-call",
    skill: "listening",
    title: "Listen to a delay call",
    level: "B1",
    duration: "12 min",
    tip: "Listen for: reason, new time, and next action.",
    material: {
      title: "Call from a teammate",
      speakable: true,
      body: `Hey, sorry to call you now. I'm stuck in traffic because of heavy rain, so I'll be about twenty minutes late for the design review.
Could you start without me and share the Figma link in the chat?
I'll join as soon as I arrive and catch up on the notes.`,
    },
    questions: [
      {
        id: "l3q1",
        kind: "choice",
        prompt: "Why is the speaker late?",
        options: ["Meeting moved", "Stuck in traffic / rain", "Forgot the time", "Sick"],
        correctIndex: 1,
        explainVi: "“stuck in traffic because of heavy rain”.",
      },
      {
        id: "l3q2",
        kind: "choice",
        prompt: "How late will they be?",
        options: ["5 minutes", "10 minutes", "About 20 minutes", "One hour"],
        correctIndex: 2,
        explainVi: "“about twenty minutes late”.",
      },
      {
        id: "l3q3",
        kind: "open",
        prompt: "What two things does the speaker ask you to do?",
        expectKeywords: ["start", "figma"],
        sampleAnswer: "Start without them and share the Figma link in the chat.",
        explainVi: "“start without me and share the Figma link in the chat”.",
      },
    ],
  },

  // ——— Speaking ———
  {
    id: "speak-self-intro",
    skill: "speaking",
    title: "Say a self-intro",
    level: "A2",
    duration: "12 min",
    tip: "3 lines: name/role → experience → what you want next.",
    material: {
      title: "Speaking prompt",
      body: `Situation: You are in a job interview.
Task: Introduce yourself in 40–60 seconds.
Include: your name, current role, years of experience, and one strength.`,
    },
    questions: [
      {
        id: "s1q1",
        kind: "open",
        prompt: "Write (or type as if speaking) your self-introduction.",
        expectKeywords: ["i", "developer", "experience"],
        sampleAnswer:
          "Hi, I'm Minh. I'm a frontend developer with two years of experience. I mainly work with React, and I'm good at turning designs into clean UI.",
        explainVi:
          "Keep it short and clear; use Present Simple for your role and Present Perfect if you mention years of experience.",
      },
      {
        id: "s1q2",
        kind: "choice",
        prompt: "Which sentence sounds most natural for experience?",
        options: [
          "I am having two years experience.",
          "I have two years of experience.",
          "I have two years experiences.",
          "I am two years experience.",
        ],
        correctIndex: 1,
        explainVi: "Standard pattern: “I have two years of experience.”",
      },
      {
        id: "s1q3",
        kind: "open",
        prompt: "Say one strength related to your work in one sentence.",
        expectKeywords: ["i"],
        sampleAnswer: "I'm good at breaking large UI tasks into smaller steps.",
        explainVi: "Use “I'm good at + V-ing” or “My strength is…”.",
      },
    ],
  },
  {
    id: "speak-standup-turn",
    skill: "speaking",
    title: "Give a stand-up update",
    level: "A2+",
    duration: "10 min",
    tip: "Yesterday / Today / Blockers — one sentence each.",
    material: {
      title: "Speaking prompt",
      body: `Situation: Daily stand-up with your team.
Task: Give your update in three short sentences:
1) What you finished yesterday
2) What you will do today
3) Any blockers`,
    },
    questions: [
      {
        id: "s2q1",
        kind: "open",
        prompt: "Write your full stand-up update (3 sentences).",
        expectKeywords: ["yesterday", "today"],
        sampleAnswer:
          "Yesterday I finished the header component. Today I'll work on the mobile menu. I have no blockers.",
        explainVi: "Use Past Simple for yesterday and “will / I'm going to” for today.",
      },
      {
        id: "s2q2",
        kind: "choice",
        prompt: "Best sentence for “no blockers”?",
        options: [
          "I don't have blocker.",
          "I have no blockers right now.",
          "I am no blockers.",
          "There isn't blockers with me.",
        ],
        correctIndex: 1,
        explainVi: "“I have no blockers right now.” is natural in stand-ups.",
      },
    ],
  },
  {
    id: "speak-handle-delay",
    skill: "speaking",
    title: "Apologize and suggest a plan B",
    level: "B1",
    duration: "12 min",
    tip: "Sorry + reason + new time + offer to help.",
    material: {
      title: "Speaking prompt",
      body: `Situation: You will be 15 minutes late to a client call.
Task: Leave a short voice note (type it here) that:
1) apologizes
2) gives a clear reason
3) suggests starting without you OR a new time
4) offers one helpful action (share agenda / notes)`,
    },
    questions: [
      {
        id: "s3q1",
        kind: "open",
        prompt: "Write your voice-note script (4–6 sentences).",
        expectKeywords: ["sorry", "late"],
        sampleAnswer:
          "Hi, I'm sorry I'll be about fifteen minutes late because of traffic. Please start without me and I'll join as soon as I can. I already shared the agenda in the chat. Thanks for your patience.",
        explainVi: "Stay polite, state the time clearly, and give the listener a concrete action.",
      },
      {
        id: "s3q2",
        kind: "choice",
        prompt: "Which apology sounds most professional?",
        options: [
          "My bad, wait for me.",
          "Sorry I'm late lol.",
          "I'm sorry I'll be about 15 minutes late.",
          "I late 15 minutes.",
        ],
        correctIndex: 2,
        explainVi: "Apologize and give a specific time — that’s the professional tone.",
      },
    ],
  },

  // ——— Writing ———
  {
    id: "write-simple-reply",
    skill: "writing",
    title: "Write a meeting reply",
    level: "A2",
    duration: "8 min",
    tip: "Clear yes/no + time + one question if needed.",
    material: {
      title: "Writing brief",
      body: `Message from your manager:
"Can we meet tomorrow at 3 PM to review the homepage?"

Task: Write a short reply that:
- accepts the meeting
- confirms the time
- asks if the meeting is online or in the office`,
    },
    questions: [
      {
        id: "w0q1",
        kind: "open",
        prompt: "Write your reply (2–3 sentences).",
        expectKeywords: ["3", "pm"],
        sampleAnswer:
          "Sure, tomorrow at 3 PM works for me. Will the meeting be online or in the office?",
        explainVi: "Confirm the time, then ask one necessary detail.",
      },
      {
        id: "w0q2",
        kind: "choice",
        prompt: "Best opening to accept a meeting?",
        options: ["Maybe.", "Sure, that works for me.", "I don't know.", "Ok ok."],
        correctIndex: 1,
        explainVi: "“Sure, that works for me.” is clear and polite.",
      },
    ],
  },
  {
    id: "write-slack-update",
    skill: "writing",
    title: "Write a Slack update",
    level: "A2+",
    duration: "12 min",
    tip: "1 message = status + next step.",
    material: {
      title: "Writing brief",
      body: `Context: Your teammate asks for a quick status on the login bug.
Write a short Slack message (2–3 sentences) that:
- says you fixed the bug
- mentions you tested on mobile
- asks them to review the PR`,
    },
    questions: [
      {
        id: "w1q1",
        kind: "open",
        prompt: "Write your Slack message.",
        expectKeywords: ["fixed", "pr", "review"],
        sampleAnswer:
          "Hey, I fixed the login bug and tested it on mobile. Could you review the PR when you have a minute?",
        explainVi: "Friendly tone with a clear CTA (“Could you review…”).",
      },
      {
        id: "w1q2",
        kind: "choice",
        prompt: "Which request is the most polite and natural?",
        options: [
          "Review PR now.",
          "You must check my PR.",
          "Could you review the PR when you have a minute?",
          "Please to review my PR.",
        ],
        correctIndex: 2,
        explainVi: "“Could you… when you have a minute?” is polite and natural.",
      },
    ],
  },
  {
    id: "write-followup-email",
    skill: "writing",
    title: "Write a follow-up email",
    level: "B1",
    duration: "15 min",
    tip: "Clear subject + 3 parts: thanks / summary / next step.",
    material: {
      title: "Writing brief",
      body: `Context: You just finished a meeting about the checkout redesign.
Write a short follow-up email to the team with:
- a thank-you line
- two decisions from the meeting (mobile review by Thursday; Minh opens PR)
- one clear next step for readers`,
    },
    questions: [
      {
        id: "w2q1",
        kind: "open",
        prompt: "Write a subject line for the email.",
        expectKeywords: ["checkout", "follow"],
        sampleAnswer: "Follow-up: checkout redesign decisions",
        explainVi: "Subjects work best with topic + type (follow-up / update).",
      },
      {
        id: "w2q2",
        kind: "open",
        prompt: "Write the email body (4–6 short sentences or bullets).",
        expectKeywords: ["thursday", "minh", "pr"],
        sampleAnswer:
          "Thanks everyone for joining today's meeting.\n\nDecisions:\n- Finish mobile layout review by Thursday 5 PM\n- Minh will open a PR for the payment form\n\nPlease comment in Notion if you see blockers.",
        explainVi: "Split thanks / decisions / CTA so the email is easy to skim.",
      },
      {
        id: "w2q3",
        kind: "choice",
        prompt: "Which closing is appropriate for a work email?",
        options: ["Love,", "Thx!!!", "Best,", "See ya,"],
        correctIndex: 2,
        explainVi: "“Best,” or “Thanks,” fit workplace email.",
      },
    ],
  },
];

function levelOrder(level: SkillLevel): number {
  return LEVELS.findIndex((item) => item.id === level);
}

export function getLevelMeta(level: SkillLevel): LevelMeta | undefined {
  return LEVELS.find((item) => item.id === level);
}

export function isSkillLevel(value: string): value is SkillLevel {
  return LEVELS.some((item) => item.id === value);
}

export function getExercisesBySkill(skill: SkillId, level?: SkillLevel): SkillExercise[] {
  return SKILL_EXERCISES.filter(
    (item) => item.skill === skill && (level ? item.level === level : true),
  ).sort((a, b) => levelOrder(a.level) - levelOrder(b.level));
}

export function getExercisesGroupedByLevel(skill: SkillId): Array<{
  level: LevelMeta;
  exercises: SkillExercise[];
}> {
  return LEVELS.map((level) => ({
    level,
    exercises: getExercisesBySkill(skill, level.id),
  })).filter((group) => group.exercises.length > 0);
}

export function getExercise(skill: SkillId, exerciseId: string): SkillExercise | undefined {
  return SKILL_EXERCISES.find((item) => item.skill === skill && item.id === exerciseId);
}

export function getSkillMeta(skill: SkillId): SkillMeta | undefined {
  return SKILLS.find((item) => item.id === skill);
}

export function isSkillId(value: string): value is SkillId {
  return SKILLS.some((item) => item.id === value);
}
