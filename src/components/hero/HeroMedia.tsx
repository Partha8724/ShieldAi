"use client";

import React, { useState, useEffect } from "react";
import ShieldScene from "./ShieldScene";

export default function HeroMedia() {
  const [mediaType, setMediaType] = useState<"video" | "image" | "default" | null>(null);
  const [videoSrc, setVideoSrc] = useState("/media/hero/hero-video.mp4");
  const [imageSrc, setImageSrc] = useState("/media/hero/hero-image.jpg");
  const [posterSrc, setPosterSrc] = useState("/media/hero/hero-poster.jpg");

  useEffect(() => {
    const checkMedia = async () => {
      const posterPaths = [
        "/media/hero/hero-poster.jpg",
        "/media/hero/hero-poster.jpg.png",
        "/media/hero/hero-poster.png",
        "/media/hero/hero-poster.jpg.jpg"
      ];
      const videoPaths = [
        "/media/hero/background-video.mp4",
        "/media/hero/background-video.mp4.mp4",
        "/media/hero/hero-video.mp4",
        "/media/hero/hero-video.mp4.mp4"
      ];
      const imagePaths = [
        "/media/hero/hero-image.jpg",
        "/media/hero/hero-image.jpg.jpg",
        "/media/hero/hero-image.jpg.png",
        "/media/hero/hero-image.png"
      ];

      try {
        const [posters, videos, images] = await Promise.all([
          Promise.all(
            posterPaths.map(async (path) => {
              try {
                const res = await fetch(path, { method: "HEAD" });
                return { path, ok: res.ok };
              } catch {
                return { path, ok: false };
              }
            })
          ),
          Promise.all(
            videoPaths.map(async (path) => {
              try {
                const res = await fetch(path, { method: "HEAD" });
                return { path, ok: res.ok };
              } catch {
                return { path, ok: false };
              }
            })
          ),
          Promise.all(
            imagePaths.map(async (path) => {
              try {
                const res = await fetch(path, { method: "HEAD" });
                return { path, ok: res.ok };
              } catch {
                return { path, ok: false };
              }
            })
          )
        ]);

        const activePoster = posters.find((p) => p.ok);
        if (activePoster) {
          setPosterSrc(activePoster.path);
        }

        const activeVideo = videos.find((v) => v.ok);
        if (activeVideo) {
          setMediaType("video");
          setVideoSrc(activeVideo.path);
          return;
        }

        const activeImage = images.find((img) => img.ok);
        if (activeImage) {
          setMediaType("image");
          setImageSrc(activeImage.path);
          return;
        }

        setMediaType("default");
      } catch {
        setMediaType("default");
      }
    };
    checkMedia();
  }, []);

  if (mediaType === null) {
    return <div className="absolute inset-0 bg-[#09090b]" />;
  }

  if (mediaType === "video") {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-[#09090b]">
        <video
          src={videoSrc}
          poster={posterSrc}
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

  if (mediaType === "image") {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-[#09090b]">
        <img
          src={imageSrc}
          alt="Hero Background"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]" />
      </div>
    );
  }

  // Render original ShieldScene ThreeJS mesh
  return <ShieldScene />;
}
