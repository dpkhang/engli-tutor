"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Eye, LayoutTemplate, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  useActionDialog,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { templateHooks } from "@/features/workspace-api/hooks";
import {
  FUNNEL_LABEL,
  templateToPageFrame,
} from "@/features/landing-pages/model/page-frames";
import { FramePreview } from "@/features/landing-pages/ui/create-landing-page/frame-gallery";

export default function TemplatesPage() {
  const dialog = useActionDialog();
  const query = templateHooks.useList();
  const create = templateHooks.useCreate();
  const remove = templateHooks.useDelete();
  const systemTemplates = (query.data ?? []).filter((item) => item.system);
  const frames = systemTemplates.map(templateToPageFrame).filter((frame) => frame != null);
  const workspaceTemplates = (query.data ?? []).filter((item) => !item.system);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(
      {
        name: String(form.get("name")),
        category: String(form.get("category")),
        description: String(form.get("description") || ""),
      },
      { onSuccess: () => event.currentTarget.reset() },
    );
  };
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Templates"
        description="Xem thử khung trang sẵn có, hoặc quản lý bộ mẫu tái sử dụng của workspace."
        action={<Button asChild><Link href="/templates/generate"><Sparkles /> Tạo template bằng AI</Link></Button>}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Khung trang (xem thử miễn phí)</h2>
            <p className="text-sm text-muted-foreground">
              Template được tải từ server — preview không trừ credit và có thể dùng ngay khi tạo bằng AI.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/landing-pages/new">
              <WandSparkles /> Tạo bằng AI
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {frames.map((frame) => (
            <Card key={frame.id} className="h-full gap-0 overflow-hidden py-0 shadow-none">
              <div className="h-36 w-full shrink-0">
                <FramePreview frame={frame} className="h-full rounded-none border-0 border-b" />
              </div>
              <CardContent className="flex min-w-0 flex-1 flex-col gap-3 py-4">
                <div className="flex min-w-0 items-start gap-2">
                  <h3 className="min-w-0 flex-1 truncate font-semibold">{frame.name}</h3>
                  <Badge variant="outline" className="shrink-0">
                    {FUNNEL_LABEL[frame.funnel]}
                  </Badge>
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{frame.description}</p>
                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" className="min-w-0 flex-1" asChild>
                    <Link href={`/templates/preview/${encodeURIComponent(frame.id)}`}>
                      <Eye /> Xem thử
                    </Link>
                  </Button>
                  <Button size="sm" className="min-w-0 flex-1" asChild>
                    <Link href={`/landing-pages/new?frame=${encodeURIComponent(frame.id)}`}>
                      Dùng khung
                    </Link>
                  </Button>
                </div>
              </CardContent>

            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Template workspace</h2>
          <p className="text-sm text-muted-foreground">
            Tạo thủ công miễn phí hoặc quản lý các template AI đã lưu trong workspace.
          </p>
        </div>
        <Card className="shadow-none">
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-[1fr_180px_1fr_auto] md:items-end"
              onSubmit={submit}
            >
              <div className="space-y-2">
                <Label htmlFor="template-name">Tên template</Label>
                <Input
                  id="template-name"
                  name="name"
                  required
                  minLength={3}
                  placeholder="Product launch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Danh mục</Label>
                <Input id="template-category" name="category" required defaultValue="Marketing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Mô tả</Label>
                <Input id="template-description" name="description" placeholder="Mô tả ngắn..." />
              </div>
              <Button disabled={create.isPending}>
                <Plus /> Tạo
              </Button>
            </form>
            {create.error ? (
              <p className="mt-3 text-sm text-destructive">{create.error.message}</p>
            ) : null}
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaceTemplates.map((item) => (
            <Card key={item.id} className="h-full gap-4 shadow-none">
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <LayoutTemplate className="size-5" />
                  </span>
                  <Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description || "Chưa có mô tả"}
                  </p>
                </div>
                <div className="mt-auto space-y-2">
                  {templateToPageFrame(item) ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild><Link href={`/templates/preview/${encodeURIComponent(templateToPageFrame(item)!.id)}`}><Eye /> Xem thử</Link></Button>
                      <Button size="sm" asChild><Link href={`/landing-pages/new?frame=${encodeURIComponent(templateToPageFrame(item)!.id)}`}>Dùng mẫu</Link></Button>
                    </div>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={remove.isPending}
                    onClick={async () => {
                      const accepted = await dialog.confirm({
                        title: "Xóa template?",
                        description: `Template “${item.name}” sẽ bị xóa vĩnh viễn.`,
                        confirmLabel: "Xóa template",
                        tone: "danger",
                      });
                      if (accepted) remove.mutate(item.id);
                    }}
                  >
                    <Trash2 /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!query.isLoading && !workspaceTemplates.length ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Chưa có template workspace.
          </p>
        ) : null}
        {query.isError ? (
          <p className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
            Không thể tải template từ server: {query.error.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
