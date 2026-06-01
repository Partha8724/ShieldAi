"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  activePath?: string;
}

export default function Navbar({ activePath }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentPath = activePath || pathname;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-6 backdrop-blur-md bg-[#09090b]/50 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">ShieldAI</span>
        </Link>
        
        {/* Tablet Compact Navigation (768px-1023px) */}
        <div className="hidden md:flex lg:hidden items-center gap-6 text-sm font-medium text-white/70">
          <Link href="/influencer" className={`hover:text-white transition-colors ${currentPath === "/influencer" ? "text-white font-semibold" : ""}`}>For Creators</Link>
          <Link href="/pricing" className={`hover:text-white transition-colors ${currentPath === "/pricing" ? "text-white font-semibold" : ""}`}>Pricing</Link>
          <Link href="/login" className="text-xs font-semibold bg-white/5 border border-white/10 text-white px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all">
            Sign in
          </Link>
        </div>

        {/* Laptop & Desktop Full Navigation (1024px+) */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#story" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/influencer" className={`hover:text-white transition-colors ${currentPath === "/influencer" ? "text-white font-semibold" : ""}`}>For Creators</Link>
          <Link href="/pricing" className={`hover:text-white transition-colors ${currentPath === "/pricing" ? "text-white font-semibold" : ""}`}>Pricing</Link>
        </div>
        
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/waitlist">
            <Button variant="primary" className="bg-white text-black hover:bg-gray-200 rounded-full px-5 h-9 text-xs">
              Get Early Access
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-45 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-[#09090b] border-l border-white/10 p-8 z-50 md:hidden flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                    <ShieldCheck className="w-5 h-5 text-white" />
                    ShieldAI
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-6 text-base font-medium text-white/70">
                  <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</Link>
                  <Link href="/#story" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">How it works</Link>
                  <Link href="/influencer" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">For Creators</Link>
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Pricing</Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Sign In</Link>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <Link href="/waitlist" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full bg-white text-black hover:bg-gray-200">
                    Get Early Access
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
