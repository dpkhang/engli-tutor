"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, GripVertical, ImageIcon, LoaderCircle, Save, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  cn,
} from "@landing-page-generator/ui";
import { mediaHooks } from "@/features/workspace-api/hooks";
import { useLandingPage, useUpdateLandingPage } from "../../hooks/use-landing-pages";
import {
  generatedLandingContentSchema,
  parseGeneratedContent,
  type GeneratedLandingContent,
  type GeneratedSection,
} from "../../model/generated-content";

const SECTION_LABEL: Record<GeneratedSection["type"], string> = {
  header: "Header",
  hero: "Hero",
  features: "Tính năng",
  "social-proof": "Social proof",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "Call to action",
  footer: "Footer",
};

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}

export function LandingPageContentEditor({ id }: { id: string }) {
  const query = useLandingPage(id);
  const update = useUpdateLandingPage(id);
  const media = mediaHooks.useList();
  const [content, setContent] = useState<GeneratedLandingContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseGeneratedContent(query.data?.content);
    if (!parsed) return;
    setContent(structuredClone(parsed));
    setDirty(false);
  }, [query.data]);

  const changeContent = (recipe: (draft: GeneratedLandingContent) => void) => {
    setContent((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      recipe(next);
      return next;
    });
    setDirty(true);
    setValidationError(null);
  };

  const save = async () => {
    if (!content) return;
    const parsed = generatedLandingContentSchema.safeParse(content);
    if (!parsed.success) {
      setValidationError("Nội dung chưa hợp lệ. Vui lòng kiểm tra lại các section.");
      return;
    }
    try {
      await update.mutateAsync({ content: parsed.data });
      setDirty(false);
    } catch {
      // Mutation error is rendered below.
    }
  };

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Đang tải editor…</p>;
  if (query.isError) {
    return <Alert variant="destructive"><AlertDescription>{query.error.message}</AlertDescription></Alert>;
  }
  if (!query.data || !content) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Landing page này chưa có nội dung generate hợp lệ để chỉnh sửa.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-7 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href={`/pages/${id}`}><ArrowLeft /> Quay lại chi tiết</Link>
          </Button>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Content editor</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{query.data.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Chỉnh nội dung đã generate và xem lại trên trang demo.</p>
          </div>
        </div>
        <Button asChild variant="outline"><Link href={`/demo/${query.data.slug}`}><Eye /> Xem demo</Link></Button>
      </div>

      {(validationError || update.error) ? (
        <Alert variant="destructive"><AlertDescription>{validationError ?? update.error?.message}</AlertDescription></Alert>
      ) : null}

      <Card className="shadow-none">
        <CardHeader><CardTitle>SEO metadata</CardTitle><CardDescription>Tiêu đề và mô tả hiển thị trên công cụ tìm kiếm.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2"><Label>Meta title</Label><Input value={content.meta.title} onChange={(e) => changeContent((d) => { d.meta.title = e.target.value; })} /></div>
          <div className="space-y-2"><Label>Meta description</Label><TextArea className="min-h-10" value={content.meta.description} onChange={(e) => changeContent((d) => { d.meta.description = e.target.value; })} /></div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0 shadow-none">
        <CardHeader className="pt-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <CardTitle>Banner hero</CardTitle>
              <CardDescription className="mt-1">
                Ảnh này hiển thị ở hero của landing page và đầu item trong thư viện trang.
              </CardDescription>
            </div>
            {content.media?.heroImageUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => changeContent((draft) => { delete draft.media; })}
              >
                <Trash2 /> Bỏ banner
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
          <div className="relative aspect-[16/6] min-h-36 overflow-hidden rounded-md bg-muted">
            {content.media?.heroImageUrl ? (
              <img
                src={content.media.heroImageUrl}
                alt="Banner hero hiện tại"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <ImageIcon className="mx-auto mb-2 size-6" />
                  Chưa có banner
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label>Chọn ảnh từ thư viện</Label>
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link href="/media">Mở thư viện media</Link>
              </Button>
            </div>
            {media.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                <LoaderCircle className="mr-2 size-4 animate-spin" /> Đang tải ảnh...
              </div>
            ) : (media.data ?? []).filter((asset) => asset.kind === "IMAGE").length ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(media.data ?? []).filter((asset) => asset.kind === "IMAGE").map((asset) => {
                  const selected = content.media?.heroImageUrl === asset.url;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeContent((draft) => {
                        draft.media = { heroImageUrl: asset.url };
                      })}
                      className={cn(
                        "relative w-44 shrink-0 overflow-hidden rounded-md border-2 bg-muted text-left transition-colors",
                        selected ? "border-primary" : "border-transparent hover:border-border",
                      )}
                    >
                      <span className="block aspect-[16/9] overflow-hidden">
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <span className="block truncate bg-background px-2 py-2 text-xs font-medium">
                        {asset.name}
                      </span>
                      {selected ? (
                        <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có ảnh trong thư viện. Tải ảnh lên trước khi thay banner.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader><CardTitle>Giao diện</CardTitle><CardDescription>Màu thương hiệu và phong cách font của trang.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2"><Label>Màu chính</Label><div className="flex gap-2"><input type="color" className="h-10 w-12 rounded border" value={content.theme.primaryColor} onChange={(e) => changeContent((d) => { d.theme.primaryColor = e.target.value; })} /><Input value={content.theme.primaryColor} onChange={(e) => changeContent((d) => { d.theme.primaryColor = e.target.value; })} /></div></div>
          <div className="space-y-2"><Label>Màu phụ</Label><div className="flex gap-2"><input type="color" className="h-10 w-12 rounded border" value={content.theme.secondaryColor} onChange={(e) => changeContent((d) => { d.theme.secondaryColor = e.target.value; })} /><Input value={content.theme.secondaryColor} onChange={(e) => changeContent((d) => { d.theme.secondaryColor = e.target.value; })} /></div></div>
          <div className="space-y-2"><Label>Font style</Label><Input value={content.theme.fontStyle} onChange={(e) => changeContent((d) => { d.theme.fontStyle = e.target.value; })} /></div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div><h2 className="text-xl font-semibold">Nội dung sections</h2><p className="text-sm text-muted-foreground">Mỗi dòng trong “Danh sách nội dung” sẽ là một item riêng.</p></div>
        {content.sections.map((section, index) => (
          <Card key={`${section.type}-${index}`} className="shadow-none">
            <CardHeader className="flex-row items-center gap-3">
              <GripVertical className="size-5 text-muted-foreground" />
              <div><CardTitle className="text-base">Section {index + 1}: {SECTION_LABEL[section.type]}</CardTitle><Badge className="mt-2" variant="outline">{section.type}</Badge></div>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>{section.type === "header" ? "Tên thương hiệu" : "Heading"}</Label><Input value={section.heading} onChange={(e) => changeContent((d) => { d.sections[index]!.heading = e.target.value; })} /></div>
              <div className="space-y-2"><Label>Subheading</Label><TextArea value={section.subheading ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.subheading = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>Body</Label><TextArea value={section.body ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.body = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>Nhãn CTA</Label><Input value={section.ctaLabel ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.ctaLabel = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>{section.type === "header" ? "Menu (mỗi dòng một mục)" : "Danh sách nội dung"}</Label><TextArea value={section.items.join("\n")} onChange={(e) => changeContent((d) => { d.sections[index]!.items = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean); })} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t bg-background/90 p-4 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{dirty ? "Có thay đổi chưa lưu" : "Nội dung đã đồng bộ"}</p>
          <Button disabled={!dirty || update.isPending} onClick={() => void save()}>
            {update.isPending ? <LoaderCircle className="animate-spin" /> : <Save />} {update.isPending ? "Đang lưu…" : "Lưu nội dung"}
          </Button>
        </div>
      </div>
    </div>
  );
}
