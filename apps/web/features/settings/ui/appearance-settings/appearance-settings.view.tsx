"use client";

import { memo } from "react";
import { Monitor, Moon, Palette, Sparkles, Sun, Type } from "lucide-react";
import { Button, CardTitle, SegmentedSwitch, cn } from "@landing-page-generator/ui";
import {
  ACCENTS,
  REDUCE_MOTION_OPTIONS,
  TEXT_SIZES,
  type AccentId,
  type ReduceMotionPreference,
  type TextSizeId,
  type ThemePreference,
} from "../../model/preferences";
import { SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";

const THEME_OPTIONS: Array<{ id: ThemePreference; label: string; hint: string }> = [
  { id: "light", label: "Light", hint: "Bright workspace" },
  { id: "dark", label: "Dark", hint: "Dim for night study" },
  { id: "system", label: "System", hint: "Follow your device" },
];

export type AppearanceViewState = {
  theme: ThemePreference;
  accent: AccentId;
  textSize: TextSizeId;
  reduceMotion: ReduceMotionPreference;
};

function ThemePreview({ mode }: { mode: ThemePreference }) {
  if (mode === "system") {
    return (
      <div className="relative h-20 overflow-hidden rounded-xl border border-border/80">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[#f3f5f8] p-2.5">
          <div className="h-1.5 w-10 rounded-full bg-[#c9d1db]" />
          <div className="mt-2 h-10 rounded-lg bg-white shadow-sm" />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#12161d] p-2.5">
          <div className="h-1.5 w-10 rounded-full bg-[#3b4656]" />
          <div className="mt-2 h-10 rounded-lg bg-[#1c232c]" />
        </div>
      </div>
    );
  }

  const dark = mode === "dark";
  return (
    <div
      className={cn(
        "h-20 overflow-hidden rounded-xl border p-2.5",
        dark ? "border-white/10 bg-[#12161d]" : "border-border/80 bg-[#f3f5f8]",
      )}
    >
      <div className={cn("h-1.5 w-12 rounded-full", dark ? "bg-[#3b4656]" : "bg-[#c9d1db]")} />
      <div className={cn("mt-2 h-10 rounded-lg shadow-sm", dark ? "bg-[#1c232c]" : "bg-white")}>
        <div className="m-2 h-2 w-16 rounded-full bg-primary/70" />
      </div>
    </div>
  );
}

export type AppearanceSettingsViewProps = {
  view: AppearanceViewState | null;
  dirty: boolean;
  onThemeChange: (theme: ThemePreference) => void;
  onAccentChange: (accent: AccentId) => void;
  onTextSizeChange: (size: TextSizeId) => void;
  onReduceMotionChange: (value: ReduceMotionPreference) => void;
  onApply: () => void;
  onDiscard: () => void;
};

export const AppearanceSettingsView = memo(function AppearanceSettingsView({
  view,
  dirty,
  onThemeChange,
  onAccentChange,
  onTextSizeChange,
  onReduceMotionChange,
  onApply,
  onDiscard,
}: AppearanceSettingsViewProps) {
  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <div className={cn("space-y-4", dirty && "pb-28")}>
          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                {view.theme === "dark" ? (
                  <Moon className="size-5 text-primary" />
                ) : view.theme === "light" ? (
                  <Sun className="size-5 text-primary" />
                ) : (
                  <Monitor className="size-5 text-primary" />
                )}
                Theme
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                Choose how EngliTutor looks while you study. System follows your device.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onThemeChange(option.id)}
                    className={cn(
                      "rounded-2xl border p-2.5 text-left transition-colors",
                      view.theme === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <ThemePreview mode={option.id} />
                    <span className="mt-2 block text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </SettingsCardContent>
          </SettingsCard>

          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5 text-primary" /> Accent color
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                Buttons, links, and highlights use this color across the workspace.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ACCENTS.map((option) => {
                  const active = view.accent === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onAccentChange(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-8 rounded-full border-2 shadow-sm",
                          active ? "border-foreground/20" : "border-transparent",
                        )}
                        style={{ backgroundColor: `hsl(${option.swatch})` }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </SettingsCardContent>
          </SettingsCard>

          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="size-5 text-primary" /> Text size
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                Scale the workspace for easier reading during longer sessions.
              </p>
              <SegmentedSwitch
                value={view.textSize}
                onChange={onTextSizeChange}
                ariaLabel="Text size"
                options={TEXT_SIZES.map((option) => ({ id: option.id, label: option.label }))}
              />
              <p
                className={cn(
                  "rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5 leading-6 text-foreground",
                  view.textSize === "large"
                    ? "text-lg"
                    : view.textSize === "comfortable"
                      ? "text-base"
                      : "text-sm",
                )}
              >
                Preview: “She booked a meeting for Tuesday afternoon.”
              </p>
            </SettingsCardContent>
          </SettingsCard>

          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Motion
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                Reduce movement on welcome, speaking, and loading screens.
              </p>
              <SegmentedSwitch
                value={view.reduceMotion}
                onChange={onReduceMotionChange}
                ariaLabel="Animation"
                options={REDUCE_MOTION_OPTIONS.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
              />
              <p className="text-xs text-muted-foreground">
                {REDUCE_MOTION_OPTIONS.find((item) => item.id === view.reduceMotion)?.hint}
              </p>
            </SettingsCardContent>
          </SettingsCard>

          {dirty ? (
            <div className="fixed inset-x-0 bottom-0 z-70 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md sm:px-6">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 pr-16 lg:pl-62 lg:pr-4">
                <p className="text-sm text-muted-foreground">You have unsaved appearance changes.</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="rounded-full" onClick={onDiscard}>
                    Discard
                  </Button>
                  <Button type="button" className="rounded-full" onClick={onApply}>
                    Apply
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
