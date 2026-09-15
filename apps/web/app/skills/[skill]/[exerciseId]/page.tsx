import { notFound } from "next/navigation";
import { SkillExercisePage, isSkillId } from "@/features/learn";

export default async function SkillExerciseRoutePage({
  params,
}: {
  params: Promise<{ skill: string; exerciseId: string }>;
}) {
  const { skill, exerciseId } = await params;
  if (!isSkillId(skill) || !exerciseId) notFound();
  return <SkillExercisePage skill={skill} exerciseId={exerciseId} />;
}
