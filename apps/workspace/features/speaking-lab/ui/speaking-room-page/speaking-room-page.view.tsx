"use client";

import { memo, type KeyboardEvent, type RefObject } from "react";
import Link from "next/link";
import { useUpgradeModal } from "@/features/payments/ui/upgrade-modal-provider";
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  LoaderCircle,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { type TutorLevel, type TutorScenario } from "@/features/tutor-chat/api";
import { VoiceOrb } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

export const SCENES: {
  id: TutorScenario;
  label: string;
  blurb: string;
  opener: string;
}[] = [
  {
    id: "interview",
    label: "Interview",
    blurb: "Self-intro & behavioral",
    opener:
      "Hi! Let's practice a spoken interview. Please introduce yourself in about 30 seconds — name, role, and one strength.",
  },
  {
    id: "standup",
    label: "Stand-up",
    blurb: "Yesterday / today / blockers",
    opener: "Good morning! It's your turn in stand-up. Tell me what you finished yesterday in two short sentences.",
  },
  {
    id: "smalltalk",
    label: "Small talk",
    blurb: "Chat with a colleague",
    opener: "Hey! How's your week going? Answer in two or three spoken sentences.",
  },
  {
    id: "free",
    label: "Free",
    blurb: "You pick the topic",
    opener: "I'm ready to speak with you. What topic would you like to practice for one minute?",
  },
];

export const LEVELS: TutorLevel[] = ["A2", "B1", "TOEIC", "IELTS"];

export type SpeakingRoomPageViewProps = {
  scene: TutorScenario;
  level: TutorLevel;
  draft: string;
  pending: boolean;
  error: string | null;
  showUpgrade: boolean;
  lockedScenes: TutorScenario[];
  demoMode: boolean;
  autoSpeak: boolean;
  aiSpeaking: boolean;
  voiceSource: "ai" | "browser" | null;
  panelOpen: boolean;
  sfxOn: boolean;
  sceneLabel: string;
  promptEn: string;
  promptTip: string | null;
  userTurns: number;
  orbMode: "idle" | "recording" | "ai" | "thinking";
  voiceRecording: boolean;
  voiceSupported: boolean;
  voiceStream: MediaStream | null;
  voiceError: string | null;
  bottomRef: RefObject<HTMLDivElement | null>;
  draftInputRef: RefObject<HTMLTextAreaElement | null>;
  onExit: () => void;
  onToggleSfx: () => void;
  onToggleAutoSpeak: () => void;
  onReset: () => void;
  onTogglePanel: () => void;
  onSelectScene: (id: TutorScenario) => void;
  onSelectLevel: (level: TutorLevel) => void;
  onMicClick: () => void;
  onReplayPrompt: () => void;
  onDraftChange: (value: string) => void;
  onDraftKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};

