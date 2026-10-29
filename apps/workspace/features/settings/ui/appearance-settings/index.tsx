"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  getAccentPreference,
  getReduceMotionPreference,
  getTextSizePreference,
  getThemePreference,
  saveAppearancePreferences,
  PREFERENCES_EVENT,
} from "../../model/preferences";
import { useSettingsDraft } from "../shared";
import {
  AppearanceSettingsView,
  type AppearanceViewState,
} from "./appearance-settings.view";

function readAppearance(): AppearanceViewState {
  return {
    theme: getThemePreference(),
    accent: getAccentPreference(),
    textSize: getTextSizePreference(),
    reduceMotion: getReduceMotionPreference(),
  };
}

/**
 * Save rule (ET-3 #4): nothing is painted or persisted until Save is clicked.
 * The draft is never previewed live, so Discard (reset) and leaving the page
 * need no restore.
 */
export function AppearanceSettings() {
  const [saved, setSaved] = useState<AppearanceViewState | null>(null);

  useLayoutEffect(() => {
    setSaved(readAppearance());
  }, []);

  // Reflect external changes; a dirty draft lives in useSettingsDraft's override and is kept.
  useEffect(() => {
    const sync = () => setSaved(readAppearance());
    window.addEventListener(PREFERENCES_EVENT, sync);
    return () => window.removeEventListener(PREFERENCES_EVENT, sync);
  }, []);

  const persist = useCallback(async (next: AppearanceViewState) => {
    await saveAppearancePreferences(next);
    setSaved(readAppearance());
  }, []);

  const { draft, patch, reset, isDirty, saving, save } = useSettingsDraft({ saved, persist });

  return (
    <AppearanceSettingsView
      view={draft}
      isDirty={isDirty}
      saving={saving}
      onThemeChange={useCallback((theme) => patch({ theme }), [patch])}
      onAccentChange={useCallback((accent) => patch({ accent }), [patch])}
      onTextSizeChange={useCallback((textSize) => patch({ textSize }), [patch])}
      onReduceMotionChange={useCallback((reduceMotion) => patch({ reduceMotion }), [patch])}
      onSave={() => void save()}
      onReset={reset}
    />
  );
}
