"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck, Code, Settings, FileText, AlertCircle, PlayCircle, Layers, Activity, Search } from "lucide-react";
import BackgroundMedia from "@/components/BackgroundMedia";

const docTopics = [
  {
    id: "getting-started",
    icon: PlayCircle,
    title: "Getting Started",
    description: "Welcome to ShieldAI. Learn the basic concepts of cryptographic digital protection and how to safeguard your likeness in under five minutes.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Quick Start</h3>
        <p className="text-zinc-400">
          ShieldAI uses a local-first cryptographic model to verify authorship of digital assets. 
          Instead of uploading unprotected files to central servers, you sign them locally using browser APIs.
        </p>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-2">Core Workflow:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
            <li>Create an account to retrieve your cryptographic namespace.</li>
            <li>Upload raw assets in the **Content Vault** tab.</li>
            <li>Your browser generates a local SHA-256 hash (never transferring files unnecessarily).</li>
            <li>Steganographic watermark is applied to local pixels.</li>
            <li>A public Certificate (CERT-ID) is registered in the database for scanner lookup.</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: "account-setup",
    icon: Settings,
    title: "Account Setup",
    description: "Configure your user profile, enable Two-Factor Authentication (MFA), and link external social channels for unified publishing.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Secure Profile Configuration</h3>
        <p className="text-zinc-400">
          ShieldAI secures user profiles using multi-factor credentials and strict session handling.
        </p>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <h4 className="text-white font-semibold">Security Settings:</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <h5 className="text-xs font-mono text-zinc-500 mb-1">MFA AUTHENTICATION</h5>
              <p className="text-sm text-zinc-300">Enable Authenticator App codes to protect credentials from remote hijacking.</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <h5 className="text-xs font-mono text-zinc-500 mb-1">SESSION CONTROL</h5>
              <p className="text-sm text-zinc-300">Track active IP addresses, browser clients, and revoke access tokens remotely.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "upload-protection",
    icon: ShieldCheck,
    title: "Upload Protection",
    description: "How the client-side steganographic engine signs pixels and creates localized asset ownership footprints without file compression.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">On-Device Canvas Hashing</h3>
        <p className="text-zinc-400">
          The protection pipeline occurs in your local sandbox. Our algorithms alter imperceptible pixel bits (Least Significant Bits) to embed cryptographic identities directly into target image media.
        </p>
        <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 font-mono text-xs text-zinc-400 space-y-2">
          <span className="text-zinc-600">// Pseudo-code for client-side watermarking:</span>
          <div>
            <span className="text-indigo-400">const</span> canvas = document.createElement(<span className="text-emerald-400">"canvas"</span>);<br />
            <span className="text-indigo-400">const</span> ctx = canvas.getContext(<span className="text-emerald-400">"2d"</span>);<br />
            ctx.drawImage(image, <span className="text-orange-400">0</span>, <span className="text-orange-400">0</span>);<br />
            <span className="text-indigo-400">const</span> imgData = ctx.getImageData(<span className="text-orange-400">0</span>, <span className="text-orange-400">0</span>, canvas.width, canvas.height);<br />
            <br />
            <span className="text-zinc-600">// Apply LSB steganography with cryptographic key</span><br />
            applySignature(imgData.data, secretHashKey);<br />
            ctx.putImageData(imgData, <span className="text-orange-400">0</span>, <span className="text-orange-400">0</span>);
          </div>
        </div>
      </div>
    )
  },
  {
    id: "verification-certificates",
    icon: FileText,
    title: "Verification Certificates",
    description: "Verify the authenticity of digital assets using cryptographic certificates. Understand the certificate database mapping.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Ownership Certificates</h3>
        <p className="text-zinc-400">
          Once protected, an asset generates a unique Certificate ID (e.g. `CERT-XXXX`). This public block contains timestamp records, cryptographic hash values, and details linking back to the verified creator.
        </p>
        <div className="border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-mono text-zinc-500">CERTIFICATE VERIFICATION CARD</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VERIFIED</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Asset Hash:</span>
              <span className="font-mono text-zinc-300">f8d39c02a...e9b72</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Certificate ID:</span>
              <span className="font-mono text-zinc-300">CERT-7A9B9F0E1D</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Creator Signature:</span>
              <span className="font-mono text-zinc-300">user_cl7819hbc</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "monitoring-dashboard",
    icon: Activity,
    title: "Monitoring Dashboard",
    description: "Tracking asset locations across social sites, search engine caches, and generative training indexes.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Threat Monitor & Scanning</h3>
        <p className="text-zinc-400">
          ShieldAI runs background crawler jobs that index public sites for identical hashes. If pixel match percentages cross the 95% threshold, the system flags the occurrence as a threat.
        </p>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Detection Categories:</h4>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-[#09090b] border border-white/5 rounded-xl">
              <div className="text-xs text-zinc-500">DEEPFAKE REUSE</div>
              <div className="text-lg font-bold text-rose-400 mt-1">High</div>
            </div>
            <div className="p-3 bg-[#09090b] border border-white/5 rounded-xl">
              <div className="text-xs text-zinc-500">INDEXED COPIES</div>
              <div className="text-lg font-bold text-amber-400 mt-1">Moderate</div>
            </div>
            <div className="p-3 bg-[#09090b] border border-white/5 rounded-xl">
              <div className="text-xs text-zinc-500">AI TRAINING SETS</div>
              <div className="text-lg font-bold text-indigo-400 mt-1">Scraped</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "publishing-workflow",
    icon: Layers,
    title: "Publishing Workflow",
    description: "Configure automated publishing schedules, embed verification anchors, and direct social distributions.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Decentralized Content Publishing</h3>
        <p className="text-zinc-400">
          Before distributing assets to social media channels, configure integration anchors to automatically publish your cryptographic signatures alongside file uploads.
        </p>
        <p className="text-zinc-400 text-sm">
          Linking social profiles allows ShieldAI to auto-verify platforms such as YouTube, X, and Instagram. Any copy appearing elsewhere is flagged.
        </p>
      </div>
    )
  },
  {
    id: "api-reference",
    icon: Code,
    title: "API Reference",
    description: "Integrate ShieldAI directly into your content platforms, CMS tools, or custom desktop clients.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">API Documentation</h3>
        <p className="text-zinc-400">
          You can interact with ShieldAI services using our secure HTTPS JSON endpoints. Authenticate requests using your profile API Key.
        </p>
        <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 font-mono text-xs space-y-3">
          <div>
            <span className="text-purple-400">POST</span> /api/content/upload
          </div>
          <div className="text-zinc-500">// Header:</div>
          <div>Authorization: Bearer <span className="text-amber-400">YOUR_API_KEY</span></div>
          <div className="text-zinc-500">// Payload response:</div>
          <div className="text-zinc-400">
            &#123;<br />
            &nbsp;&nbsp;<span className="text-emerald-400">"success"</span>: <span className="text-orange-400">true</span>,<br />
            &nbsp;&nbsp;<span className="text-emerald-400">"certificateId"</span>: <span className="text-emerald-300">"CERT-F5A7B390"</span>,<br />
            &nbsp;&nbsp;<span className="text-emerald-400">"hash"</span>: <span className="text-emerald-300">"b7a9c3d9e8..."</span><br />
            &#125;
          </div>
        </div>
      </div>
    )
  },
  {
    id: "security-best-practices",
    icon: AlertCircle,
    title: "Security Best Practices",
    description: "Key recommendations to protect private keys, secure credential tokens, and verify digital custody signatures.",
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Platform Safety</h3>
        <p className="text-zinc-400">
          Always protect your local account configurations. Do not share session keys or verification hashes publicly.
        </p>
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-sm text-zinc-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            **Warning:** Steganographic signatures will be destroyed if an image undergoes high compression or file format transformations (e.g. converting a PNG to a highly-compressed WebP). Store the local original files as your secure baseline.
          </p>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const activeDoc = docTopics.find((t) => t.id === activeTab) || docTopics[0];

  const filteredTopics = docTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-white/20 relative">
      <BackgroundMedia />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 mb-12 gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                SHIELDAI CORE DOCUMENTATION
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Platform Guide</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <a
              href="/docs/documentation/documentation.pdf"
              download
              className="text-xs font-medium px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
            >
              Download Full Manual (PDF)
            </a>
          </div>
        </div>

        {/* Sidebar and Grid */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/5 focus:border-white/20 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-3 space-y-1">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTab(topic.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm transition-all duration-[120ms] ${
                      activeTab === topic.id
                        ? "bg-white text-black font-semibold shadow-xl scale-102"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <topic.icon className={`w-4 h-4 shrink-0 ${activeTab === topic.id ? "text-black" : "text-zinc-500"}`} />
                    <span className="truncate">{topic.title}</span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-zinc-500">
                  No matching topics found
                </div>
              )}
            </div>

            {/* Offline docs links */}
            <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.01] space-y-4">
              <h4 className="text-xs font-mono text-zinc-500">PDF MANUALS</h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: "Whitepaper", path: "/docs/whitepaper/whitepaper.pdf" },
                  { name: "Technical Overview", path: "/docs/whitepaper/technical-overview.pdf" },
                  { name: "API Reference", path: "/docs/documentation/api-reference.pdf" },
                  { name: "Integration Guide", path: "/docs/documentation/integration-guide.pdf" }
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.path}
                    download
                    className="flex justify-between items-center p-2.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded">PDF</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Reader Panel */}
          <div className="lg:col-span-8">
            <div className="border border-white/5 bg-white/[0.02] rounded-3xl p-8 sm:p-10 space-y-8 relative overflow-hidden min-h-[450px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[120px] pointer-events-none" />
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-xs">
                <activeDoc.icon className="w-4 h-4 text-zinc-400" />
                <span>SECTION / {activeDoc.title.toUpperCase()}</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {activeDoc.title}
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed">
                  {activeDoc.description}
                </p>
              </div>
              <div className="border-t border-white/5 pt-8">
                {activeDoc.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
