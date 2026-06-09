import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Toaster } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getCleanSiteUrl } from "@/lib/utils";

const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "ShieldAI | AI-Powered Identity & Content Protection",
    template: "%s | ShieldAI",
  },
  description: "ShieldAI protects creators, influencers, and public figures from deepfakes, AI impersonation, and digital theft using cryptographic watermarking and real-time monitoring.",
  keywords: [
    "AI identity protection",
    "deepfake prevention",
    "deepfake protection software",
    "digital content copyright",
    "steganographic watermark",
    "cryptographic content signature",
    "protect face from AI",
    "AI content monitoring",
    "creator protection tools",
    "content ownership verification",
    "digital watermarking service",
    "image copyright protection",
    "AI impersonation protection",
    "online identity security",
  ],
  authors: [{ name: "ShieldAI Team", url: "https://shieldai-eight.vercel.app" }],
  creator: "ShieldAI",
  publisher: "ShieldAI",
  metadataBase: new URL(getCleanSiteUrl()),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ShieldAI | AI-Powered Identity & Content Protection",
    description: "Protect your face, content, and identity from deepfakes and AI theft. Invisible watermarking, real-time threat monitoring, and cryptographic ownership certificates.",
    url: "/",
    siteName: "ShieldAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShieldAI – Protect your digital identity from AI deepfakes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ShieldAI",
    creator: "@ShieldAI",
    title: "ShieldAI | AI-Powered Identity & Content Protection",
    description: "Protect your face, content, and identity from deepfakes and AI theft. Real-time monitoring and cryptographic watermarking.",
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
  category: "Technology",
  verification: {
    google: "Q72yEhAyA4nX-d9yOARsYtjdYP2Wr_AzDCJZ3XgXmY4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ShieldAI",
    "url": "https://shieldai-eight.vercel.app",
    "logo": "https://shieldai-eight.vercel.app/og-image.png",
    "description": "ShieldAI provides AI-powered cryptographic identity and content protection for creators, influencers, and public figures.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": "English"
    },
    "sameAs": []
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ShieldAI",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "All",
    "description": "Cryptographic protection layer for digital identity and content ownership. Protect your face, images, and videos from deepfakes and AI impersonation.",
    "url": "https://shieldai-eight.vercel.app",
    "offers": [
      { "@type": "Offer", "name": "Creator Plan", "price": "9.99", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
      { "@type": "Offer", "name": "Professional Plan", "price": "29.00", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
      { "@type": "Offer", "name": "Enterprise Plan", "price": "70.00", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } }
    ],
    "featureList": [
      "Invisible Steganographic Watermarking",
      "Real-time Deepfake Monitoring",
      "Cryptographic Ownership Certificates",
      "AI Identity Vault",
      "Automated Takedown Requests"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is ShieldAI?",
        "acceptedAnswer": { "@type": "Answer", "text": "ShieldAI is an AI-powered platform that protects creators and public figures from deepfakes, AI impersonation, and digital content theft using cryptographic watermarking and real-time monitoring." }
      },
      {
        "@type": "Question",
        "name": "How does ShieldAI protect against deepfakes?",
        "acceptedAnswer": { "@type": "Answer", "text": "ShieldAI applies invisible adversarial perturbations to your images that confuse AI deepfake models. It also monitors the web 24/7 for unauthorized use of your likeness and alerts you instantly." }
      },
      {
        "@type": "Question",
        "name": "Is ShieldAI safe and private?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. ShieldAI processes your content on-device where possible, ensuring your private images and biometric data never leave your control. All operations use industry-standard cryptographic protocols." }
      },
      {
        "@type": "Question",
        "name": "What payment methods does ShieldAI accept?",
        "acceptedAnswer": { "@type": "Answer", "text": "ShieldAI accepts PayPal and cryptocurrency payments via NOWPayments, supporting Bitcoin, Ethereum, USDT, and 300+ other cryptocurrencies." }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my ShieldAI subscription?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can cancel your subscription at any time from your dashboard. Your protection remains active until the end of your billing period." }
      }
    ]
  };

  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
