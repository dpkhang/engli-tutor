"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Coins, LoaderCircle, Sparkles } from "lucide-react";
import { Button, Card, CardContent, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { FUNNEL_LABEL } from "@/features/landing-pages/model/page-frames";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import { templateHooks } from "@/features/workspace-api/hooks";

const schema = z.object({
  description: z.string().trim().min(20, "Mô tả ít nhất 20 ký tự").max(2000),
  funnel: z.enum(["LEADS", "SALES", "REGISTRATION", "AWARENESS"]),
});
type Values = z.infer<typeof schema>;

export function GenerateTemplatePage() {
  const router = useRouter();
  const generate = templateHooks.useGenerate();
  const billing = useBillingMe();
  const baseCost = billing.data?.aiGenerateCost ?? 10;
  const minimumCost = billing.data?.aiTemplatePricing?.minimum ?? baseCost;
  const maximumCost = billing.data?.aiTemplatePricing?.maximum ?? baseCost * 3;
  const balance = billing.data?.balance ?? null;
  const hasEnoughCredits = balance == null || balance >= maximumCost;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { description: "", funnel: "LEADS" } });

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/templates"><ArrowLeft /> Quay lại Templates</Link>
      </Button>
      <PageHeader eyebrow="AI Template Studio" title="Tạo template từ mô tả" description="AI thiết kế một layout recipe có thể xem thử và dùng lại cho nhiều landing page." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <Card className="shadow-none">
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(async (values) => {
              try {
                await generate.mutateAsync(values);
                await billing.refetch();
                router.push("/templates");
              } catch {
                void billing.refetch();
              }
            })}>
              <div className="space-y-2">
                <Label htmlFor="ai-template-description">Mô tả template</Label>
                <textarea id="ai-template-description" className="min-h-48 w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Ví dụ: Landing page cho khóa học kỹ năng lãnh đạo, phong cách chuyên nghiệp, tập trung form đăng ký..." {...form.register("description")} />
                <p className="min-h-5 text-xs text-destructive">{form.formState.errors.description?.message}</p>
              </div>
              <div className="max-w-sm space-y-2">
                <Label>Mục tiêu chính</Label>
                <Select value={form.watch("funnel")} onValueChange={(value) => form.setValue("funnel", value as Values["funnel"])}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(FUNNEL_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!hasEnoughCredits ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/35 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  <span className="flex items-center gap-2"><AlertCircle className="size-4" /> Bạn cần thêm {maximumCost - (balance ?? 0)} credit để tạm giữ mức tối đa.</span>
                  <Button variant="outline" size="sm" asChild><Link href="/payments">Nạp credit</Link></Button>
                </div>
              ) : null}
              {generate.isError ? <p className="text-sm text-destructive">{generate.error.message}</p> : null}
              <Button size="lg" disabled={generate.isPending || billing.isLoading || !hasEnoughCredits}>
                {generate.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                {generate.isPending ? "Đang tạo template..." : `Tạo template (${minimumCost}–${maximumCost} credit)`}
              </Button>
            </form>
          </CardContent>
        </Card>
        <aside className="rounded-md bg-foreground p-5 text-background lg:sticky lg:top-6">
          <p className="flex items-center gap-2 text-sm font-medium"><Coins className="size-4" /> Chi phí generation</p>
          <p className="mt-3 text-3xl font-bold">{minimumCost}–{maximumCost}</p>
          <p className="mt-1 text-sm opacity-80">credit / lần tạo</p>
          <div className="mt-5 border-t border-background/20 pt-4">
            <p className="text-xs opacity-70">Số dư hiện tại</p>
            <p className="mt-1 text-lg font-semibold">{billing.isLoading ? "Đang tải..." : `${balance ?? 0} credit`}</p>
          </div>
          <p className="mt-4 text-xs leading-5 opacity-70">Hệ thống tạm giữ mức tối đa, chỉ quyết toán theo nội dung và layout thực tế AI trả về, rồi tự động hoàn phần chưa dùng.</p>
        </aside>
      </div>
    </div>
  );
}
