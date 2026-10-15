import { workspaceApiClient } from "@/lib/workspace-api-client";
import type { SkillLevel } from "@/features/learn";
import { notifyAccountChanged } from "../model/account-sync";

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  city: string | null;
  nativeLanguage: string | null;
  uiLocale: "en" | "vi" | null;
  tutorExplanationLocale: "en" | "vi" | null;
  targetLevel: SkillLevel | null;
  learningGoal: string | null;
  welcomeSeenAt: string | null;
  appearanceTheme: string | null;
  appearanceAccent: string | null;
  appearanceTextSize: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateAccountInput = {
  name?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  city?: string;
  nativeLanguage?: string;
  uiLocale?: "en" | "vi";
  tutorExplanationLocale?: "en" | "vi";
  targetLevel?: SkillLevel | "";
  learningGoal?: string;
  welcomeSeen?: boolean;
  appearanceTheme?: string;
  appearanceAccent?: string;
  appearanceTextSize?: string;
};

export const accountApi = {
  get: () => workspaceApiClient.get<AccountProfile>("/api/account"),
  update: async (input: UpdateAccountInput) => {
    const profile = await workspaceApiClient.patch<AccountProfile>("/api/account", input);
    notifyAccountChanged(profile);
    return profile;
  },
};
