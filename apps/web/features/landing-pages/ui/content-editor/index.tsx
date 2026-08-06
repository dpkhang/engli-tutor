"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, GripVertical, LoaderCircle, Save } from "lucide-react";
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
} from "@landing-page-generator/ui";
import { useLandingPage, useUpdateLandingPage } from "../../hooks/use-landing-pages";
import {
  generatedLandingContentSchema,
  parseGeneratedContent,
  type GeneratedLandingContent,
  type GeneratedSection,
} from "../../model/generated-content";

const SECTION_LABEL: Record<GeneratedSection["type"], string> = {
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
              <div className="space-y-2 md:col-span-2"><Label>Heading</Label><Input value={section.heading} onChange={(e) => changeContent((d) => { d.sections[index]!.heading = e.target.value; })} /></div>
              <div className="space-y-2"><Label>Subheading</Label><TextArea value={section.subheading ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.subheading = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>Body</Label><TextArea value={section.body ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.body = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>Nhãn CTA</Label><Input value={section.ctaLabel ?? ""} onChange={(e) => changeContent((d) => { d.sections[index]!.ctaLabel = e.target.value || null; })} /></div>
              <div className="space-y-2"><Label>Danh sách nội dung</Label><TextArea value={section.items.join("\n")} onChange={(e) => changeContent((d) => { d.sections[index]!.items = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean); })} /></div>
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
