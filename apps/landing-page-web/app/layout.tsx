import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteShell } from "@/features/layout";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pagecraft — Landing Page Generator",
  description: "Tạo và xuất bản landing page quảng bá nhanh chóng",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${display.variable} ${sans.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
