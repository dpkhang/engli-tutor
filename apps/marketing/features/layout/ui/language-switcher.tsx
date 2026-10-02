"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Languages } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import { isLocale, type Locale } from "@engli-tutor/i18n";

function getLocale(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : "en";
}

function localizedPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  return segments.join("/") || `/${locale}`;
}

export function LanguageSwitcher({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const currentLocale = getLocale(pathname);

  return (
    <div className="flex items-center gap-1 rounded-full border border-current/20 p-1 text-xs" aria-label="Language">
      <Languages className="mx-1 size-3.5 opacity-70" aria-hidden />
      {(["en", "vi"] as const).map((locale) => (
        <Link
          key={locale}
          href={localizedPath(pathname, locale)}
          aria-current={locale === currentLocale ? "page" : undefined}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-full px-2 font-medium transition-colors",
            locale === currentLocale
              ? transparent
                ? "bg-white/20 text-white"
                : "bg-muted text-foreground"
              : transparent
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {locale.toUpperCase()}
          {locale === currentLocale ? <Check className="size-3" aria-hidden /> : null}
        </Link>
      ))}
    </div>
  );
}
