"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  LockKeyholeOpen,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useActionDialog,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useLandingPages } from "@/features/landing-pages/hooks/use-landing-pages";
import { domainHooks } from "@/features/workspace-api/hooks";
import type { Domain } from "@/features/workspace-api/api";
import { DomainVerificationPanel } from "./domain-verification-panel";

const STATUS_CONFIG: Record<
  Domain["status"],
  { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle2 }
> = {
  VERIFIED: { label: "Đã xác minh", variant: "default", icon: CheckCircle2 },
  PENDING: { label: "Đang chờ", variant: "secondary", icon: Clock3 },
  REGISTERING: { label: "Đang đăng ký", variant: "secondary", icon: Clock3 },
  DNS_PENDING: { label: "Chờ DNS", variant: "secondary", icon: Clock3 },
  FAILED: { label: "Cần kiểm tra", variant: "destructive", icon: AlertCircle },
};

export default function DomainsPage() {
  const searchParams = useSearchParams();
  const dialog = useActionDialog();
  const pagesQuery = useLandingPages();
  const query = domainHooks.useList();
  const create = domainHooks.useCreate();
  const update = domainHooks.useUpdate();
  const remove = domainHooks.useDelete();
  const setSsl = domainHooks.useSetSsl();
  const confirmCheckout = domainHooks.useConfirmCheckout();
  const confirmedSession = useRef<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [createPageId, setCreatePageId] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const domains = query.data ?? [];
  const publishedPages = useMemo(
    () => (pagesQuery.data ?? []).filter((page) => page.status === "PUBLISHED"),
    [pagesQuery.data],
  );
  const verified = domains.filter((domain) => domain.status === "VERIFIED").length;
  const pending = domains.filter((domain) =>
    ["PENDING", "REGISTERING", "DNS_PENDING", "FAILED"].includes(domain.status),
  ).length;
  const sslEnabled = domains.filter((domain) => domain.sslEnabled).length;
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (
      checkoutState !== "success" ||
      checkoutType !== "domain" ||
      !sessionId ||
      confirmedSession.current === sessionId
    ) {
      return;
    }
    confirmedSession.current = sessionId;
    confirmCheckout.mutate(sessionId);
  }, [checkoutState, checkoutType, sessionId, confirmCheckout]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createPageId) {
      setCreateFormError("Chọn landing page (slug) để gắn với domain.");
      return;
    }
    setCreateFormError(null);
    const form = new FormData(event.currentTarget);
    create.mutate(
      {
        hostname: String(form.get("hostname")).trim().toLowerCase(),
        landingPageId: createPageId,
      },
      {
        onSuccess: (domain) => {
          event.currentTarget.reset();
          setCreatePageId("");
          setVerifyingId(domain.id);
        },
      },
    );
  };

  const deleteDomain = async (domain: Domain) => {
    const accepted = await dialog.confirm({
      title: "Gỡ domain?",
      description: `Domain ${domain.hostname} sẽ không còn kết nối với workspace.`,
      confirmLabel: "Gỡ domain",
      tone: "danger",
    });
    if (accepted) {
      if (verifyingId === domain.id) setVerifyingId(null);
      remove.mutate(domain.id);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Publishing"
        title="Tên miền"
        description="Kết nối domain, gắn landing page đã xuất bản, xác minh DNS và theo dõi SSL."
        action={
          <Button asChild variant="outline">
            <Link href="/domains/search">
              <Search /> Tìm domain để thuê
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-3 border-y py-5">
        {[
          { label: "Đã kết nối", value: domains.length, icon: Globe2 },
          { label: "Đã xác minh", value: verified, icon: ShieldCheck },
          { label: "SSL hoạt động", value: sslEnabled, icon: LockKeyhole },
        ].map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`px-3 sm:px-5 ${index > 0 ? "border-l" : ""}`}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="size-4" />
              <span className="hidden text-xs sm:inline">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{query.isLoading ? "—" : value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">{label}</p>
          </div>
        ))}
      </section>

      {checkoutState === "success" && checkoutType === "domain" ? (
        <Alert>
          <AlertDescription>
            {confirmCheckout.isPending
              ? "Đang xác nhận thanh toán và đăng ký domain..."
              : confirmCheckout.isError
                ? confirmCheckout.error.message
                : "Thanh toán thành công. Domain đang được đăng ký và cấu hình DNS."}
          </AlertDescription>
        </Alert>
      ) : null}
      {checkoutState === "cancel" && checkoutType === "domain" ? (
        <Alert variant="destructive">
          <AlertDescription>Thanh toán domain đã được hủy.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Kết nối domain sẵn có</CardTitle>
          <p className="text-sm text-muted-foreground">
            Hostname sẽ phục vụ đúng slug đã gắn sau khi DNS verified (vd. campaign.brand.com → /p/my-slug).
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-start"
            onSubmit={submit}
          >
            <div className="grid min-w-0 grid-rows-[1.25rem_2.25rem] gap-2">
              <Label htmlFor="domain-hostname" className="h-5 leading-5">
                Hostname
              </Label>
              <Input
                id="domain-hostname"
                name="hostname"
                required
                className="h-9"
                placeholder="lp.brand.com hoặc campaign.pagecraft-ai.site"
                autoComplete="off"
                aria-invalid={Boolean(create.error)}
              />
            </div>
            <div className="grid min-w-0 grid-rows-[1.25rem_2.25rem] gap-2">
              <Label className="h-5 leading-5">Landing page</Label>
              <Select
                value={createPageId || "__none"}
                onValueChange={(value) => {
                  setCreateFormError(null);
                  setCreatePageId(value === "__none" ? "" : value);
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Chọn page + slug" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Chọn page đã publish</SelectItem>
                  {publishedPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name} · /{page.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-rows-[1.25rem_2.25rem] gap-2">
              <span className="hidden h-5 sm:block" aria-hidden />
              <Button disabled={create.isPending || !publishedPages.length} className="h-9 w-full sm:w-auto">
                <Plus /> {create.isPending ? "Đang kết nối..." : "Kết nối"}
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            {publishedPages.length
              ? "Bắt buộc gắn page PUBLISHED. Sau verify, mở https://hostname sẽ render đúng slug."
              : "Chưa có page đã xuất bản — publish ở /demo/[slug], rồi gắn domain."}
          </p>
          <p className="mt-1 min-h-5 text-sm text-destructive" role={create.error || createFormError ? "alert" : undefined}>
            {createFormError ?? create.error?.message ?? ""}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Domain đã kết nối</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {query.isLoading ? "Đang tải..." : `${domains.length} domain trong workspace`}
              </p>
            </div>
            {pending > 0 ? <Badge variant="secondary">{pending} cần xử lý</Badge> : null}
          </div>
        </CardHeader>

        {query.error ? (
          <p className="px-5 py-8 text-center text-sm text-destructive">{query.error.message}</p>
        ) : null}

        {!query.isLoading && !query.error && domains.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Globe2 className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">Chưa kết nối domain</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Domain đầu tiên sẽ xuất hiện tại đây sau khi được thêm.
            </p>
          </div>
        ) : null}

        {domains.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div
                className="grid grid-cols-[minmax(220px,1.25fr)_minmax(180px,0.9fr)_minmax(190px,0.8fr)_minmax(170px,auto)] items-center gap-4 border-b bg-muted/30 px-5 py-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground"
                role="row"
              >
                <span>Domain</span>
                <span>Landing page</span>
                <span>Trạng thái / SSL</span>
                <span className="text-right">Thao tác</span>
              </div>

              <div className="divide-y">
          {domains.map((domain) => {
            const status = STATUS_CONFIG[domain.status];
            const StatusIcon = status.icon;
            const needsVerify = domain.status !== "VERIFIED";
            const canToggleSsl = domain.status === "VERIFIED" || domain.dnsStatus === "ACTIVE";
            const sslBusy = setSsl.isPending && setSsl.variables?.id === domain.id;
            return (
              <div key={domain.id}>
                <div className="grid min-h-20 grid-cols-[minmax(220px,1.25fr)_minmax(180px,0.9fr)_minmax(190px,0.8fr)_minmax(170px,auto)] items-center gap-4 px-5 py-4 whitespace-nowrap transition-colors hover:bg-muted/20">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Globe2 className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      {domain.status === "VERIFIED" ? (
                        <a
                          href={`https://${domain.hostname}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {domain.hostname}
                        </a>
                      ) : (
                        <p className="truncate text-sm font-semibold text-foreground">
                          {domain.hostname}
                        </p>
                      )}
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {domain.source === "PURCHASED" ? "Thuê" : "Sẵn có"}
                        {domain.landingPage
                          ? ` · → /p/${domain.landingPage.slug}`
                          : " · chưa gắn slug"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <Select
                      value={domain.landingPage?.id ?? "__none"}
                      onValueChange={(value) =>
                        update.mutate({
                          id: domain.id,
                          landingPageId: value === "__none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-9 w-full" aria-label="Landing page">
                        <SelectValue placeholder="Chọn page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Chưa gắn</SelectItem>
                        {publishedPages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name} · /{page.slug}
                          </SelectItem>
                        ))}
                        {domain.landingPage &&
                        !publishedPages.some((page) => page.id === domain.landingPage?.id) ? (
                          <SelectItem value={domain.landingPage.id}>
                            {domain.landingPage.name} · /{domain.landingPage.slug} (chưa publish)
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex min-w-0 flex-nowrap items-center gap-2">
                    <Badge variant={status.variant} className="shrink-0 gap-1.5">
                      <StatusIcon className="size-3" /> {status.label}
                    </Badge>
                    <Badge
                      variant={domain.sslEnabled ? "default" : "secondary"}
                      className="shrink-0 gap-1.5"
                    >
                      <LockKeyhole className="size-3" />
                      SSL {domain.sslEnabled ? "Bật" : (domain.sslStatus ?? "NONE") === "PENDING" ? "Chờ" : "Tắt"}
                    </Badge>
                  </div>

                  <div className="flex min-h-9 flex-nowrap items-center justify-end gap-1.5">
                    {needsVerify ? (
                      <Button
                        type="button"
                        variant={verifyingId === domain.id ? "secondary" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() =>
                          setVerifyingId((current) => (current === domain.id ? null : domain.id))
                        }
                      >
                        <ShieldCheck />
                        {verifyingId === domain.id ? "Ẩn" : "Xác minh"}
                      </Button>
                    ) : null}
                    {canToggleSsl ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9"
                        disabled={sslBusy}
                        onClick={() =>
                          setSsl.mutate({ id: domain.id, enabled: !domain.sslEnabled })
                        }
                      >
                        {sslBusy ? (
                          <LoaderCircle className="animate-spin" />
                        ) : domain.sslEnabled ? (
                          <LockKeyholeOpen />
                        ) : (
                          <LockKeyhole />
                        )}
                        {domain.sslEnabled ? "Tắt SSL" : "Bật SSL"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={remove.isPending}
                      aria-label={`Gỡ ${domain.hostname}`}
                      title="Gỡ domain"
                      onClick={() => void deleteDomain(domain)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {setSsl.isError && setSsl.variables?.id === domain.id ? (
                  <div className="flex items-center gap-2 border-t border-destructive/15 bg-destructive/5 px-4 py-2 text-xs text-destructive md:px-5">
                    <AlertCircle className="size-3.5 shrink-0" />
                    Không thể cập nhật SSL: {setSsl.error.message}
                  </div>
                ) : null}
                {update.isError && update.variables?.id === domain.id ? (
                  <div className="flex items-center gap-2 border-t border-destructive/15 bg-destructive/5 px-4 py-2 text-xs text-destructive md:px-5">
                    <AlertCircle className="size-3.5 shrink-0" />
                    Không thể cập nhật landing page: {update.error.message}
                  </div>
                ) : null}

                {verifyingId === domain.id ? (
                  <div className="border-t bg-muted/20 px-4 py-4 sm:px-5">
                    <DomainVerificationPanel
                      domain={domain}
                      onClose={() => setVerifyingId(null)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
