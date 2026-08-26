import type { SkillExercise, SkillId, SkillLevel } from "../model/skill-exercises";
import type { LearningExercise, LearningIntegratedLesson, LearningSkill } from "./types";
import type { LessonPack } from "../model/curriculum";

const SKILL_LABEL: Record<LearningSkill, LessonPack["skills"][number]> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
};

export function mapLearningExercise(exercise: LearningExercise): SkillExercise {
  return {
    id: exercise.id,
    skill: exercise.skill as SkillId,
    level: exercise.level as SkillLevel,
    title: exercise.title,
    duration: `${exercise.durationMinutes} min`,
    tip: exercise.tip,
    material: exercise.material,
    questions: exercise.questions.map((question) => {
      if (question.kind === "choice") {
        return {
          id: question.id,
          kind: "choice" as const,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explainVi: question.explanation,
        };
      }
      return {
        id: question.id,
        kind: "open" as const,
        prompt: question.prompt,
        expectKeywords: question.keywords,
        sampleAnswer: question.sampleAnswer,
        explainVi: question.explanation,
      };
    }),
  };
}

export function mapIntegratedLesson(lesson: LearningIntegratedLesson): LessonPack {
  const skills = Array.from(
    new Set(lesson.activities.map((activity) => SKILL_LABEL[activity.skill])),
  );

  return {
    id: lesson.id,
    title: lesson.title,
    level: lesson.level,
    duration: `${lesson.totalDurationMinutes} min`,
    skills,
    tip: lesson.objectives[0] ?? lesson.source.adaptationNote,
    game: lesson.verifiedFacts[0]
      ? `Verified fact — ${lesson.verifiedFacts[0]}`
      : "Complete all four skill activities in this pack",
    scenario: "free",
    focus: lesson.topic,
  };
}
