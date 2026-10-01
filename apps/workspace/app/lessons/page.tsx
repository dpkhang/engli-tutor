import { Suspense } from "react";
import { LessonsPage } from "@/features/learn";

export default function LessonsRoutePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading path…</div>}>
      <LessonsPage />
    </Suspense>
  );
}
