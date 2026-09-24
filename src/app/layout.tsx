import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Orbitron } from "next/font/google";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { MouseGlow } from "@/components/fx/MouseGlow";
import { ParticleField } from "@/components/fx/ParticleField";
import { SplashScreen } from "@/components/fx/SplashScreen";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AppStateProvider } from "@/providers/AppStateProvider";
import { SITE } from "@/lib/site";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | MLBB LAB",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "MLBB",
    "モバイルレジェンド",
    "モバレ",
    "Mobile Legends",
    "攻略",
    "ビルド",
    "カウンター",
    "Tierリスト",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${orbitron.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppStateProvider>
          <SplashScreen />
          <AuroraBackground />
          <ParticleField />
          <MouseGlow />
          <Sidebar />
          <div className="flex min-h-screen flex-col lg:pl-60">
            <TopBar />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
          <BottomNav />
        </AppStateProvider>
      </body>
    </html>
  );
}
