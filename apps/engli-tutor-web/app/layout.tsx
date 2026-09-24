import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CookieConsentBanner } from "@engli-tutor/ui";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EngliTutor — AI English Tutor",
  description:
    "Practice speaking English with AI every day and get feedback in Vietnamese. Built for A2–B1 working professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        {children}
        <CookieConsentBanner policyHref="/policy/cookies" />
      </body>
    </html>
  );
}
