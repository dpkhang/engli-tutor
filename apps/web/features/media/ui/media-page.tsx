"use client";
import { FormEvent, useState } from "react";
import { ExternalLink, FileImage, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Input, Label, useActionDialog } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { mediaHooks } from "@/features/workspace-api/hooks";
import type { MediaAsset } from "@/features/workspace-api/api";

function getMediaSource(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function MediaItem({
  item,
  deleting,
  onDelete,
}: {
  item: MediaAsset;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = item.kind === "IMAGE" && !imageFailed;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {showImage ? (
          <img
            src={item.url}
            alt={item.altText ?? item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/60">
            <FileImage className="size-8" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 rounded-md border bg-background/90 p-1 shadow-sm backdrop-blur-sm">
          <Button asChild variant="ghost" size="icon-xs">
            <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Mở ${item.name}`} title="Mở media">
              <ExternalLink />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="hover:text-destructive"
            disabled={deleting}
            aria-label={`Xóa ${item.name}`}
            title="Xóa media"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-foreground" title={item.name}>
            {item.name}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{getMediaSource(item.url)}</p>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground/70 uppercase">
          {item.kind}
        </span>
      </div>
    </article>
  );
}

export default function MediaPage() {
  const dialog = useActionDialog();
  const query = mediaHooks.useList();
  const create = mediaHooks.useCreate();
  const remove = mediaHooks.useDelete();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(
      {
        name: String(form.get("name")),
        url: String(form.get("url")),
        altText: String(form.get("altText") || ""),
        kind: "IMAGE",
      },
      { onSuccess: () => event.currentTarget.reset() },
    );
  };
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assets"
        title="Thư viện media"
        description="Quản lý metadata và URL tài nguyên dùng trong landing page."
      />
      <Card className="shadow-none">
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_1.5fr_1fr_auto] md:items-end"
            onSubmit={submit}
          >
            <div className="space-y-2">
              <Label htmlFor="media-name">Tên asset</Label>
              <Input id="media-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-url">URL</Label>
              <Input id="media-url" name="url" type="url" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-alt">Alt text</Label>
              <Input id="media-alt" name="altText" />
            </div>
            <Button disabled={create.isPending}>
              <Plus /> Thêm
            </Button>
          </form>
          {create.error ? (
            <p className="mt-3 text-sm text-destructive">{create.error.message}</p>
          ) : null}
        </CardContent>
      </Card>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {query.data?.map((item) => (
          <MediaItem
            key={item.id}
            item={item}
            deleting={remove.isPending}
            onDelete={() => {
              void dialog
                .confirm({
                  title: "Xóa asset?",
                  description: `Asset “${item.name}” sẽ bị xóa khỏi thư viện media.`,
                  confirmLabel: "Xóa asset",
                  tone: "danger",
                })
                .then((accepted) => {
                  if (accepted) remove.mutate(item.id);
                });
            }}
          />
        ))}
      </section>
    </div>
  );
}
