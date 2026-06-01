"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { ArrowRight, ShieldCheck, UploadCloud, Fingerprint, Activity, Bell, FileBadge, CheckCircle2, ShieldAlert, HelpCircle, Target, FileText, Download, Eye, Code, BookOpen, Play, Film } from "lucide-react";

const HeroMedia = dynamic(() => import("@/components/hero/HeroMedia"), { ssr: false });
const AbstractVault = dynamic(() => import("@/components/3d/AbstractVault"), { ssr: false });
const AbstractFace = dynamic(() => import("@/components/3d/AbstractFace"), { ssr: false });
const SectionMedia = dynamic(() => import("@/components/SectionMedia"), { ssr: false });
const BackgroundMedia = dynamic(() => import("@/components/BackgroundMedia"), { ssr: false });
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

// Custom easing from design engineering guidelines
const easeOut = [0.23, 1, 0.32, 1];

function useTypingAnimation(
  phrases: string[],
  typingSpeed = 60,
  deletingSpeed = 40,
  pauseTime = 2000
) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPhrase = phrases[phraseIndex];

    if (phase === "typing") {
      if (text.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setPhase("deleting");
        }, pauseTime);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length - 1));
        }, deletingSpeed);
      } else {
        setPhase("typing");
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

const revealVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: easeOut }
  }
};

const storytellingSteps = [
  { icon: UploadCloud, title: "Upload", desc: "Securely upload your assets to the ShieldAI vault." },
  { icon: ShieldCheck, title: "AI Protects", desc: "Our models analyze and establish baseline ownership." },
  { icon: Fingerprint, title: "Watermark Applied", desc: "Invisible algorithmic signatures are embedded." },
  { icon: FileBadge, title: "Certificate Generated", desc: "Cryptographic proof of authenticity is minted." },
  { icon: Activity, title: "Threats Detected", desc: "Continuous monitoring scans the web for unauthorized use." },
  { icon: Bell, title: "User Alerted", desc: "Real-time notifications empower you to take action." }
];

