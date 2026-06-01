import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Toaster } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ShieldAI | Cryptographic Identity & Content Protection",
  description: "Inoculate your likeness against deepfakes, apply invisible steganographic signatures, and mathematically prove digital content ownership on-device.",
  keywords: [
    "AI identity protection",
    "deepfake prevention",
    "steganographic watermark",
    "cryptographic signature",
    "copyright verification",
    "local-first privacy",
    "creator protection tools",
    "AI defense system"
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shieldai.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShieldAI | Cryptographic Identity & Content Protection",
    description: "Inoculate your likeness against deepfakes, apply invisible steganographic signatures, and mathematically prove digital content ownership on-device.",
    url: "/",
    siteName: "ShieldAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShieldAI Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldAI | Cryptographic Identity & Content Protection",
    description: "Inoculate your likeness against deepfakes, apply invisible steganographic signatures, and mathematically prove digital content ownership on-device.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ShieldAI",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "All",
    "description": "Cryptographic protection layer for digital identity and content ownership, inoculating likeness against deepfakes and scraping.",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground selection:bg-primary/30`}>
        <SmoothScroll />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
