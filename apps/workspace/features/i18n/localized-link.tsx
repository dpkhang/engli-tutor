"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getPathLocale, withLocalePath } from "@/lib/locale-path";

type Props = Omit<LinkProps, "href"> & {
  href: string;
  children: ReactNode;
  className?: string;
};

export function LocalizedLink({ href, children, ...props }: Props) {
  const pathname = usePathname();
  return <Link href={withLocalePath(href, getPathLocale(pathname))} {...props}>{children}</Link>;
}
