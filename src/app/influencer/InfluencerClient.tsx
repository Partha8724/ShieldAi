"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Camera, 
  Video, 
  Award, 
  Share2, 
  Briefcase, 
  Users, 
  Target, 
  ShieldAlert, 
  Lock, 
  Database, 
  FileCheck,
  Compass,
  GraduationCap,
  Sparkles,
  Eye,
  Activity,
  Instagram,
  User
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Navbar from "@/components/Navbar";

const easeOut = [0.23, 1, 0.32, 1];

const revealVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: easeOut }
  }
};

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      variants={revealVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CreatorSolutionPage() {
  const protectItems = [
    {
      icon: Camera,
      title: "Photos",
      desc: "Apply imperceptible adversarial noise patterns to portfolios, headshots, and creative images before publication to block AI scraper models."
    },
    {
      icon: Video,
      title: "Videos",
      desc: "Embed invisible steganographic signatures within video content, securing vlogs, campaign files, and short-form footage."
    },
    {
      icon: Award,
      title: "Brand Content",
      desc: "Lock in ownership metadata on commercial photos and sponsored campaigns to prevent unauthorized advertising and distribution."
    },
    {
      icon: Share2,
      title: "Social Media Assets",
      desc: "Defend feed images, Instagram stories, and visual layouts from bots and scrapers feeding massive text-to-image AI directories."
    },
    {
      icon: Briefcase,
      title: "Campaign Content",
      desc: "Generate proof of origin for pre-release client previews and sponsored campaigns to guarantee custody trails and authorship."
    }
  ];

  const useCases = [
    {
      icon: Sparkles,
      type: "Fashion Creators",
      desc: "Protect design aesthetics, unique outfit photos, and model lookbooks from counterfeits."
    },
    {
      icon: Compass,
      type: "Travel Creators",
      desc: "Safeguard high-resolution landscape photography and aerial captures from unauthorized licensing."
    },
    {
      icon: Video,
      type: "YouTubers",
      desc: "Secure customized video thumbnails and exclusive behind-the-scenes clips from duplication."
    },
    {
      icon: Instagram,
      type: "Instagram Influencers",
      desc: "Protect selfies, lifestyle imagery, and visual grids from identity impersonation accounts."
    },
    {
      icon: Users,
      type: "Public Figures",
      desc: "Establish clear cryptographic ownership to inoculate your likeness against malicious deepfakes."
    },
    {
      icon: GraduationCap,
      type: "Educators",
      desc: "Secure slide decks, educational diagrams, course slides, and online course video modules."
    },
    {
      icon: Camera,
      type: "Photographers",
      desc: "Distribute digital proofs to clients backed by embedded cryptographic copyright signatures."
    },
    {
      icon: User,
      type: "Models",
      desc: "Ensure portfolio headshots are flagged as protected, blocking automated face extracting crawlers."
    },
    {
      icon: Briefcase,
      type: "Business Owners",
      desc: "Seal proprietary product photos, packaging mockups, and corporate marketing materials."
    }
  ];

  const capabilities = [
    "Generate ownership certificates",
    "Create cryptographic fingerprints",
    "Verify content authenticity",
    "Monitor for possible copies",
    "Detect suspicious reuse",
    "Create ownership evidence",
    "Protect creator reputation"
  ];

  const trustValues = [
    {
      title: "Local Processing",
      desc: "Your files stay on your device. We use secure browser-based APIs (Canvas & Web Crypto) to process your assets locally. Sensitive raw data is never uploaded to our servers unnecessarily."
    },
    {
      title: "Cryptographic Security",
      desc: "Our algorithms utilize robust SHA-256 hash digests and steganographic watermarking signatures, backed by secure cryptography."
    },
    {
      title: "Privacy First",
      desc: "We do not sell your data. ShieldAI registers public ownership metadata registries to secure your claims without reading your private files."
    },
    {
      title: "Ownership Certificates",
      desc: "Every protection record issues a signed digital certificate, linking ownership parameters dynamically for instant public verification."
    },
    {
      title: "Creator Protection",
      desc: "Protect photos, videos, brand campaigns, and social media platforms using automated takedown logs and digital watermarking signatures."
    },
    {
      title: "Data Transparency",
      desc: "Complete control of audit logs and user activity. Clear account histories, zero hidden fees, and transparent platform stats."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-white/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden px-6">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[160px]" />
        </div>

        <div className="z-10 text-center max-w-4xl">
          <ScrollReveal>
            <Badge variant="default" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              ShieldAI for Creators
            </Badge>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 bg-gradient-to-b from-white to-white/75 bg-clip-text text-transparent">
              Protection for Creators and Influencers
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <p className="text-base md:text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
              Your identity, your content, your brand. Protect your high-value digital files from unauthorized AI training, scrapes, and clones. Run local-first security signatures completely in your browser.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-white text-black hover:bg-gray-200 h-12 px-8 w-full">
                Start Protecting
              </Link>
              <Link href="/waitlist" className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-transparent text-white hover:bg-white/10 border border-white/20 h-12 px-8 w-full group">
                Join Early Access
                <ArrowRight className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Inline Privacy Badges */}
          <ScrollReveal delay={0.4} className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-zinc-500 uppercase tracking-widest font-mono">
            <span>"Your files stay on your device."</span>
            <span>"We do not own your content."</span>
            <span>"We do not sell your data."</span>
            <span>"We cannot access your private files."</span>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Protect Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Scope of Defense</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What We Protect</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Comprehensive security mapping designed specifically to cover diverse visual and media content formats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protectItems.map((item, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
              <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="mb-6 p-3 bg-white/5 w-fit rounded-xl border border-white/5 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Designed for Every Creative Discipline */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Tailored Use Cases</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Designed for Every Creative Discipline</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            No matter what medium or channel you publish to, ShieldAI integrates cleanly to defend your brand.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.05}>
              <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors duration-300 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 shrink-0">
                  <useCase.icon className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{useCase.type}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{useCase.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Cryptographic Protection: Capabilities vs Limitations */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Capabilities List */}
          <ScrollReveal className="space-y-8">
            <div>
              <Badge variant="default" className="bg-white/10 text-white border-white/20 mb-4">Proven Mechanisms</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                What the System Can Do
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                ShieldAI operates as a cryptographic ledger for digital assets. All generation, hashing, and watermark insertion are compiled locally inside the browser.
              </p>
            </div>
            
            <div className="rounded-3xl bg-white/[0.01] border border-white/5 p-8 space-y-6">
              <ul className="space-y-4 text-xs text-zinc-300">
                {capabilities.map((cap, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Right Column: Important Accuracy Notice */}
          <ScrollReveal delay={0.1} className="space-y-8">
            <div className="rounded-3xl bg-rose-500/5 border border-rose-500/10 p-8 md:p-12 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-sm font-semibold text-rose-400">Important Accuracy Notice</h3>
              </div>
              
              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                <p>
                  We believe in mathematical integrity and do not claim impossible protection. Our system operates under realistic parameters:
                </p>
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] space-y-2 text-zinc-500">
                  <p>✖ "No one can copy your content." (False claim)</p>
                  <p>✖ "No AI can ever use your image." (False claim)</p>
                  <p>✖ "100% protection guaranteed." (False claim)</p>
                </div>
                <p>
                  Instead, ShieldAI is designed to mathematically prove ownership ownership trails, detect unauthorized digital reuse, monitor across index feeds, and build legally-defensible copyright evidence records.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Built on Creator Trust (Zero-Budget Local-First explanation) */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Data Security Pledge</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built on Creator Trust</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Our local-first privacy architecture ensures you retain absolute control over your visual property.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustValues.map((value, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.05}>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-[#111111]/80 transition-colors duration-300 min-h-[180px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2.5">{value.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-t border-white/5 text-center">
        <ScrollReveal>
          <div className="rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 p-12 md:p-20 relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ready to Protect Your Likeness?</h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-8">
              Seal your creations and build an immutable record of authenticity completely local to your browser today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-white text-black hover:bg-gray-200 h-11 px-8 w-full sm:w-auto">
                Get Started Free
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-transparent text-white hover:bg-white/10 border border-white/20 h-11 px-8 w-full sm:w-auto">
                View Pricing Plan
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight mb-4">
              <ShieldCheck className="w-5 h-5" />
              ShieldAI
            </Link>
            <p className="text-sm text-white/50 max-w-xs mb-6">
              The cryptographic layer for digital identity. Protect your face, voice, and ideas.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/#features" className="hover:text-white transition-colors">Identity Vault</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Face Protection</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Content Monitoring</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">API Access</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/40">
          <p>© {new Date().getFullYear()} ShieldAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
