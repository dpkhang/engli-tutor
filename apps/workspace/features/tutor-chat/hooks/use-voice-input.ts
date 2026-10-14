"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspaceI18n } from "@/features/i18n";

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceInputState = {
  supported: boolean;
  recording: boolean;
  transcript: string;
  interim: string;
  audioUrl: string | null;
  error: string | null;
  speechSupported: boolean;
};

export type VoiceInputOptions = {
  /** Auto-stop once the learner has spoken and then stayed quiet this long (ms). */
  silenceMs?: number;
};

const SILENCE_POLL_MS = 100;
const NOISE_CALIBRATION_MS = 400;
const MIN_SPEECH_MS = 300;
const MIN_SPEECH_LEVEL = 0.015;

type SilenceWatch = { context: AudioContext; timer: number };

function watchSilence(stream: MediaStream, silenceMs: number, onSilence: () => void, lastVoiceRef: { current: number }) {
  const AudioCtx =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const context = new AudioCtx();
  // Safari may create the context suspended once the getUserMedia await has consumed the user gesture.
  if (context.state === "suspended") void context.resume().catch(() => {});
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);

  const startedAt = performance.now();
  let noiseFloor = 0;
  let calibrationFrames = 0;
  let speechMs = 0;
  lastVoiceRef.current = 0;

  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const level = Math.sqrt(sum / samples.length);
    const now = performance.now();

    if (now - startedAt < NOISE_CALIBRATION_MS) {
      noiseFloor = (noiseFloor * calibrationFrames + level) / (calibrationFrames + 1);
      calibrationFrames += 1;
      return;
    }

    if (level > Math.max(MIN_SPEECH_LEVEL, noiseFloor * 2.5)) {
      speechMs += SILENCE_POLL_MS;
      lastVoiceRef.current = now;
    }

    if (speechMs >= MIN_SPEECH_MS && lastVoiceRef.current && now - lastVoiceRef.current >= silenceMs) {
      onSilence();
    }
  }, SILENCE_POLL_MS);

  return { context, timer } satisfies SilenceWatch;
}

export function useVoiceInput(onTranscript?: (text: string) => void, options?: VoiceInputOptions) {
  const t = useWorkspaceI18n();
  const silenceMs = options?.silenceMs;
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const baseTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const silenceWatchRef = useRef<SilenceWatch | null>(null);
  const lastVoiceRef = useRef(0);

  const stopSilenceWatch = useCallback(() => {
    const watch = silenceWatchRef.current;
    if (!watch) return;
    silenceWatchRef.current = null;
    window.clearInterval(watch.timer);
    void watch.context.close().catch(() => {});
  }, []);

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionCtor()));
    setMediaSupported(
      typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  useEffect(() => {
    return () => {
      stopSilenceWatch();
      recognitionRef.current?.abort();
      mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  const stop = useCallback(() => {
    stopSilenceWatch();
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setRecording(false);
    }
  }, [stopSilenceWatch]);

  const start = useCallback(async () => {
    setError(null);
    setInterim("");
    baseTranscriptRef.current = "";
    setTranscript("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("tutorChat.recordingUnsupported"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : undefined;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopSilenceWatch();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
        mediaRecorderRef.current = null;
        setRecording(false);

        const finalText = (baseTranscriptRef.current || "").trim();
        if (finalText) onTranscriptRef.current?.(finalText);
      };

      recorder.start();
      setRecording(true);

      if (silenceMs) {
        stopSilenceWatch();
        silenceWatchRef.current = watchSilence(stream, silenceMs, () => stop(), lastVoiceRef);
      }

      const Recognition = getSpeechRecognitionCtor();
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let finalChunk = "";
          let interimChunk = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) finalChunk += result[0].transcript;
            else interimChunk += result[0].transcript;
          }
          if (lastVoiceRef.current && (finalChunk || interimChunk)) lastVoiceRef.current = performance.now();
          if (finalChunk) {
            baseTranscriptRef.current = `${baseTranscriptRef.current} ${finalChunk}`.trim();
            setTranscript(baseTranscriptRef.current);
            onTranscriptRef.current?.(baseTranscriptRef.current);
          }
          setInterim(interimChunk);
        };
        recognition.onerror = (event) => {
          if (event.error === "aborted" || event.error === "no-speech") return;
          if (event.error === "not-allowed") {
            setError(t("tutorChat.micDenied"));
          }
        };
        recognition.onend = () => {
          // Keep recording audio if user is still holding; restart recognition while recording
          if (mediaRecorderRef.current?.state === "recording") {
            try {
              recognition.start();
            } catch {
              /* already started */
            }
          }
        };
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch {
      setError(t("tutorChat.micOpenFailed"));
      stopSilenceWatch();
      setRecording(false);
    }
  }, [audioUrl, silenceMs, stop, stopSilenceWatch, t]);

  const toggle = useCallback(async () => {
    if (recording) stop();
    else await start();
  }, [recording, start, stop]);

  const clearAudio = useCallback(
    (options?: { revoke?: boolean }) => {
      const shouldRevoke = options?.revoke !== false;
      if (shouldRevoke && audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
    },
    [audioUrl],
  );

  return {
    supported: mediaSupported,
    speechSupported,
    recording,
    transcript,
    interim,
    audioUrl,
    audioBlob,
    stream,
    error,
    start,
    stop,
    toggle,
    clearAudio,
  };
}
