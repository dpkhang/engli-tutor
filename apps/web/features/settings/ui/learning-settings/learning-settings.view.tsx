"use client";

import { memo } from "react";
import { Target, Volume2 } from "lucide-react";
import { Button, CardTitle, Label, SegmentedSwitch, cn } from "@landing-page-generator/ui";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { SPEECH_RATES, type SpeechRateId } from "../../model/preferences";
import { ChoiceChip, SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";

export type LearningViewState = {
  level: SkillLevel | null;
  speechRate: SpeechRateId;
  autoPlay: boolean;
};

export type LearningSettingsViewProps = {
  view: LearningViewState | null;
  dirty: boolean;
  savePending: boolean;
  onLevelChange: (level: SkillLevel) => void;
  onSpeechRateChange: (id: SpeechRateId) => void;
  onToggleAutoPlay: () => void;
  onApply: () => void;
  onDiscard: () => void;
};

export const LearningSettingsView = memo(function LearningSettingsView({
  view,
  dirty,
  savePending,
  onLevelChange,
  onSpeechRateChange,
  onToggleAutoPlay,
  onApply,
  onDiscard,
}: LearningSettingsViewProps) {
  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <div className={cn("space-y-4", dirty && "pb-28")}>
          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> Preferred level
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                Skills opens this band first. You can still switch to any level on the practice
                page.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {LEVELS.map((item) => (
                  <ChoiceChip
                    key={item.id}
                    active={view.level === item.id}
                    onClick={() => onLevelChange(item.id)}
                  >
                    {item.id}
                    <span className="opacity-70">· {item.labelVi}</span>
                  </ChoiceChip>
                ))}
              </div>
            </SettingsCardContent>
          </SettingsCard>

          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="size-5 text-primary" /> Listening & speech
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Playback speed</Label>
                <p className="text-sm text-muted-foreground">
                  Applies to Listen on exercises and AI tutor speech.
                </p>
                <SegmentedSwitch
                  value={view.speechRate}
                  onChange={onSpeechRateChange}
                  ariaLabel="Playback speed"
                  options={(Object.keys(SPEECH_RATES) as SpeechRateId[]).map((id) => ({
                    id,
                    label: SPEECH_RATES[id].label,
                  }))}
                />
                <p className="text-xs text-muted-foreground">{SPEECH_RATES[view.speechRate].hint}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoplay-listening">Auto-play listening audio</Label>
                <p className="text-sm text-muted-foreground">
                  Start audio automatically when you open a listening exercise.
                </p>
                <button
                  id="autoplay-listening"
                  type="button"
                  role="switch"
                  aria-checked={view.autoPlay}
                  onClick={onToggleAutoPlay}
                  className={cn(
                    "relative inline-flex h-8 w-14 items-center rounded-full border transition-colors",
                    view.autoPlay ? "border-primary bg-primary" : "border-border bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-6 rounded-full bg-background shadow-sm transition-transform",
                      view.autoPlay ? "translate-x-7" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </SettingsCardContent>
          </SettingsCard>

          {dirty ? (
            <div className="fixed inset-x-0 bottom-0 z-70 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md sm:px-6">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 pr-16 lg:pl-62 lg:pr-4">
                <p className="text-sm text-muted-foreground">You have unsaved learning changes.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={savePending}
                    onClick={onDiscard}
                  >
                    Discard
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full"
                    disabled={savePending}
                    onClick={onApply}
                  >
                    {savePending ? "Saving..." : "Apply"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </SettingsPanel>
  );
});
