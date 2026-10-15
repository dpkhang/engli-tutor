"use client";

import { memo, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { useUpgradeModal } from "@/features/payments";
import {
  BrainCircuit,
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { type TutorChatMessage } from "../../api/tutor-api";
import { useWorkspaceI18n } from "@/features/i18n";

export const CHAT_STARTER =
  "Hi! I'm ready to practice English with you. What would you like to talk about today?";

type ChatMessage = TutorChatMessage & { audioUrl?: string; streaming?: boolean };

/** Drops a trailing "💬 Tips:" block if the model still adds one. */
function stripTips(content: string): string {
  const marker = content.indexOf("💬");
  return (marker === -1 ? content : content.slice(0, marker)).trim();
}

export type TutorChatPageViewProps = {
  messages: ChatMessage[];
  draft: string;
  pending: boolean;
  error: string | null;
  showUpgrade: boolean;
  demoMode: boolean;
  voiceRecording: boolean;
  voiceSupported: boolean;
  voiceSpeechSupported: boolean;
  voiceError: string | null;
  micDisabled: boolean;
  messageListRef: RefObject<HTMLDivElement | null>;
  composerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onResetCurrent: () => void;
  onDraftChange: (value: string) => void;
  onDraftKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent) => void;
  onToggleMic: () => void;
};

export const TutorChatPageView = memo(function TutorChatPageView({
  messages,
  draft,
  pending,
  error,
  showUpgrade,
  demoMode,
  voiceRecording,
  voiceSupported,
  voiceSpeechSupported,
  voiceError,
  micDisabled,
  messageListRef,
  composerRef,
  inputRef,
  onResetCurrent,
  onDraftChange,
  onDraftKeyDown,
  onSubmit,
  onToggleMic,
}: TutorChatPageViewProps) {
  const t = useWorkspaceI18n();
  const { openUpgradeModal } = useUpgradeModal();
  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col gap-5">
      <header className="workspace-hero-accent relative space-y-3 overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 px-5 py-5 text-primary-foreground sm:space-y-4 sm:rounded-[1.75rem] sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 hidden size-52 rounded-full border-26 border-white/7 sm:block"
        />
        <p className="relative hidden items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase sm:inline-flex">
          <Sparkles className="size-3.5 text-amber-300" />
          {t("workspace.chatPracticeSpace")}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="relative max-w-2xl space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("workspace.chatTutor")}
            </h1>
            <p className="hidden text-sm leading-relaxed text-white/70 sm:block sm:text-base">
              {t("workspace.chatDescription")}
            </p>
          </div>
        </div>

        {demoMode ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
            <Sparkles className="size-3.5" />
            {t("workspace.demoMode")}
          </p>
        ) : null}
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_24px_60px_-35px_rgba(79,70,229,0.28)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <MessageCircle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">EngliTutor AI</p>
            <p className="truncate text-xs text-muted-foreground">
              A2–B1 · {t("workspace.voiceInputSupported")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onResetCurrent}
            aria-label={t("workspace.newConversation")}
            title={t("workspace.newConversation")}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>

        <div ref={messageListRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const english = isUser ? message.content : stripTips(message.content);

            return (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[min(100%,36rem)] space-y-2",
                    isUser ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      isUser
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : message.streaming
                          ? "rounded-bl-md border border-primary/20 bg-linear-to-br from-primary/10 via-accent/8 to-muted text-foreground shadow-[0_8px_30px_-18px_rgba(79,70,229,0.7)]"
                          : "rounded-bl-md bg-muted text-foreground",
                    )}
                  >
                    {!isUser && message.streaming ? (
                      <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-primary/80 uppercase">
                        <span className="grid size-5 place-items-center rounded-full bg-primary/15">
                          <BrainCircuit className="size-3.5 animate-pulse" />
                        </span>
                        <span>EngliTutor AI</span>
                        <span className="flex gap-0.5" aria-label="AI is composing">
                          <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                          <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                          <span className="size-1 animate-bounce rounded-full bg-primary" />
                        </span>
                      </span>
                    ) : null}
                    {english}
                    {!isUser && message.streaming ? (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary align-[-2px]"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  {message.audioUrl ? (
                    <audio
                      controls
                      src={message.audioUrl}
                      className={cn("h-9 max-w-full", isUser ? "accent-white" : undefined)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}

          {pending && !messages.some((message) => message.streaming) ? (
            <div className="flex justify-start">
              <div className="relative overflow-hidden rounded-2xl rounded-bl-md border border-primary/20 bg-linear-to-br from-primary/10 via-accent/8 to-muted px-4 py-3 shadow-[0_8px_30px_-18px_rgba(79,70,229,0.7)]">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-primary">
                    <BrainCircuit className="size-4 animate-pulse" />
                  </span>
                  <span className="font-medium">{t("workspace.aiThinking")}</span>
                  <span className="flex gap-1" aria-hidden>
                    <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.25s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.12s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                  </span>
                </div>
                <p className="mt-1 pl-9 text-xs text-muted-foreground">
                  {t("workspace.aiPreparingReply")}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div
          ref={composerRef}
          className="scroll-mb-4 border-t border-border px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
        >
          {error || voiceError ? (
            <p className="mb-2 text-sm text-destructive">{error || voiceError}</p>
          ) : null}
          {showUpgrade ? (
            <Button type="button" size="sm" className="mb-3" onClick={openUpgradeModal}>
              {t("workspace.seePlans")}
            </Button>
          ) : null}

          {voiceRecording ? (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-foreground">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
              </span>
              {t("workspace.recordEnglishInstruction")}
              {!voiceSpeechSupported ? (
                <span className="text-muted-foreground"> ({t("workspace.noSttBrowser")})</span>
              ) : null}
            </div>
          ) : null}

          <form
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[1.25rem] border border-border bg-muted/40 p-2 shadow-sm sm:flex sm:items-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
            onSubmit={onSubmit}
          >
            <Button
              type="button"
              variant={voiceRecording ? "destructive" : "outline"}
              size="lg"
              disabled={micDisabled}
              className={cn(
                "order-2 h-11 w-11 shrink-0 rounded-full p-0 sm:order-0",
                voiceRecording && "animate-pulse",
              )}
              aria-label={voiceRecording ? t("workspace.stopRecording") : t("workspace.record")}
              title={
                !voiceSupported
                  ? t("tutorChat.noRecording")
                  : voiceRecording
                    ? t("workspace.stopRecording")
                    : t("tutorChat.recordSpoken")
              }
              onClick={onToggleMic}
            >
              {voiceRecording ? (
                <Square className="size-4 fill-current" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={onDraftKeyDown}
              placeholder={
                voiceRecording ? t("workspace.listeningStop") : t("workspace.writeMessage")
              }
              disabled={pending || voiceRecording}
              className="order-1 col-span-3 max-h-32 min-h-20 w-full resize-none overflow-y-auto rounded-xl border-0 bg-background px-3.5 py-3 text-base leading-6 shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 disabled:opacity-60 sm:order-0 sm:col-auto sm:max-h-36 sm:min-h-11 sm:flex-1 sm:rounded-2xl sm:border sm:border-border sm:px-4 sm:py-2.5 sm:text-sm sm:shadow-none sm:focus-visible:border-primary sm:focus-visible:ring-primary/40"
            />
            <span className="order-2 min-w-0 truncate text-xs text-muted-foreground sm:hidden">
              {voiceRecording ? t("workspace.tapStop") : t("workspace.voiceInput")}
            </span>
            <Button
              type="submit"
              size="lg"
              disabled={pending || voiceRecording || !draft.trim()}
              className="order-3 h-11 shrink-0 rounded-full px-4 sm:order-0 sm:px-5"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {t("workspace.send")}
            </Button>
          </form>
          <p className="mt-2 hidden flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1">
              <Mic className="size-3" />
              {t("workspace.recordInstruction")}
            </span>
            {!voiceSupported ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                <MicOff className="size-3" />
                {t("workspace.microphoneUnsupported")}
              </span>
            ) : null}
          </p>
        </div>
      </section>
    </div>
  );
});
