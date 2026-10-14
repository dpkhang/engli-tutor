"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { markLessonStarted } from "@/features/learn";
import {
  UPGRADE_MESSAGE_KEY,
  billingMeQueryKey,
  upgradeReasonFromError,
  type UpgradeReason,
} from "@/features/payments";
import { useWorkspaceI18n } from "@/features/i18n";
import { tutorApi, type TutorChatMessage } from "../../api/tutor-api";
import { useVoiceInput } from "../../hooks/use-voice-input";
import { CHAT_STARTER, TutorChatPageView } from "./tutor-chat-page.view";

type ChatMessage = TutorChatMessage & { audioUrl?: string; streaming?: boolean };

export function TutorChatPage() {
  const t = useWorkspaceI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: CHAT_STARTER },
  ]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const queryClient = useQueryClient();
  const [demoMode, setDemoMode] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lessonId = useSearchParams().get("lesson");

  useEffect(() => {
    if (lessonId) markLessonStarted(lessonId);
  }, [lessonId]);

  const onVoiceText = useCallback((text: string) => {
    setDraft(text);
  }, []);
  const voice = useVoiceInput(onVoiceText);
  const discardRecordingRef = useRef(false);
  const cancelRecording = useCallback(() => {
    if (!voice.recording) return;
    discardRecordingRef.current = true;
    voice.stop();
  }, [voice]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "0px";
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 44), 144)}px`;
  }, [draft]);

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
    if (voice.recording && (voice.transcript || voice.interim)) {
      const live = [voice.transcript, voice.interim].filter(Boolean).join(" ").trim();
      if (live) setDraft(live);
    }
  }, [voice.recording, voice.transcript, voice.interim]);

  const resetChat = useCallback(() => {
    cancelRecording();
    setMessages([{ role: "assistant", content: CHAT_STARTER }]);
    setDraft("");
    setError(null);
    setUpgradeReason(null);
    setDemoMode(false);
    voice.clearAudio();
    inputRef.current?.focus();
  }, [cancelRecording, voice]);

  const sendMessage = useCallback(async (rawText: string, audioUrl?: string) => {
    const text = rawText.trim();
    if (!text || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text, audioUrl }];
    setMessages(nextMessages);
    setDraft("");
    setPending(true);
    setError(null);
    setUpgradeReason(null);

    try {
      const payload = nextMessages.map(({ role, content }) => ({ role, content }));
      let streamedReply = "";
      const result = await tutorApi.chatStream({
        messages: payload,
        scenario: "free",
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
        reason
          ? t(UPGRADE_MESSAGE_KEY[reason])
          : err instanceof Error
            ? err.message
            : t("tutorChat.sendError"),
      );
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }, [messages, pending, queryClient, t]);

  const send = useCallback(() => {
    if (voice.recording) return;
    void sendMessage(draft);
  }, [draft, sendMessage, voice.recording]);

  // A finished recording is sent straight away instead of waiting in the composer.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(() => {
    if (voice.recording || !voice.audioUrl) return;
    const audioUrl = voice.audioUrl;
    const text = (voice.transcript || draftRef.current).trim();
    voice.clearAudio({ revoke: false });
    if (discardRecordingRef.current) {
      discardRecordingRef.current = false;
      URL.revokeObjectURL(audioUrl);
      setDraft("");
    } else if (text) {
      void sendMessage(text, audioUrl);
    } else {
      URL.revokeObjectURL(audioUrl);
      setDraft("");
      setError(t("tutorChat.noAudio"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per finished recording
  }, [voice.recording, voice.audioUrl]);

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
    if (!voice.recording) {
      setDraft("");
      setError(null);
    }
    void voice.toggle();
  }, [voice]);

  const micDisabled = pending || !voice.supported;

  return (
    <TutorChatPageView
      messages={messages}
      draft={draft}
      pending={pending}
      error={error}
      showUpgrade={upgradeReason !== null}
      demoMode={demoMode}
      voiceRecording={voice.recording}
      voiceSupported={voice.supported}
      voiceSpeechSupported={voice.speechSupported}
      voiceError={voice.error}
      micDisabled={micDisabled}
      messageListRef={messageListRef}
      composerRef={composerRef}
      inputRef={inputRef}
      onResetCurrent={resetChat}
      onDraftChange={onDraftChange}
      onDraftKeyDown={onDraftKeyDown}
      onSubmit={onSubmit}
      onToggleMic={onToggleMic}
    />
  );
}
