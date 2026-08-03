"use client";

import { useState } from "react";
import Link from "next/link";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  ArrowLeft,
  Check,
  Eye,
  FileText,
  Globe2,
  Info,
  Link2,
  Layers3,
  LayoutTemplate,
  LoaderCircle,
  Rocket,
  Save,
  Tag,
  Target,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@landing-page-generator/ui";
import type { CreateLandingPageAdvancedValues } from "../../model/schema";

type Props = {
  register: UseFormRegister<CreateLandingPageAdvancedValues>;
  control: Control<CreateLandingPageAdvancedValues>;
  errors: FieldErrors<CreateLandingPageAdvancedValues>;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  description: string;
  category: CreateLandingPageAdvancedValues["category"];
  objective: CreateLandingPageAdvancedValues["objective"];
  template: CreateLandingPageAdvancedValues["template"];
  tags: string[];
  pending: boolean;
  error: string | null;
  onTagsChange: (tags: string[]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function CreateLandingPageView({
  register,
  control,
  errors,
  name,
  slug,
  status,
  description,
  category,
  objective,
  template,
  tags,
  pending,
  error,
  onTagsChange,
  onSubmit,
}: Props) {
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    const value = tagInput.trim().toLocaleLowerCase("vi").replace(/\s+/g, "-");
    if (!value || tags.includes(value) || tags.length >= 5) return;
    onTagsChange([...tags, value]);
    setTagInput("");
  };
  const checklist = [
    { label: "Tên trang hợp lệ", ready: name.trim().length >= 3 },
    { label: "Slug hợp lệ", ready: /^[a-z0-9-]{3,120}$/.test(slug) },
    { label: "Chọn trạng thái ban đầu", ready: Boolean(status) },
  ];
  const readyCount = checklist.filter((item) => item.ready).length;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/landing-pages"><ArrowLeft /> Quay lại Landing pages</Link>
        </Button>
        <header className="space-y-2">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Create</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Tạo landing page mới</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Thiết lập định danh và trạng thái ban đầu. Bạn có thể tiếp tục cấu hình nội dung sau khi trang được tạo.</p>
        </header>
      </div>

      <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4.5" /></span><div><CardTitle>Thông tin cơ bản</CardTitle><CardDescription>Tên nội bộ và URL của landing page.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="create-name">Tên landing page</Label>
                <Input id="create-name" placeholder="Summer Campaign 2026" autoFocus aria-invalid={Boolean(errors.name)} {...register("name")} />
                <div className="flex justify-between gap-3"><p className="text-xs text-muted-foreground">Dùng tên dễ nhận biết trong workspace.</p><span className="text-xs text-muted-foreground">{name.length}/120</span></div>
                {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-slug">Slug</Label>
                <div className="flex items-center rounded-md border bg-muted/35 pl-3 focus-within:ring-2 focus-within:ring-ring/40"><Link2 className="size-4 text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">/</span><Input id="create-slug" placeholder="summer-campaign-2026" className="border-0 bg-transparent font-mono shadow-none focus-visible:ring-0" aria-invalid={Boolean(errors.slug)} {...register("slug")} /></div>
                <p className="text-xs text-muted-foreground">Slug được tạo tự động từ tên; chỉ dùng chữ thường, số và dấu gạch ngang.</p>
                {errors.slug ? <p className="text-xs text-destructive">{errors.slug.message}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Layers3 className="size-4.5" /></span><div><CardTitle>Phân loại và mục tiêu</CardTitle><CardDescription>Metadata giúp tổ chức và tìm kiếm chiến dịch.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-5">
              <Alert><Info /><AlertDescription>Category, tags, mục tiêu và template hiện chỉ lưu trên trình duyệt này, chưa đồng bộ backend.</AlertDescription></Alert>
              <div className="space-y-2"><Label htmlFor="create-description">Mô tả ngắn</Label><textarea id="create-description" rows={3} placeholder="Mô tả mục đích và nội dung chính của chiến dịch..." className="flex w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" aria-invalid={Boolean(errors.description)} {...register("description")} /><div className="flex justify-between"><p className="text-xs text-muted-foreground">Hiển thị nội bộ trong workspace.</p><span className="text-xs text-muted-foreground">{description.length}/240</span></div>{errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="create-category">Danh mục</Label><Controller control={control} name="category" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="create-category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MARKETING">Marketing</SelectItem><SelectItem value="PRODUCT">Sản phẩm</SelectItem><SelectItem value="EVENT">Sự kiện</SelectItem><SelectItem value="PORTFOLIO">Portfolio</SelectItem><SelectItem value="OTHER">Khác</SelectItem></SelectContent></Select>} /></div>
                <div className="space-y-2"><Label htmlFor="create-objective">Mục tiêu</Label><Controller control={control} name="objective" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="create-objective" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LEADS">Thu thập leads</SelectItem><SelectItem value="SALES">Tăng doanh số</SelectItem><SelectItem value="REGISTRATION">Đăng ký sự kiện</SelectItem><SelectItem value="AWARENESS">Nhận diện thương hiệu</SelectItem></SelectContent></Select>} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="create-tags">Tags</Label><div className="flex gap-2"><Input id="create-tags" value={tagInput} maxLength={24} disabled={tags.length >= 5} placeholder={tags.length >= 5 ? "Đã đạt tối đa 5 tags" : "Nhập tag rồi nhấn Enter"} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} /><Button type="button" variant="outline" disabled={!tagInput.trim() || tags.length >= 5} onClick={addTag}>Thêm</Button></div><div className="flex min-h-7 flex-wrap gap-2">{tags.map((tag) => <Badge key={tag} variant="secondary" className="gap-1.5"><Tag className="size-3" />{tag}<button type="button" aria-label={`Xóa tag ${tag}`} onClick={() => onTagsChange(tags.filter((item) => item !== tag))}><X className="size-3" /></button></Badge>)}</div>{errors.tags ? <p className="text-xs text-destructive">{errors.tags.message}</p> : <p className="text-xs text-muted-foreground">Tối đa 5 tags, mỗi tag 24 ký tự.</p>}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><LayoutTemplate className="size-4.5" /></span><div><CardTitle>Template khởi tạo</CardTitle><CardDescription>Chọn cấu trúc phù hợp với chiến dịch.</CardDescription></div></div></CardHeader>
            <CardContent><Controller control={control} name="template" render={({ field }) => <div className="grid gap-3 sm:grid-cols-2">{[{ value: "BLANK", label: "Trang trống", note: "Bắt đầu từ đầu" }, { value: "PRODUCT_LAUNCH", label: "Ra mắt sản phẩm", note: "Hero, benefits, CTA" }, { value: "EVENT", label: "Sự kiện", note: "Agenda, speaker, đăng ký" }, { value: "LEAD_CAPTURE", label: "Thu thập leads", note: "Form và social proof" }].map((item) => <button key={item.value} type="button" className={`rounded-xl border p-4 text-left transition ${field.value === item.value ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "hover:border-primary/40"}`} onClick={() => field.onChange(item.value)}><span className="text-sm font-semibold">{item.label}</span><span className="mt-1 block text-xs text-muted-foreground">{item.note}</span></button>)}</div>} /></CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Rocket className="size-4.5" /></span><div><CardTitle>Xuất bản</CardTitle><CardDescription>Chọn trạng thái ngay sau khi tạo.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="create-status">Trạng thái ban đầu</Label><Controller control={control} name="status" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="create-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Draft — tiếp tục chỉnh sửa</SelectItem><SelectItem value="PUBLISHED">Published — xuất bản ngay</SelectItem></SelectContent></Select>} /></div>
              {status === "PUBLISHED" ? <Alert><Info /><AlertDescription>Trang sẽ được tạo trước, sau đó chuyển sang Published qua API cập nhật trạng thái.</AlertDescription></Alert> : null}
            </CardContent>
          </Card>

          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" asChild><Link href="/landing-pages">Hủy</Link></Button><Button type="submit" size="lg" disabled={pending}>{pending ? <><LoaderCircle className="animate-spin" /> Đang tạo...</> : status === "PUBLISHED" ? <><Globe2 /> Tạo và xuất bản</> : <><Save /> Tạo bản nháp</>}</Button></div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card className="overflow-hidden py-0 shadow-none">
            <div className="flex h-36 items-center justify-center border-b bg-[radial-gradient(circle_at_top,hsl(var(--primary)/.2),hsl(var(--surface))_65%)]"><div className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-background/80 shadow-sm"><Eye className="size-5 text-primary" /></span><p className="mt-3 text-xs font-medium text-muted-foreground">Live preview</p></div></div>
            <CardContent className="space-y-3 py-5"><div className="flex items-center justify-between gap-3"><p className="truncate font-semibold">{name || "Tên landing page"}</p><Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>{status === "PUBLISHED" ? "Published" : "Draft"}</Badge></div><p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{description || "Mô tả ngắn của landing page sẽ hiển thị tại đây."}</p><p className="truncate rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">/{slug || "your-page-slug"}</p><div className="flex flex-wrap gap-1.5"><Badge variant="outline"><Layers3 className="size-3" />{category}</Badge><Badge variant="outline"><Target className="size-3" />{objective}</Badge>{tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}</div></CardContent>
          </Card>

          <Card className="gap-4 shadow-none">
            <CardHeader><CardTitle className="text-base">Mức độ sẵn sàng</CardTitle><CardDescription>{readyCount}/{checklist.length} mục hoàn tất</CardDescription></CardHeader>
            <CardContent className="space-y-3">{checklist.map((item) => <div key={item.label} className="flex items-center gap-2 text-sm"><span className={`grid size-5 place-items-center rounded-full ${item.ready ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Check className="size-3" /></span><span className={item.ready ? "text-foreground" : "text-muted-foreground"}>{item.label}</span></div>)}</CardContent>
            <CardFooter className="border-t"><p className="text-xs leading-5 text-muted-foreground">Template: {template}. SEO, content blocks, domain và analytics sẽ được cấu hình sau khi tạo trang.</p></CardFooter>
          </Card>
        </aside>
      </form>
    </div>
  );
}
