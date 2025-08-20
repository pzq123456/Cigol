import { Metadata } from "next";

export const metadata: Metadata = {
  title: "cigol.dev - Developer Hub Coming Soon",
  description: "cigol.dev is under construction! A hub for developers, designers, and researchers with tools, portfolio, and geek blog. Stay tuned!",
  keywords: ["cigol.dev", "developer tools", "portfolio", "geek blog", "programming", "coming soon", "web development", "design resources"],
  authors: [{ name: "cigol.dev" }],
  robots: "index, follow",
  openGraph: {
    title: "cigol.dev - Developer Hub Coming Soon",
    description: "A hub for developers, designers, and researchers with tools, portfolio, and geek blog.",
    url: "https://cigol.dev",
    type: "website",
    siteName: "cigol.dev",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "cigol.dev Coming Soon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cigol_dev",
    creator: "@cigol_dev",
    title: "cigol.dev - Coming Soon",
    description: "A hub for developers, designers, and researchers. Stay tuned for tools and geek content!",
    images: ["/og-image.jpg"],
  },
  viewport: "width=device-width, initial-scale=1",
  category: "technology",
};