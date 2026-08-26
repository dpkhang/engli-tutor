import { notFound } from "next/navigation";
import { SkillExercisePage } from "@/features/learn";
import { isSkillId } from "@/features/learn/model/skill-exercises";

export default async function SkillExerciseRoutePage({
  params,
}: {
  params: Promise<{ skill: string; exerciseId: string }>;
}) {
  const { skill, exerciseId } = await params;
  if (!isSkillId(skill) || !exerciseId) notFound();
  return <SkillExercisePage skill={skill} exerciseId={exerciseId} />;
}
