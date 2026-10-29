"use client";

import { useCallback, useState } from "react";
import { useToast } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { isDraftDirty } from "../../model/draft";

/**
 * Local draft over a saved value. Nothing is persisted until `save()` runs.
 * `persist` must throw on failure (draft is kept for retry) and must make the
 * caller's `saved` value reflect the new state on success.
 */
export function useSettingsDraft<T extends Record<string, unknown>>({
  saved,
  persist,
}: {
  saved: T | null;
  persist: (draft: T) => Promise<void>;
}) {
  const t = useWorkspaceI18n();
  const toast = useToast();
  const [override, setOverride] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  const draft = override ?? saved;
  const isDirty = isDraftDirty(draft, saved);

  const patch = useCallback(
    (next: Partial<T>) => {
      if (!saved) return;
      setOverride((current) => ({ ...(current ?? saved), ...next }));
    },
    [saved],
  );

  const reset = useCallback(() => setOverride(null), []);

  const save = useCallback(async () => {
    if (!draft || !isDirty || saving) return;
    setSaving(true);
    try {
      await persist(draft);
      setOverride(null);
      toast.success(t("settings.form.saved"));
    } catch (error) {
      toast.toast({
        title: t("settings.form.saveFailed"),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }, [draft, isDirty, persist, saving, t, toast]);

  return { draft, patch, reset, isDirty, saving, save };
}
