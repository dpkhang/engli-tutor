"use client";

import { useState } from "react";
import { Button, Input, Label } from "@landing-page-generator/ui";
import { LoaderCircle } from "lucide-react";
import { workspaceApi } from "@/features/workspace-api/api";

type Props = {
  landingPageId: string;
  slug: string;
  ctaLabel: string | null;
  primaryColor: string;
};

export function DemoLeadForm({ landingPageId, slug, ctaLabel, primaryColor }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    if (!email.trim() && !phone.trim()) {
      setError("Cần email hoặc số điện thoại");
      return;
    }
    setPending(true);
    try {
      await workspaceApi.leads.create({
        name: name.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        landingPageId,
        source: `demo:${slug}`,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được lead");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur"
    >
      <div className="space-y-1.5">
        <Label htmlFor={`lead-name-${landingPageId}`} className="text-white/80">
          Họ tên
        </Label>
        <Input
          id={`lead-name-${landingPageId}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nguyễn Văn A"
          className="border-white/20 bg-white/95 text-foreground"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`lead-email-${landingPageId}`} className="text-white/80">
          Email
        </Label>
        <Input
          id={`lead-email-${landingPageId}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="border-white/20 bg-white/95 text-foreground"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`lead-phone-${landingPageId}`} className="text-white/80">
          Số điện thoại
        </Label>
        <Input
          id={`lead-phone-${landingPageId}`}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="0901234567"
          className="border-white/20 bg-white/95 text-foreground"
        />
      </div>
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-200">Đã gửi lead — kiểm tra mục Leads trong workspace.</p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" /> Đang gửi...
          </>
        ) : (
          (ctaLabel || "Đăng ký ngay")
        )}
      </Button>
    </form>
  );
}
