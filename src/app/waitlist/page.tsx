import type { Metadata } from "next";
import WaitlistClient from "./WaitlistClient";

export const metadata: Metadata = {
  title: "ShieldAI Early Access Waitlist | Join the Identity Protection Vault",
  description: "Secure your place in the queue for Next-Gen Cryptographic Likeness Protection. Refer friends to skip positions and access the beta vault instantly.",
  alternates: {
    canonical: "/waitlist",
  },
  openGraph: {
    title: "ShieldAI Early Access Waitlist | Join the Identity Protection Vault",
    description: "Secure your place in the queue for Next-Gen Cryptographic Likeness Protection. Refer friends to skip positions and access the beta vault instantly.",
    url: "/waitlist",
  }
};

export default function WaitlistPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "ShieldAI Early Access Waitlist Registration",
    "description": "Secure priority queue standing to verify digital content authorship and secure biometric models from artificial replication.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WaitlistClient />
    </>
  );
}
