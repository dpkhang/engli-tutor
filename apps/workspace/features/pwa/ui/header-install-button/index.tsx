"use client";

import { useEffect, useRef, useState } from "react";
import { Download, EllipsisVertical, Share } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { useInstallPrompt } from "../../lib/install-prompt";

export function HeaderInstallButton() {
  const t = useWorkspaceI18n();
  const { state, promptInstall } = useInstallPrompt();
  const [hintOpen, setHintOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hintOpen) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setHintOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [hintOpen]);

  if (state !== "prompt" && state !== "android" && state !== "ios") return null;

  const label = state === "android" ? t("workspace.pwaAndroidAction") : t("workspace.pwaInstallAction");

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full text-primary"
        aria-label={label}
        title={label}
        aria-expanded={state === "prompt" ? undefined : hintOpen}
        onClick={() => {
          if (state === "prompt") void promptInstall();
          else setHintOpen((open) => !open);
        }}
      >
        <Download className="size-5" />
      </Button>
      {hintOpen && state !== "prompt" ? (
        <div
          role="dialog"
          aria-label={t("workspace.pwaInstallTitle")}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border bg-background p-3 shadow-lg"
        >
          <p className="text-sm font-semibold">{t("workspace.pwaInstallTitle")}</p>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            {state === "ios" ? (
              <Share className="mt-0.5 size-3.5 shrink-0 text-primary" />
            ) : (
              <EllipsisVertical className="mt-0.5 size-3.5 shrink-0 text-primary" />
            )}
            {state === "ios" ? t("workspace.pwaIosHint") : t("workspace.pwaAndroidHint")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
