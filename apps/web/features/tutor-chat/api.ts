import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TutorScenario = "interview" | "standup" | "smalltalk" | "email" | "free";
export type TutorMode = "chat" | "speaking";
export type TutorLevel = "A2" | "B1" | "TOEIC" | "IELTS";

export type TutorChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TutorChatResponse = {
  reply: string;
  demo: boolean;
};

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export const tutorApi = {
  chat: (input: {
    messages: TutorChatMessage[];
    scenario: TutorScenario;
    mode?: TutorMode;
    level?: TutorLevel;
  }) => workspaceApiClient.post<TutorChatResponse>("/api/tutor/chat", input),

  /** Returns MPEG audio when TTS is configured; throws on non-OK responses. */
  speak: async (input: {
    text: string;
    voice?: string;
    signal?: AbortSignal;
  }): Promise<Blob> => {
    const response = await fetch(`${getApiBase()}/api/tutor/speak`, {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: {
        Accept: "audio/mpeg, application/json",
        "Content-Type": "application/json",
        "X-Client": "pagecraft-workspace",
      },
      body: JSON.stringify({ text: input.text, voice: input.voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed (${response.status})`);
    }

    return response.blob();
  },
};
