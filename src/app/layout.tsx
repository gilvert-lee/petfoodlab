import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — 반려동물 사료 성분 사전`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: "website", locale: "ko_KR" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {SITE.adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
