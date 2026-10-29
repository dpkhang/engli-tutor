"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type SkillLevel } from "@/features/learn";
import { accountApi } from "@/features/accounts";
import { queryKeys } from "@/lib/query";
import {
  applyLearningPreferences,
  getAutoPlayListening,
  getPreferredLevel,
  getSpeechRateId,
  setPreferredLevel,
  type SpeechRateId,
} from "../../model/preferences";
import { useSettingsDraft } from "../shared";
import { LearningSettingsView, type LearningViewState } from "./learning-settings.view";

export function LearningSettings() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
  });
  const [saved, setSaved] = useState<LearningViewState | null>(null);

  useLayoutEffect(() => {
    if (saved) return;
    if (!profileQuery.isSuccess && !profileQuery.isError) return;
    const serverLevel = profileQuery.data?.targetLevel ?? null;
    if (serverLevel) setPreferredLevel(serverLevel);
    setSaved({
      level: serverLevel ?? getPreferredLevel(),
      speechRate: getSpeechRateId(),
      autoPlay: getAutoPlayListening(),
    });
  }, [profileQuery.isSuccess, profileQuery.isError, profileQuery.data, saved]);

  const persist = useCallback(
    async (next: LearningViewState) => {
      if (next.level && next.level !== saved?.level) {
        const profile = await accountApi.update({ targetLevel: next.level });
        queryClient.setQueryData(queryKeys.account, profile);
      }
      applyLearningPreferences(next);
      setSaved(next);
    },
    [queryClient, saved?.level],
  );

  const { draft, patch, reset, isDirty, saving, save } = useSettingsDraft({ saved, persist });

  return (
    <LearningSettingsView
      view={draft}
      isDirty={isDirty}
      saving={saving}
      onLevelChange={useCallback((level: SkillLevel) => patch({ level }), [patch])}
      onSpeechRateChange={useCallback((speechRate: SpeechRateId) => patch({ speechRate }), [patch])}
      onAutoPlayChange={useCallback((autoPlay: boolean) => patch({ autoPlay }), [patch])}
      onSave={() => void save()}
      onReset={reset}
    />
  );
}
