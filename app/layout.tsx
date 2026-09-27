import type { Metadata } from "next";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  Great_Vibes,
  Montserrat,
} from "next/font/google";
import "./globals.css";

const titleFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-title",
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const scriptFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const bodyFont = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Once Upon a Covenant | 2027 Midwest Marriage Retreat",
  description: "A Love Story Written by God. October 8–10, 2027 in Noblesville, Indiana.",
  metadataBase: new URL("https://onceuponacovenant.org"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${titleFont.variable} ${serifFont.variable} ${scriptFont.variable} ${bodyFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
