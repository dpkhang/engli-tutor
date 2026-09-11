import { workspaceApiClient } from "@/lib/workspace-api-client";
import type { SkillLevel } from "@/features/learn/model/skill-exercises";

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
  targetLevel: SkillLevel | null;
  learningGoal: string | null;
  welcomeSeenAt: string | null;
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
  targetLevel?: SkillLevel | "";
  learningGoal?: string;
  welcomeSeen?: boolean;
};

export const accountApi = {
  get: () => workspaceApiClient.get<AccountProfile>("/api/account"),
  update: (input: UpdateAccountInput) =>
    workspaceApiClient.patch<AccountProfile>("/api/account", input),
};
