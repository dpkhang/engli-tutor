"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { hydrateLessonProgress, setActiveLessonProgressUser } from "../../model/lesson-progress";

export function LessonProgressSync({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setActiveLessonProgressUser(null);
      return;
    }
    void hydrateLessonProgress(userId);
  }, [userId]);

  return children;
}
