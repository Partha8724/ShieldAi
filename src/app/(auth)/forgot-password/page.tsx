"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/Input";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;

      if (!email) {
        setError("Please enter your email address.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/auth/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to process request. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
    } catch {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Check your email</h1>
          <p className="text-white/60">
            We've sent a password reset link to your email address. It will expire in 15 minutes.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-white hover:underline underline-offset-4 mt-4 inline-block">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reset password</h1>
        <p className="text-white/60">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white/80">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-300 rounded-xl h-12"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-gray-200 h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Send reset link <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-white/50">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-white hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
