import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TutorScenario = "interview" | "standup" | "smalltalk" | "email" | "free";
export type TutorMode = "chat" | "speaking";
export type TutorLevel = "A2" | "A2+" | "B1";

export type TutorChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TutorChatResponse = {
  reply: string;
  demo: boolean;
};

export const tutorApi = {
  chat: (input: {
    messages: TutorChatMessage[];
    scenario: TutorScenario;
    mode?: TutorMode;
    level?: TutorLevel;
  }) => workspaceApiClient.post<TutorChatResponse>("/api/tutor/chat", input),
};
