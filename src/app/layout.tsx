import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* next/font self-hosts these at build time. A CDN <link> would be a render-time
   network dependency on a page whose whole point is that it is static. */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display-loaded",
  display: "swap",
});
const body = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-body-loaded",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-loaded",
  display: "swap",
});

const SITE = "https://pricinghistory.onedaybuilt.com";
const TITLE = "What software used to cost";
const DESC =
  "Every price Figma, Vercel, Linear, Notion and Stripe ever published, read off the Internet Archive and hung on the line that price drew.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE,
    siteName: "onedaybuilt",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(TITLE)}&stat=${encodeURIComponent("7y 7m")}&subtitle=${encodeURIComponent("Figma held one price for seven and a half years. Then January 2026 happened.")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
