"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type SkillLevel } from "@/features/learn/model/skill-exercises";
import { accountApi } from "@/features/accounts/api";
import { queryKeys } from "@/lib/query";
import {
  applyLearningPreferences,
  getAutoPlayListening,
  getPreferredLevel,
  getSpeechRateId,
  setPreferredLevel,
  type SpeechRateId,
} from "../../model/preferences";
import { LearningSettingsView, type LearningViewState } from "./learning-settings.view";

function isDirty(draft: LearningViewState, saved: LearningViewState) {
  return (
    draft.level !== saved.level ||
    draft.speechRate !== saved.speechRate ||
    draft.autoPlay !== saved.autoPlay
  );
}

export function LearningSettings() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
  });
  const [view, setView] = useState<LearningViewState | null>(null);
  const [saved, setSaved] = useState<LearningViewState | null>(null);
  const [savePending, setSavePending] = useState(false);

  useLayoutEffect(() => {
    if (saved) return;
    if (!profileQuery.isSuccess && !profileQuery.isError) return;
    const serverLevel = profileQuery.data?.targetLevel ?? null;
    if (serverLevel) setPreferredLevel(serverLevel);
    const current: LearningViewState = {
      level: serverLevel ?? getPreferredLevel(),
      speechRate: getSpeechRateId(),
      autoPlay: getAutoPlayListening(),
    };
    setView(current);
    setSaved(current);
  }, [profileQuery.isSuccess, profileQuery.isError, profileQuery.data, saved]);

  const dirty = Boolean(view && saved && isDirty(view, saved));

  const onLevelChange = useCallback((next: SkillLevel) => {
    setView((current) => (current ? { ...current, level: next } : current));
  }, []);

  const onSpeechRateChange = useCallback((id: SpeechRateId) => {
    setView((current) => (current ? { ...current, speechRate: id } : current));
  }, []);

  const onToggleAutoPlay = useCallback(() => {
    setView((current) => (current ? { ...current, autoPlay: !current.autoPlay } : current));
  }, []);

  const onApply = useCallback(async () => {
    if (!view) return;
    setSavePending(true);
    try {
      applyLearningPreferences(view);
      if (view.level && view.level !== saved?.level) {
        const profile = await accountApi.update({ targetLevel: view.level });
        queryClient.setQueryData(queryKeys.account, profile);
      }
      setSaved(view);
    } catch {
      setSaved(view);
    } finally {
      setSavePending(false);
    }
  }, [queryClient, saved?.level, view]);

  const onDiscard = useCallback(() => {
    if (!saved) return;
    setView(saved);
  }, [saved]);

  return (
    <LearningSettingsView
      view={view}
      dirty={dirty}
      savePending={savePending}
      onLevelChange={onLevelChange}
      onSpeechRateChange={onSpeechRateChange}
      onToggleAutoPlay={onToggleAutoPlay}
      onApply={onApply}
      onDiscard={onDiscard}
    />
  );
}
