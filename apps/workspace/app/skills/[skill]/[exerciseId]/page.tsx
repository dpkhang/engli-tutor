import { notFound } from "next/navigation";
import { SkillExercisePage, isSkillId } from "@/features/learn";

export default async function SkillExerciseRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ skill: string; exerciseId: string }>;
  searchParams: Promise<{ level?: string | string[] }>;
}) {
  const { skill, exerciseId } = await params;
  const query = await searchParams;
  const listLevel = Array.isArray(query.level) ? query.level[0] : query.level;
  if (!isSkillId(skill) || !exerciseId) notFound();
  return <SkillExercisePage skill={skill} exerciseId={exerciseId} listLevel={listLevel} />;
}
