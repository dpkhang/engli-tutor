"use client";

import { memo, type ReactNode } from "react";
import {
  Leaf,
  Monitor,
  Moon,
  MoonStar,
  Palette,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Waves,
  Type,
} from "lucide-react";
import { Button, CardTitle, SegmentedSwitch, cn } from "@engli-tutor/ui";
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
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

const THEME_OPTIONS: Array<{ id: ThemePreference; label: string; hint: string }> = [
  { id: "light", label: "light", hint: "Bright workspace" },
  { id: "warm", label: "warm", hint: "Soft paper tone" },
  { id: "dark", label: "dark", hint: "Dim for night study" },
  { id: "midnight", label: "midnight", hint: "Deep OLED black" },
  { id: "forest", label: "forest", hint: "Calm green night" },
  { id: "ocean", label: "ocean", hint: "Cool blue depth" },
  { id: "dusk", label: "dusk", hint: "Warm sunset glow" },
  { id: "system", label: "system", hint: "Follow your device" },
];

const THEME_ICONS: Record<ThemePreference, ReactNode> = {
  light: <Sun className="size-5 text-primary" />,
  warm: <Sunrise className="size-5 text-primary" />,
  dark: <Moon className="size-5 text-primary" />,
  midnight: <MoonStar className="size-5 text-primary" />,
  forest: <Leaf className="size-5 text-primary" />,
  ocean: <Waves className="size-5 text-primary" />,
  dusk: <Sunset className="size-5 text-primary" />,
  system: <Monitor className="size-5 text-primary" />,
};

const THEME_PREVIEW: Record<
  Exclude<ThemePreference, "system">,
  { bg: string; bar: string; card: string; border: string }
> = {
  light: { bg: "#f3f5f8", bar: "#c9d1db", card: "#ffffff", border: "border-border/80" },
  warm: { bg: "#f6f0e6", bar: "#d9c8b0", card: "#fbf7f0", border: "border-[#e2d4c0]" },
  dark: { bg: "#12161d", bar: "#3b4656", card: "#1c232c", border: "border-white/10" },
  midnight: { bg: "#06080f", bar: "#2a3348", card: "#0d1220", border: "border-white/8" },
  forest: { bg: "#0c1510", bar: "#2f4a3a", card: "#142019", border: "border-white/8" },
  ocean: { bg: "#0a1219", bar: "#2a4558", card: "#11202b", border: "border-white/8" },
  dusk: { bg: "#16101c", bar: "#4a3558", card: "#22182c", border: "border-white/8" },
};

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

  const preview = THEME_PREVIEW[mode];
  return (
    <div
      className={cn("h-20 overflow-hidden rounded-xl border p-2.5", preview.border)}
      style={{ backgroundColor: preview.bg }}
    >
      <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: preview.bar }} />
      <div className="mt-2 h-10 rounded-lg shadow-sm" style={{ backgroundColor: preview.card }}>
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
  const t = useWorkspaceI18n();
  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <div className={cn("space-y-4", dirty && "pb-28")}>
          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                {THEME_ICONS[view.theme]}
                {t("workspace.theme")}
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {t("workspace.appearanceDescription")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
                    <span className="mt-2 block text-sm font-semibold">{t(`workspace.${option.label}`)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </SettingsCardContent>
          </SettingsCard>

          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5 text-primary" /> {t("workspace.accentColor")}
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {t("workspace.accentColor")}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
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
                <Type className="size-5 text-primary" /> {t("workspace.textSize")}
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {t("workspace.textSize")}
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
                <Sparkles className="size-5 text-primary" /> {t("workspace.motion")}
              </CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {t("workspace.motion")}
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
              <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:pr-16 lg:pl-62 lg:pr-4">
                <p className="text-sm text-muted-foreground">{t("workspace.unsavedAppearance")}</p>
                <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                  <Button type="button" variant="outline" className="flex-1 rounded-full sm:flex-none" onClick={onDiscard}>
                    {t("workspace.discard")}
                  </Button>
                  <Button type="button" className="flex-1 rounded-full sm:flex-none" onClick={onApply}>
                    {t("workspace.apply")}
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
