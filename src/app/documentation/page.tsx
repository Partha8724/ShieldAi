"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocumentationFallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/docs");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto" />
        <p className="text-zinc-500 text-sm">Redirecting to documentation...</p>
      </div>
    </div>
  );
}
