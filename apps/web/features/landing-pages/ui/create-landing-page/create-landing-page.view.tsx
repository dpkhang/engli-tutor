"use client";

import { useState } from "react";
import Link from "next/link";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
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
  Sparkles,
  Tag,
  Target,
  WandSparkles,
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
  cn,
} from "@landing-page-generator/ui";
import type {
  CreateLandingPageAdvancedValues,
  GenerateLandingPageFormValues,
} from "../../model/schema";
import {
  FUNNEL_LABEL,
  PAGE_FRAMES,
  getPageFrameById,
  type PageFrame,
} from "../../model/page-frames";
import { FrameGallery, FramePreview } from "./frame-gallery";

export type CreateMode = "ai" | "manual";
export type WizardStep = 1 | 2 | 3 | 4;

type Props = {
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  selectedFrameId: string | null;
  onSelectFrame: (id: string) => void;
  frameError: string | null;
  draftRestored?: boolean;
  onDiscardDraft?: () => void;
  openaiReady: boolean;
  openaiUnknown: boolean;
  creditBalance: number | null;
  aiGenerateCost: number;
  hasEnoughCredits: boolean;
  creditsLoading: boolean;
  registerManual: UseFormRegister<CreateLandingPageAdvancedValues>;
  controlManual: Control<CreateLandingPageAdvancedValues>;
  errorsManual: FieldErrors<CreateLandingPageAdvancedValues>;
  registerAi: UseFormRegister<GenerateLandingPageFormValues>;
  controlAi: Control<GenerateLandingPageFormValues>;
  errorsAi: FieldErrors<GenerateLandingPageFormValues>;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  description: string;
  category: CreateLandingPageAdvancedValues["category"];
  objective: CreateLandingPageAdvancedValues["objective"];
  template: CreateLandingPageAdvancedValues["template"];
  tags: string[];
  brief: string;
  audience: string;
  tone: GenerateLandingPageFormValues["tone"];
  language: GenerateLandingPageFormValues["language"];
  pending: boolean;
  draftSaving: boolean;
  draftSaved: boolean;
  error: string | null;
  onTagsChange: (tags: string[]) => void;
  onNextStep: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const TONE_LABEL: Record<GenerateLandingPageFormValues["tone"], string> = {
  professional: "Chuyên nghiệp",
  friendly: "Thân thiện",
  bold: "Mạnh mẽ",
  luxury: "Cao cấp",
  playful: "Vui tươi",
};

const WIZARD_STEPS: {
  step: WizardStep;
  label: string;
  body: string;
  cta: string;
}[] = [
  {
    step: 1,
    label: "Mô tả chiến dịch",
    body: "Tên, brief, audience và giọng điệu.",
    cta: "Tiếp: chọn khung",
  },
  {
    step: 2,
    label: "Chọn khung trang",
    body: "Áp layout phù hợp funnel của bạn.",
    cta: "Tiếp: review",
  },
  {
    step: 3,
    label: "Review",
    body: "Kiểm tra toàn bộ cấu hình trước khi tạo trang.",
    cta: "Tiếp: tạo trang",
  },
  {
    step: 4,
    label: "Tạo trang",
    body: "Xác nhận chi phí và bắt đầu AI generate.",
    cta: "Tạo trang",
  },
];

type WizardStepperProps = {
  step: WizardStep;
  pending: boolean;
  canSubmit: boolean;
  draftSaving: boolean;
  draftSaved: boolean;
  onStepChange: (step: WizardStep) => void;
  onNextStep: () => void;
  onSaveDraft: () => void;
};

function WizardStepper({
  step,
  pending,
  canSubmit,
  draftSaving,
  draftSaved,
  onStepChange,
  onNextStep,
  onSaveDraft,
}: WizardStepperProps) {
  const current = WIZARD_STEPS.find((item) => item.step === step)!;

  return (
    <div className="sticky top-20 z-20 space-y-4 rounded-2xl border bg-background/95 p-4 shadow-sm backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Quy trình tạo trang
        </p>
        <Badge variant="secondary" className="tabular-nums">
          Bước {step}/4
        </Badge>
      </div>

      <ol className="grid gap-4 sm:grid-cols-4 sm:gap-0">
        {WIZARD_STEPS.map((item, index) => {
          const active = step === item.step;
          const done = step > item.step;
          const reachable = done || active;
          const isLast = index === WIZARD_STEPS.length - 1;
          return (
            <li key={item.step} className="min-w-0 sm:px-0">
              <button
                type="button"
                disabled={!done || pending}
                onClick={() => {
                  if (done) onStepChange(item.step);
                }}
                className={cn(
                  "w-full min-w-0 rounded-xl p-2.5 text-left transition",
                  active && "bg-primary/10 ring-1 ring-primary/30",
                  done && !active && "hover:bg-muted/70",
                  !reachable && "opacity-50",
                  done ? "cursor-pointer" : "cursor-default",
                )}
                aria-current={active ? "step" : undefined}
              >
                {/* Circle + connector share one row → line always centered on circles */}
                <div className="flex items-center">
                  <span
                    className={cn(
                      "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold tabular-nums",
                      (active || done) &&
                        "border-primary bg-primary text-primary-foreground shadow-sm",
                      !active &&
                        !done &&
                        "border-muted-foreground/25 bg-background text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={2.5} /> : item.step}
                  </span>
                  {!isLast ? (
                    <span
                      aria-hidden
                      className={cn(
                        "mx-3 hidden h-0.5 min-w-0 flex-1 sm:block",
                        done ? "bg-primary" : "bg-border",
                      )}
                    />
                  ) : (
                    <span aria-hidden className="hidden flex-1 sm:block" />
                  )}
                </div>
                <span className="mt-2.5 block min-w-0 space-y-0.5 sm:pr-4">
                  <span
                    className={cn(
                      "block text-[11px] font-bold tracking-[0.14em] uppercase",
                      active || done ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    Bước 0{item.step}
                  </span>
                  <span
                    className={cn(
                      "block text-sm font-semibold leading-snug",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="hidden text-xs leading-5 text-muted-foreground sm:line-clamp-2">
                    {item.body}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{current.label}</span>
          <span className="mx-1.5 text-border">·</span>
          {current.body}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {step < 4 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || draftSaving}
              onClick={onSaveDraft}
            >
              {draftSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
              {draftSaving ? "Đang lưu..." : draftSaved ? "Đã lưu bản nháp" : "Lưu bản nháp"}
            </Button>
          ) : null}
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => onStepChange((step - 1) as WizardStep)}
            >
              <ArrowLeft /> Quay lại
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href="/landing-pages">Hủy</Link>
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" size="sm" disabled={pending} onClick={onNextStep}>
              {current.cta} <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={pending || !canSubmit} form="create-landing-form">
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <WandSparkles /> {current.cta}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateLandingPageView({
  mode,
  onModeChange,
  step,
  onStepChange,
  selectedFrameId,
  onSelectFrame,
  frameError,
  draftRestored = false,
  onDiscardDraft,
  openaiReady,
  openaiUnknown,
  creditBalance,
  aiGenerateCost,
  hasEnoughCredits,
  creditsLoading,
  registerManual,
  controlManual,
  errorsManual,
  registerAi,
  controlAi,
  errorsAi,
  name,
  slug,
  status,
  description,
  category,
  objective,
  template,
  tags,
  brief,
  audience,
  tone,
  language,
  pending,
  draftSaving,
  draftSaved,
  error,
  onTagsChange,
  onNextStep,
  onSaveDraft,
  onSubmit,
}: Props) {
  const [tagInput, setTagInput] = useState("");
  const selectedFrame = getPageFrameById(selectedFrameId) ?? null;

  const addTag = () => {
    const value = tagInput.trim().toLocaleLowerCase("vi").replace(/\s+/g, "-");
    if (!value || tags.includes(value) || tags.length >= 5) return;
    onTagsChange([...tags, value]);
    setTagInput("");
  };

  const checklist =
    mode === "ai"
      ? [
          { label: "Tên trang hợp lệ", ready: name.trim().length >= 3 },
          { label: "Slug hợp lệ", ready: /^[a-z0-9-]{3,120}$/.test(slug) },
          { label: "Mô tả đủ chi tiết", ready: brief.trim().length >= 20 },
          { label: "Đã chọn khung trang", ready: Boolean(selectedFrame) },
          { label: "OpenAI sẵn sàng", ready: openaiReady },
          {
            label: `Đủ credit (≥ ${aiGenerateCost})`,
            ready: !creditsLoading && hasEnoughCredits,
          },
        ]
      : [
          { label: "Tên trang hợp lệ", ready: name.trim().length >= 3 },
          { label: "Slug hợp lệ", ready: /^[a-z0-9-]{3,120}$/.test(slug) },
          { label: "Chọn trạng thái ban đầu", ready: Boolean(status) },
        ];
  const readyCount = checklist.filter((item) => item.ready).length;
  const canSubmitAi =
    (openaiReady || openaiUnknown) &&
    (creditsLoading || hasEnoughCredits) &&
    Boolean(selectedFrame);

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/landing-pages">
            <ArrowLeft /> Quay lại Landing pages
          </Link>
        </Button>
        <header className="space-y-2">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Create</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            Tạo landing page mới
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Bốn bước từ brief tới demo: mô tả chiến dịch, chọn khung trang, review rồi tạo bằng AI.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "ai" ? "default" : "outline"}
            onClick={() => onModeChange("ai")}
          >
            <WandSparkles /> Tạo bằng AI
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => onModeChange("manual")}
          >
            <FileText /> Trang trống
          </Button>
        </div>

        {mode === "ai" ? (
          <WizardStepper
            step={step}
            pending={pending}
            canSubmit={canSubmitAi}
            draftSaving={draftSaving}
            draftSaved={draftSaved}
            onStepChange={onStepChange}
            onNextStep={onNextStep}
            onSaveDraft={onSaveDraft}
          />
        ) : null}

        {mode === "ai" && draftRestored ? (
          <Alert>
            <Info />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>
                Đã khôi phục bản nháp chưa hoàn thành (đồng bộ server — gồm bước và khung đã chọn).
              </span>
              {onDiscardDraft ? (
                <Button type="button" variant="outline" size="sm" onClick={onDiscardDraft}>
                  Xóa bản nháp
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <form
        id="create-landing-form"
        onSubmit={onSubmit}
        className={cn(
          "grid items-start gap-6",
          mode === "manual" && "lg:grid-cols-[1.45fr_1fr]",
        )}
      >
        <div className="space-y-6">
          {mode === "ai" ? (
            <>
              {!openaiUnknown && !openaiReady ? (
                <Alert variant="destructive">
                  <Info />
                  <AlertDescription>
                    Backend production chưa cấu hình{" "}
                    <code className="font-mono">OPENAI_API_KEY</code>. Thêm biến này vào Environment
                    của service Render, redeploy API rồi refresh trang.
                  </AlertDescription>
                </Alert>
              ) : null}

              {!creditsLoading && !hasEnoughCredits ? (
                <Alert variant="destructive">
                  <Info />
                  <AlertDescription>
                    Không đủ credit (cần {aiGenerateCost}, còn {creditBalance ?? 0}).{" "}
                    <Link href="/payments" className="underline">
                      Nạp credit bằng thẻ
                    </Link>
                    .
                  </AlertDescription>
                </Alert>
              ) : null}

              {!creditsLoading && step === 4 ? (
                <Alert>
                  <Info />
                  <AlertDescription>
                    Chi phí AI generate: <strong>{aiGenerateCost} credit</strong> · Số dư:{" "}
                    <strong>{creditBalance ?? 0}</strong>
                  </AlertDescription>
                </Alert>
              ) : null}

              {step === 1 ? (
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="size-4.5" />
                      </span>
                      <div>
                        <CardTitle>01 · Mô tả chiến dịch</CardTitle>
                        <CardDescription>
                          AI sẽ tạo hero, benefits, CTA và các section phù hợp từ brief của bạn.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="ai-name">Tên landing page</Label>
                      <Input
                        id="ai-name"
                        placeholder="Summer Campaign 2026"
                        aria-invalid={Boolean(errorsAi.name)}
                        {...registerAi("name")}
                      />
                      {errorsAi.name ? (
                        <p className="text-xs text-destructive">{errorsAi.name.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-slug">Slug</Label>
                      <div className="flex items-center rounded-md border bg-muted/35 pl-3 focus-within:ring-2 focus-within:ring-ring/40">
                        <Link2 className="size-4 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">/</span>
                        <Input
                          id="ai-slug"
                          placeholder="summer-campaign-2026"
                          className="border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                          aria-invalid={Boolean(errorsAi.slug)}
                          {...registerAi("slug")}
                        />
                      </div>
                      {errorsAi.slug ? (
                        <p className="text-xs text-destructive">{errorsAi.slug.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-brief">Mô tả mong muốn</Label>
                      <textarea
                        id="ai-brief"
                        rows={6}
                        placeholder="Ví dụ: Landing page ra mắt app học tiếng Anh cho sinh viên, nhấn mạnh luyện speaking với AI, CTA đăng ký dùng thử miễn phí 7 ngày..."
                        className="flex w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-invalid={Boolean(errorsAi.brief)}
                        {...registerAi("brief")}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Tối thiểu 20 ký tự.</p>
                        <span className="text-xs text-muted-foreground">{brief.length}/4000</span>
                      </div>
                      {errorsAi.brief ? (
                        <p className="text-xs text-destructive">{errorsAi.brief.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-audience">Đối tượng / offer (tuỳ chọn)</Label>
                      <Input
                        id="ai-audience"
                        placeholder="Sinh viên, dùng thử 7 ngày miễn phí..."
                        aria-invalid={Boolean(errorsAi.audience)}
                        {...registerAi("audience")}
                      />
                      {errorsAi.audience ? (
                        <p className="text-xs text-destructive">{errorsAi.audience.message}</p>
                      ) : null}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ai-tone">Giọng điệu</Label>
                        <Controller
                          control={controlAi}
                          name="tone"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger id="ai-tone" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(TONE_LABEL) as Array<keyof typeof TONE_LABEL>).map(
                                  (value) => (
                                    <SelectItem key={value} value={value}>
                                      {TONE_LABEL[value]}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-language">Ngôn ngữ</Label>
                        <Controller
                          control={controlAi}
                          name="language"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger id="ai-language" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {step === 2 ? (
                <Card id="frame-selection" className="scroll-mt-24 shadow-none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <LayoutTemplate className="size-4.5" />
                      </span>
                      <div>
                        <CardTitle>02 · Chọn khung trang</CardTitle>
                        <CardDescription>
                          Mỗi khung map tới layout recipe cố định (preset + section variants).
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FrameGallery
                      frames={PAGE_FRAMES}
                      selectedId={selectedFrameId}
                      onSelect={onSelectFrame}
                      error={frameError}
                    />
                  </CardContent>
                </Card>
              ) : null}

              {step === 3 ? (
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Rocket className="size-4.5" />
                      </span>
                      <div>
                        <CardTitle>03 · Review trước khi tạo</CardTitle>
                        <CardDescription>
                          Kiểm tra brief, khung trang và mức độ sẵn sàng. Nút Tạo trang chỉ chạy
                          sau bước này.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3 rounded-xl border p-4">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Chiến dịch
                        </p>
                        <p className="font-semibold">{name || "—"}</p>
                        <p className="font-mono text-xs text-muted-foreground">/{slug || "—"}</p>
                        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                          {brief || "—"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline">{TONE_LABEL[tone]}</Badge>
                          <Badge variant="outline">
                            {language === "vi" ? "Tiếng Việt" : "English"}
                          </Badge>
                          {audience ? (
                            <Badge variant="secondary" className="max-w-full truncate">
                              {audience}
                            </Badge>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-2"
                          onClick={() => onStepChange(1)}
                        >
                          Sửa brief
                        </Button>
                      </div>
                      <div className="space-y-3 rounded-xl border p-4">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Khung trang
                        </p>
                        {selectedFrame ? (
                          <FrameSummary frame={selectedFrame} />
                        ) : (
                          <p className="text-sm text-destructive">Chưa chọn khung trang.</p>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-2"
                          onClick={() => onStepChange(2)}
                        >
                          Đổi khung
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Mức độ sẵn sàng</p>
                        <Badge variant={readyCount === checklist.length ? "default" : "secondary"}>
                          {readyCount}/{checklist.length} hoàn tất
                        </Badge>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {checklist.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-sm">
                            <span
                              className={cn(
                                "grid size-5 place-items-center rounded-full",
                                item.ready
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Check className="size-3" />
                            </span>
                            <span className={item.ready ? "text-foreground" : "text-muted-foreground"}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {step === 4 ? (
                <Card className="border-primary/30 shadow-none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <Rocket className="size-5" />
                      </span>
                      <div>
                        <CardTitle>04 · Tạo landing page</CardTitle>
                        <CardDescription>
                          Review đã hoàn tất. Xác nhận để AI bắt đầu tạo nội dung và mở trang demo.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
                      <div><p className="text-xs text-muted-foreground">Landing page</p><p className="mt-1 font-semibold">{name}</p></div>
                      <div><p className="text-xs text-muted-foreground">Khung trang</p><p className="mt-1 font-semibold">{selectedFrame?.name ?? "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Chi phí</p><p className="mt-1 font-semibold">{aiGenerateCost} credit</p></div>
                    </div>
                    <Alert>
                      <Info />
                      <AlertDescription>
                        Chỉ khi bấm <strong>Tạo trang</strong>, hệ thống mới trừ credit và gọi AI generate.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <ManualCreateFields
              registerManual={registerManual}
              controlManual={controlManual}
              errorsManual={errorsManual}
              name={name}
              tags={tags}
              tagInput={tagInput}
              setTagInput={setTagInput}
              addTag={addTag}
              onTagsChange={onTagsChange}
            />
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Bottom CTA — mirror stepper actions after scrolling through the form */}
          <div className="flex flex-col-reverse gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" asChild>
                <Link href="/landing-pages">Hủy</Link>
              </Button>
              {mode === "ai" && step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStepChange((step - 1) as WizardStep)}
                  disabled={pending}
                >
                  <ArrowLeft /> Quay lại
                </Button>
              ) : null}
            </div>
            {mode === "ai" && step < 4 ? (
              <Button type="button" size="lg" onClick={onNextStep} disabled={pending}>
                {WIZARD_STEPS[step - 1]!.cta} <ArrowRight />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={
                  pending ||
                  (mode === "ai" && !canSubmitAi)
                }
              >
                {pending ? (
                  <>
                    <LoaderCircle className="animate-spin" />{" "}
                    {mode === "ai" ? "AI đang tạo..." : "Đang tạo..."}
                  </>
                ) : mode === "ai" ? (
                  <>
                    <WandSparkles /> Tạo trang
                  </>
                ) : status === "PUBLISHED" ? (
                  <>
                    <Globe2 /> Tạo và xuất bản
                  </>
                ) : (
                  <>
                    <Save /> Tạo bản nháp
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {mode === "manual" ? (
          <aside className="space-y-6 lg:sticky lg:top-24">
          <Card className="overflow-hidden py-0 shadow-none">
            <div className="border-b bg-[radial-gradient(circle_at_top,hsl(var(--primary)/.2),hsl(var(--surface))_65%)] p-3">
              <div className="flex h-36 items-center justify-center">
                <div className="text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-background/80 shadow-sm">
                    <Eye className="size-5 text-primary" />
                  </span>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Live preview
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-3 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-semibold">{name || "Tên landing page"}</p>
                <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
                  {status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                {description || "Mô tả ngắn của landing page sẽ hiển thị tại đây."}
              </p>
              <p className="truncate rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                /{slug || "your-page-slug"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">
                    <Layers3 className="size-3" />
                    {category}
                  </Badge>
                  <Badge variant="outline">
                    <Target className="size-3" />
                    {objective}
                  </Badge>
                  {tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Mức độ sẵn sàng</CardTitle>
              <CardDescription>
                {readyCount}/{checklist.length} mục hoàn tất
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`grid size-5 place-items-center rounded-full ${item.ready ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <Check className="size-3" />
                  </span>
                  <span className={item.ready ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t">
              <p className="text-xs leading-5 text-muted-foreground">
                Template: {template}. SEO và content blocks cấu hình sau khi tạo trang.
              </p>
            </CardFooter>
          </Card>
          </aside>
        ) : null}
      </form>
    </div>
  );
}

function FrameSummary({ frame }: { frame: PageFrame }) {
  return (
    <div className="space-y-2">
      <FramePreview frame={frame} className="h-28" />
      <p className="font-semibold">{frame.name}</p>
      <p className="text-xs leading-5 text-muted-foreground">{frame.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{FUNNEL_LABEL[frame.funnel]}</Badge>
        <Badge variant="secondary">{frame.preset}</Badge>
      </div>
    </div>
  );
}

type ManualProps = {
  registerManual: UseFormRegister<CreateLandingPageAdvancedValues>;
  controlManual: Control<CreateLandingPageAdvancedValues>;
  errorsManual: FieldErrors<CreateLandingPageAdvancedValues>;
  name: string;
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  addTag: () => void;
  onTagsChange: (tags: string[]) => void;
};

function ManualCreateFields({
  registerManual,
  controlManual,
  errorsManual,
  name,
  tags,
  tagInput,
  setTagInput,
  addTag,
  onTagsChange,
}: ManualProps) {
  return (
    <>
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4.5" />
            </span>
            <div>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Tên nội bộ và URL của landing page.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="create-name">Tên landing page</Label>
            <Input
              id="create-name"
              placeholder="Summer Campaign 2026"
              aria-invalid={Boolean(errorsManual.name)}
              {...registerManual("name")}
            />
            <div className="flex justify-between gap-3">
              <p className="text-xs text-muted-foreground">Dùng tên dễ nhận biết trong workspace.</p>
              <span className="text-xs text-muted-foreground">{name.length}/120</span>
            </div>
            {errorsManual.name ? (
              <p className="text-xs text-destructive">{errorsManual.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-slug">Slug</Label>
            <div className="flex items-center rounded-md border bg-muted/35 pl-3 focus-within:ring-2 focus-within:ring-ring/40">
              <Link2 className="size-4 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">/</span>
              <Input
                id="create-slug"
                placeholder="summer-campaign-2026"
                className="border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                aria-invalid={Boolean(errorsManual.slug)}
                {...registerManual("slug")}
              />
            </div>
            {errorsManual.slug ? (
              <p className="text-xs text-destructive">{errorsManual.slug.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Layers3 className="size-4.5" />
            </span>
            <div>
              <CardTitle>Phân loại và mục tiêu</CardTitle>
              <CardDescription>Metadata giúp tổ chức và tìm kiếm chiến dịch.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert>
            <Info />
            <AlertDescription>
              Category, tags, mục tiêu và template hiện chỉ lưu trên trình duyệt này, chưa đồng bộ
              backend.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="create-description">Mô tả ngắn</Label>
            <textarea
              id="create-description"
              rows={3}
              placeholder="Mô tả mục đích và nội dung chính của chiến dịch..."
              className="flex w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-invalid={Boolean(errorsManual.description)}
              {...registerManual("description")}
            />
            {errorsManual.description ? (
              <p className="text-xs text-destructive">{errorsManual.description.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-category">Danh mục</Label>
              <Controller
                control={controlManual}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="create-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                      <SelectItem value="EVENT">Sự kiện</SelectItem>
                      <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-objective">Mục tiêu</Label>
              <Controller
                control={controlManual}
                name="objective"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="create-objective" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEADS">Thu thập leads</SelectItem>
                      <SelectItem value="SALES">Tăng doanh số</SelectItem>
                      <SelectItem value="REGISTRATION">Đăng ký sự kiện</SelectItem>
                      <SelectItem value="AWARENESS">Nhận diện thương hiệu</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="create-tags"
                value={tagInput}
                maxLength={24}
                disabled={tags.length >= 5}
                placeholder={tags.length >= 5 ? "Đã đạt tối đa 5 tags" : "Nhập tag rồi nhấn Enter"}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!tagInput.trim() || tags.length >= 5}
                onClick={addTag}
              >
                Thêm
              </Button>
            </div>
            <div className="flex min-h-7 flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1.5">
                  <Tag className="size-3" />
                  {tag}
                  <button
                    type="button"
                    aria-label={`Xóa tag ${tag}`}
                    onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <LayoutTemplate className="size-4.5" />
            </span>
            <div>
              <CardTitle>Template khởi tạo</CardTitle>
              <CardDescription>Chọn cấu trúc phù hợp với chiến dịch.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Controller
            control={controlManual}
            name="template"
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "BLANK", label: "Trang trống", note: "Bắt đầu từ đầu" },
                  {
                    value: "PRODUCT_LAUNCH",
                    label: "Ra mắt sản phẩm",
                    note: "Hero, benefits, CTA",
                  },
                  { value: "EVENT", label: "Sự kiện", note: "Agenda, speaker, đăng ký" },
                  {
                    value: "LEAD_CAPTURE",
                    label: "Thu thập leads",
                    note: "Form và social proof",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`rounded-xl border p-4 text-left transition ${field.value === item.value ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "hover:border-primary/40"}`}
                    onClick={() => field.onChange(item.value)}
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.note}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Rocket className="size-4.5" />
            </span>
            <div>
              <CardTitle>Xuất bản</CardTitle>
              <CardDescription>Chọn trạng thái ngay sau khi tạo.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-status">Trạng thái ban đầu</Label>
            <Controller
              control={controlManual}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="create-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft — tiếp tục chỉnh sửa</SelectItem>
                    <SelectItem value="PUBLISHED">Published — xuất bản ngay</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
