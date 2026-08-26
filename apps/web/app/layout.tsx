import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthGate } from "@/providers/auth-gate";
import { AppShell } from "@/features/layout";
import { ActionDialogProvider } from "@landing-page-generator/ui";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EngliTutor — Learn English with AI",
  description:
    "Practice listening · speaking · reading · writing with AI chat, quick tips, and mini-games every day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pagecraft-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <ActionDialogProvider>
            <AuthGate>
              <AppShell>{children}</AppShell>
            </AuthGate>
          </ActionDialogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
