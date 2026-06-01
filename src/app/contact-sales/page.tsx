"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, Mail, Building, FileText } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";

export default function ContactSalesPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/contact-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, useCase }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
        toast("Message sent successfully!", "success");
      } else {
        toast(data.error || "Failed to submit lead", "error");
      }
    } catch {
      toast("Connection error, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Lead Registered</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Thank you, <span className="text-white font-medium">{name}</span>. Your request has been stored in our CRM pipeline. A member of our enterprise success team will follow up within 24 hours.
              </p>
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Contact Enterprise Sales</h1>
          <p className="text-white/60 text-sm">
            Scale your digital identity vault across multiple organizations, customize adversarial model training, and access API keys.
          </p>
        </div>

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
            <label className="text-xs font-medium text-zinc-400">Work Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Company Name</label>
            <Input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enterprise Inc."
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Describe your scale or use case</label>
            <Input
              type="text"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. Agency representing 50+ content creators"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Inquiry <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
