"use client";
import { FormEvent } from "react";
import { ExternalLink, FileImage, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardContent, Input, Label, useActionDialog } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { mediaHooks } from "@/features/workspace-api/hooks";

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
          <Card key={item.id} className="overflow-hidden py-0 shadow-none">
            <div className="grid h-32 place-items-center bg-muted">
              {item.kind === "IMAGE" ? (
                <img
                  src={item.url}
                  alt={item.altText ?? item.name}
                  className="size-full object-cover"
                />
              ) : (
                <FileImage className="size-8 text-muted-foreground" />
              )}
            </div>
            <CardContent className="space-y-3 py-4">
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{item.name}</h2>
                  <Badge variant="outline" className="mt-1">
                    {item.kind}
                  </Badge>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  const accepted = await dialog.confirm({
                    title: "Xóa asset?",
                    description: `Asset “${item.name}” sẽ bị xóa khỏi thư viện media.`,
                    confirmLabel: "Xóa asset",
                    tone: "danger",
                  });
                  if (accepted) remove.mutate(item.id);
                }}
              >
                <Trash2 /> Xóa
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
