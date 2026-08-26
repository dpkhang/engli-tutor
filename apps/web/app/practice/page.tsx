import { Suspense } from "react";
import { TutorChatPage } from "@/features/tutor-chat";

export default function PracticeRoutePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Opening chat room…</div>}>
      <TutorChatPage />
    </Suspense>
  );
}
