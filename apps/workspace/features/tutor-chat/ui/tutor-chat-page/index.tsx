"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LESSON_PACKS, markLessonStarted } from "@/features/learn";
import {
  UPGRADE_MESSAGE,
  billingMeQueryKey,
  planAllows,
  upgradeReasonFromError,
  useBillingMe,
  type UpgradeReason,
} from "@/features/payments";
import { tutorApi, type TutorChatMessage, type TutorScenario } from "../../api";
import { useVoiceInput } from "../../hooks/use-voice-input";
import { SCENARIOS, STARTERS, TutorChatPageView } from "./tutor-chat-page.view";

type ChatMessage = TutorChatMessage & { audioUrl?: string; streaming?: boolean };

const PRO_SCENARIOS: TutorScenario[] = ["interview", "standup"];

function isScenario(value: string | null): value is TutorScenario {
  return SCENARIOS.some((item) => item.id === value);
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
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const queryClient = useQueryClient();
  const billing = useBillingMe();
  const lockedScenarios = useMemo(
    () => (planAllows(billing.data, "proScenarios") ? [] : PRO_SCENARIOS),
    [billing.data],
  );
  const scenarioLocked = lockedScenarios.includes(scenario);
  const [demoMode, setDemoMode] = useState(false);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lesson = useMemo(
    () => (lessonId ? LESSON_PACKS.find((item) => item.id === lessonId) : undefined),
    [lessonId],
  );

  const onVoiceText = useCallback((text: string) => {
    setDraft(text);
  }, []);
  const voice = useVoiceInput(onVoiceText);

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
    setUpgradeReason(null);
    setDemoMode(false);
    setPendingAudioUrl(null);
    if (nextLesson) markLessonStarted(nextLesson);
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

  const resetChat = useCallback(
    (next: TutorScenario) => {
      if (voice.recording) voice.stop();
      setScenario(next);
      setMessages([{ role: "assistant", content: starterFor(next, null) }]);
      setDraft("");
      setError(null);
      setUpgradeReason(null);
      setDemoMode(false);
      setPendingAudioUrl(null);
      voice.clearAudio();
      inputRef.current?.focus();
    },
    [voice],
  );

  // Free users without a ?scenario link start on Small talk instead of a Premium scenario.
  const defaultChecked = useRef(false);
  useEffect(() => {
    if (defaultChecked.current || !billing.data) return;
    defaultChecked.current = true;
    if (!scenarioLocked || searchParams.get("scenario") || messages.length > 1) return;
    resetChat("smalltalk");
  }, [billing.data, messages.length, resetChat, scenarioLocked, searchParams]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending || voice.recording || scenarioLocked) return;

    const audioUrl = pendingAudioUrl ?? undefined;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text, audioUrl }];
    setMessages(nextMessages);
    setDraft("");
    setPendingAudioUrl(null);
    voice.clearAudio({ revoke: false });
    setPending(true);
    setError(null);
    setUpgradeReason(null);

    try {
      const payload = nextMessages.map(({ role, content }) => ({ role, content }));
      let streamedReply = "";
      const result = await tutorApi.chatStream({
        messages: payload,
        scenario,
        onChunk: (chunk) => {
          streamedReply += chunk;
          setMessages((prev) => {
            const withoutStreaming = prev.filter((message) => !message.streaming);
            return [...withoutStreaming, { role: "assistant", content: streamedReply, streaming: true }];
          });
        },
      });
      setDemoMode(result.demo);
      setMessages((prev) => [
        ...prev.filter((message) => !message.streaming),
        { role: "assistant", content: result.reply },
      ]);
      void queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
    } catch (err) {
      const reason = upgradeReasonFromError(err);
      setUpgradeReason(reason);
      setError(
        reason ? UPGRADE_MESSAGE[reason] : err instanceof Error ? err.message : "Couldn't send message",
      );
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
      if (audioUrl) setPendingAudioUrl(audioUrl);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }, [draft, messages, pending, pendingAudioUrl, queryClient, scenario, scenarioLocked, voice]);

  const onResetCurrent = useCallback(() => resetChat(scenario), [resetChat, scenario]);
  const onDraftChange = useCallback((value: string) => setDraft(value), []);
  const onDraftKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void send();
      }
    },
    [send],
  );
  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      void send();
    },
    [send],
  );
  const onToggleMic = useCallback(() => {
    void voice.toggle();
  }, [voice]);
  const onDeleteAudio = useCallback(() => {
    if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    setPendingAudioUrl(null);
    voice.clearAudio({ revoke: true });
  }, [pendingAudioUrl, voice]);

  const micDisabled = pending || !voice.supported;
  const scenarioLabel = SCENARIOS.find((s) => s.id === scenario)?.label;

  return (
    <TutorChatPageView
      lesson={lesson}
      scenario={scenario}
      messages={messages}
      draft={draft}
      pending={pending}
      error={error ?? (scenarioLocked ? UPGRADE_MESSAGE.pro : null)}
      showUpgrade={upgradeReason !== null || scenarioLocked}
      lockedScenarios={lockedScenarios}
      demoMode={demoMode}
      pendingAudioUrl={pendingAudioUrl}
      voiceRecording={voice.recording}
      voiceSupported={voice.supported}
      voiceSpeechSupported={voice.speechSupported}
      voiceError={voice.error}
      micDisabled={micDisabled}
      scenarioLabel={scenarioLabel}
      messageListRef={messageListRef}
      composerRef={composerRef}
      inputRef={inputRef}
      onResetCurrent={onResetCurrent}
      onSelectScenario={resetChat}
      onDraftChange={onDraftChange}
      onDraftKeyDown={onDraftKeyDown}
      onSubmit={onSubmit}
      onToggleMic={onToggleMic}
      onDeleteAudio={onDeleteAudio}
    />
  );
}
