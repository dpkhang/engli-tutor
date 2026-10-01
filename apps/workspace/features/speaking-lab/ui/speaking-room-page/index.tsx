"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  UPGRADE_MESSAGE,
  billingMeQueryKey,
  upgradeReasonFromError,
  type UpgradeReason,
} from "@/features/payments";
import {
  tutorApi,
  type TutorChatMessage,
  type TutorLevel,
  type TutorScenario,
} from "@/features/tutor-chat/api";
import { useVoiceInput } from "@/features/tutor-chat/hooks/use-voice-input";
import { speakingSfx } from "../../lib/speaking-sfx";
import { useAiSpeech } from "../../hooks/use-ai-speech";
import { SCENES, SpeakingRoomPageView } from "./speaking-room-page.view";

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
  const router = useRouter();
  const [scene, setScene] = useState<TutorScenario>("interview");
  const [level, setLevel] = useState<TutorLevel>("B1");
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", content: SCENES[0].opener }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const queryClient = useQueryClient();
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
  const aliveRef = useRef(true);

  turnsRef.current = turns;
  pendingRef.current = pending;
  autoSpeakRef.current = autoSpeak;
  sfxOnRef.current = sfxOn;

  const onVoiceText = useCallback((text: string) => setDraft(text), []);
  const voice = useVoiceInput(onVoiceText);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      aiSpeech.stop();
      if (voice.recording) voice.stop();
      voice.clearAudio({ revoke: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stop speech/mic only on leave
  }, []);

  useLayoutEffect(() => {
    const input = draftInputRef.current;
    if (!input) return;
    input.style.height = "44px";
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 44), 112)}px`;
  }, [draft]);

  const sceneMeta = useMemo(
    () => SCENES.find((item) => item.id === scene) ?? SCENES[0],
    [scene],
  );
  const lastAssistant = useMemo(
    () => [...turns].reverse().find((t) => t.role === "assistant"),
    [turns],
  );
  const { english: promptEn, tip: promptTip } = useMemo(
    () => splitCoach(lastAssistant?.content ?? sceneMeta.opener),
    [lastAssistant, sceneMeta.opener],
  );
  const userTurns = useMemo(() => turns.filter((t) => t.role === "user").length, [turns]);
  const orbMode = voice.recording ? "recording" : pending ? "thinking" : aiSpeaking ? "ai" : "idle";

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
      if (!aliveRef.current || !autoSpeakRef.current) return;
      const { english } = splitCoach(content);
      if (!english) return;
      setAiSpeaking(true);
      void aiSpeech
        .speak(english, () => {
          if (!aliveRef.current) return;
          setAiSpeaking(false);
        })
        .then((result) => {
          if (!aliveRef.current) return;
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
      if (!trimmed || pendingRef.current || !aliveRef.current) return;

      pendingRef.current = true;
      setPending(true);
      setError(null);
      setUpgradeReason(null);
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
        if (!aliveRef.current) return;

        setDemoMode(result.demo);
        const withReply: Turn[] = [...nextTurns, { role: "assistant", content: result.reply }];
        setTurns(withReply);
        turnsRef.current = withReply;
        playSfx(() => speakingSfx.aiReady());
        speakLastAssistant(result.reply);
        void queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
      } catch (err) {
        if (!aliveRef.current) return;
        playSfx(() => speakingSfx.error());
        const reason = upgradeReasonFromError(err);
        setUpgradeReason(reason);
        setError(
          reason ? UPGRADE_MESSAGE[reason] : err instanceof Error ? err.message : "Couldn't send your turn",
        );
        setTurns(turnsRef.current.slice(0, -1));
        turnsRef.current = turnsRef.current.slice(0, -1);
        setDraft(trimmed);
      } finally {
        if (!aliveRef.current) {
          pendingRef.current = false;
          return;
        }
        pendingRef.current = false;
        setPending(false);
        voice.clearAudio({ revoke: false });
      }
    },
    [aiSpeech, level, playSfx, queryClient, scene, speakLastAssistant, voice],
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

  const resetRoom = useCallback(
    (nextScene: TutorScenario = scene, nextLevel: TutorLevel = level) => {
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
      setUpgradeReason(null);
      setDemoMode(false);
      pendingRef.current = false;
      setPending(false);
      speakLastAssistant(opener);
    },
    [aiSpeech, level, scene, speakLastAssistant, voice],
  );

  const onMicClick = useCallback(async () => {
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
  }, [aiSpeech, pending, playSfx, voice]);

  const replayPrompt = useCallback(() => {
    if (!promptEn || !aliveRef.current) return;
    setAiSpeaking(true);
    void aiSpeech
      .speak(promptEn, () => {
        if (!aliveRef.current) return;
        setAiSpeaking(false);
      })
      .then((result) => {
        if (!aliveRef.current) return;
        setVoiceSource(result.source);
      });
  }, [aiSpeech, promptEn]);

  const onToggleSfx = useCallback(() => setSfxOn((v) => !v), []);
  const onToggleAutoSpeak = useCallback(() => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (!next) {
      aiSpeech.stop();
      setAiSpeaking(false);
    }
  }, [aiSpeech, autoSpeak]);
  const onReset = useCallback(() => resetRoom(), [resetRoom]);
  const onTogglePanel = useCallback(() => setPanelOpen((v) => !v), []);
  const onSelectScene = useCallback(
    (id: TutorScenario) => {
      resetRoom(id, level);
      setPanelOpen(false);
    },
    [level, resetRoom],
  );
  const onSelectLevel = useCallback(
    (item: TutorLevel) => {
      resetRoom(scene, item);
    },
    [resetRoom, scene],
  );
  const onDraftChange = useCallback((value: string) => setDraft(value), []);
  const onDraftKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      e.preventDefault();
      if (pending || voice.recording || !draft.trim()) return;
      void sendUtterance(draft);
    },
    [draft, pending, sendUtterance, voice.recording],
  );
  const onSend = useCallback(() => {
    void sendUtterance(draft);
  }, [draft, sendUtterance]);
  const onMic = useCallback(() => {
    void onMicClick();
  }, [onMicClick]);
  const onExit = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/");
  }, [router]);

  return (
    <SpeakingRoomPageView
      scene={scene}
      level={level}
      draft={draft}
      pending={pending}
      error={error}
      showUpgrade={upgradeReason !== null}
      demoMode={demoMode}
      autoSpeak={autoSpeak}
      aiSpeaking={aiSpeaking}
      voiceSource={voiceSource}
      panelOpen={panelOpen}
      sfxOn={sfxOn}
      sceneLabel={sceneMeta.label}
      promptEn={promptEn}
      promptTip={promptTip}
      userTurns={userTurns}
      orbMode={orbMode}
      voiceRecording={voice.recording}
      voiceSupported={voice.supported}
      voiceStream={voice.stream}
      voiceError={voice.error}
      bottomRef={bottomRef}
      draftInputRef={draftInputRef}
      onExit={onExit}
      onToggleSfx={onToggleSfx}
      onToggleAutoSpeak={onToggleAutoSpeak}
      onReset={onReset}
      onTogglePanel={onTogglePanel}
      onSelectScene={onSelectScene}
      onSelectLevel={onSelectLevel}
      onMicClick={onMic}
      onReplayPrompt={replayPrompt}
      onDraftChange={onDraftChange}
      onDraftKeyDown={onDraftKeyDown}
      onSend={onSend}
    />
  );
}
