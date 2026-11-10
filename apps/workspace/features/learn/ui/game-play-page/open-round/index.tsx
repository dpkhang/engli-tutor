"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVoiceInput } from "@/features/tutor-chat";
import { OpenRoundView } from "./open-round.view";

export function OpenRound({
  value,
  locked,
  placeholder,
  allowMic,
  onChange,
  onRecordingChange,
}: {
  value: string;
  locked: boolean;
  placeholder: string;
  allowMic: boolean;
  onChange: (value: string) => void;
  onRecordingChange?: (recording: boolean) => void;
}) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  // Text typed before the mic started; the transcript is appended to it instead of replacing it.
  const prefixRef = useRef("");
  const voice = useVoiceInput((text) => {
    if (lockedRef.current) return;
    onChange(`${prefixRef.current} ${text}`.trim());
  });
  const { recording, stop: stopVoice, toggle } = voice;

  useEffect(() => {
    onRecordingChange?.(recording);
  }, [onRecordingChange, recording]);

  useEffect(() => {
    if (locked && recording) stopVoice();
  }, [locked, recording, stopVoice]);

  const onTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
    [onChange],
  );
  const onToggleMic = useCallback(() => {
    if (!recording) prefixRef.current = valueRef.current.trim();
    void toggle();
  }, [recording, toggle]);

  return (
    <OpenRoundView
      value={value}
      locked={locked}
      placeholder={placeholder}
      allowMic={allowMic}
      supported={voice.supported}
      recording={recording}
      interim={voice.interim}
      error={voice.error}
      onTextChange={onTextChange}
      onToggleMic={onToggleMic}
    />
  );
}
