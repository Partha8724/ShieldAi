"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setStatus("success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            onSubmit={handleSubmit}
            className="relative flex flex-col group w-full"
          >
            <div className="relative flex w-full items-center bg-white/[0.02] border border-white/10 rounded-full overflow-hidden focus-within:border-white/30 focus-within:bg-white/[0.04] transition-all duration-300">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
                className="flex-1 bg-transparent px-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="mr-1.5 rounded-full bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Join <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="absolute -bottom-6 left-6 text-xs text-red-400">
                {errorMessage}
              </p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-center p-4 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-5 h-5 text-white mr-3" />
            </motion.div>
            <span className="text-sm font-medium text-white/90">
              You're on the list. We'll be in touch.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