export const SpeakingRoomPageView = memo(function SpeakingRoomPageView({
  scene,
  level,
  draft,
  pending,
  error,
  showUpgrade,
  lockedScenes,
  demoMode,
  autoSpeak,
  aiSpeaking,
  voiceSource,
  panelOpen,
  sfxOn,
  sceneLabel,
  promptEn,
  promptTip,
  userTurns,
  orbMode,
  voiceRecording,
  voiceSupported,
  voiceStream,
  voiceError,
  bottomRef,
  draftInputRef,
  onExit,
  onToggleSfx,
  onToggleAutoSpeak,
  onReset,
  onTogglePanel,
  onSelectScene,
  onSelectLevel,
  onMicClick,
  onReplayPrompt,
  onDraftChange,
  onDraftKeyDown,
  onSend,
}: SpeakingRoomPageViewProps) {
  const t = useWorkspaceI18n();
  const { openUpgradeModal } = useUpgradeModal();
  return (
    <div className="speaking-room fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-8%,hsl(var(--primary)/0.28),transparent_52%),radial-gradient(ellipse_at_85%_95%,hsl(var(--primary)/0.12),transparent_42%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface)/0.85)_48%,hsl(var(--background))_100%)]" />
        <div className="speaking-aurora absolute top-[-12%] left-[18%] h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="speaking-aurora-rev absolute right-[-12%] bottom-[-14%] h-80 w-80 rounded-full bg-primary/14 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background)/0.35)_100%)]" />
      </div>

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-primary/10 px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
            aria-label={t("workspace.exit")}
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              <Sparkles className="size-3" strokeWidth={2} />
              {t("workspace.speakWithAi")}
            </p>
            <p className="truncate text-[15px] font-medium tracking-tight text-foreground">
              {sceneLabel}
              <span className="ml-2 font-normal text-muted-foreground">{level}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={onToggleSfx}
            className={cn(
              "hidden h-9 items-center rounded-full px-3 text-[11px] font-medium transition sm:inline-flex",
              sfxOn
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
            )}
          >
            {sfxOn ? "SFX" : t("workspace.sfxOff")}
          </button>
          <button
            type="button"
            onClick={onToggleAutoSpeak}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition",
              autoSpeak
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
            )}
            aria-label={t("workspace.aiVoice")}
            title={autoSpeak ? t("workspace.muteAiVoice") : t("workspace.enableAiVoice")}
          >
            {autoSpeak ? (
              <Volume2 className="size-4" strokeWidth={1.5} />
            ) : (
              <VolumeX className="size-4" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/8 hover:text-foreground"
            aria-label={t("workspace.newConversation")}
          >
            <RefreshCw className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onTogglePanel}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium transition",
              panelOpen
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
            )}
          >
            {t("workspace.scene")}
            <ChevronDown
              className={cn("size-3.5 transition duration-300", panelOpen && "rotate-180")}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </header>

      {panelOpen ? (
        <div className="absolute top-17 right-5 left-5 z-30 space-y-4 rounded-[1.25rem] border border-primary/15 bg-card/95 p-4 shadow-[0_24px_60px_-28px_hsl(var(--primary)/0.45)] backdrop-blur-xl sm:right-8 sm:left-auto sm:w-md">
          <div className="flex flex-wrap gap-2">
            {SCENES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectScene(item.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition",
                  scene === item.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "bg-primary/6 text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
              >
                {item.label}
                {lockedScenes.includes(item.id) ? (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase opacity-80">
                    <Crown className="size-2.5" />
                    {t("workspace.premium")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSelectLevel(item)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium transition",
                  level === item
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-muted-foreground">
              {userTurns} {t("workspace.turns")}
              {demoMode ? " · demo" : ""}
            </span>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
        <div className="grid min-h-0 place-items-center overflow-y-auto px-5 py-2 sm:px-8 sm:py-4">
          <div className="flex w-full max-w-lg flex-col items-center gap-2.5 sm:gap-3">
            <p
              className={cn(
                "flex h-5 shrink-0 items-center justify-center text-[13px] font-medium transition-colors duration-500",
                voiceRecording
                  ? "text-primary"
                  : pending
                    ? "text-muted-foreground"
                    : aiSpeaking
                      ? "text-primary"
                      : "text-muted-foreground",
              )}
            >
              {voiceRecording
                ? t("workspace.recording")
                : pending
                  ? t("workspace.thinking")
                  : aiSpeaking
                    ? voiceSource === "browser"
                      ? t("workspace.aiSpeakingBrowser")
                      : t("workspace.aiSpeaking")
                    : t("workspace.tapMic")}
            </p>

            <button
              type="button"
              disabled={pending || !voiceSupported}
              onClick={onMicClick}
              className="group relative shrink-0 disabled:opacity-45"
              aria-label={voiceRecording ? t("workspace.stopRecording") : t("workspace.startRecording")}
            >
              <VoiceOrb stream={voiceStream} active={voiceRecording} mode={orbMode}>
                {pending ? (
                  <LoaderCircle className="size-7 animate-spin" strokeWidth={1.75} />
                ) : voiceRecording ? (
                  <Square className="size-7 fill-current" strokeWidth={0} />
                ) : !voiceSupported ? (
                  <MicOff className="size-7" strokeWidth={1.75} />
                ) : (
                  <Mic className="size-7" strokeWidth={1.75} />
                )}
              </VoiceOrb>
            </button>

            <button
              type="button"
              onClick={onReplayPrompt}
              disabled={!promptEn || pending || voiceRecording}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-30"
            >
              <Volume2 className="size-3.5" strokeWidth={1.5} />
              {t("workspace.replayAiLine")}
            </button>

            <div className="flex h-29 w-full shrink-0 flex-col justify-start overflow-hidden text-center sm:h-32">
              <div className="flex h-8 shrink-0 items-center justify-center">
                {(error || voiceError) && (
                  <p className="line-clamp-2 text-xs text-destructive">
                    {error || voiceError}
                    {showUpgrade ? (
                      <>
                        {" "}
                        <button type="button" className="font-semibold text-primary underline" onClick={openUpgradeModal}>
                          {t("workspace.seePlans")}
                        </button>
                      </>
                    ) : null}
                  </p>
                )}
              </div>

              <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden">
                {voiceRecording || (draft && !pending) ? (
                  <p className="line-clamp-3 text-[16px] leading-normal text-foreground sm:text-[17px]">
                    <span className="font-semibold text-primary">You — </span>
                    {draft || "…"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="line-clamp-4 text-[16px] leading-normal text-foreground/90 sm:text-[17px]">
                      {promptEn}
                    </p>
                    {promptTip ? (
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {promptTip}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div ref={bottomRef} className="sr-only" />
          </div>
        </div>

        <footer className="relative z-20 shrink-0 border-t border-primary/10 bg-background/85 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-8 sm:pt-4">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2.5">
            <p className="flex h-4 items-center justify-center text-center text-[11px] text-muted-foreground">
{voiceRecording
                ? t("workspace.whenDoneTapAgain")
                : t("workspace.speakNaturally")}
            </p>
            <div className="flex w-full items-end gap-2">
              <textarea
                ref={draftInputRef}
                rows={1}
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={onDraftKeyDown}
                placeholder={t("workspace.typeAnswer")}
                disabled={pending || voiceRecording}
                className="h-11 max-h-28 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-primary/15 bg-card/80 px-4 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-50"
              />
              <Button
                type="button"
                className="h-11 shrink-0 rounded-2xl bg-primary px-5 font-medium text-primary-foreground shadow-[0_12px_28px_-14px_hsl(var(--primary)/0.7)] hover:bg-primary/90"
                disabled={pending || voiceRecording || !draft.trim()}
                onClick={onSend}
              >
                Send
              </Button>
              <Link
                href="/"
                className="hidden h-11 shrink-0 items-center gap-1 rounded-2xl px-2 text-[12px] text-muted-foreground transition hover:text-primary sm:inline-flex"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                {t("workspace.home")}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
});
