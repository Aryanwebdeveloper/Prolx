import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prolx Digital Agency — Premium Web Development & Digital Products",
  description: "Full-service digital agency building exceptional websites, mobile apps, and digital products. UI/UX design, SaaS development, e-commerce, SEO, and digital marketing.",
  metadataBase: new URL("https://prolx.cloud"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Prolx Digital Agency — Premium Web Development",
    description: "Full-service digital agency building exceptional websites, mobile apps, and digital products. UI/UX design, SaaS development, e-commerce, SEO, and digital marketing.",
    url: "https://prolx.cloud",
    siteName: "Prolx Digital Agency",
    locale: "en_US",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProLx",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
          <PWAInstallPrompt />
        </ThemeProvider>
        <TempoInit />
      </body>
    </html>
  );
}
