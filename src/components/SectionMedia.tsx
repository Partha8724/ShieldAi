"use client";

import React, { useState, useEffect } from "react";

interface SectionMediaProps {
  dir: string; // e.g. "/media/home/section-1"
  fallback: React.ReactNode;
  className?: string;
}

// Static lookup mapping of verified existing assets under public/media/home/
const SECTION_MEDIA_CONFIG: Record<
  string,
  {
    desktop: { path: string; type: "video" | "image" };
    mobile: { path: string; type: "video" | "image" };
  }
> = {
  "/media/home/section-1": {
    desktop: { path: "/media/home/section-1/video.mp4", type: "video" },
    mobile: { path: "/media/home/section-1/image.jpg", type: "image" },
  },
  "/media/home/section-2": {
    desktop: { path: "/media/home/section-2/video.mp4", type: "video" },
    mobile: { path: "/media/home/section-2/video.mp4", type: "video" },
  },
  "/media/home/section-3": {
    desktop: { path: "/media/home/section-3/video.mp4", type: "video" },
    mobile: { path: "/media/home/section-3/video.mp4", type: "video" },
  },
};

export default function SectionMedia({ dir, fallback, className = "w-full h-full" }: SectionMediaProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const config = SECTION_MEDIA_CONFIG[dir];
  if (!config) {
    return <>{fallback}</>;
  }

  const activeMedia = isMobile ? config.mobile : config.desktop;

  if (activeMedia.type === "video") {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center bg-black/20">
        <video
          src={activeMedia.path}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (activeMedia.type === "image") {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center bg-black/20">
        <img
          src={activeMedia.path}
          alt="Section Media"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return <>{fallback}</>;
}
