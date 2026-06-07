"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface BackgroundMediaProps {
  name?: "homepage" | "dashboard" | "login" | "signup" | "security" | "auth";
  opacity?: number;
}

export default function BackgroundMedia({ name, opacity = 0.15 }: BackgroundMediaProps) {
  const pathname = usePathname();
  const [src, setSrc] = useState<string | null>(null);
  const [type, setType] = useState<"video" | "image" | null>(null);

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

  useEffect(() => {
    const checkBg = async () => {
      // Priority: mp4 > webm > jpg > png
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const extensions = isMobile
        ? ([
            { ext: "jpg", type: "image" },
            { ext: "jpeg", type: "image" },
            { ext: "png", type: "image" },
            { ext: "mp4", type: "video" },
            { ext: "webm", type: "video" }
          ] as const)
        : ([
            { ext: "mp4", type: "video" },
            { ext: "webm", type: "video" },
            { ext: "jpg", type: "image" },
            { ext: "jpeg", type: "image" },
            { ext: "png", type: "image" }
          ] as const);

      try {
        const results = await Promise.all(
          extensions.map(async (item) => {
            const url = `/media/backgrounds/${activeName}-bg.${item.ext}`;
            try {
              const res = await fetch(url, { method: "HEAD" });
              return { url, type: item.type, ok: res.ok };
            } catch {
              return { url, type: item.type, ok: false };
            }
          })
        );
        const active = results.find((r) => r.ok);
        if (active) {
          setSrc(active.url);
          setType(active.type);
        } else {
          setSrc(null);
          setType(null);
        }
      } catch {
        setSrc(null);
        setType(null);
      }
    };

    checkBg();
  }, [activeName]);

  if (!src) return null;

  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0" 
      style={{ opacity }}
    >
      {type === "video" ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={src}
          alt={`${activeName} background`}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
