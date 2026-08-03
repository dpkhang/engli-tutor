"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateLandingPage } from "../../api/landing-pages";
import { useCreateLandingPage } from "../../hooks/use-landing-pages";
import {
  createLandingPageAdvancedSchema,
  slugifyName,
  type CreateLandingPageAdvancedValues,
} from "../../model/schema";
import { saveLandingPageLocalMetadata } from "../../model/local-metadata";
import { CreateLandingPageView } from "./create-landing-page.view";

export function CreateLandingPage() {
  const router = useRouter();
  const create = useCreateLandingPage();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const createdPageId = useRef<string | null>(null);
  const form = useForm<CreateLandingPageAdvancedValues>({
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

  const name = form.watch("name");
  const slug = form.watch("slug");
  const status = form.watch("status");
  const description = form.watch("description");
  const category = form.watch("category");
  const objective = form.watch("objective");
  const template = form.watch("template");
  const tags = form.watch("tags");
  const slugDirty = form.formState.dirtyFields.slug;

  useEffect(() => {
    if (slugDirty) return;
    form.setValue("slug", slugifyName(name), { shouldValidate: name.length >= 3 });
  }, [name, slugDirty, form]);

  const onSubmit = form.handleSubmit(async (values) => {
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
      const pageId =
        createdPageId.current ?? (await create.mutateAsync(input)).id;
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

  return (
    <CreateLandingPageView
      register={form.register}
      control={form.control}
      errors={form.formState.errors}
      name={name}
      slug={slug}
      status={status}
      description={description}
      category={category}
      objective={objective}
      template={template}
      tags={tags}
      onTagsChange={(nextTags) => form.setValue("tags", nextTags, { shouldDirty: true, shouldValidate: true })}
      pending={create.isPending || publishing}
      error={submitError ?? create.error?.message ?? null}
      onSubmit={onSubmit}
    />
  );
}
