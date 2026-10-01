"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  applyAppearancePreferences,
  getAccentPreference,
  getReduceMotionPreference,
  getTextSizePreference,
  getThemePreference,
  type AccentId,
  type ReduceMotionPreference,
  type TextSizeId,
  type ThemePreference,
  PREFERENCES_EVENT,
} from "../../model/preferences";
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

function isDirty(draft: AppearanceViewState, saved: AppearanceViewState) {
  return (
    draft.theme !== saved.theme ||
    draft.accent !== saved.accent ||
    draft.textSize !== saved.textSize ||
    draft.reduceMotion !== saved.reduceMotion
  );
}

export function AppearanceSettings() {
  const [view, setView] = useState<AppearanceViewState | null>(null);
  const [saved, setSaved] = useState<AppearanceViewState | null>(null);

  useLayoutEffect(() => {
    const current = readAppearance();
    setView(current);
    setSaved(current);
  }, []);

  const dirty = Boolean(view && saved && isDirty(view, saved));

  const update = useCallback(<K extends keyof AppearanceViewState>(key: K, value: AppearanceViewState[K]) => {
    setView((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  const onThemeChange = useCallback(
    (theme: ThemePreference) => update("theme", theme),
    [update],
  );
  const onAccentChange = useCallback(
    (accent: AccentId) => update("accent", accent),
    [update],
  );
  const onTextSizeChange = useCallback(
    (size: TextSizeId) => update("textSize", size),
    [update],
  );
  const onReduceMotionChange = useCallback(
    (value: ReduceMotionPreference) => update("reduceMotion", value),
    [update],
  );

  const onApply = useCallback(() => {
    if (!view) return;
    applyAppearancePreferences(view);
    setSaved(view);
  }, [view]);

  const onDiscard = useCallback(() => {
    if (!saved) return;
    setView(saved);
  }, [saved]);

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const sync = () => {
      if (dirtyRef.current) return;
      const next = readAppearance();
      setView(next);
      setSaved(next);
    };
    window.addEventListener(PREFERENCES_EVENT, sync);
    return () => window.removeEventListener(PREFERENCES_EVENT, sync);
  }, []);

  return (
    <AppearanceSettingsView
      view={view}
      dirty={dirty}
      onThemeChange={onThemeChange}
      onAccentChange={onAccentChange}
      onTextSizeChange={onTextSizeChange}
      onReduceMotionChange={onReduceMotionChange}
      onApply={onApply}
      onDiscard={onDiscard}
    />
  );
}
