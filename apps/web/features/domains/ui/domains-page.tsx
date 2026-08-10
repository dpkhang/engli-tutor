"use client";

import { type FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Globe2,
  LockKeyhole,
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
  useActionDialog,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { domainHooks } from "@/features/workspace-api/hooks";
import type { Domain } from "@/features/workspace-api/api";

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
  const query = domainHooks.useList();
  const create = domainHooks.useCreate();
  const remove = domainHooks.useDelete();
  const confirmCheckout = domainHooks.useConfirmCheckout();
  const confirmedSession = useRef<string | null>(null);
  const domains = query.data ?? [];
  const verified = domains.filter((domain) => domain.status === "VERIFIED").length;
  const pending = domains.filter((domain) =>
    ["PENDING", "REGISTERING", "DNS_PENDING"].includes(domain.status),
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
    const form = new FormData(event.currentTarget);
    create.mutate(
      { hostname: String(form.get("hostname")).trim().toLowerCase() },
      { onSuccess: () => event.currentTarget.reset() },
    );
  };

  const deleteDomain = async (domain: Domain) => {
    const accepted = await dialog.confirm({
      title: "Gỡ domain?",
      description: `Domain ${domain.hostname} sẽ không còn kết nối với workspace.`,
      confirmLabel: "Gỡ domain",
      tone: "danger",
    });
    if (accepted) remove.mutate(domain.id);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Publishing"
        title="Tên miền"
        description="Kết nối, xác minh và theo dõi SSL cho custom domain của workspace."
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
          <CardTitle>Kết nối domain mới</CardTitle>
          <p className="text-sm text-muted-foreground">
            Nhập hostname đầy đủ, không bao gồm giao thức hoặc đường dẫn.
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}>
            <div className="flex-1 space-y-2">
              <Label htmlFor="domain-hostname">Hostname</Label>
              <Input
                id="domain-hostname"
                name="hostname"
                required
                placeholder="campaign.example.com"
                autoComplete="off"
                aria-invalid={Boolean(create.error)}
              />
            </div>
            <Button disabled={create.isPending} className="sm:w-auto">
              <Plus /> {create.isPending ? "Đang kết nối..." : "Kết nối"}
            </Button>
          </form>
          <p className="mt-2 min-h-5 text-sm text-destructive" role={create.error ? "alert" : undefined}>
            {create.error?.message ?? ""}
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
            {pending > 0 ? <Badge variant="secondary">{pending} đang chờ</Badge> : null}
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

        <div className="divide-y">
          {domains.map((domain) => {
            const status = STATUS_CONFIG[domain.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={domain.id}
                className="relative grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(130px,0.8fr)_auto] sm:items-center sm:px-5"
              >
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
                      <p className="truncate text-sm font-semibold text-foreground">{domain.hostname}</p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {domain.landingPage ? domain.landingPage.name : "Chưa gắn landing page"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-12 sm:pl-0">
                  <Badge variant={status.variant} className="gap-1.5">
                    <StatusIcon className="size-3" /> {status.label}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <LockKeyhole className="size-3" /> SSL {domain.sslEnabled ? "Bật" : "Tắt"}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-4 self-center text-muted-foreground hover:text-destructive sm:static"
                  disabled={remove.isPending}
                  aria-label={`Gỡ ${domain.hostname}`}
                  title="Gỡ domain"
                  onClick={() => void deleteDomain(domain)}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
