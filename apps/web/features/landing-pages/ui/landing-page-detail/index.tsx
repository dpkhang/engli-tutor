"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useDeleteLandingPage,
  useLandingPage,
  useUpdateLandingPage,
} from "../../hooks/use-landing-pages";
import {
  updateLandingPageSchema,
  type UpdateLandingPageValues,
} from "../../model/schema";
import { LandingPageDetailView } from "./landing-page-detail.view";

export function LandingPageDetail({ id }: { id: string }) {
  const router = useRouter();
  const query = useLandingPage(id);
  const update = useUpdateLandingPage(id);
  const remove = useDeleteLandingPage();

  const form = useForm<UpdateLandingPageValues>({
    resolver: zodResolver(updateLandingPageSchema),
    defaultValues: {
      name: "",
      slug: "",
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (!query.data) return;
    form.reset({
      name: query.data.name,
      slug: query.data.slug,
      status: query.data.status,
    });
  }, [query.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
    } catch {
      // surfaced via mutation
    }
  });

  const onDelete = async () => {
    if (!window.confirm("Xóa landing page này? Thao tác không hoàn tác.")) return;
    try {
      await remove.mutateAsync(id);
      router.replace("/");
    } catch {
      // surfaced via mutation
    }
  };

  return (
    <LandingPageDetailView
      page={query.data ?? null}
      isLoading={query.isLoading}
      isError={query.isError}
      loadError={query.error?.message ?? null}
      register={form.register}
      errors={form.formState.errors}
      dirty={form.formState.isDirty}
      pending={update.isPending}
      deletePending={remove.isPending}
      saveError={update.error?.message ?? null}
      deleteError={remove.error?.message ?? null}
      onSubmit={onSubmit}
      onDelete={() => {
        void onDelete();
      }}
      onRetry={() => {
        void query.refetch();
      }}
    />
  );
}
