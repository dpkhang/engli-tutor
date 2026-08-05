"use client";
import { FormEvent } from "react";
import { Mail, Phone, Plus, Trash2, UserRoundCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { leadHooks, useUpdateLead } from "@/features/workspace-api/hooks";
import type { Lead } from "@/features/workspace-api/api";

export default function LeadsPage() {
  const query = leadHooks.useList();
  const create = leadHooks.useCreate();
  const update = useUpdateLead();
  const remove = leadHooks.useDelete();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(
      {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
      },
      { onSuccess: () => event.currentTarget.reset() },
    );
  };
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Growth"
        title="Leads"
        description="Quản lý khách hàng tiềm năng và tiến trình chuyển đổi."
      />
      <Card className="shadow-none">
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
            onSubmit={submit}
          >
            <div className="space-y-2">
              <Label htmlFor="lead-name">Họ tên</Label>
              <Input id="lead-name" name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Điện thoại</Label>
              <Input id="lead-phone" name="phone" />
            </div>
            <Button disabled={create.isPending}>
              <Plus /> Thêm lead
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Cần ít nhất email hoặc số điện thoại.
          </p>
          {create.error ? (
            <p className="mt-2 text-sm text-destructive">{create.error.message}</p>
          ) : null}
        </CardContent>
      </Card>
      <Card className="overflow-hidden py-0 shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Lead</th>
                <th className="p-4">Liên hệ</th>
                <th className="p-4">Nguồn</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data?.map((lead) => (
                <tr key={lead.id}>
                  <td className="p-4">
                    <span className="flex items-center gap-2 font-medium">
                      <UserRoundCheck className="size-4 text-primary" />
                      {lead.name || "Chưa có tên"}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {lead.email ? (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        {lead.email}
                      </span>
                    ) : null}
                    {lead.phone ? (
                      <span className="mt-1 flex items-center gap-1">
                        <Phone className="size-3" />
                        {lead.phone}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">
                      {lead.landingPage?.name || lead.source || "Manual"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Select
                      value={lead.status}
                      onValueChange={(status) =>
                        update.mutate({ id: lead.id, status: status as Lead["status"] })
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"].map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(lead.id)}>
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!query.data?.length ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Chưa có leads.</p>
        ) : null}
      </Card>
    </div>
  );
}
