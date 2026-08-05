"use client";
import { FormEvent, useEffect, useState } from "react";
import { Bell, Paintbrush, Save } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useSettings, useUpdateSettings } from "@/features/workspace-api/hooks";

export default function SettingsPage() {
  const query = useSettings();
  const update = useUpdateSettings();
  const [notifications, setNotifications] = useState({
    notificationEmail: true,
    notificationLeads: true,
    notificationPublish: true,
  });
  useEffect(() => {
    if (query.data)
      setNotifications({
        notificationEmail: query.data.notificationEmail,
        notificationLeads: query.data.notificationLeads,
        notificationPublish: query.data.notificationPublish,
      });
  }, [query.data]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update.mutate({
      workspaceName: String(form.get("workspaceName")),
      logoUrl: String(form.get("logoUrl") || "") || null,
      primaryColor: String(form.get("primaryColor")),
      ...notifications,
    });
  };
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Cài đặt"
        description="Cấu hình nhận diện và thông báo của workspace."
      />
      <form className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]" onSubmit={submit}>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="size-5 text-primary" /> Nhận diện workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Tên workspace</Label>
              <Input
                id="workspace-name"
                name="workspaceName"
                required
                minLength={2}
                defaultValue={query.data?.workspaceName ?? "LandingCraft Workspace"}
                key={`name-${query.data?.workspaceName}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-logo">Logo URL</Label>
              <Input
                id="workspace-logo"
                name="logoUrl"
                type="url"
                defaultValue={query.data?.logoUrl ?? ""}
                key={`logo-${query.data?.logoUrl}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-color">Màu thương hiệu</Label>
              <div className="flex gap-3">
                <Input
                  id="workspace-color-picker"
                  type="color"
                  className="w-14 p-1"
                  defaultValue={query.data?.primaryColor ?? "#13795B"}
                  onChange={(event) => {
                    const target = document.getElementById(
                      "workspace-color",
                    ) as HTMLInputElement | null;
                    if (target) target.value = event.target.value.toUpperCase();
                  }}
                />
                <Input
                  id="workspace-color"
                  name="primaryColor"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  defaultValue={query.data?.primaryColor ?? "#13795B"}
                  key={`color-${query.data?.primaryColor}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "notificationEmail" as const, label: "Email hệ thống" },
              { key: "notificationLeads" as const, label: "Có lead mới" },
              { key: "notificationPublish" as const, label: "Trang được xuất bản" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={notifications[item.key]}
                  onChange={(event) =>
                    setNotifications((current) => ({
                      ...current,
                      [item.key]: event.target.checked,
                    }))
                  }
                />
              </label>
            ))}
            {update.isSuccess ? (
              <Alert>
                <AlertDescription>Đã lưu cài đặt workspace.</AlertDescription>
              </Alert>
            ) : null}
            {update.error ? (
              <Alert variant="destructive">
                <AlertDescription>{update.error.message}</AlertDescription>
              </Alert>
            ) : null}
            <Button className="w-full" disabled={update.isPending || query.isLoading}>
              <Save /> {update.isPending ? "Đang lưu..." : "Lưu cài đặt"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
