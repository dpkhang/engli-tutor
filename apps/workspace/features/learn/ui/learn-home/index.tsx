"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { LearnHomeView } from "./learn-home.view";

export function LearnHome() {
  const { data: session } = useSession();
  const firstName = useMemo(
    () =>
      session?.user?.name?.trim()?.split(/\s+/)[0] || session?.user?.email?.split("@")[0] || "there",
    [session?.user?.name, session?.user?.email],
  );

  return <LearnHomeView firstName={firstName} />;
}
