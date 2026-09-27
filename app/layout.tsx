import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Once Upon a Covenant | 2027 Midwest Marriage Retreat",
  description: "A Love Story Written by God. October 8–10, 2027 in Noblesville, Indiana.",
  metadataBase: new URL("https://onceuponacovenant.org"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
