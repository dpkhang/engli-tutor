import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { TutorChatPage } from "@/features/tutor-chat";

export default function PracticeRoutePage() {
  return (
    <Suspense fallback={<RouteFallback messageKey="shell.openingChat" />}>
      <TutorChatPage />
    </Suspense>
  );
}
