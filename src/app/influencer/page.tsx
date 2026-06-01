import type { Metadata } from "next";
import InfluencerClient from "./InfluencerClient";

export const metadata: Metadata = {
  title: "ShieldAI for Creators & Influencers | Stop Voice & Likeness Theft",
  description: "Protect your digital DNA, voice models, and facial scans. Inoculate your photos against deepfakes and scraping. Prove and verify content ownership natively.",
  alternates: {
    canonical: "/influencer",
  },
  openGraph: {
    title: "ShieldAI for Creators & Influencers | Stop Voice & Likeness Theft",
    description: "Protect your digital DNA, voice models, and facial scans. Inoculate your photos against deepfakes and scraping. Prove and verify content ownership natively.",
    url: "/influencer",
  }
};

export default function InfluencerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ShieldAI Creator Inoculation Vault",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "All",
    "description": "Biometric face signature and voice model cryptographic protection layer preventing diffusion training and AI deepfakes.",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InfluencerClient />
    </>
  );
}
