"use client";

import React, { useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const supabase = createClient();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
      } else if (result.data?.mfaRequired) {
        setIsMfaStep(true);
        setMfaUserId(result.data.userId);
        setIsLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  async function onMfaSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: mfaUserId, code: mfaCode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Invalid 2FA code. Try 123456.");
        setIsLoading(false);
      }
    } catch {
      setError("MFA network verification failed.");
      setIsLoading(false);
    }
  }

  if (isMfaStep) {
    return (
      <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Two-factor authentication</h1>
          <p className="text-white/60">
            Enter the 6-digit code to verify your identity.
          </p>
        </div>

        <form onSubmit={onMfaSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-white/80">
              MFA Authentication Code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 tracking-[0.3em] text-center text-xl font-mono focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-300 rounded-xl h-12"
            />
            <p className="text-[11px] text-zinc-500 text-center">
              Testing sandbox: Enter the code <code className="text-white/70">123456</code> to proceed.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-gray-200 h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Verify code <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsMfaStep(false);
            setError(null);
            setMfaUserId(null);
            setMfaCode("");
          }}
          className="text-center text-sm text-white/50 hover:text-white transition-colors"
        >
          Cancel and return to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
        <p className="text-white/60">
          Enter your credentials to access the vault.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}
        
        <div className="space-y-5">
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-white/50 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-300 rounded-xl h-12"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-gray-200 h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign in <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-white/30">Or continue with</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => window.location.href = "/api/auth/oauth/redirect?provider=google"}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all active:scale-[0.98]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.014c1.614 0 3.084.614 4.205 1.623l3.205-3.2A10.914 10.914 0 0 0 13.99 1C7.924 1 3 5.925 3 12c0 6.075 4.925 11 11 11 7.159 0 11.24-5.025 11.24-11.25a9.7 9.7 0 0 0-.24-2.465H12.24Z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/api/auth/oauth/redirect?provider=github"}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-white hover:underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  );
}
