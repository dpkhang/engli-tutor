"use client";
import { FormEvent } from "react";
import { Globe2, LockKeyhole, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardContent, Input, Label } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { domainHooks } from "@/features/workspace-api/hooks";

export default function DomainsPage() {
  const query = domainHooks.useList(); const create = domainHooks.useCreate(); const remove = domainHooks.useDelete();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); create.mutate({ hostname: String(form.get("hostname")).trim().toLowerCase() }, { onSuccess: () => event.currentTarget.reset() }); };
  return <div className="space-y-8"><PageHeader eyebrow="Publishing" title="Tên miền" description="Kết nối và theo dõi custom domains của workspace." />
    <Card className="shadow-none"><CardContent><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}><div className="flex-1 space-y-2"><Label htmlFor="domain-hostname">Hostname</Label><Input id="domain-hostname" name="hostname" required placeholder="campaign.example.com" /></div><Button disabled={create.isPending}><Plus /> Thêm domain</Button></form>{create.error ? <p className="mt-3 text-sm text-destructive">{create.error.message}</p> : null}</CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">{query.data?.map((domain) => <Card key={domain.id} className="gap-4 shadow-none"><CardContent className="space-y-4"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Globe2 className="size-5" /></span><Badge variant={domain.status === "VERIFIED" ? "default" : domain.status === "FAILED" ? "destructive" : "secondary"}>{domain.status}</Badge></div><div><h2 className="font-semibold">{domain.hostname}</h2><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" />SSL {domain.sslEnabled ? "đã bật" : "chưa bật"}</p></div><Button variant="outline" size="sm" className="w-full" onClick={() => remove.mutate(domain.id)}><Trash2 /> Gỡ domain</Button></CardContent></Card>)}</div>{!query.data?.length ? <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Chưa kết nối domain.</p> : null}</div>;
}
