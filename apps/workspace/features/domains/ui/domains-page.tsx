"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { LocalizedLink as Link } from "@/features/i18n/localized-link";
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
} from "@engli-tutor/ui";
import { PageHeader } from "@/features/layout";
import { domainHooks } from "../hooks";
import type { Domain } from "../api";
import { DomainVerificationPanel } from "./domain-verification-panel";

const STATUS_CONFIG: Record<
  Domain["status"],
  { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle2 }
> = {
  VERIFIED: { label: "Verified", variant: "default", icon: CheckCircle2 },
  PENDING: { label: "Pending", variant: "secondary", icon: Clock3 },
  REGISTERING: { label: "Registering", variant: "secondary", icon: Clock3 },
  DNS_PENDING: { label: "Awaiting DNS", variant: "secondary", icon: Clock3 },
  FAILED: { label: "Needs attention", variant: "destructive", icon: AlertCircle },
};

export default function DomainsPage() {
  const searchParams = useSearchParams();
  const dialog = useActionDialog();
  const query = domainHooks.useList();
  const create = domainHooks.useCreate();
  const remove = domainHooks.useDelete();
  const confirmCheckout = domainHooks.useConfirmCheckout();
  const confirmedSession = useRef<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const domains = query.data ?? [];
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
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    create.mutate(
      {
        hostname: String(form.get("hostname")).trim().toLowerCase(),
      },
      {
        onSuccess: (domain) => {
          formElement.reset();
          setVerifyingId(domain.id);
        },
      },
    );
  };

  const deleteDomain = async (domain: Domain) => {
    const accepted = await dialog.confirm({
      title: "Remove domain?",
      description: `Domain ${domain.hostname} will no longer be connected to the workspace.`,
      confirmLabel: "Remove domain",
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
        title="Domains"
        description="Connect a domain, attach a published landing page, verify DNS, and track SSL."
        action={
          <Button asChild variant="outline">
            <Link href="/domains/search">
              <Search /> Find a domain to buy
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-3 border-y py-5">
        {[
          { label: "Connected", value: domains.length, icon: Globe2 },
          { label: "Verified", value: verified, icon: ShieldCheck },
          { label: "SSL active", value: sslEnabled, icon: LockKeyhole },
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
              ? "Confirming payment and registering the domain..."
              : confirmCheckout.isError
                ? confirmCheckout.error.message
                : "Payment successful. The domain is being registered and DNS is being configured."}
          </AlertDescription>
        </Alert>
      ) : null}
      {checkoutState === "cancel" && checkoutType === "domain" ? (
        <Alert variant="destructive">
          <AlertDescription>Domain payment was canceled.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Connect an existing domain</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a hostname, verify DNS records and monitor Cloudflare SSL provisioning.
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
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
                placeholder="lp.brand.com or campaign.harrybox.cloud"
                autoComplete="off"
                aria-invalid={Boolean(create.error)}
              />
            </div>
            <div className="grid grid-rows-[1.25rem_2.25rem] gap-2">
              <span className="hidden h-5 sm:block" aria-hidden />
              <Button disabled={create.isPending} className="h-9 w-full sm:w-auto">
                <Plus /> {create.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            DNS verification and SSL provisioning use the configured Cloudflare integration.
          </p>
          <p className="mt-1 min-h-5 text-sm text-destructive" role={create.error ? "alert" : undefined}>
            {create.error?.message ?? ""}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Connected domains</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {query.isLoading ? "Loading..." : `${domains.length} domains in workspace`}
              </p>
            </div>
            {pending > 0 ? <Badge variant="secondary">{pending} need attention</Badge> : null}
          </div>
        </CardHeader>

        {query.error ? (
          <p className="px-5 py-8 text-center text-sm text-destructive">{query.error.message}</p>
        ) : null}

        {!query.isLoading && !query.error && domains.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Globe2 className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">No domain connected</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your first domain will appear here after it is added.
            </p>
          </div>
        ) : null}

        {domains.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div
                className="grid grid-cols-[minmax(260px,1.4fr)_minmax(190px,0.8fr)_minmax(170px,auto)] items-center gap-4 border-b bg-muted/30 px-5 py-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground"
                role="row"
              >
                <span>Domain</span>
                <span>Status / SSL</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y">
          {domains.map((domain) => {
            const status = STATUS_CONFIG[domain.status];
            const StatusIcon = status.icon;
            const sslStatus = domain.sslStatus ?? "NONE";
            const needsVerify =
              domain.status !== "VERIFIED" || sslStatus === "PENDING" || sslStatus === "FAILED";
            const sslLabel = domain.sslEnabled
              ? "SSL active"
              : sslStatus === "PENDING"
                ? "SSL provisioning"
                : sslStatus === "FAILED"
                  ? "SSL error"
                  : "SSL pending verification";
            return (
              <div key={domain.id}>
                <div className="grid min-h-20 grid-cols-[minmax(260px,1.4fr)_minmax(190px,0.8fr)_minmax(170px,auto)] items-center gap-4 px-5 py-4 whitespace-nowrap transition-colors hover:bg-muted/20">
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
                        {domain.source === "PURCHASED" ? "Purchased" : "Existing"}
                        {domain.registrar ? ` · ${domain.registrar.toLowerCase()}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-nowrap items-center gap-2">
                    <Badge variant={status.variant} className="shrink-0 gap-1.5">
                      <StatusIcon className="size-3" /> {status.label}
                    </Badge>
                    <Badge
                      variant={domain.sslEnabled ? "default" : sslStatus === "FAILED" ? "destructive" : "secondary"}
                      className="shrink-0 gap-1.5"
                    >
                      <LockKeyhole className="size-3" />
                      {sslLabel}
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
                        {verifyingId === domain.id
                          ? "Hide"
                          : domain.status === "VERIFIED"
                            ? "Update SSL"
                            : "Verify"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={remove.isPending}
                      aria-label={`Remove ${domain.hostname}`}
                      title="Remove domain"
                      onClick={() => void deleteDomain(domain)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

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
