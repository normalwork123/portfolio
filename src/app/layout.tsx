import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Canonical production origin. Update if the domain changes.
const siteUrl = "https://portofoliov1-eta.vercel.app";
const siteName = "Harsh Rai — Frontend Developer";
const siteDescription =
  "Cinematic portfolio of Harsh Rai, a frontend developer building immersive, " +
  "high-performance web experiences with React, Next.js, Three.js and WebGL.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s · Harsh Rai",
  },
  description: siteDescription,
  applicationName: "Harsh Rai Portfolio",
  authors: [{ name: "Harsh Rai" }],
  creator: "Harsh Rai",
  keywords: [
    "Harsh Rai",
    "Frontend Developer",
    "React Developer",
    "Next.js",
    "Three.js",
    "WebGL",
    "TypeScript",
    "UI/UX",
    "Portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
