import type { GenerateLandingPageFormValues } from "./schema";
import { getPageFrameById } from "./page-frames";

export type CreateWizardDraftMode = "ai" | "manual";
export type CreateWizardDraftStep = 1 | 2 | 3 | 4;

export type CreateWizardDraft = {
  version: 1;
  updatedAt: string;
  mode: CreateWizardDraftMode;
  step: CreateWizardDraftStep;
  selectedFrameId: string | null;
  ai: GenerateLandingPageFormValues;
};

export type ServerWizardDraftResponse = {
  id: string;
  updatedAt: string;
  payload: {
    version: 1;
    mode: CreateWizardDraftMode;
    step: CreateWizardDraftStep;
    selectedFrameId: string | null;
    ai: GenerateLandingPageFormValues;
  };
} | null;

function isWizardStep(value: unknown): value is CreateWizardDraftStep {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function isCreateMode(value: unknown): value is CreateWizardDraftMode {
  return value === "ai" || value === "manual";
}

function normalizeDraft(input: {
  updatedAt?: string;
  mode: unknown;
  step: unknown;
  selectedFrameId?: string | null;
  ai: Partial<GenerateLandingPageFormValues>;
}): CreateWizardDraft | null {
  if (!isWizardStep(input.step) || !isCreateMode(input.mode) || !input.ai) return null;
  const frameId =
    input.selectedFrameId && getPageFrameById(input.selectedFrameId)
      ? input.selectedFrameId
      : null;
  let step = input.step;
  if (step >= 3 && !frameId) step = 2;

  return {
    version: 1,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
    mode: input.mode,
    step,
    selectedFrameId: frameId,
    ai: {
      name: String(input.ai.name ?? ""),
      slug: String(input.ai.slug ?? ""),
      brief: String(input.ai.brief ?? ""),
      audience: String(input.ai.audience ?? ""),
      tone: input.ai.tone ?? "professional",
      language: input.ai.language ?? "vi",
    },
  };
}

export function draftFromServer(response: ServerWizardDraftResponse): CreateWizardDraft | null {
  if (!response?.payload) return null;
  return normalizeDraft({
    updatedAt: response.updatedAt,
    mode: response.payload.mode,
    step: response.payload.step,
    selectedFrameId: response.payload.selectedFrameId,
    ai: response.payload.ai,
  });
}
