export type LearningSkill = "reading" | "listening" | "speaking" | "writing";
export type LearningLevel = "A2" | "B1" | "TOEIC" | "IELTS";
export type LearningGameId =
  | "speed-reply"
  | "listen-order"
  | "keyword-hunt"
  | "flashcard";

export type LearningQuestion =
  | {
      id: string;
      kind: "choice";
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      id: string;
      kind: "open";
      prompt: string;
      keywords: string[];
      /** Synonym groups; every group needs one match. Falls back to `keywords` when absent. */
      keywordGroups?: string[][];
      sampleAnswer: string;
      explanation: string;
    }
  | {
      id: string;
      kind: "order";
      prompt: string;
      items: string[];
      correctOrder: number[];
      explanation: string;
    }
  | {
      id: string;
      kind: "match";
      prompt: string;
      pairs: Array<{ left: string; right: string }>;
      explanation: string;
    }
  | {
      id: string;
      kind: "fix";
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      id: string;
      kind: "hunt";
      /** On-screen instruction (not the spoken text). */
      prompt: string;
      options: string[];
      correctWords: string[];
      explanation: string;
      /** Sentence(s) read aloud; mirrors round material. */
      transcript?: string;
      level?: LearningLevel;
      topic?: string;
      targets?: Array<{ word: string; meaningVi?: string; ipa?: string; accept?: string[] }>;
      distractors?: Array<{ word: string; type: "sound-alike" | "same-topic" | "form" }>;
    }
  | {
      id: string;
      kind: "spell";
      prompt: string;
      letters: string[];
      answer: string;
      explanation: string;
    }
  | {
      id: string;
      kind: "flash";
      prompt: string;
      word: string;
      ipa: string;
      meaningVi: string;
      gloss: string;
      example: string;
      partOfSpeech?: string;
      exampleVi?: string;
      explanation: string;
    };

export type LearningGameRound = {
  id: string;
  level: LearningLevel;
  seconds: number;
  lessonIds?: string[];
  deck?: string;
  hearAgainMax?: number;
  maxWords?: number;
  material?: { title: string; body: string; speakable?: boolean; imageUrl?: string; imageEmoji?: string };
  question: LearningQuestion;
};

export type LearningGame = {
  id: LearningGameId;
  title: string;
  body: string;
  skill: LearningSkill;
  durationMinutes: number;
  howToPlay: string;
  relatedSkill: LearningSkill;
  decks?: LearningGameDeck[];
  rounds: LearningGameRound[];
};

export type LearningGameDeck = {
  id: string;
  level: LearningLevel;
  title: string;
  cardCount: number;
};

export type LearningGameSummary = Omit<LearningGame, "rounds"> & { roundCount: number };

export type LearningExercise = {
  id: string;
  skill: LearningSkill;
  level: LearningLevel;
  title: string;
  durationMinutes: number;
  objectives: string[];
  tip: string;
  material: { title: string; body: string; speakable?: boolean };
  questions: LearningQuestion[];
};

export type LearningMeta = {
  skills: LearningSkill[];
  levels: LearningLevel[];
  totalExercises: number;
  totalGames?: number;
  games?: LearningGameId[];
  coverage: Array<{
    skill: LearningSkill;
    levels: Array<{ level: LearningLevel; exerciseCount: number }>;
  }>;
};

export type LearningIntegratedLesson = {
  id: string;
  level: LearningLevel;
  title: string;
  topic: string;
  totalDurationMinutes: number;
  objectives: string[];
  source: {
    title: string;
    publisher: string;
    url: string;
    publishedAt: string;
    accessedAt: string;
    adaptationNote: string;
  };
  verifiedFacts: string[];
  activities: Array<{
    skill: LearningSkill;
    title: string;
    durationMinutes: number;
    instructions: string[];
    material: { title: string; body: string; speakable?: boolean };
    questions: LearningQuestion[];
  }>;
};
