import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthGate } from "@/providers/auth-gate";
import { AppShell, GlobalNavigationLoading, PreventZoom, SignOutLoadingProvider } from "@/features/layout";
import { AppearanceProvider } from "@/features/settings";
import { LessonProgressSync } from "@/features/learn/ui/lesson-progress-sync";
import { PushRegistrar } from "@/features/notifications/push-registrar";
import { ServiceWorkerRegistrar } from "@/features/pwa";
import { ActionDialogProvider, ToastProvider } from "@engli-tutor/ui";
import { UpgradeModalProvider } from "@/features/payments/ui/upgrade-modal-provider";
import { WorkspaceI18n } from "@/features/i18n/workspace-i18n";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EngliTutor",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var t=localStorage.getItem('pagecraft-theme');var darkIds={dark:1,midnight:1,forest:1,ocean:1,dusk:1};var resolved=t==='system'||!t?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;if(resolved==='warm'||resolved==='light'||resolved==='dark'||resolved==='midnight'||resolved==='forest'||resolved==='ocean'||resolved==='dusk'){}else{resolved=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var d=!!darkIds[resolved];r.classList.toggle('dark',d);r.classList.remove('midnight');r.setAttribute('data-theme',resolved);r.style.colorScheme=d?'dark':'light';var a=localStorage.getItem('englitutor-accent');if(a)r.setAttribute('data-accent',a);var s=localStorage.getItem('englitutor-text-size');if(s)r.setAttribute('data-text-size',s);var m=localStorage.getItem('englitutor-reduce-motion');if(m)r.setAttribute('data-reduce-motion',m);r.classList.toggle('reduce-motion',m==='on')}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AppearanceProvider>
            <WorkspaceI18n>
            <LessonProgressSync>
            <ActionDialogProvider>
              <ToastProvider>
                <UpgradeModalProvider>
                <SignOutLoadingProvider>
                  <Suspense fallback={null}>
                    <GlobalNavigationLoading />
                  </Suspense>
                  <ServiceWorkerRegistrar />
                  <PreventZoom />
                  <AuthGate>
                    <PushRegistrar />
                    <AppShell>{children}</AppShell>
                  </AuthGate>
                </SignOutLoadingProvider>
                </UpgradeModalProvider>
              </ToastProvider>
            </ActionDialogProvider>
            </LessonProgressSync>
            </WorkspaceI18n>
          </AppearanceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
