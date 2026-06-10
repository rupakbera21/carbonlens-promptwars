import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/presentation/components/common/skip-link";
import { AuthProvider } from "@/presentation/providers/auth-provider";
import { ThemeProvider } from "@/presentation/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CarbonLens — Track & Reduce Your Carbon Footprint",
    template: "%s | CarbonLens",
  },
  description:
    "Understand, track, and reduce your personal carbon footprint with transparent scoring, personalized recommendations, and actionable insights.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "climate action",
    "emissions tracker",
    "CO2 calculator",
  ],
  authors: [{ name: "CarbonLens Team" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "CarbonLens — Track & Reduce Your Carbon Footprint",
    description:
      "Transparent carbon tracking with personalized recommendations.",
    siteName: "CarbonLens",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SkipLink />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
