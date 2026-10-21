import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Sans, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { InlineScript } from "@/components/inline-script";
import { SITE_URL } from "@/lib/env";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// next/font self-hosts and subsets at build time (PRD §9: fonts self-hosted).
// Archivo carries the poster voice via its width axis; see the type scale in globals.css.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PlotEdu — Where Knowledge Meets Real-World Practice",
    template: "%s · PlotEdu",
  },
  description:
    "Practical courses in land, planning and regulations for Maharashtra's architects and development-control professionals. Plot first, regulation second, design third.",
  openGraph: { siteName: "PlotEdu", type: "website", locale: "en_IN" },
};

export const viewport: Viewport = {
  themeColor: "#0F1A2B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en-IN"
      data-theme-pref="dark"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrument.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <head>
        <InlineScript html={THEME_BOOT_SCRIPT} />
      </head>
      <body>{children}</body>
    </html>
  );
}