export default function Home() {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");
  const [viewerType, setViewerType] = useState<"pdf" | "video" | null>(null);
  const [viewerStatus, setViewerStatus] = useState<"loading" | "loaded" | "missing">("loading");
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    if (!viewerUrl) return;

    // Detect mobile/tablet viewport sizes
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || (typeof window !== "undefined" && window.innerWidth < 1024);
      setIsMobileDevice(isMobile);
    };
    checkDevice();

    // Verify if the target file exists on the server
    setViewerStatus("loading");
    const verifyFile = async () => {
      try {
        const res = await fetch(viewerUrl, { method: "HEAD" });
        if (res.ok) {
          setViewerStatus("loaded");
        } else {
          setViewerStatus("missing");
        }
      } catch (err) {
        setViewerStatus("missing");
      }
    };
    verifyFile();
  }, [viewerUrl]);

  const typedText = useTypingAnimation([
    "Protect Your Identity.",
    "Protect Your Face.",
    "Protect Your Content.",
    "Protect Your Reputation.",
    "Protect Your Future."
  ]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-white/20 relative">
      <BackgroundMedia />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
        <HeroMedia />
        
        <div className="z-10 text-center max-w-4xl px-6 mt-16 md:mt-0">
          <Badge variant="default" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Introducing ShieldAI Core
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6 min-h-[120px] sm:min-h-[140px] md:min-h-[100px] flex items-center justify-center">
            {typedText}
            <span className="w-[3px] h-[1em] bg-white ml-1 animate-[pulse_1s_step-end_infinite]"></span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto text-pretty">
            Advanced cryptographic watermarking and autonomous monitoring.
            Secure your digital presence against deepfakes, unauthorized scraping, and AI generation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-white text-black hover:bg-gray-200 h-12 px-8 w-full sm:w-auto">
              Start Protecting
            </Link>
            <button
              onClick={() => {
                setViewerUrl("/docs/documentation/documentation.pdf");
                setViewerType("pdf");
                setViewerTitle("Core Platform Documentation");
              }}
              className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-transparent text-white hover:bg-white/10 border border-white/20 h-12 px-8 w-full sm:w-auto group"
            >
              View Documentation 
              <ArrowRight className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            <EarlyAccessForm />
          </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section id="story" className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Lifecycle of Trust</h2>
          <p className="text-white/60 text-lg text-balance">
            We don't just alert you to theft. We build a verifiable chain of custody for your digital identity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 relative">
          {storytellingSteps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="flex flex-col p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                <div className="mb-6 p-3 bg-white/10 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                
                <div className="absolute -bottom-6 -right-6 text-9xl font-black text-white/[0.02] pointer-events-none select-none">
                  {i + 1}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Feature 1: Asymmetric layout */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="aspect-square rounded-3xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 relative overflow-hidden flex items-center justify-center p-8">
              {/* Abstract visual for Identity Vault */}
              <div className="w-full h-full border border-white/10 rounded-2xl relative">
                <SectionMedia dir="/media/home/section-1" fallback={<AbstractVault />} />
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div>
              <Badge variant="default" className="bg-white/10 text-white mb-4">AI Identity Vault</Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
                Your digital DNA, cryptographically sealed.
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Store your voice models, facial scans, and stylistic baselines in a secure enclave. 
                ShieldAI creates an immutable record of ownership that stands up to technical and legal scrutiny.
              </p>
              <ul className="space-y-4">
                {["Zero-knowledge encryption protocol", "Decentralized proof of origin", "Revocable access tokens"].map((item, i) => (
                  <li key={i} className="flex items-center text-sm font-medium text-white/80">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-white/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature 2: Reversed Asymmetric */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal className="order-2 lg:order-1">
            <div>
              <Badge variant="default" className="bg-white/10 text-white mb-4">Face Protection</Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
                Inoculate your likeness against deepfakes.
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                We apply imperceptible adversarial noise to your photos and videos before you publish them. 
                This prevents generative AI models from successfully extracting or replicating your facial features.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setViewerUrl("/docs/whitepaper/whitepaper.pdf");
                  setViewerType("pdf");
                  setViewerTitle("Privacy & Ownership Whitepaper");
                }}
                className="text-white hover:bg-white/10 px-0 group"
              >
                Read the whitepaper
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal className="order-1 lg:order-2">
            <div className="aspect-[4/3] lg:aspect-square rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center p-8 group">
              <SectionMedia dir="/media/home/section-2" fallback={<AbstractFace />} />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-center backdrop-blur-md pointer-events-none">
                 <div className="bg-[#09090b]/80 border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-full">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <div className="text-sm font-medium">Likeness Inoculated</div>
                     <div className="text-xs text-white/50">Protected from diffusion models</div>
                   </div>
                 </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Feature 3: Smart Content & AI Monitoring Combined */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 md:p-16 lg:p-24 overflow-hidden relative">
            <div className="max-w-3xl relative z-10">
              <Badge variant="default" className="bg-white/10 text-white mb-6">Smart Content & Monitoring</Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                We watch the web so you don't have to.
              </h2>
              <p className="text-lg md:text-xl text-white/60 mb-10 text-balance leading-relaxed">
                Our autonomous agents continuously scan clear and dark web sources. If your protected content 
                is used without authorization, ShieldAI immediately issues automated takedowns.
              </p>
              
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    setViewerUrl("/demo/demo-video.mp4");
                    setViewerType("video");
                    setViewerTitle("Platform Core Demo");
                  }}
                  className="bg-white text-black hover:bg-gray-200 rounded-full px-8 transition-all active:scale-[0.97]"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
              <SectionMedia
                dir="/media/home/section-3"
                fallback={<div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-[128px]" />}
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How Your Content Is Protected Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">How Protection Works</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How Your Content Is Protected</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            A step-by-step cryptographic protocol running client-side to verify and safeguard your digital presence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 01</span>
            <h3 className="text-lg font-semibold text-white mb-2">Upload Content</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Select your photos, videos, or documents. All raw assets are processed locally in your browser.
            </p>
          </div>
          
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 02</span>
            <h3 className="text-lg font-semibold text-white mb-2">Generate Cryptographic Fingerprint</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your browser generates a unique mathematical SHA-256 hash. If even a pixel changes, the fingerprint alters.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 03</span>
            <h3 className="text-lg font-semibold text-white mb-2">Create Ownership Certificate</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              A cryptographic certificate (e.g. CERT-XXXXXXXXXXXX) is generated and linked to the asset record for public verification.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 04</span>
            <h3 className="text-lg font-semibold text-white mb-2">Apply Invisible Protection</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We apply an algorithmic signature to the file metadata. This invisible marker traces owner origin without altering image quality.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 05</span>
            <h3 className="text-lg font-semibold text-white mb-2">Publish Content</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              You publish the protected assets to social networks or platforms. The fingerprint registers you as the author.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 06</span>
            <h3 className="text-lg font-semibold text-white mb-2">Monitor For Misuse</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Our background monitoring agents scan the web. Misuse triggers immediate alerts and automated takedown logs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <span className="text-xs font-mono text-zinc-500 mb-2 block">STEP 07</span>
            <h3 className="text-lg font-semibold text-white mb-2">Verify Ownership</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Instantly verify authorship of any asset using the cryptographic registry, retrieving active verification details.
            </p>
          </div>
        </div>
      </section>

      {/* Cryptographic Security Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Flowchart Visual */}
          <div className="space-y-6">
            <Badge variant="default" className="bg-white/10 text-white border-white/20">Secured by Mathematics</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              What is Cryptographic Protection?
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every uploaded asset receives a unique mathematical fingerprint. If someone alters the file, the fingerprint changes. This enables swift authenticity checks and provides legally-admissible ownership evidence.
            </p>
            
            {/* Visual flow container */}
            <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 space-y-4">
              {[
                { name: "Original File", desc: "Your asset remains on-device" },
                { name: "Hash Generated", desc: "SHA-256 local fingerprint computed" },
                { name: "Certificate Created", desc: "Unique CERT-ID issued in database" },
                { name: "Protection Applied", desc: "Steganographic signature embedded" },
                { name: "Ownership Verified", desc: "Continuous monitoring scan baseline" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono text-[10px] text-white font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{step.name}</h4>
                    <p className="text-[10px] text-zinc-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Capabilities Split View */}
          <div className="space-y-8">
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-8 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-white" /> What the System Can Do
              </h3>
              <ul className="space-y-3.5 text-xs text-zinc-300">
                {[
                  "Generate tamper-proof ownership certificates",
                  "Create unique cryptographic asset fingerprints",
                  "Verify digital content authenticity in real-time",
                  "Monitor public web platforms for identical copies",
                  "Detect unauthorized deepfake or likeness reuse",
                  "Build immutable legally-admissible ownership evidence",
                  "Protect creator reputation and brand integrity"
                ].map((cap, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-rose-500/5 border border-rose-500/10 p-8 space-y-4">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Important Accuracy Notice
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We believe in mathematical integrity and do not claim impossible protection. Our system does not guarantee that no one can ever copy your files or that no AI model will ever use your images. Instead, it provides the tools to mathematically prove ownership, detect unauthorized reuse, and enforce your creator ownership rights legally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Integrity First</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built on Creator Trust</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            We prioritize data transparency, local computation, and cryptographic proof of origin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">Your Files Stay On Your Device</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We process image and document signatures directly in your local environment. Raw assets never need to leave your device.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">Local Processing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Using Canvas steganography and browser Crypto APIs, protection layers are applied client-side with 0% server overhead.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">Encrypted Fingerprints</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculate highly-resilient cryptographic file digests on-device. The secure mathematical hashes prove initial origin.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">Ownership Certificates</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate tamper-proof public registration records (CERT-XXXXXXXXXXXX) mapped locally using client signing authorities.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">Privacy First Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No content tracking, no tracking cookies, and no personal profile mining. Our design centers on creator integrity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-white">No unnecessary file storage</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We register public metadata hashes to verify ownership. We do not store, copy, or distribute your private file contents.
            </p>
          </div>
        </div>
      </section>

      {/* Trust, Whitepaper, Documentation & Demo Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        {/* Visual Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[160px] pointer-events-none" />

        <div className="text-center mb-16 relative z-10">
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Trust & Transparency</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Privacy, Documentation & Demos</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Deep-dive into our technical architecture whitepapers, read guides, or watch video walkthroughs natively.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch relative z-10">
          {/* Card 1: Whitepaper */}
          <ScrollReveal>
            <div className="h-full flex flex-col p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">RESEARCH & THEORY</span>
                    <h3 className="text-2xl font-bold text-white mb-3">Privacy & Ownership Whitepaper</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                      Learn how our cryptographic verification, ownership certification, and privacy-first architecture help creators protect their digital assets.
                    </p>
                  </div>
                  
                  {/* Elegant 3D Paper Stack Visualization */}
                  <div className="w-24 h-24 relative shrink-0 hidden sm:block select-none pointer-events-none">
                    <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl transform translate-x-2 translate-y-2 rotate-6 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-12 duration-300" />
                    <div className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl transform translate-x-1 translate-y-1 rotate-3 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:rotate-6 duration-300" />
                    <div className="absolute inset-0 bg-zinc-900 border border-white/20 rounded-xl flex items-center justify-center p-3 shadow-2xl transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-3 duration-300">
                      <FileText className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                </div>

                {/* Content Previews */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <span className="text-xs font-mono text-zinc-500 block">WHITEPAPER TOPICS</span>
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
                    {[
                      "Privacy Architecture",
                      "Cryptographic Verification",
                      "Ownership Certificates",
                      "Local Storage Strategy",
                      "Content Protection",
                      "Monitoring System",
                      "Creator Protection",
                      "Security Model",
                      "Future Roadmap"
                    ].map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2 relative z-10">
                <button
                  onClick={() => {
                    setViewerUrl("/docs/whitepaper/whitepaper.pdf");
                    setViewerType("pdf");
                    setViewerTitle("Privacy & Ownership Whitepaper");
                  }}
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-white text-black hover:bg-zinc-200 text-xs h-10 px-3.5 gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Read Whitepaper
                </button>
                <a
                  href="/docs/whitepaper/whitepaper.pdf"
                  download="whitepaper.pdf"
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-white/5 text-white hover:bg-white/10 border border-white/10 text-xs h-10 px-3.5 gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
                <button
                  onClick={() => {
                    setViewerUrl("/docs/whitepaper/technical-overview.pdf");
                    setViewerType("pdf");
                    setViewerTitle("Technical Overview");
                  }}
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-transparent text-zinc-400 hover:text-white text-xs h-10 px-2 gap-1.5 group"
                >
                  Technical Overview
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Documentation */}
          <ScrollReveal>
            <div className="h-full flex flex-col p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">INTEGRATION & CODE</span>
                    <h3 className="text-2xl font-bold text-white mb-3">Developer & User Documentation</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                      Explore platform architecture, verification systems, security workflows, certificates, monitoring, and publishing integrations.
                    </p>
                  </div>

                  {/* Architecture Preview Visualization */}
                  <div className="w-24 h-24 relative shrink-0 hidden sm:block select-none pointer-events-none">
                    <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between p-2.5">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="w-8 h-1 bg-white/20 rounded" />
                      </div>
                      <div className="h-4 bg-white/5 rounded flex items-center px-1">
                        <Code className="w-2.5 h-2.5 text-zinc-500" />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600">
                        <span>API</span>
                        <span>v1.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Previews */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <span className="text-xs font-mono text-zinc-500 block">DOCUMENTATION TOPICS</span>
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
                    {[
                      "Getting Started",
                      "Account Setup",
                      "Upload Protection",
                      "Verification Certificates",
                      "Monitoring Dashboard",
                      "Publishing Workflow",
                      "API Reference",
                      "Security Best Practices"
                    ].map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2.5 relative z-10">
                <button
                  onClick={() => {
                    setViewerUrl("/docs/documentation/documentation.pdf");
                    setViewerType("pdf");
                    setViewerTitle("Core Platform Documentation");
                  }}
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-white text-black hover:bg-zinc-200 text-xs h-10 px-3.5 gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  View Documentation
                </button>
                <button
                  onClick={() => {
                    setViewerUrl("/docs/documentation/api-reference.pdf");
                    setViewerType("pdf");
                    setViewerTitle("API Reference Manual");
                  }}
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-white/5 text-white hover:bg-white/10 border border-white/10 text-xs h-10 px-3.5 gap-2"
                >
                  <Code className="w-3.5 h-3.5" />
                  API Documentation
                </button>
                <button
                  onClick={() => {
                    setViewerUrl("/docs/documentation/integration-guide.pdf");
                    setViewerType("pdf");
                    setViewerTitle("Integration Guide");
                  }}
                  className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-[120ms] active:scale-[0.97] bg-transparent text-zinc-400 hover:text-white text-xs h-10 px-2 gap-1.5 group"
                >
                  Integration Guide
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Demo Tour & Gallery */}
          <ScrollReveal>
            <div className="h-full flex flex-col p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">TOUR & WALKTHROUGHS</span>
                    <h3 className="text-2xl font-bold text-white mb-3">Platform Demo & Video Tour</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                      Watch interactive walkthroughs, platform demonstrations, and security tours of the ShieldAI core protection suite.
                    </p>
                  </div>

                  {/* Play Graphic Visual */}
                  <div className="w-24 h-24 relative shrink-0 hidden sm:block select-none pointer-events-none">
                    <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl transform translate-x-2 translate-y-2 rotate-6 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-12 duration-300" />
                    <div className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl transform translate-x-1 translate-y-1 rotate-3 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:rotate-6 duration-300" />
                    <div className="absolute inset-0 bg-zinc-900 border border-white/20 rounded-xl flex items-center justify-center p-3 shadow-2xl transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-3 duration-300">
                      <Play className="w-8 h-8 text-white/80 fill-white/10" />
                    </div>
                  </div>
                </div>

                {/* Primary Demo buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setViewerUrl("/demo/demo-video.mp4");
                      setViewerType("video");
                      setViewerTitle("Platform Core Demo");
                    }}
                    className="inline-flex items-center justify-center rounded-xl font-medium bg-white text-black hover:bg-zinc-200 text-xs h-10 px-4 gap-2 transition-all active:scale-[0.97]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Watch Demo
                  </button>
                  <button
                    onClick={() => {
                      setViewerUrl("/demo/overview-video.mp4");
                      setViewerType("video");
                      setViewerTitle("Overview Video");
                    }}
                    className="inline-flex items-center justify-center rounded-xl font-medium bg-white/5 text-white hover:bg-white/10 border border-white/10 text-xs h-10 px-4 gap-2 transition-all active:scale-[0.97]"
                  >
                    <Film className="w-3.5 h-3.5" />
                    Demo Video
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => {
                      setViewerUrl("/demo/platform-tour.mp4");
                      setViewerType("video");
                      setViewerTitle("Platform Tour");
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white h-9 px-3 gap-1.5 text-left transition-all active:scale-[0.97]"
                  >
                    <span>Platform Tour</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewerUrl("/demo/security-demo.mp4");
                      setViewerType("video");
                      setViewerTitle("Security Walkthrough");
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white h-9 px-3 gap-1.5 text-left transition-all active:scale-[0.97]"
                  >
                    <span>Technical Overview</span>
                  </button>
                </div>

                {/* Content Previews & Gallery */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <span className="text-xs font-mono text-zinc-500 block">DEMO VIDEO GALLERY</span>
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
                    {[
                      { name: "Core Walkthrough", path: "/demo/videos/demo-1.mp4" },
                      { name: "Steganography", path: "/demo/videos/demo-2.mp4" },
                      { name: "Threat Alerts", path: "/demo/videos/demo-3.mp4" },
                      { name: "API Integration", path: "/demo/videos/demo-4.mp4" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setViewerUrl(item.path);
                          setViewerType("video");
                          setViewerTitle(item.name);
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/5 text-left transition-all hover:text-white group/btn w-full text-zinc-400"
                      >
                        <Play className="w-3 h-3 text-zinc-600 group-hover/btn:text-white transition-colors" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Embedded Media Viewer Modal (PDF, Video & Word) */}
      <AnimatePresence>
        {viewerUrl && (
          <motion.div
            key="media-viewer-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl h-[80vh] bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-white/50" />
                  <span className="font-semibold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{viewerTitle}</span>
                </div>
                <button
                  onClick={() => setViewerUrl(null)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-colors text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-[#09090b] flex items-center justify-center p-6 relative">
                {viewerStatus === "loading" && (
                  <div className="text-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white animate-spin mx-auto" />
                    <p className="text-zinc-500 text-xs font-mono">RETRIEVING ASSET...</p>
                  </div>
                )}

                {viewerStatus === "missing" && (
                  <div className="text-center max-w-md p-6 space-y-4 border border-white/5 bg-white/[0.01] rounded-2xl">
                    <ShieldAlert className="w-10 h-10 text-white/60 mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-white">Content coming soon.</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      This content is currently being prepared for the platform. Please check back shortly or contact support.
                    </p>
                    <button
                      onClick={() => setViewerUrl(null)}
                      className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-medium text-white transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                )}

                {viewerStatus === "loaded" && (
                  <>
                    {viewerUrl.toLowerCase().endsWith(".docx") ? (
                      /* Word Document fallback download card */
                      <div className="text-center max-w-md p-6 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 text-white/60" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">Word Document (.docx)</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            This document is formatted as a Microsoft Word file and must be downloaded to be read on your device.
                          </p>
                        </div>
                        <a
                          href={viewerUrl}
                          download
                          className="inline-flex items-center justify-center rounded-xl font-medium bg-white text-black hover:bg-zinc-200 text-xs h-11 px-5 gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download DOCX
                        </a>
                      </div>
                    ) : viewerType === "video" ? (
                      /* Responsive Video Player */
                      <video
                        src={viewerUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain bg-black rounded-2xl"
                      />
                    ) : isMobileDevice ? (
                      /* Mobile optimized display sheet instead of broken iframe for PDFs */
                      <div className="text-center max-w-md p-6 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                          <BookOpen className="w-8 h-8 text-white/60" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">Ready for Reading</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Mobile or tablet device detected. For the best reading experience, please view this document in a new browser tab or download it directly.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 items-center justify-center">
                          <a
                            href={viewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl font-medium bg-white text-black hover:bg-zinc-200 text-xs h-11 px-5 gap-2 w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4" />
                            Open in New Tab
                          </a>
                          <a
                            href={viewerUrl}
                            download
                            className="inline-flex items-center justify-center rounded-xl font-medium bg-white/5 text-white hover:bg-white/10 border border-white/10 text-xs h-11 px-5 gap-2 w-full sm:w-auto"
                          >
                            <Download className="w-4 h-4" />
                            Download Document
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* Desktop embedded frame for PDFs */
                      <iframe
                        src={`${viewerUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-0 rounded-2xl bg-[#18181b]"
                        title={viewerTitle}
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold text-lg tracking-tight mb-4">
              <ShieldCheck className="w-5 h-5" />
              ShieldAI
            </div>
            <p className="text-sm text-white/50 max-w-xs mb-6">
              The cryptographic layer for digital identity. Protect your face, voice, and ideas.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="#features" className="hover:text-white transition-colors">Identity Vault</Link></li>
              <li><Link href="/influencer" className="hover:text-white transition-colors">Creator Protection</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Face Protection</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Content Monitoring</Link></li>
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

// Helper component for scroll reveals based on design guidelines
function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

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
