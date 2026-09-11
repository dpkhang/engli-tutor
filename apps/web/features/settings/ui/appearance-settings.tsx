"use client";

import { useLayoutEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Label } from "@landing-page-generator/ui";
import {
  applyThemePreference,
  getThemePreference,
  type ThemePreference,
} from "../model/preferences";
import { ChoiceChip } from "./choice-chip";
import { SettingsPanel } from "./settings-panel";

const THEME_OPTIONS: Array<{ id: ThemePreference; label: string; icon: typeof Sun }> = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function AppearanceSettings() {
  const [theme, setTheme] = useState<ThemePreference | null>(null);

  useLayoutEffect(() => {
    setTheme(getThemePreference());
  }, []);

  const chooseTheme = (next: ThemePreference) => {
    applyThemePreference(next);
    setTheme(next);
  };

  return (
    <SettingsPanel ready={theme !== null}>
      <Card className="rounded-[1.5rem] shadow-none">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="size-5 text-primary" />
            ) : theme === "light" ? (
              <Sun className="size-5 text-primary" />
            ) : (
              <Monitor className="size-5 text-primary" />
            )}
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          <Label>Color mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <ChoiceChip
                  key={option.id}
                  active={theme === option.id}
                  onClick={() => chooseTheme(option.id)}
                >
                  <Icon className="size-4" />
                  {option.label}
                </ChoiceChip>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            System follows your device light/dark setting.
          </p>
        </CardContent>
      </Card>
    </SettingsPanel>
  );
}
