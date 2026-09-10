"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  LoaderCircle,
  Mic,
  MicOff,
  RefreshCw,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import {
  tutorApi,
  type TutorChatMessage,
  type TutorLevel,
  type TutorScenario,
} from "@/features/tutor-chat/api";
import { useVoiceInput } from "@/features/tutor-chat/hooks/use-voice-input";
import { speakingSfx } from "../lib/speaking-sfx";
import { useAiSpeech } from "../hooks/use-ai-speech";
import { VoiceOrb } from "./voice-orb";

const SCENES: {
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
    opener:
      "Good morning! It's your turn in stand-up. Tell me what you finished yesterday in two short sentences.",
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

const LEVELS: TutorLevel[] = ["A2", "B1", "TOEIC", "IELTS"];

type Turn = TutorChatMessage & { audioUrl?: string };

function splitCoach(content: string): { english: string; tip: string | null } {
  const marker = content.indexOf("💬");
  if (marker === -1) return { english: content.trim(), tip: null };
  return {
    english: content.slice(0, marker).trim(),
    tip: content.slice(marker).trim(),
  };
}

export function SpeakingRoomPage() {
  const [scene, setScene] = useState<TutorScenario>("interview");
  const [level, setLevel] = useState<TutorLevel>("B1");
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", content: SCENES[0].opener }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [voiceSource, setVoiceSource] = useState<"ai" | "browser" | null>(null);
  const [draft, setDraft] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [sfxOn, setSfxOn] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const draftInputRef = useRef<HTMLTextAreaElement>(null);
  const turnsRef = useRef(turns);
  const pendingRef = useRef(false);
  const wasRecordingRef = useRef(false);
  const autoSpeakRef = useRef(autoSpeak);
  const sfxOnRef = useRef(sfxOn);
  const aiSpeech = useAiSpeech();

  turnsRef.current = turns;
  pendingRef.current = pending;
  autoSpeakRef.current = autoSpeak;
  sfxOnRef.current = sfxOn;

  const voice = useVoiceInput((text) => setDraft(text));

  useLayoutEffect(() => {
    const input = draftInputRef.current;
    if (!input) return;
    input.style.height = "44px";
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 44), 112)}px`;
  }, [draft]);

  const sceneMeta = SCENES.find((item) => item.id === scene) ?? SCENES[0];
  const lastAssistant = [...turns].reverse().find((t) => t.role === "assistant");
  const { english: promptEn, tip: promptTip } = splitCoach(
    lastAssistant?.content ?? sceneMeta.opener,
  );
  const userTurns = turns.filter((t) => t.role === "user").length;

  const playSfx = useCallback((fn: () => Promise<void>) => {
    if (!sfxOnRef.current) return;
    void fn();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, pending]);

  useEffect(() => {
    if (voice.recording) {
      wasRecordingRef.current = true;
      const live = [voice.transcript, voice.interim].filter(Boolean).join(" ").trim();
      if (live) setDraft(live);
    }
  }, [voice.recording, voice.transcript, voice.interim]);

  const speakLastAssistant = useCallback(
    (content: string) => {
      if (!autoSpeakRef.current) return;
      const { english } = splitCoach(content);
      if (!english) return;
      setAiSpeaking(true);
      void aiSpeech
        .speak(english, () => {
          setAiSpeaking(false);
        })
        .then((result) => {
          setVoiceSource(result.source);
        });
    },
    [aiSpeech],
  );

  useEffect(() => {
    speakLastAssistant(SCENES[0].opener);
    return () => aiSpeech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak opener once on mount
  }, []);

  const sendUtterance = useCallback(
    async (text: string, audioUrl?: string) => {
      const trimmed = text.trim();
      if (!trimmed || pendingRef.current) return;

      pendingRef.current = true;
      setPending(true);
      setError(null);
      aiSpeech.stop();
      setAiSpeaking(false);
      playSfx(() => speakingSfx.send());

      const nextTurns: Turn[] = [...turnsRef.current, { role: "user", content: trimmed, audioUrl }];
      setTurns(nextTurns);
      turnsRef.current = nextTurns;
      setDraft("");

      try {
        const payload = nextTurns.map(({ role, content }) => ({ role, content }));
        const result = await tutorApi.chat({
          messages: payload,
          scenario: scene,
          mode: "speaking",
          level,
        });
        setDemoMode(result.demo);
        const withReply: Turn[] = [...nextTurns, { role: "assistant", content: result.reply }];
        setTurns(withReply);
        turnsRef.current = withReply;
        playSfx(() => speakingSfx.aiReady());
        speakLastAssistant(result.reply);
      } catch (err) {
        playSfx(() => speakingSfx.error());
        setError(err instanceof Error ? err.message : "Couldn't send your turn");
        setTurns(turnsRef.current.slice(0, -1));
        turnsRef.current = turnsRef.current.slice(0, -1);
        setDraft(trimmed);
      } finally {
        pendingRef.current = false;
        setPending(false);
        voice.clearAudio({ revoke: false });
      }
    },
    [aiSpeech, level, playSfx, scene, speakLastAssistant, voice],
  );

  useEffect(() => {
    if (voice.recording || !wasRecordingRef.current) return;
    wasRecordingRef.current = false;
    playSfx(() => speakingSfx.recStop());

    const text = (voice.transcript || draft).trim();
    if (!text) {
      playSfx(() => speakingSfx.error());
      setError("No speech detected. Try speaking more clearly or open the typing panel.");
      return;
    }
    void sendUtterance(text, voice.audioUrl ?? undefined);
  }, [voice.recording, voice.transcript, voice.audioUrl, draft, sendUtterance, playSfx]);

  const resetRoom = (nextScene: TutorScenario = scene, nextLevel: TutorLevel = level) => {
    aiSpeech.stop();
    setAiSpeaking(false);
    if (voice.recording) voice.stop();
    voice.clearAudio({ revoke: true });
    wasRecordingRef.current = false;
    const opener = SCENES.find((s) => s.id === nextScene)?.opener ?? SCENES[0].opener;
    setScene(nextScene);
    setLevel(nextLevel);
    const initial: Turn[] = [{ role: "assistant", content: opener }];
    setTurns(initial);
    turnsRef.current = initial;
    setDraft("");
    setError(null);
    setDemoMode(false);
    pendingRef.current = false;
    setPending(false);
    speakLastAssistant(opener);
  };

  const onMicClick = async () => {
    setError(null);
    if (pending) return;
    if (voice.recording) {
      voice.stop();
      return;
    }
    aiSpeech.stop();
    setAiSpeaking(false);
    setDraft("");
    playSfx(() => speakingSfx.recStart());
    await voice.start();
  };

  const replayPrompt = () => {
    if (!promptEn) return;
    setAiSpeaking(true);
    void aiSpeech
      .speak(promptEn, () => setAiSpeaking(false))
      .then((result) => {
        setVoiceSource(result.source);
      });
  };

  const orbMode = voice.recording ? "recording" : pending ? "thinking" : aiSpeaking ? "ai" : "idle";

  return (
    <div className="speaking-room fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-[#0b1220] text-[#eef2f8]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(107,140,255,0.22),transparent_52%),radial-gradient(ellipse_at_80%_90%,rgba(255,90,95,0.08),transparent_40%),linear-gradient(180deg,#10182a_0%,#0b1220_48%,#080d18_100%)]" />
        <div className="speaking-aurora absolute top-[-10%] left-[22%] h-96 w-96 rounded-full bg-[#6b8cff]/16 blur-[120px]" />
        <div className="speaking-aurora-rev absolute right-[-10%] bottom-[-12%] h-80 w-80 rounded-full bg-[#7aa2ff]/10 blur-[110px]" />
      </div>

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/skills/speaking"
            className="inline-flex size-9 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Exit"
          >
            <X className="size-4" strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#9db0ff]/85">Speaking</p>
            <p className="truncate text-[15px] font-medium tracking-tight text-white/92">
              {sceneMeta.label}
              <span className="ml-2 font-normal text-white/35">{level}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setSfxOn((v) => !v)}
            className="hidden h-9 items-center rounded-full px-3 text-[11px] text-white/40 transition hover:bg-white/[0.05] hover:text-white/75 sm:inline-flex"
          >
            {sfxOn ? "SFX" : "SFX off"}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next) {
                aiSpeech.stop();
                setAiSpeaking(false);
              }
            }}
            className="inline-flex size-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.05] hover:text-white/85"
            aria-label="AI voice"
            title={autoSpeak ? "Mute AI voice" : "Enable AI voice"}
          >
            {autoSpeak ? (
              <Volume2 className="size-4" strokeWidth={1.5} />
            ) : (
              <VolumeX className="size-4" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={() => resetRoom()}
            className="inline-flex size-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.05] hover:text-white/85"
            aria-label="New conversation"
          >
            <RefreshCw className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[12px] text-white/50 transition hover:bg-white/[0.05] hover:text-white/90"
          >
            Scene
            <ChevronDown
              className={cn("size-3.5 transition duration-300", panelOpen && "rotate-180")}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </header>

      {panelOpen ? (
        <div className="absolute top-[4.25rem] right-5 left-5 z-30 space-y-4 rounded-[1.25rem] border border-white/[0.06] bg-[#121b2d]/95 p-4 shadow-2xl backdrop-blur-xl sm:right-8 sm:left-auto sm:w-[28rem]">
          <div className="flex flex-wrap gap-2">
            {SCENES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  resetRoom(item.id, level);
                  setPanelOpen(false);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] transition",
                  scene === item.id
                    ? "bg-white/12 text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/75",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => resetRoom(scene, item)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  level === item
                    ? "bg-[#6b8cff]/25 text-[#c5d2ff]"
                    : "text-white/35 hover:text-white/70",
                )}
              >
                {item}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-white/30">
              {userTurns} turn{userTurns === 1 ? "" : "s"}
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
                voice.recording
                  ? "text-[#ff8a8e]"
                  : pending
                    ? "text-white/35"
                    : aiSpeaking
                      ? "text-[#9db0ff]"
                      : "text-white/50",
              )}
            >
              {voice.recording
                ? "Recording…"
                : pending
                  ? "Thinking…"
                  : aiSpeaking
                    ? voiceSource === "browser"
                      ? "AI speaking (browser)"
                      : "AI speaking"
                    : "Tap the mic to speak"}
            </p>

            <button
              type="button"
              disabled={pending || !voice.supported}
              onClick={() => void onMicClick()}
              className="group relative shrink-0 disabled:opacity-45"
              aria-label={voice.recording ? "Stop recording" : "Start recording"}
            >
              <VoiceOrb stream={voice.stream} active={voice.recording} mode={orbMode}>
                {pending ? (
                  <LoaderCircle className="size-7 animate-spin" strokeWidth={1.75} />
                ) : voice.recording ? (
                  <Square className="size-7 fill-current" strokeWidth={0} />
                ) : !voice.supported ? (
                  <MicOff className="size-7" strokeWidth={1.75} />
                ) : (
                  <Mic className="size-7" strokeWidth={1.75} />
                )}
              </VoiceOrb>
            </button>

            <button
              type="button"
              onClick={replayPrompt}
              disabled={!promptEn || pending || voice.recording}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] text-white/45 transition hover:bg-white/[0.05] hover:text-white/80 disabled:opacity-30"
            >
              <Volume2 className="size-3.5" strokeWidth={1.5} />
              Replay AI line
            </button>

            <div className="flex h-[7.25rem] w-full shrink-0 flex-col justify-start overflow-hidden text-center sm:h-[8rem]">
              <div className="flex h-8 shrink-0 items-center justify-center">
                {(error || voice.error) && (
                  <p className="line-clamp-2 text-xs text-[#ff8a8e]">{error || voice.error}</p>
                )}
              </div>

              <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden">
                {voice.recording || (draft && !pending) ? (
                  <p className="line-clamp-3 text-[16px] leading-[1.5] text-white/90 sm:text-[17px]">
                    <span className="text-[#ff8a8e]">You — </span>
                    {draft || "…"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="line-clamp-4 text-[16px] leading-[1.5] text-white/82 sm:text-[17px]">
                      {promptEn}
                    </p>
                    {promptTip ? (
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-white/30 whitespace-pre-wrap">
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

        <footer className="relative z-20 shrink-0 border-t border-white/[0.06] bg-[#080d18]/85 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-8 sm:pt-4">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2.5">
            <p className="flex h-4 items-center justify-center text-center text-[11px] text-white/28">
              {voice.recording
                ? "When you're done, tap again to send"
                : "Speak naturally — 2 to 4 sentences is enough"}
            </p>
            <div className="flex w-full items-end gap-2">
              <textarea
                ref={draftInputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (e.shiftKey) return;
                  e.preventDefault();
                  if (pending || voice.recording || !draft.trim()) return;
                  void sendUtterance(draft);
                }}
                placeholder="Type your answer…"
                disabled={pending || voice.recording}
                className="h-11 max-h-28 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border-0 bg-white/[0.06] px-4 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:bg-white/[0.09] focus-visible:ring-[3px] focus-visible:ring-primary/50 disabled:opacity-50"
              />
              <Button
                type="button"
                className="h-11 shrink-0 rounded-2xl border-0 bg-white px-5 font-medium text-[#0b1220] hover:bg-white/92"
                disabled={pending || voice.recording || !draft.trim()}
                onClick={() => void sendUtterance(draft)}
              >
                Send
              </Button>
              <Link
                href="/"
                className="hidden h-11 shrink-0 items-center gap-1 rounded-2xl px-2 text-[12px] text-white/30 transition hover:text-white/65 sm:inline-flex"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                Home
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
