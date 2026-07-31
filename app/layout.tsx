import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: "Landing Page Generator",
  description: "Create and manage landing pages",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
