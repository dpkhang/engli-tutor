import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthGate } from "@/providers/auth-gate";
import { AppShell, GlobalNavigationLoading, SignOutLoadingProvider } from "@/features/layout";
import { AppearanceProvider } from "@/features/settings";
import { ActionDialogProvider, CookieConsentBanner, ToastProvider } from "@engli-tutor/ui";
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
            __html: `(function(){try{var r=document.documentElement;var t=localStorage.getItem('pagecraft-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';var a=localStorage.getItem('englitutor-accent');if(a)r.setAttribute('data-accent',a);var s=localStorage.getItem('englitutor-text-size');if(s)r.setAttribute('data-text-size',s);var m=localStorage.getItem('englitutor-reduce-motion');if(m)r.setAttribute('data-reduce-motion',m);r.classList.toggle('reduce-motion',m==='on')}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AppearanceProvider>
            <ActionDialogProvider>
              <ToastProvider>
                <SignOutLoadingProvider>
                  <Suspense fallback={null}>
                    <GlobalNavigationLoading />
                  </Suspense>
                  <AuthGate>
                    <AppShell>{children}</AppShell>
                  </AuthGate>
                  <CookieConsentBanner policyHref="/policy/cookies" />
                </SignOutLoadingProvider>
              </ToastProvider>
            </ActionDialogProvider>
          </AppearanceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
