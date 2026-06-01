"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing from the URL.");
    }
  }, [token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to reset password. The link may have expired.");
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Password reset complete</h1>
          <p className="text-white/60">
            Your password has been successfully updated. You can now log in with your new credentials.
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
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Choose new password</h1>
        <p className="text-white/60">
          Enter your new password below to secure your ShieldAI vault account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <p className="text-sm font-medium text-red-400 text-pretty">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white/80">
              New Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={!token}
              placeholder="••••••••"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-300 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              disabled={!token}
              placeholder="••••••••"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-300 rounded-xl h-12"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-white text-black hover:bg-gray-200 h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Reset Password <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm">Loading reset interface...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
