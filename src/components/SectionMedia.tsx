"use client";

import React, { useState, useEffect } from "react";

interface SectionMediaProps {
  dir: string; // e.g. "/media/home/section-1"
  fallback: React.ReactNode;
  className?: string;
}

export default function SectionMedia({ dir, fallback, className = "w-full h-full" }: SectionMediaProps) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkMedia = async () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const files = isMobile
        ? [
            { path: `${dir}/image.jpg`, type: "image" as const },
            { path: `${dir}/background.jpg`, type: "image" as const },
            { path: `${dir}/video.mp4`, type: "video" as const },
            { path: `${dir}/animation.webm`, type: "video" as const }
          ]
        : [
            { path: `${dir}/video.mp4`, type: "video" as const },
            { path: `${dir}/animation.webm`, type: "video" as const },
            { path: `${dir}/image.jpg`, type: "image" as const },
            { path: `${dir}/background.jpg`, type: "image" as const }
          ];

      try {
        const results = await Promise.all(
          files.map(async (file) => {
            try {
              const res = await fetch(file.path, { method: "HEAD" });
              return { ...file, ok: res.ok };
            } catch {
              return { ...file, ok: false };
            }
          })
        );
        const active = results.find((r) => r.ok);
        if (active) {
          setMediaSrc(active.path);
          setMediaType(active.type);
        } else {
          setMediaSrc(null);
          setMediaType(null);
        }
      } catch {
        setMediaSrc(null);
        setMediaType(null);
      } finally {
        setChecked(true);
      }
    };

    checkMedia();
  }, [dir]);

  if (!checked) {
    return <div className="animate-pulse w-full h-full bg-white/5 rounded-2xl" />;
  }

  if (mediaSrc && mediaType === "video") {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center bg-black/20">
        <video
          src={mediaSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (mediaSrc && mediaType === "image") {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center bg-black/20">
        <img
          src={mediaSrc}
          alt="Section Media"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return <>{fallback}</>;
}
