"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { LESSON_PACKS } from "@/features/learn";
import { tutorApi, type TutorChatMessage, type TutorScenario } from "../api";
import { useVoiceInput } from "../hooks/use-voice-input";

const SCENARIOS: { id: TutorScenario; label: string; hint: string }[] = [
  { id: "interview", label: "Interview", hint: "Behavioral & project questions" },
  { id: "standup", label: "Stand-up", hint: "Short daily update" },
  { id: "smalltalk", label: "Small talk", hint: "Office conversation" },
  { id: "email", label: "Email", hint: "Draft / edit a short email" },
  { id: "free", label: "Free", hint: "You pick the topic" },
];

const STARTERS: Record<TutorScenario, string> = {
  interview:
    "Hi! I'm EngliTutor. Let's practice a job interview. Tell me briefly about yourself and your current role.",
  standup:
    "Good morning! Let's do a quick standup. What did you finish yesterday, and what's on your plate today?",
  smalltalk: "Hey! How's your week going so far? Feel free to answer in a few short sentences.",
  email:
    "Let's practice work writing. Describe the email you need — who it's for and what you want them to do.",
  free: "Hi! I'm ready to practice English with you. What topic would you like to talk about today?",
};

type ChatMessage = TutorChatMessage & { audioUrl?: string };

function isScenario(value: string | null): value is TutorScenario {
  return SCENARIOS.some((item) => item.id === value);
}

function splitCoach(content: string): { english: string; tip: string | null } {
  const marker = content.indexOf("💬");
  if (marker === -1) return { english: content.trim(), tip: null };
  return {
    english: content.slice(0, marker).trim(),
    tip: content.slice(marker).trim(),
  };
}

function starterFor(scenario: TutorScenario, lessonId: string | null): string {
  const lesson = lessonId ? LESSON_PACKS.find((item) => item.id === lessonId) : undefined;
  if (!lesson) return STARTERS[scenario];
  return [
    `Hi! Today we'll practice “${lesson.title}” (${lesson.level}, ~${lesson.duration}).`,
    `Focus: ${lesson.focus}`,
    `Quick tip: ${lesson.tip}`,
    `Mini-game: ${lesson.game}`,
    "",
    STARTERS[scenario],
  ].join("\n");
}

