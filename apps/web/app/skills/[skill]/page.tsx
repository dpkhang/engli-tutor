import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SkillListPage } from "@/features/learn";
import { SKILLS, isSkillId } from "@/features/learn/model/skill-exercises";

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
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading exercises…</div>}>
      <SkillListPage skill={skill} />
    </Suspense>
  );
}
