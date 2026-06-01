"use client";

import React, { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export default function PromoteButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("You are now an administrator!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast(data.error || "Promotion failed", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePromote}
      disabled={loading}
      className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
      Promote to Administrator
    </button>
  );
}
