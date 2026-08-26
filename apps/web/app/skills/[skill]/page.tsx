import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SkillListPage } from "@/features/learn";
import { isSkillId } from "@/features/learn/model/skill-exercises";

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
