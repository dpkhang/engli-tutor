"use client";

import { useState } from "react";
import { Check, Copy, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
} from "@landing-page-generator/ui";
import { domainHooks } from "../hooks";
import type { Domain } from "../api";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-2.5 py-1.5 font-mono text-xs">
          {value}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

export function DomainVerificationPanel({
  domain,
  onClose,
}: {
  domain: Domain;
  onClose?: () => void;
}) {
  const verification = domainHooks.useVerification(domain.id);
  const verify = domainHooks.useVerify();
  const instructions = verification.data?.instructions;
  const dnsMessage = verify.data?.dns?.message ?? verify.error?.message;
  const isSubdomain = instructions?.kind === "subdomain";

  if (domain.source === "PURCHASED") {
    return (
      <Card className="shadow-none">
        <CardContent className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">
            Purchased domains are verified automatically after payment. Use the DNS/SSL check button if still
            pending.
          </p>
          <div className="flex gap-2">
            <Button size="sm" disabled={verify.isPending} onClick={() => verify.mutate(domain.id)}>
              {verify.isPending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
              Check status
            </Button>
            {onClose ? (
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-none">
      <CardContent className="space-y-4 py-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Verify — {domain.hostname}</p>
              {instructions ? (
                <Badge variant="outline">
                  {isSubdomain ? "Subdomain · CNAME" : "Apex · TXT"}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isSubdomain
                ? "Only one CNAME record is needed to point the subdomain to Pagecraft."
                : "Apex domains need TXT. Prefer a subdomain (lp.brand.com) for simpler setup."}
            </p>
          </div>
        </div>

        {verification.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading DNS instructions…</p>
        ) : null}
        {verification.error ? (
          <Alert variant="destructive">
            <AlertDescription>{verification.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {instructions ? (
          <div className="space-y-4">
            {instructions.records.map((record) => (
              <div key={`${record.type}-${record.host}`} className="space-y-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    {record.type} · {record.purpose}
                  </p>
                  <Badge variant={record.required ? "default" : "secondary"}>
                    {record.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <CopyField label="Host / Name (FQDN)" value={record.host} />
                <CopyField label="Host label (DNS UI)" value={record.hostLabel} />
                <CopyField label="Value / Target" value={record.value} />
              </div>
            ))}
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {instructions.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              {instructions.skipDns ? (
                <li>This environment has DOMAIN_VERIFY_SKIP_DNS enabled (skips real DNS).</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {dnsMessage ? (
          <Alert variant={verify.data?.dns?.ok ? "default" : "destructive"}>
            <AlertDescription>{dnsMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={verify.isPending || verification.isLoading}
            onClick={() => verify.mutate(domain.id)}
          >
            {verify.isPending ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
            {isSubdomain ? "Verify CNAME" : "Verify TXT"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={verification.isFetching}
            onClick={() => void verification.refetch()}
          >
            <RefreshCw /> Refresh instructions
          </Button>
          {onClose ? (
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
