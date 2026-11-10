"use client";

import { memo } from "react";
import { useWorkspaceI18n } from "@/features/i18n";
import { Mic2 } from "lucide-react";
import { Button } from "@engli-tutor/ui";

export const OpenRoundView = memo(function OpenRoundView({
  value,
  locked,
  placeholder,
  allowMic,
  supported,
  recording,
  interim,
  error,
  onTextChange,
  onToggleMic,
}: {
  value: string;
  locked: boolean;
  placeholder: string;
  allowMic: boolean;
  supported: boolean;
  recording: boolean;
  interim: string | null | undefined;
  error: string | null | undefined;
  onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleMic: () => void;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        value={value}
        disabled={locked}
        onChange={onTextChange}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-70"
      />
      {allowMic && !locked ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!supported}
            onClick={onToggleMic}
          >
            <Mic2 className="size-4" />
            {recording ? t("learn.game.stop") : t("learn.game.speakInstead")}
          </Button>
          {interim ? <span className="text-xs text-muted-foreground">{interim}</span> : null}
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
});
