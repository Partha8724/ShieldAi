"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface BackgroundMediaProps {
  name?: "homepage" | "dashboard" | "login" | "signup" | "security" | "auth";
  opacity?: number;
}

const STATIC_BACKGROUNDS: Record<string, { src: string; type: "video" | "image" }> = {
  homepage: { src: "/media/backgrounds/homepage-bg.mp4", type: "video" },
  dashboard: { src: "/media/backgrounds/dashboard-bg.mp4", type: "video" },
};

export default function BackgroundMedia({ name, opacity = 0.15 }: BackgroundMediaProps) {
  const pathname = usePathname();

  // Resolve background type name from pathname if not explicitly passed
  const activeName = React.useMemo(() => {
    if (name) return name;
    if (pathname === "/") return "homepage";
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/login")) return "login";
    if (pathname.includes("/register") || pathname.includes("/signup")) return "signup";
    if (pathname.includes("/security")) return "security";
    return "homepage";
  }, [name, pathname]);

  const activeBg = STATIC_BACKGROUNDS[activeName];

  if (!activeBg) return null;

  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0" 
      style={{ opacity }}
    >
      {activeBg.type === "video" ? (
        <video
          src={activeBg.src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={activeBg.src}
          alt={`${activeName} background`}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
