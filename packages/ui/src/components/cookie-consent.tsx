"use client";

import { useCallback, useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/utils";

export const COOKIE_CONSENT_KEY = "englitutor-cookie-consent";
export const COOKIE_CONSENT_EVENT = "englitutor-cookie-consent";

export type CookieConsentChoice = "accepted" | "necessary";

const CHOICE_LABEL: Record<CookieConsentChoice, string> = {
  accepted: "Accepted",
  necessary: "Necessary only",
};

function isChoice(value: string | null): value is CookieConsentChoice {
  return value === "accepted" || value === "necessary";
}

export function readCookieConsent(): CookieConsentChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return isChoice(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { choice, open: false } }));
}

export function openCookieConsent() {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { open: true } }));
}

export function CookieConsentBanner({ policyHref = "/policy/cookies" }: { policyHref?: string }) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    setChoice(readCookieConsent());
    setReady(true);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ choice?: CookieConsentChoice; open?: boolean }>).detail;
      if (detail?.open) {
        setForced(true);
        return;
      }
      if (detail?.choice) {
        setChoice(detail.choice);
        setForced(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  const decide = useCallback((next: CookieConsentChoice) => {
    writeCookieConsent(next);
    setChoice(next);
    setForced(false);
  }, []);

  if (!ready || (!forced && choice)) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-copy"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_-12px_40px_-18px_rgba(15,23,42,0.35)] sm:p-5">
        <div className="flex gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p id="cookie-consent-title" className="text-sm font-semibold text-foreground">
              Accept cookies
            </p>
            <p id="cookie-consent-copy" className="text-sm leading-relaxed text-muted-foreground">
              We use cookies to keep you signed in and remember learning preferences. We do not use
              advertising cookies.{" "}
              <a
                href={policyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Cookie Policy
              </a>
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => decide("necessary")}>
            Necessary only
          </Button>
          <Button type="button" className="rounded-full" onClick={() => decide("accepted")}>
            Accept cookies
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CookieConsentManageButton({ className }: { className?: string }) {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);

  useEffect(() => {
    setChoice(readCookieConsent());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ choice?: CookieConsentChoice }>).detail;
      if (detail?.choice) setChoice(detail.choice);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-sm text-muted-foreground">
        Current choice:{" "}
        <span className="font-medium text-foreground">
          {choice ? CHOICE_LABEL[choice] : "Not chosen yet"}
        </span>
      </p>
      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={openCookieConsent}>
        Manage cookies
      </Button>
    </div>
  );
}
