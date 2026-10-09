"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { getPathLocale, withLocalePath } from "@/lib/locale-path";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** Drop-in for next/link that keeps the current /en or /vi prefix on internal paths. */
export function LocalizedLink({ href, ...props }: Props) {
  const pathname = usePathname();
  return <Link href={withLocalePath(href, getPathLocale(pathname))} {...props} />;
}