export function TutorChatPage() {
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get("scenario");
  const initialScenario: TutorScenario = isScenario(scenarioParam) ? scenarioParam : "interview";
  const lessonId = searchParams.get("lesson");

  const [scenario, setScenario] = useState<TutorScenario>(initialScenario);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: starterFor(initialScenario, lessonId) },
  ]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lesson = lessonId ? LESSON_PACKS.find((item) => item.id === lessonId) : undefined;

  const voice = useVoiceInput((text) => {
    setDraft(text);
  });

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "0px";
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 44), 144)}px`;
  }, [draft]);

  useEffect(() => {
    const scenarioParam = searchParams.get("scenario");
    const nextScenario: TutorScenario = isScenario(scenarioParam) ? scenarioParam : "interview";
    const nextLesson = searchParams.get("lesson");
    setScenario(nextScenario);
    setMessages([{ role: "assistant", content: starterFor(nextScenario, nextLesson) }]);
    setDraft("");
    setError(null);
    setDemoMode(false);
    setPendingAudioUrl(null);
    if (voice.recording) voice.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on URL change only
  }, [searchParams]);

  useEffect(() => {
    if (messages.length <= 1 && !pending) return;

    const frame = window.requestAnimationFrame(() => {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages, pending]);

  useEffect(() => {
    if (!voice.recording && voice.audioUrl) {
      setPendingAudioUrl(voice.audioUrl);
    }
  }, [voice.recording, voice.audioUrl]);

  useEffect(() => {
    if (voice.recording && (voice.transcript || voice.interim)) {
      const live = [voice.transcript, voice.interim].filter(Boolean).join(" ").trim();
      if (live) setDraft(live);
    }
  }, [voice.recording, voice.transcript, voice.interim]);

  const resetChat = (next: TutorScenario) => {
    if (voice.recording) voice.stop();
    setScenario(next);
    setMessages([{ role: "assistant", content: starterFor(next, null) }]);
    setDraft("");
    setError(null);
    setDemoMode(false);
    setPendingAudioUrl(null);
    voice.clearAudio();
    inputRef.current?.focus();
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || pending || voice.recording) return;

    const audioUrl = pendingAudioUrl ?? undefined;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text, audioUrl }];
    setMessages(nextMessages);
    setDraft("");
    setPendingAudioUrl(null);
    voice.clearAudio({ revoke: false });
    setPending(true);
    setError(null);

    try {
      const payload = nextMessages.map(({ role, content }) => ({ role, content }));
      const result = await tutorApi.chat({ messages: payload, scenario });
      setDemoMode(result.demo);
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send message");
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
      if (audioUrl) setPendingAudioUrl(audioUrl);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  };

  const micDisabled = pending || !voice.supported;

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col gap-5">
      <header className="relative space-y-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary to-primary/80 px-5 py-6 text-primary-foreground sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 size-52 rounded-full border-[26px] border-white/[0.07]"
        />
        <p className="relative inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
          <Sparkles className="size-3.5 text-amber-300" />
          Your judgment-free practice space
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="relative max-w-2xl space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {lesson ? lesson.title : "Chat EngliTutor"}
            </h1>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              {lesson
                ? `${lesson.skills.join(" · ")} · ${lesson.duration} · ${lesson.focus}`
                : "Type or record English — AI replies in English and suggests corrections in Vietnamese."}
            </p>
          </div>
          <Button
            type="button"
            className="relative h-10 rounded-full border-0 bg-white text-primary hover:bg-white/90"
            onClick={() => resetChat(scenario)}
          >
            <RefreshCw className="size-4" />
            New conversation
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => resetChat(item.id)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-left text-sm transition-colors",
                scenario === item.id
                  ? "border-white bg-white text-primary"
                  : "border-white/15 bg-white/[0.06] text-white/65 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={cn(
                  "ml-2 hidden text-xs sm:inline",
                  scenario === item.id ? "text-primary/70" : "text-white/40",
                )}
              >
                {item.hint}
              </span>
            </button>
          ))}
        </div>

        {demoMode ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
            <Sparkles className="size-3.5" />
            Running in demo mode (OpenAI not configured) — chat UI still works.
          </p>
        ) : null}
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_24px_60px_-35px_rgba(79,70,229,0.28)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <MessageCircle className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">EngliTutor AI</p>
            <p className="truncate text-xs text-muted-foreground">
              {SCENARIOS.find((s) => s.id === scenario)?.label} · A2–B1 · voice input supported
            </p>
          </div>
        </div>

        <div
          ref={messageListRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const { english, tip } = isUser
              ? { english: message.content, tip: null }
              : splitCoach(message.content);

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
                        : "rounded-bl-md bg-muted text-foreground",
                    )}
                  >
                    {english}
                  </div>
                  {message.audioUrl ? (
                    <audio
                      controls
                      src={message.audioUrl}
                      className={cn("h-9 max-w-full", isUser ? "accent-white" : undefined)}
                    />
                  ) : null}
                  {tip ? (
                    <div className="rounded-2xl border border-accent/25 bg-accent/8 px-3.5 py-2.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {tip}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {pending ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                EngliTutor is replying…
              </div>
            </div>
          ) : null}
        </div>

        <div ref={composerRef} className="scroll-mb-4 border-t border-border p-3 sm:p-4">
          {error || voice.error ? (
            <p className="mb-2 text-sm text-destructive">{error || voice.error}</p>
          ) : null}

          {voice.recording ? (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-foreground">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
              </span>
              Recording… speak English, then tap stop.
              {!voice.speechSupported ? (
                <span className="text-muted-foreground">
                  {" "}
                  (No STT in this browser — type after listening back)
                </span>
              ) : null}
            </div>
          ) : null}

          {pendingAudioUrl && !voice.recording ? (
            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/50 px-3.5 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Last recording</p>
              <audio controls src={pendingAudioUrl} className="h-8 max-w-full flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={() => {
                  if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
                  setPendingAudioUrl(null);
                  voice.clearAudio({ revoke: true });
                }}
              >
                Delete audio
              </Button>
            </div>
          ) : null}

          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <Button
              type="button"
              variant={voice.recording ? "destructive" : "outline"}
              size="lg"
              disabled={micDisabled}
              className={cn(
                "h-11 w-11 shrink-0 rounded-full p-0",
                voice.recording && "animate-pulse",
              )}
              aria-label={voice.recording ? "Stop recording" : "Record"}
              title={
                !voice.supported
                  ? "Browser does not support recording"
                  : voice.recording
                    ? "Stop recording"
                    : "Record spoken English"
              }
              onClick={() => void voice.toggle()}
            >
              {voice.recording ? (
                <Square className="size-4 fill-current" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder={
                voice.recording
                  ? "Listening… (tap ■ to stop)"
                  : "Type or tap mic to record English… (Enter to send)"
              }
              disabled={pending || voice.recording}
              className="max-h-36 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-border bg-background px-4 py-2.5 text-sm leading-6 outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-60"
            />
            <Button
              type="submit"
              size="lg"
              disabled={pending || voice.recording || !draft.trim()}
              className="h-11 shrink-0 rounded-full px-5"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send
            </Button>
          </form>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Mic className="size-3" />
              Record → recognize (Chrome/Edge works best) → quick edit → Send
            </span>
            {!voice.supported ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                <MicOff className="size-3" />
                This device does not support a microphone
              </span>
            ) : null}
          </p>
        </div>
      </section>
    </div>
  );
}
