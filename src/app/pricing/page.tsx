import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "ShieldAI Pricing | Secure Cryptographic Likeness Inoculation Plans",
  description: "Secure your digital identity with pricing plans tailored for creators, professionals, and enterprises. Access real-time deepfake monitoring, biometric protection, and on-device steganography.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "ShieldAI Pricing | Secure Cryptographic Likeness Inoculation Plans",
    description: "Secure your digital identity with pricing plans tailored for creators, professionals, and enterprises. Access real-time deepfake monitoring, biometric protection, and on-device steganography.",
    url: "/pricing",
  }
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ShieldAI Protection Subscriptions",
    "description": "Cryptographic sealing and deepfake monitoring plans for digital creators, models, and public figures.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "9.00",
      "highPrice": "500.00",
      "offerCount": "3",
      "offers": [
        {
          "@type": "Offer",
          "name": "Creator Plan",
          "price": "9.00",
          "priceCurrency": "USD",
          "category": "Monthly Subscription"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan",
          "price": "29.00",
          "priceCurrency": "USD",
          "category": "Monthly Subscription"
        },
        {
          "@type": "Offer",
          "name": "Enterprise Plan",
          "price": "49.00",
          "priceCurrency": "USD",
          "category": "Monthly Subscription"
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingClient />
    </>
  );
}
