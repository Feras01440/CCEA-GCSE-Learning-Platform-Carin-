import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SubjectScope, ThemeProvider, themeInitScript } from "@/lib/theme/ThemeProvider";
import { AppShell } from "@/components/shell/AppShell";
import { ServiceWorker } from "@/components/shell/ServiceWorker";
import { PRODUCT } from "@/lib/product";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: PRODUCT.name, template: `%s · ${PRODUCT.name}` },
  description: PRODUCT.tagline,
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/cairn.svg" },
  appleWebApp: { capable: true, title: PRODUCT.name, statusBarStyle: "default" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Script id="cairn-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <SubjectScope />
          <AppShell productName={PRODUCT.name}>{children}</AppShell>
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
