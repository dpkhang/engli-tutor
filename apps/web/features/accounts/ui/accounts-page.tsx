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
  useActionDialog,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { authClient, useSession } from "@/lib/auth-client";

export default function AccountsPage() {
  const dialog = useActionDialog();
  const { data } = useSession();
  const user = data?.user;

  const signOut = async () => {
    const accepted = await dialog.confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to continue managing the workspace.",
      confirmLabel: "Sign out",
      tone: "danger",
    });
    if (!accepted) return;
    void authClient.signOut().then(() => window.location.assign("/login"));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal"
        title="Account"
        description="View your profile, security status, and current sign-in session."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account-name">Full name</Label>
              <Input id="account-name" value={user?.name ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={user?.email ?? ""} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">
              Profile update API is not enabled yet. Details are loaded from your Better Auth session.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" /> Email
                </span>
                <Badge variant="secondary">Linked</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <KeyRound className="size-4" /> Password
                </span>
                <Badge variant="outline">In use</Badge>
              </div>
            </CardContent>
          </Card>
          <Button type="button" variant="outline" className="w-full" onClick={() => void signOut()}>
            Sign out of this session
          </Button>
        </div>
      </div>
    </div>
  );
}
