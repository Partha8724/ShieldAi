"use client";

import React from "react";

export default function HeroMedia() {
  // Directly render the verified, existing background-video.mp4 and hero-poster.jpg
  // to avoid concurrent dynamic fetch checks which cause 404 console errors.
  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-[#09090b]">
      <video
        src="/media/hero/background-video.mp4"
        poster="/media/hero/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]" />
    </div>
  );
}
