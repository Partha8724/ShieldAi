"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, ArrowRight, Loader2, Download, Calendar, Activity, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/Toast";

type InvoiceItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  createdAt: string;
};

type BillingClientProps = {
  initialSub: {
    planTier: string;
    status: string;
    currentPeriodEnd: string | null;
    paypalSubscriptionId: string | null;
  };
  uploadsCount: number;
  monitoringCount: number;
  invoices: InvoiceItem[];
  plansList: Array<{
    name: string;
    priceMonthly: number;
    priceYearly: number;
    uploadLimit: number;
    monitoringLimit: number;
    features: string[];
  }>;
};

const easeOut = [0.23, 1, 0.32, 1];

export default function BillingClient({
  initialSub,
  uploadsCount,
  monitoringCount,
  invoices,
  plansList,
}: BillingClientProps) {
  const [sub, setSub] = useState(initialSub);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [processingMethod, setProcessingMethod] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const currentPlanObj = plansList.find(p => p.name === sub.planTier) || plansList[0];

  const handleCheckout = async (planName: string, method: string) => {
    setProcessingMethod(method);
    setPaymentState("processing");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: planName,
          billingCycle,
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
        setSub(data.result.subscription);
        toast(`Upgraded to ${planName} successfully!`, "success");
        setTimeout(() => {
          setPaymentState("idle");
          setSelectedPlan(null);
          window.location.reload(); // Refresh to update statistics/invoices
        }, 2000);
      } else {
        toast(data.error || "Payment failed", "error");
        setPaymentState("idle");
        setProcessingMethod(null);
      }
    } catch {
      toast("Connection error during checkout", "error");
      setPaymentState("idle");
      setProcessingMethod(null);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSub({
          planTier: "FREE",
          status: "ACTIVE",
          currentPeriodEnd: null,
          paypalSubscriptionId: null,
        });
        toast("Subscription cancelled", "info");
        window.location.reload();
      } else {
        toast(data.error || "Failed to cancel subscription", "error");
      }
    } catch {
      toast("Connection error, please try again", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan details */}
        <div className="md:col-span-2 rounded-2xl bg-[#111111] border border-white/5 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subscription Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white">
                Active
              </span>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">{sub.planTier} Plan</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {sub.planTier === "FREE" 
                  ? "Basic account with entry-level protection limits." 
                  : `Next billing date: ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "N/A"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-white/5">
            {sub.planTier !== "FREE" && (
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Quota details */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6 space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Usage Counters</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Upload Limits</span>
                <span className="text-white font-medium">
                  {uploadsCount} / {currentPlanObj.uploadLimit > 100000 ? "Unlimited" : currentPlanObj.uploadLimit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (uploadsCount / (currentPlanObj.uploadLimit || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Monitoring Jobs</span>
                <span className="text-white font-medium">
                  {monitoringCount} / {currentPlanObj.monitoringLimit > 100000 ? "Unlimited" : currentPlanObj.monitoringLimit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (monitoringCount / (currentPlanObj.monitoringLimit || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing options list if user is on Free or upgradeable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Change Tiers</h3>
          <div className="bg-white/5 border border-white/10 p-0.5 rounded-full flex items-center relative text-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${billingCycle === "monthly" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${billingCycle === "yearly" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansList.map((plan) => {
            const isCurrent = sub.planTier === plan.name;
            if (plan.name === "FREE") return null;

            return (
              <div 
                key={plan.name} 
                className={`rounded-2xl border p-5 flex flex-col justify-between bg-[#111111]/40 ${isCurrent ? "border-white/30" : "border-white/5"}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{plan.name}</h4>
                    {isCurrent && <span className="text-[10px] bg-white/10 text-white border border-white/10 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                  <p className="text-2xl font-bold text-white mb-4">
                    ${billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                    <span className="text-xs text-zinc-500 font-normal"> / {billingCycle}</span>
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-400 mb-6">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => setSelectedPlan(plan.name)}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    Select {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction billing invoice list */}
      <div className="rounded-2xl bg-[#111111] border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-medium text-white">Billing History</h3>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No payments registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Invoice Number</th>
                  <th className="px-5 py-3.5">Billing Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.01]">
                    <td className="px-5 py-4 font-medium text-white">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-zinc-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white">${inv.amount.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`/api/invoices/${inv.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-md transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold mb-1">Confirm Subscription</h3>
                <p className="text-zinc-400 text-xs">
                  Subscribe to {selectedPlan} &mdash;{" "}
                  <span className="text-white font-medium">
                    ${billingCycle === "yearly" 
                      ? plansList.find(p => p.name === selectedPlan)?.priceYearly 
                      : plansList.find(p => p.name === selectedPlan)?.priceMonthly}
                    /{billingCycle}
                  </span>
                </p>
              </div>

              {paymentState === "success" ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-6"
                >
                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-base">Payment Successful</p>
                  <p className="text-xs text-zinc-500">Activating your protection vault...</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleCheckout(selectedPlan!, "paypal")}
                    disabled={paymentState === "processing"}
                    className="w-full bg-white/[0.03] border border-white/5 hover:bg-white/5 text-white h-12 rounded-xl text-xs font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {processingMethod === "paypal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Pay with PayPal
                  </button>

                  <button
                    onClick={() => handleCheckout(selectedPlan!, "stripe")}
                    disabled={paymentState === "processing"}
                    className="w-full bg-white/[0.03] border border-white/5 hover:bg-white/5 text-white h-12 rounded-xl text-xs font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {processingMethod === "stripe" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    Pay securely with Card
                  </button>

                  <button
                    onClick={() => handleCheckout(selectedPlan!, "crypto")}
                    disabled={paymentState === "processing"}
                    className="w-full bg-white/[0.03] border border-white/5 hover:bg-white/5 text-white h-12 rounded-xl text-xs font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {processingMethod === "crypto" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                    Pay with Crypto
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
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
