"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LOCALE_COOKIE, isLocale, type Locale } from "@engli-tutor/i18n";

function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const value = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))?.[1];
  return isLocale(value) ? value : "en";
}

export function WorkspaceLanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useWorkspaceI18n();
  const [locale, setLocale] = useState<Locale>(() => {
    const segment = pathname?.split("/")[1];
    return isLocale(segment) ? segment : readLocale();
  });

  useEffect(() => {
    const sync = () => {
      const segment = pathname?.split("/")[1];
      setLocale(isLocale(segment) ? segment : readLocale());
    };
    window.addEventListener("englitutor-locale-change", sync);
    return () => window.removeEventListener("englitutor-locale-change", sync);
  }, [pathname]);

  const currentLocale = pathname?.split("/")[1];
  const activeLocale = isLocale(currentLocale) ? currentLocale : locale;

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
    window.dispatchEvent(new Event("englitutor-locale-change"));
    const currentPath = pathname ?? "/";
    const currentSegment = currentPath.split("/")[1];
    const withoutLocale = isLocale(currentSegment) ? currentPath.slice(currentSegment.length + 1) || "/" : currentPath;
    router.push(withoutLocale === "/" ? `/${nextLocale}` : `/${nextLocale}${withoutLocale}`);
  };

  const languageName = activeLocale === "vi" ? "Tiếng Việt" : "English";

  return (
    <Select value={activeLocale} onValueChange={(value) => changeLocale(value as Locale)}>
      <SelectTrigger
        size="sm"
        className={cn(
          "h-8 min-w-24 rounded-full border-border/80 bg-background px-3 text-xs font-semibold shadow-none",
          className,
        )}
        aria-label={t("workspace.language")}
        title={t("workspace.changeLanguage")}
      >
        <SelectValue aria-label={languageName}>{languageName}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-32">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="vi">Tiếng Việt</SelectItem>
      </SelectContent>
    </Select>
  );
}
