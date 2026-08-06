"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  deleteWizardDraft,
  getWizardDraft,
  putWizardDraft,
  updateLandingPage,
} from "../../api/landing-pages";
import {
  useCreateLandingPage,
  useGenerateLandingPage,
  useWorkspaceIntegrations,
} from "../../hooks/use-landing-pages";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import {
  createLandingPageAdvancedSchema,
  generateLandingPageFormSchema,
  slugifyName,
  type CreateLandingPageAdvancedValues,
  type GenerateLandingPageFormValues,
} from "../../model/schema";
import { frameToLayoutHint, getPageFrameById } from "../../model/page-frames";
import {
  draftFromServer,
  type CreateWizardDraft,
} from "../../model/create-wizard-draft";
import { saveLandingPageLocalMetadata } from "../../model/local-metadata";
import { AiGeneratingOverlay } from "./ai-generating-overlay";
import {
  CreateLandingPageView,
  type CreateMode,
  type WizardStep,
} from "./create-landing-page.view";

const AI_DEFAULTS: GenerateLandingPageFormValues = {
  name: "",
  slug: "",
  brief: "",
  audience: "",
  tone: "professional",
  language: "vi",
};

export function CreateLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const frameFromQuery = searchParams.get("frame");
  const create = useCreateLandingPage();
  const generate = useGenerateLandingPage();
  const integrations = useWorkspaceIntegrations();
  const credits = useBillingMe();
  const [mode, setMode] = useState<CreateMode>("ai");
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [frameError, setFrameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const createdPageId = useRef<string | null>(null);
  const skipSlugAuto = useRef(false);
  const syncingRef = useRef(false);

  const openaiReady = integrations.data?.openai === true;
  const openaiUnknown = integrations.isLoading;
  const creditBalance = credits.data?.balance;
  const aiGenerateCost = credits.data?.aiGenerateCost ?? 10;
  const hasEnoughCredits =
    creditBalance == null ? true : creditBalance >= aiGenerateCost;

  const manualForm = useForm<CreateLandingPageAdvancedValues>({
    resolver: zodResolver(createLandingPageAdvancedSchema),
    defaultValues: {
      name: "",
      slug: "",
      status: "DRAFT",
      description: "",
      category: "MARKETING",
      objective: "LEADS",
      template: "BLANK",
      tags: [],
    },
  });

  const aiForm = useForm<GenerateLandingPageFormValues>({
    resolver: zodResolver(generateLandingPageFormSchema),
    defaultValues: AI_DEFAULTS,
  });

  const applyDraft = (draft: CreateWizardDraft, preferQueryFrame: boolean) => {
    const queryFrame = preferQueryFrame ? getPageFrameById(frameFromQuery) : undefined;
    skipSlugAuto.current = true;
    aiForm.reset(draft.ai);
    if (draft.ai.slug) {
      aiForm.setValue("slug", draft.ai.slug, { shouldDirty: true });
    }
    setMode(draft.mode);
    setSelectedFrameId(queryFrame?.id ?? draft.selectedFrameId);
    const stepOneComplete =
      draft.ai.name.trim().length >= 3 &&
      /^[a-z0-9-]{3,120}$/.test(draft.ai.slug) &&
      draft.ai.brief.trim().length >= 20;
    setStep(stepOneComplete ? draft.step : 1);
    setDraftRestored(true);
  };

  // Drafts are persisted on the backend only so they follow the signed-in workspace.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const queryFrame = getPageFrameById(frameFromQuery);

      if (queryFrame) {
        setSelectedFrameId(queryFrame.id);
        setMode("ai");
      }

      try {
        const serverRow = await getWizardDraft();
        if (cancelled) return;
        const server = draftFromServer(serverRow);
        if (server) applyDraft(server, true);
      } catch {
        // API unavailable — start with an empty form.
      } finally {
        if (!cancelled) setDraftReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const frame = getPageFrameById(frameFromQuery);
    if (!frame) return;
    setSelectedFrameId(frame.id);
    setMode("ai");
  }, [frameFromQuery, draftReady]);

  const aiName = aiForm.watch("name");
  const aiSlug = aiForm.watch("slug");
  const manualName = manualForm.watch("name");
  const manualSlug = manualForm.watch("slug");
  const name = mode === "ai" ? aiName : manualName;
  const slug = mode === "ai" ? aiSlug : manualSlug;
  const aiSlugDirty = Boolean(aiForm.formState.dirtyFields.slug);
  const manualSlugDirty = Boolean(manualForm.formState.dirtyFields.slug);

  useEffect(() => {
    if (!draftReady) return;
    if (skipSlugAuto.current) {
      skipSlugAuto.current = false;
      return;
    }
    if (aiSlugDirty) return;
    aiForm.setValue("slug", slugifyName(aiName), { shouldValidate: aiName.length >= 3 });
  }, [aiName, aiSlugDirty, aiForm, draftReady]);

  useEffect(() => {
    if (manualSlugDirty) return;
    manualForm.setValue("slug", slugifyName(manualName), {
      shouldValidate: manualName.length >= 3,
    });
  }, [manualName, manualSlugDirty, manualForm]);

  const status = mode === "manual" ? manualForm.watch("status") : "DRAFT";
  const description = mode === "manual" ? manualForm.watch("description") : aiForm.watch("brief");
  const category = mode === "manual" ? manualForm.watch("category") : "MARKETING";
  const objective = mode === "manual" ? manualForm.watch("objective") : "LEADS";
  const template = mode === "manual" ? manualForm.watch("template") : "PRODUCT_LAUNCH";
  const tags = mode === "manual" ? manualForm.watch("tags") : [];
  const brief = aiForm.watch("brief");
  const audience = aiForm.watch("audience");
  const tone = aiForm.watch("tone");
  const language = aiForm.watch("language");

  // Debounced server-only autosave.
  useEffect(() => {
    if (!draftReady || mode !== "ai") return;
    const timer = window.setTimeout(() => {
      const payload = {
        version: 1 as const,
        mode,
        step,
        selectedFrameId,
        ai: {
          name: aiName ?? "",
          slug: aiSlug ?? "",
          brief: brief ?? "",
          audience: audience ?? "",
          tone,
          language,
        },
      };
      const hasContent =
        payload.ai.name.trim().length > 0 ||
        payload.ai.brief.trim().length > 0 ||
        Boolean(payload.ai.audience.trim()) ||
        Boolean(selectedFrameId) ||
        step > 1;
      if (!hasContent || syncingRef.current) return;
      syncingRef.current = true;
      void putWizardDraft(payload)
        .catch(() => undefined)
        .finally(() => {
          syncingRef.current = false;
        });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [
    draftReady,
    mode,
    step,
    selectedFrameId,
    aiName,
    aiSlug,
    brief,
    audience,
    tone,
    language,
  ]);

  const discardDraft = () => {
    void deleteWizardDraft().catch(() => undefined);
    skipSlugAuto.current = false;
    aiForm.reset(AI_DEFAULTS);
    setStep(1);
    setSelectedFrameId(null);
    setFrameError(null);
    setSubmitError(null);
    setDraftRestored(false);
    setMode("ai");
  };

  const saveDraftNow = async () => {
    setDraftSaving(true);
    setDraftSaved(false);
    try {
      const payload = {
        version: 1 as const,
        mode: "ai" as const,
        step,
        selectedFrameId,
        ai: {
          name: aiName ?? "",
          slug: aiSlug ?? "",
          brief: brief ?? "",
          audience: audience ?? "",
          tone,
          language,
        },
      };
      await putWizardDraft(payload);
      setDraftRestored(true);
      setDraftSaved(true);
      window.setTimeout(() => setDraftSaved(false), 2500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể lưu bản nháp");
    } finally {
      setDraftSaving(false);
    }
  };

  const onManualSubmit = manualForm.handleSubmit(async (values) => {
    const {
      status: initialStatus,
      description: pageDescription,
      category: pageCategory,
      objective: pageObjective,
      template: pageTemplate,
      tags: pageTags,
      ...input
    } = values;
    setSubmitError(null);
    try {
      const pageId = createdPageId.current ?? (await create.mutateAsync(input)).id;
      createdPageId.current = pageId;
      saveLandingPageLocalMetadata(pageId, {
        description: pageDescription,
        category: pageCategory,
        objective: pageObjective,
        template: pageTemplate,
        tags: pageTags,
      });
      if (initialStatus === "PUBLISHED") {
        setPublishing(true);
        await updateLandingPage(pageId, { status: initialStatus });
      }
      router.push(`/pages/${pageId}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo landing page");
    } finally {
      setPublishing(false);
    }
  });

  const onNextStep = async () => {
    setSubmitError(null);
    setFrameError(null);
    if (step === 1) {
      const valid = await aiForm.trigger(
        ["name", "slug", "brief", "audience", "tone", "language"],
        { shouldFocus: false },
      );
      if (!valid) {
        window.requestAnimationFrame(() => {
          const firstInvalid = document.querySelector<HTMLElement>(
            '#create-landing-form [aria-invalid="true"]',
          );
          firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid?.focus({ preventScroll: true });
        });
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!selectedFrameId || !getPageFrameById(selectedFrameId)) {
        setFrameError("Chọn một khung trang để tiếp tục.");
        window.requestAnimationFrame(() => {
          document.getElementById("frame-selection")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const onAiSubmit = aiForm.handleSubmit(async (values) => {
    if (step !== 4) {
      await onNextStep();
      return;
    }
    const frame = getPageFrameById(selectedFrameId);
    if (!frame) {
      setFrameError("Chọn một khung trang để tiếp tục.");
      setStep(2);
      return;
    }
    if (!openaiReady) {
      setSubmitError(
        "Backend production chưa có OPENAI_API_KEY. Cấu hình biến này trên Render, redeploy API rồi thử lại.",
      );
      return;
    }
    if (creditBalance != null && creditBalance < aiGenerateCost) {
      setSubmitError(
        `Không đủ credit (cần ${aiGenerateCost}, còn ${creditBalance}). Nạp thêm tại Thanh toán.`,
      );
      return;
    }
    setSubmitError(null);
    try {
      const page = await generate.mutateAsync({
        name: values.name,
        slug: values.slug,
        brief: values.brief,
        audience: values.audience?.trim() || undefined,
        tone: values.tone,
        language: values.language,
        layout: frameToLayoutHint(frame),
      });
      void deleteWizardDraft().catch(() => undefined);
      setDraftRestored(false);
      saveLandingPageLocalMetadata(page.id, {
        description: values.brief.slice(0, 240),
        category: "MARKETING",
        objective: frame.funnel,
        template: "PRODUCT_LAUNCH",
        tags: ["ai-generated", frame.id],
      });
      void credits.refetch();
      router.push(`/demo/${page.slug}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể tạo landing page bằng AI",
      );
      void credits.refetch();
    }
  });

  return (
    <>
      <AiGeneratingOverlay open={generate.isPending} pageName={aiName} />
      <CreateLandingPageView
        mode={mode}
        onModeChange={(next) => {
          setMode(next);
          setSubmitError(null);
          setFrameError(null);
          if (next === "ai") setStep((prev) => prev || 1);
        }}
        step={step}
        onStepChange={(next) => {
          setStep(next);
          setFrameError(null);
          setSubmitError(null);
        }}
        selectedFrameId={selectedFrameId}
        onSelectFrame={(id) => {
          setSelectedFrameId(id);
          setFrameError(null);
        }}
        frameError={frameError}
        draftRestored={draftRestored}
        onDiscardDraft={discardDraft}
        openaiReady={openaiReady}
        openaiUnknown={openaiUnknown}
        creditBalance={creditBalance ?? null}
        aiGenerateCost={aiGenerateCost}
        hasEnoughCredits={hasEnoughCredits}
        creditsLoading={credits.isLoading}
        registerManual={manualForm.register}
        controlManual={manualForm.control}
        errorsManual={manualForm.formState.errors}
        registerAi={aiForm.register}
        controlAi={aiForm.control}
        errorsAi={aiForm.formState.errors}
        name={name}
        slug={slug}
        status={status}
        description={description}
        category={category}
        objective={objective}
        template={template}
        tags={tags}
        brief={brief}
        audience={audience ?? ""}
        tone={tone}
        language={language}
        pending={create.isPending || generate.isPending || publishing}
        draftSaving={draftSaving}
        draftSaved={draftSaved}
        error={submitError ?? create.error?.message ?? generate.error?.message ?? null}
        onTagsChange={(nextTags) =>
          manualForm.setValue("tags", nextTags, { shouldDirty: true, shouldValidate: true })
        }
        onNextStep={() => {
          void onNextStep();
        }}
        onSaveDraft={() => {
          void saveDraftNow();
        }}
        onSubmit={mode === "ai" ? onAiSubmit : onManualSubmit}
      />
    </>
  );
}
