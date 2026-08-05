import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthGate } from "@/providers/auth-gate";
import { AppShell } from "@/features/layout";
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
  title: "Pagecraft Workspace",
  description: "Quản lý và xuất bản landing page",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pagecraft-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AppShell>
            <AuthGate>{children}</AuthGate>
          </AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
