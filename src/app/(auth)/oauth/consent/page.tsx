"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, User, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "google";
  const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);

  const [email, setEmail] = useState("tester@example.com");
  const [name, setName] = useState("Identity Tester");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/oauth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, provider }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/dashboard";
      } else {
        alert(data.error || "OAuth simulation failed.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing OAuth callback.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-2 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">ShieldAI Auth Service</span>
        </div>
        <div className="text-xs text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
          {formattedProvider} Sandbox
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Authorize ShieldAI</h1>
        <p className="text-white/60 text-sm leading-relaxed">
          You are authorizing ShieldAI to receive your public profile and email address. Secure cryptographic tokens will be generated.
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
        <div className="flex items-center gap-3 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This is an offline enterprise OAuth sandbox. All generated records will be written to your local SQLite instance.</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-lg h-10 text-sm"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-lg h-10 text-sm"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 bg-transparent hover:bg-white/5 text-white border-white/10 rounded-xl h-11 text-sm font-medium"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-xl h-11 text-sm font-medium disabled:opacity-50"
          onClick={handleAuthorize}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Authorize & Sign In"}
        </Button>
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm">Configuring sandbox OAuth handshake...</div>}>
      <OAuthConsentContent />
    </Suspense>
  );
}
