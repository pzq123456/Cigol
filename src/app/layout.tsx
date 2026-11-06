import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cigol.dev - Free Online Developer Tools",
  description:
    "Free, fast, browser-based tools for developers, designers and researchers. No sign-up, no upload, everything runs locally in your browser.",
  keywords: [
    "developer tools",
    "online tools",
    "free tools",
    "web development",
    "utilities",
    "cigol.dev",
  ],
  authors: [{ name: "cigol.dev" }],
  robots: "index, follow",
  metadataBase: new URL("https://cigol.dev"),
  openGraph: {
    title: "cigol.dev - Free Online Developer Tools",
    description:
      "Free, fast, browser-based tools for developers, designers and researchers. Everything runs locally in your browser.",
    url: "https://cigol.dev",
    type: "website",
    siteName: "cigol.dev",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "cigol.dev - Free Online Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cigol_dev",
    creator: "@cigol_dev",
    title: "cigol.dev - Free Online Developer Tools",
    description:
      "Free, fast, browser-based tools for developers, designers and researchers.",
    images: ["/og-image.png"],
  },
};

const GA_MEASUREMENT_ID = "G-JTY9JNZXYP";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      <body className="antialiased">{children}</body>
    </html>
  );
}
