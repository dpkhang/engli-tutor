"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateLandingPage } from "../../api/landing-pages";
import {
  useCreateLandingPage,
  useGenerateLandingPage,
  useWorkspaceIntegrations,
} from "../../hooks/use-landing-pages";
import {
  createLandingPageAdvancedSchema,
  generateLandingPageFormSchema,
  slugifyName,
  type CreateLandingPageAdvancedValues,
  type GenerateLandingPageFormValues,
} from "../../model/schema";
import { saveLandingPageLocalMetadata } from "../../model/local-metadata";
import { CreateLandingPageView, type CreateMode } from "./create-landing-page.view";

export function CreateLandingPage() {
  const router = useRouter();
  const create = useCreateLandingPage();
  const generate = useGenerateLandingPage();
  const integrations = useWorkspaceIntegrations();
  const [mode, setMode] = useState<CreateMode>("ai");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const createdPageId = useRef<string | null>(null);

  const openaiReady = integrations.data?.openai === true;
  const openaiUnknown = integrations.isLoading;

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
    defaultValues: {
      name: "",
      slug: "",
      brief: "",
      audience: "",
      tone: "professional",
      language: "vi",
    },
  });

  const aiName = aiForm.watch("name");
  const aiSlug = aiForm.watch("slug");
  const manualName = manualForm.watch("name");
  const manualSlug = manualForm.watch("slug");
  const name = mode === "ai" ? aiName : manualName;
  const slug = mode === "ai" ? aiSlug : manualSlug;
  const aiSlugDirty = Boolean(aiForm.formState.dirtyFields.slug);
  const manualSlugDirty = Boolean(manualForm.formState.dirtyFields.slug);

  useEffect(() => {
    if (aiSlugDirty) return;
    aiForm.setValue("slug", slugifyName(aiName), { shouldValidate: aiName.length >= 3 });
  }, [aiName, aiSlugDirty, aiForm]);

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

  const onAiSubmit = aiForm.handleSubmit(async (values) => {
    if (!openaiReady) {
      setSubmitError(
        "OpenAI chưa được cấu hình. Thêm OPENAI_API_KEY vào backend rồi thử lại.",
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
      });
      saveLandingPageLocalMetadata(page.id, {
        description: values.brief.slice(0, 240),
        category: "MARKETING",
        objective: "LEADS",
        template: "PRODUCT_LAUNCH",
        tags: ["ai-generated"],
      });
      router.push(`/demo/${page.slug}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể tạo landing page bằng AI",
      );
    }
  });

  return (
    <CreateLandingPageView
      mode={mode}
      onModeChange={(next) => {
        setMode(next);
        setSubmitError(null);
      }}
      openaiReady={openaiReady}
      openaiUnknown={openaiUnknown}
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
      error={submitError ?? create.error?.message ?? generate.error?.message ?? null}
      onTagsChange={(nextTags) =>
        manualForm.setValue("tags", nextTags, { shouldDirty: true, shouldValidate: true })
      }
      onSubmit={mode === "ai" ? onAiSubmit : onManualSubmit}
    />
  );
}
