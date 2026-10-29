"use client";

import { memo } from "react";
import { Target, Volume2 } from "lucide-react";
import { SegmentedSwitch, Switch } from "@engli-tutor/ui";
import { LEVELS, type SkillLevel } from "@/features/learn";
import { SPEECH_RATES, type SpeechRateId } from "../../model/preferences";
import {
  ChoiceChip,
  SettingsFormCard,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
} from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

export type LearningViewState = {
  level: SkillLevel | null;
  speechRate: SpeechRateId;
  autoPlay: boolean;
};

export type LearningSettingsViewProps = {
  view: LearningViewState | null;
  isDirty: boolean;
  saving: boolean;
  onLevelChange: (level: SkillLevel) => void;
  onSpeechRateChange: (id: SpeechRateId) => void;
  onAutoPlayChange: (value: boolean) => void;
  onSave: () => void;
  onReset: () => void;
};

export const LearningSettingsView = memo(function LearningSettingsView({
  view,
  isDirty,
  saving,
  onLevelChange,
  onSpeechRateChange,
  onAutoPlayChange,
  onSave,
  onReset,
}: LearningSettingsViewProps) {
  const t = useWorkspaceI18n();
  return (
    <SettingsPanel ready={view !== null}>
      {view ? (
        <SettingsFormCard
          isDirty={isDirty}
          saving={saving}
          onSave={onSave}
          onReset={onReset}
        >
          <SettingsSection
            icon={<Target className="size-5 text-primary" />}
            title={t("workspace.preferredLevel")}
            description={t("workspace.preferredLevelDescription")}
          >
            <div
              role="group"
              aria-label={t("workspace.preferredLevel")}
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
            >
              {LEVELS.map((item) => (
                <ChoiceChip
                  key={item.id}
                  active={view.level === item.id}
                  pressed={view.level === item.id}
                  disabled={saving}
                  onClick={() => onLevelChange(item.id)}
                >
                  {item.id}
                  <span className="opacity-70">· {item.labelVi}</span>
                </ChoiceChip>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Volume2 className="size-5 text-primary" />}
            title={t("workspace.listeningSpeech")}
          >
            <div className="space-y-2">
              <SettingsRow
                label={t("workspace.playbackSpeed")}
                description={t("workspace.playbackSpeedDescription")}
              >
                {() => (
                  <SegmentedSwitch
                    value={view.speechRate}
                    onChange={onSpeechRateChange}
                    disabled={saving}
                    ariaLabel={t("workspace.playbackSpeed")}
                    options={(Object.keys(SPEECH_RATES) as SpeechRateId[]).map(
                      (id) => ({
                        id,
                        label: t(SPEECH_RATES[id].labelKey),
                      }),
                    )}
                  />
                )}
              </SettingsRow>
              <p className="text-xs text-muted-foreground">
                {t(SPEECH_RATES[view.speechRate].hintKey)}
              </p>
            </div>
            <SettingsRow
              label={t("workspace.autoplayListening")}
              description={t("workspace.autoplayListeningDescription")}
            >
              {({ controlId, labelId, descriptionId }) => (
                <Switch
                  id={controlId}
                  checked={view.autoPlay}
                  disabled={saving}
                  onCheckedChange={onAutoPlayChange}
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                />
              )}
            </SettingsRow>
          </SettingsSection>
        </SettingsFormCard>
      ) : null}
    </SettingsPanel>
  );
});
