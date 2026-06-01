"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-400">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // Simulate API call for verification
    const verify = async () => {
      setTimeout(() => {
        if (token === "invalid") {
          setStatus("error");
        } else {
          setStatus("success");
        }
      }, 1500);
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col space-y-6">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-400">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">Email verified</h1>
            <p className="mt-2 text-sm text-gray-400">
              Your email has been successfully verified. You can now log in.
            </p>
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 bg-white text-black hover:bg-gray-100 h-10 px-4 text-sm w-full mt-4"
          >
            Go to login
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-400">
              The verification link is invalid or has expired.
            </p>
          </div>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 bg-white text-black hover:bg-gray-100 h-10 px-4 text-sm w-full mt-4"
          >
            Sign up again
          </Link>
        </div>
      )}
    </div>
  );
}
