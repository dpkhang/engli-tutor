"use client";

import { useLayoutEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Label, cn } from "@landing-page-generator/ui";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { accountApi } from "@/features/accounts/api";
import { queryKeys } from "@/lib/query";
import {
  SPEECH_RATES,
  getAutoPlayListening,
  getPreferredLevel,
  getSpeechRateId,
  setAutoPlayListening,
  setPreferredLevel,
  setSpeechRateId,
  type SpeechRateId,
} from "../model/preferences";
import { ChoiceChip } from "./choice-chip";
import { SettingsPanel } from "./settings-panel";

type LearningView = {
  level: SkillLevel | null;
  speechRate: SpeechRateId;
  autoPlay: boolean;
};

export function LearningSettings() {
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
  });
  const [view, setView] = useState<LearningView | null>(null);
  const [levelSaving, setLevelSaving] = useState(false);

  useLayoutEffect(() => {
    if (view) return;
    if (!profileQuery.isSuccess && !profileQuery.isError) return;
    const serverLevel = profileQuery.data?.targetLevel ?? null;
    if (serverLevel) setPreferredLevel(serverLevel);
    setView({
      level: serverLevel ?? getPreferredLevel(),
      speechRate: getSpeechRateId(),
      autoPlay: getAutoPlayListening(),
    });
  }, [profileQuery.isSuccess, profileQuery.isError, profileQuery.data, view]);

  const chooseLevel = async (next: SkillLevel) => {
    setView((current) => (current ? { ...current, level: next } : current));
    setPreferredLevel(next);
    setLevelSaving(true);
    try {
      await accountApi.update({ targetLevel: next });
    } catch {
      /* Local preference still applies on Skills. */
    } finally {
      setLevelSaving(false);
    }
  };

  const toggleAutoPlay = () => {
    setView((current) => {
      if (!current) return current;
      const autoPlay = !current.autoPlay;
      setAutoPlayListening(autoPlay);
      return { ...current, autoPlay };
    });
  };

  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <>
          <Card className="rounded-[1.5rem] shadow-none">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> Preferred level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
              <p className="text-sm text-muted-foreground">
                Skills opens this band first. You can still switch to any level on the practice
                page.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {LEVELS.map((item) => (
                  <ChoiceChip
                    key={item.id}
                    active={view.level === item.id}
                    onClick={() => void chooseLevel(item.id)}
                  >
                    {item.id}
                    <span className="opacity-70">· {item.labelVi}</span>
                  </ChoiceChip>
                ))}
              </div>
              {levelSaving ? (
                <p className="text-xs text-muted-foreground">Saving to your account…</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] shadow-none">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="size-5 text-primary" /> Listening & speech
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 pt-0 sm:grid-cols-2 sm:gap-6 sm:p-6 sm:pt-0">
              <div className="space-y-3">
                <Label>Playback speed</Label>
                <p className="text-sm text-muted-foreground">
                  Applies to Listen on exercises and AI tutor speech.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                  {(Object.keys(SPEECH_RATES) as SpeechRateId[]).map((id) => (
                    <ChoiceChip
                      key={id}
                      active={view.speechRate === id}
                      onClick={() => {
                        setSpeechRateId(id);
                        setView((current) => (current ? { ...current, speechRate: id } : current));
                      }}
                    >
                      {SPEECH_RATES[id].label}
                    </ChoiceChip>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {SPEECH_RATES[view.speechRate].hint}
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="autoplay-listening">Auto-play listening audio</Label>
                <p className="text-sm text-muted-foreground">
                  Start audio automatically when you open a listening exercise.
                </p>
                <button
                  id="autoplay-listening"
                  type="button"
                  role="switch"
                  aria-checked={view.autoPlay}
                  onClick={toggleAutoPlay}
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
            </CardContent>
          </Card>
        </>
      ) : null}
    </SettingsPanel>
  );
}
