import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LiveTracker } from "@/components/live-tracker";

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
  icons: {
    icon: "/fiIcons-01.png",
    shortcut: "/fiIcons-01.png",
    apple: "/fiIcons-01.png",
  },
  keywords: ["digital agency", "web development", "mobile apps", "SEO", "UI/UX design", "SaaS", "e-commerce", "Abbottabad", "Pakistan"],
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
          <LiveTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
