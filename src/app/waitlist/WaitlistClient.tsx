"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, Share2, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";

function WaitlistContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registeredWaitlist, setRegisteredWaitlist] = useState<any>(null);
  const [redirectSeconds, setRedirectSeconds] = useState(5);

  React.useEffect(() => {
    if (registeredWaitlist) {
      const interval = setInterval(() => {
        setRedirectSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = "/dashboard";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [registeredWaitlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          useCase,
          referralSource,
          referredByCode: refCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredWaitlist(data.waitlist);
        toast("Successfully joined the waitlist!", "success");
      } else {
        toast(data.error || "Failed to join waitlist", "error");
      }
    } catch {
      toast("Connection error, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!registeredWaitlist) return;
    const link = `${window.location.origin}/waitlist?ref=${registeredWaitlist.referralCode}`;
    navigator.clipboard.writeText(link);
    toast("Referral link copied to clipboard!", "success");
  };

  if (registeredWaitlist) {
    const referralLink = typeof window !== "undefined" ? `${window.location.origin}/waitlist?ref=${registeredWaitlist.referralCode}` : "";

    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between py-12 px-6">
        <div className="max-w-md mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">ShieldAI</span>
          </Link>

          <div className="rounded-2xl border border-white/5 bg-[#111111]/40 p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">You&apos;re on the list!</h2>
              <p className="text-sm text-zinc-400">
                Thanks for signing up, <span className="text-white font-medium">{registeredWaitlist.name}</span>. We will notify you as soon as your access is approved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Queue Position</p>
                <p className="text-3xl font-bold text-white mt-1">#{registeredWaitlist.rank}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Status</p>
                <p className="text-sm font-semibold text-amber-400 mt-2.5">PENDING APPROVAL</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Share your referral link to skip queue positions:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-black border border-white/10 rounded-xl h-11 px-3 text-xs font-mono text-zinc-400 focus:outline-none"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="h-11 px-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 text-center">Every sign up using your link moves you up 5 slots!</p>

              <div className="border-t border-white/5 pt-4 space-y-2">
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  Proceed to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <p className="text-[10px] text-zinc-500 text-center">
                  Redirecting automatically in {redirectSeconds}s...
                </p>
              </div>
            </div>
          </div>

          <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors text-center block">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between py-12 px-6">
      <div className="max-w-md mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <Link href="/" className="flex items-center gap-2 group w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">ShieldAI</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Request Early Access</h1>
          <p className="text-white/60 text-sm">
            Enter your details below to request credentials to the ShieldAI autonomous protection network.
          </p>
        </div>

        {refCode && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center gap-3 text-xs text-zinc-300">
            <Users className="w-4 h-4 shrink-0 text-white" />
            <span>You were referred! Completing registration will boost your inviter&apos;s queue rank.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Full Name</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Company / Organization</label>
            <Input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Google, Stripe, etc."
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Primary Use Case</label>
            <Input
              type="text"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. Protecting content portfolio"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">How did you hear about us?</label>
            <Input
              type="text"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              placeholder="Twitter, GitHub, Word of mouth..."
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Request Access <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm">Opening waitlist application...</div>}>
      <WaitlistContent />
    </Suspense>
  );
}
