"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLandingPage } from "../../hooks/use-landing-pages";
import {
  createLandingPageSchema,
  slugifyName,
  type CreateLandingPageValues,
} from "../../model/schema";
import { LandingPageFormView } from "./landing-page-form.view";

export function LandingPageForm() {
  const create = useCreateLandingPage();
  const form = useForm<CreateLandingPageValues>({
    resolver: zodResolver(createLandingPageSchema),
    defaultValues: { name: "", slug: "" },
  });

  const name = form.watch("name");
  const slugDirty = form.formState.dirtyFields.slug;

  useEffect(() => {
    if (slugDirty) return;
    form.setValue("slug", slugifyName(name), { shouldValidate: name.length >= 3 });
  }, [name, slugDirty, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      form.reset({ name: "", slug: "" });
    } catch {
      // error surfaced via mutation
    }
  });

  return (
    <LandingPageFormView
      register={form.register}
      errors={form.formState.errors}
      pending={create.isPending}
      error={create.error?.message ?? null}
      onSubmit={onSubmit}
    />
  );
}
