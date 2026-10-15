import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { notFound } from "next/navigation";
import { SkillListPage, SKILLS, isSkillId } from "@/features/learn";

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ skill: skill.id }));
}

export const dynamicParams = false;

export default async function SkillListRoutePage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  if (!isSkillId(skill)) notFound();
  return (
    <Suspense fallback={<RouteFallback messageKey="shell.loadingExercises" />}>
      <SkillListPage skill={skill} />
    </Suspense>
  );
}
