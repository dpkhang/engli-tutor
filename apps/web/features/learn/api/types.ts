export type LearningSkill = "reading" | "listening" | "speaking" | "writing";
export type LearningLevel = "A2" | "A2+" | "B1";

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
      sampleAnswer: string;
      explanation: string;
    };

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
