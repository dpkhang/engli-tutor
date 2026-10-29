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
import { cn } from "@engli-tutor/ui";
import {
  ACCENTS,
  REDUCE_MOTION_OPTIONS,
  TEXT_SIZES,
  type AccentId,
  type ReduceMotionPreference,
  type TextSizeId,
  type ThemePreference,
} from "../../model/preferences";
import { ChoiceChip, SettingsFormCard, SettingsPanel, SettingsRow, SettingsSection } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

const THEME_OPTIONS: Array<{ id: ThemePreference; labelKey: string; hintKey: string }> = [
  { id: "light", labelKey: "workspace.light", hintKey: "settings.theme.lightHint" },
  { id: "warm", labelKey: "workspace.warm", hintKey: "settings.theme.warmHint" },
  { id: "dark", labelKey: "workspace.dark", hintKey: "settings.theme.darkHint" },
  { id: "midnight", labelKey: "workspace.midnight", hintKey: "settings.theme.midnightHint" },
  { id: "forest", labelKey: "workspace.forest", hintKey: "settings.theme.forestHint" },
  { id: "ocean", labelKey: "workspace.ocean", hintKey: "settings.theme.oceanHint" },
  { id: "dusk", labelKey: "workspace.dusk", hintKey: "settings.theme.duskHint" },
  { id: "system", labelKey: "workspace.system", hintKey: "settings.theme.systemHint" },
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
  isDirty: boolean;
  saving: boolean;
  onThemeChange: (theme: ThemePreference) => void;
  onAccentChange: (accent: AccentId) => void;
  onTextSizeChange: (size: TextSizeId) => void;
  onReduceMotionChange: (value: ReduceMotionPreference) => void;
  onSave: () => void;
  onReset: () => void;
};

export const AppearanceSettingsView = memo(function AppearanceSettingsView({
  view,
  isDirty,
  saving,
  onThemeChange,
  onAccentChange,
  onTextSizeChange,
  onReduceMotionChange,
  onSave,
  onReset,
}: AppearanceSettingsViewProps) {
  const t = useWorkspaceI18n();
  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <SettingsFormCard isDirty={isDirty} saving={saving} onSave={onSave} onReset={onReset}>
          <SettingsSection
            icon={THEME_ICONS[view.theme]}
            title={t("workspace.theme")}
            description={t("settings.appearance.themeDescription")}
          >
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={view.theme === option.id}
                  onClick={() => onThemeChange(option.id)}
                  className={cn(
                    "min-w-0 rounded-2xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    view.theme === option.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <ThemePreview mode={option.id} />
                  <span className="mt-2 block text-sm font-semibold">{t(option.labelKey)}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{t(option.hintKey)}</span>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Palette className="size-5 text-primary" />}
            title={t("workspace.accentColor")}
            description={t("settings.appearance.accentDescription")}
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {ACCENTS.map((option) => {
                const active = view.accent === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onAccentChange(option.id)}
                    className={cn(
                      "flex min-h-11 min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-8 rounded-full border-2",
                        active ? "border-foreground/20" : "border-transparent",
                      )}
                      style={{ backgroundColor: `hsl(${option.swatch})` }}
                    />
                    {t(`settings.accent.${option.id}`)}
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Type className="size-5 text-primary" />}
            title={t("workspace.textSize")}
            description={t("settings.appearance.textSizeDescription")}
          >
            <SettingsRow label={t("workspace.textSize")}>
              {({ labelId }) => (
                <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                  {TEXT_SIZES.map((option) => (
                    <ChoiceChip
                      key={option.id}
                      active={view.textSize === option.id}
                      pressed={view.textSize === option.id}
                      onClick={() => onTextSizeChange(option.id)}
                    >
                      {t(option.labelKey)}
                    </ChoiceChip>
                  ))}
                </div>
              )}
            </SettingsRow>
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
              {t("settings.textSize.preview")} “She booked a meeting for Tuesday afternoon.”
            </p>
          </SettingsSection>

          <SettingsSection
            icon={<Sparkles className="size-5 text-primary" />}
            title={t("workspace.motion")}
            description={t("settings.appearance.motionDescription")}
          >
            <SettingsRow label={t("workspace.motion")}>
              {({ labelId }) => (
                <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                  {REDUCE_MOTION_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.id}
                      active={view.reduceMotion === option.id}
                      pressed={view.reduceMotion === option.id}
                      onClick={() => onReduceMotionChange(option.id)}
                    >
                      {t(option.labelKey)}
                    </ChoiceChip>
                  ))}
                </div>
              )}
            </SettingsRow>
            <p className="text-xs text-muted-foreground">
              {t(REDUCE_MOTION_OPTIONS.find((item) => item.id === view.reduceMotion)?.hintKey ?? "")}
            </p>
          </SettingsSection>
        </SettingsFormCard>
      ) : null}
    </SettingsPanel>
  );
});
