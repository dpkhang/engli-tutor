"use client";

import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { authClient, useSession } from "@/lib/auth-client";

export default function AccountsPage() {
  const { data } = useSession();
  const user = data?.user;

  const signOut = () => void authClient.signOut().then(() => window.location.assign("/login"));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cá nhân"
        title="Tài khoản"
        description="Xem thông tin hồ sơ, trạng thái bảo mật và phiên đăng nhập hiện tại."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" /> Hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account-name">Họ và tên</Label>
              <Input id="account-name" value={user?.name ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={user?.email ?? ""} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">
              API cập nhật hồ sơ chưa được bật. Thông tin hiện lấy trực tiếp từ phiên Better Auth.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" /> Email
                </span>
                <Badge variant="secondary">Đã liên kết</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <KeyRound className="size-4" /> Mật khẩu
                </span>
                <Badge variant="outline">Đang sử dụng</Badge>
              </div>
            </CardContent>
          </Card>
          <Button type="button" variant="outline" className="w-full" onClick={signOut}>
            Đăng xuất khỏi phiên này
          </Button>
        </div>
      </div>
    </div>
  );
}
