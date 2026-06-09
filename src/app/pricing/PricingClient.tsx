"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, CreditCard, Bitcoin, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const easeOut = [0.23, 1, 0.32, 1];

const plans = [
  {
    name: "Creator",
    description: "Essential protection for independent artists and creators.",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    features: [
      "Up to 50 assets protected/month",
      "Basic adversarial noise injection",
      "Weekly monitoring scans",
      "Standard email support",
    ],
  },
  {
    name: "Professional",
    description: "Advanced cryptographic sealing for professional digital identities.",
    monthlyPrice: 29,
    yearlyPrice: 250,
    features: [
      "Unlimited asset protection",
      "Advanced AI inoculation (multi-model)",
      "Real-time continuous monitoring",
      "Automated takedown requests",
      "Priority 24/7 support",
    ],
    isPopular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for agencies, labels, and public figures.",
    monthlyPrice: 70,
    yearlyPrice: 499,
    features: [
      "Dedicated monitoring agents",
      "Custom adversarial model training",
      "API access",
      "Legal evidence generation",
      "Dedicated success manager",
    ],
  }
];

function PricingContent() {
  const searchParams = useSearchParams();
  const paramPlan = searchParams.get("plan");
  const paramCycle = searchParams.get("cycle");

  const [isYearly, setIsYearly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [processingMethod, setProcessingMethod] = useState<string | null>(null);

  useEffect(() => {
    if (paramPlan) {
      // Find case-insensitive match
      const matchedPlan = plans.find(p => p.name.toLowerCase() === paramPlan.toLowerCase());
      if (matchedPlan) {
        setSelectedPlan(matchedPlan.name);
      }
    }
    if (paramCycle === "monthly") {
      setIsYearly(false);
    } else if (paramCycle === "yearly") {
      setIsYearly(true);
    }
  }, [paramPlan, paramCycle]);

  const handleCheckout = async (planName: string, method: string) => {
    setProcessingMethod(method);
    setPaymentState("processing");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: planName,
          billingCycle: isYearly ? "yearly" : "monthly",
          paymentMethod: method.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setPaymentState("success");
        setTimeout(() => {
          setPaymentState("idle");
          setSelectedPlan(null);
          window.location.href = "/dashboard";
        }, 2000);
      } else if (res.status === 401) {
        alert("Please create an account to start your subscription. Redirecting you to register...");
        window.location.href = `/register?plan=${planName}&cycle=${isYearly ? "yearly" : "monthly"}`;
      } else {
        alert(data.error || "Payment failed");
        setPaymentState("idle");
        setProcessingMethod(null);
      }
    } catch {
      alert("Connection error during checkout");
      setPaymentState("idle");
      setProcessingMethod(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-white/20 pb-32">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 backdrop-blur-md bg-[#09090b]/80 sticky top-0 z-50 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          ShieldAI
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
          Pricing that scales with your digital footprint.
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto text-pretty">
          Choose a plan that fits your needs. All plans include our core cryptographic sealing and baseline monitoring.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-16">
        <div className="bg-white/[0.03] border border-white/10 p-1 rounded-full flex items-center relative">
          <button
            onClick={() => setIsYearly(false)}
            className={`relative w-32 py-2.5 text-sm font-medium transition-colors z-10 ${!isYearly ? "text-black" : "text-white/60 hover:text-white"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative w-32 py-2.5 text-sm font-medium transition-colors z-10 ${isYearly ? "text-black" : "text-white/60 hover:text-white"}`}
          >
            Yearly <span className="absolute -top-3 -right-2 bg-white/10 text-white border border-white/20 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">Save 20%</span>
          </button>
          <motion.div 
            className="absolute top-1 bottom-1 w-32 bg-white rounded-full z-0"
            animate={{ left: isYearly ? "132px" : "4px" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: easeOut }}
            className={`relative flex flex-col p-8 rounded-[2rem] border ${plan.isPopular ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]'} overflow-hidden group`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white/0 via-white to-white/0 opacity-50" />
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-white/60 h-10">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold tracking-tight">
                ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
              </span>
              <span className="text-white/50 ml-2">/ month</span>
              {isYearly && (
                <div className="text-sm text-white/40 mt-1">Billed ${plan.yearlyPrice} yearly</div>
              )}
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start text-sm text-white/80">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-white/40 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan.name)}
              className={`w-full py-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${plan.isPopular ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Select Plan <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Complete Checkout</h3>
                <p className="text-white/60 text-sm">
                  Subscribe to {selectedPlan} Plan &mdash;{" "}
                  <span className="text-white/80 font-medium">
                    ${isYearly
                      ? Math.round((plans.find(p => p.name === selectedPlan)?.yearlyPrice ?? 0) / 12)
                      : plans.find(p => p.name === selectedPlan)?.monthlyPrice}
                    /mo
                  </span>
                  {isYearly && (
                    <span className="text-white/40">
                      {" "}(billed ${plans.find(p => p.name === selectedPlan)?.yearlyPrice}/yr)
                    </span>
                  )}
                </p>
              </div>

              {paymentState === "success" ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-medium text-lg">Payment Successful</p>
                  <p className="text-sm text-white/50">Welcome to ShieldAI</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleCheckout(selectedPlan!, "paypal")}
                    disabled={paymentState === "processing"}
                    className="w-full bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 h-14 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {processingMethod === "paypal" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                    Pay with PayPal
                  </button>

                  <button
                    onClick={() => handleCheckout(selectedPlan!, "crypto")}
                    disabled={paymentState === "processing"}
                    className="w-full bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 h-14 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {processingMethod === "crypto" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bitcoin className="w-5 h-5" />}
                    Pay with Crypto
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">Loading pricing options...</div>}>
      <PricingContent />
    </Suspense>
  );
}
