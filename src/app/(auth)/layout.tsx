import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault Access | ShieldAI",
  description: "Access your secure cryptographic digital vault, configure deepfake protection, and manage content steganography credentials.",
};

const AbstractVault = dynamic(() => import("@/components/3d/AbstractVault"), { ssr: false });
const ProtectionShowcase = dynamic(() => import("@/components/ProtectionShowcase").then(mod => mod.ProtectionShowcase), { ssr: false });
const BackgroundMedia = dynamic(() => import("@/components/BackgroundMedia"), { ssr: false });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#09090b] text-white relative">
      <BackgroundMedia />
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] lg:px-20 xl:px-24 border-r border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="mb-12 flex items-center gap-2 group w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">ShieldAI</span>
          </Link>
          {children}
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:flex flex-col items-center justify-center overflow-hidden bg-[#09090b]">
        {/* Subtle glow behind canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none"></div>
        
        <div className="absolute inset-0 opacity-40">
          <AbstractVault />
        </div>
        
        {/* Protection Showcase Animation */}
        <div className="z-10 w-full max-w-sm">
          <ProtectionShowcase />
        </div>

        {/* Core System Label at the bottom */}
        <div className="absolute bottom-10 left-10 right-10 pointer-events-none z-10 text-center lg:text-left">
          <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
            SHIELDAI ENCLAVE SERVICE CLIENT v1.0 • MATHEMATICALLY SECURED LIKENESS
          </p>
        </div>
      </div>
    </div>
  );
}
