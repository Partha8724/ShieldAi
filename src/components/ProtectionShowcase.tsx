"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Shield, 
  FileCheck, 
  Globe, 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Lock,
  Cpu
} from "lucide-react";

// Mock X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

const scenes = [
  {
    id: 1,
    title: "Upload Your Original Content",
    description: "Your raw assets are processed entirely locally in the safety of your web browser.",
    icon: Upload,
  },
  {
    id: 2,
    title: "Cryptographic Fingerprint Created",
    description: "Every file receives a unique mathematical hash. Altering a single pixel changes it.",
    icon: Cpu,
  },
  {
    id: 3,
    title: "Ownership Proof Generated",
    description: "An immutable verification token (CERT-XXXXXXXXXXXX) is generated on your device.",
    icon: FileCheck,
  },
  {
    id: 4,
    title: "Invisible Protection Applied",
    description: "Subtle steganographic markers are embedded deep within the file layout.",
    icon: Lock,
  },
  {
    id: 5,
    title: "Publish Everywhere From One Place",
    description: "Distribute your visual assets to connected networks with ownership trails intact.",
    icon: Globe,
  },
  {
    id: 6,
    title: "Continuous Monitoring Enabled",
    description: "Our autonomous monitoring systems scan index engines to sweep for unauthorized copies.",
    icon: Eye,
  },
  {
    id: 7,
    title: "Potential Misuse Detected",
    description: "Flags duplicate files, deepfake identity cloning, and unauthorized likeness scrapers.",
    icon: AlertTriangle,
  },
  {
    id: 8,
    title: "Your Identity. Your Content. Your Proof.",
    description: "Proactive takedowns protect your digital likeness and enforce creator custody.",
    icon: Shield,
  }
];

const easeOut = [0.23, 1, 0.32, 1];

export function ProtectionShowcase() {
  const [activeScene, setActiveScene] = useState(0);
  const [customVideos, setCustomVideos] = useState<{
    upload?: boolean;
    certificate?: boolean;
    security?: boolean;
    monitoring?: boolean;
    deepfake?: boolean;
  }>({});

  useEffect(() => {
    const videoFiles = [
      { name: "upload", path: "/media/protection/upload-animation.mp4" },
      { name: "certificate", path: "/media/protection/certificate-animation.mp4" },
      { name: "security", path: "/media/protection/security-animation.mp4" },
      { name: "monitoring", path: "/media/protection/monitoring-animation.mp4" },
      { name: "deepfake", path: "/media/protection/deepfake-animation.mp4" },
    ];

    videoFiles.forEach((file) => {
      fetch(file.path, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            setCustomVideos((prev) => ({ ...prev, [file.name]: true }));
          }
        })
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto aspect-[4/5] bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-lg relative overflow-hidden group">
      
      {/* Top Progress bar */}
      <div className="flex items-center gap-1.5 w-full">
        {scenes.map((_, index) => (
          <div key={index} className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
            {index <= activeScene && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: index < activeScene ? "100%" : "100%" }}
                transition={{ duration: index === activeScene ? 4.5 : 0.3, ease: "linear" }}
                className="h-full bg-white/60"
              />
            )}
          </div>
        ))}
      </div>

      {/* Visual Animation Box */}
      <div className="flex-1 flex items-center justify-center relative my-6 min-h-[220px]">
        <AnimatePresence mode="wait">
          {activeScene === 0 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-24 h-24 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center relative overflow-hidden">
                {customVideos.upload ? (
                  <video
                    src="/media/protection/upload-animation.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-400 animate-bounce" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
                  </>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-500">original_media.jpg</span>
            </motion.div>
          )}

          {activeScene === 1 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                {customVideos.security ? (
                  <div className="w-full h-full rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                    <video
                      src="/media/protection/security-animation.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    {/* Glowing shield */}
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full bg-white/[0.02] border border-white/20"
                    />
                    <Shield className="w-10 h-10 text-white z-10" />
                    {/* Simulated bits particles floating */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 20, x: (i - 2.5) * 12, opacity: 0 }}
                        animate={{ y: -30, opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                      />
                    ))}
                  </>
                )}
              </div>
              <div className="font-mono text-[9px] text-zinc-500 bg-black/40 px-3 py-1 rounded border border-white/5">
                SHA-256: 4a8f9c0e...
              </div>
            </motion.div>
          )}

          {activeScene === 2 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-48 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md space-y-3 shadow-2xl relative overflow-hidden">
                {customVideos.certificate && (
                  <div className="absolute inset-0 w-full h-full z-0">
                    <video
                      src="/media/protection/certificate-animation.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-[#09090b]/65" />
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 relative z-10">
                  <span className="text-[9px] font-mono text-zinc-500">OWNERSHIP SEAL</span>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-1 font-mono text-[10px] relative z-10">
                  <p className="text-white/40">CERTIFICATE ID</p>
                  <p className="text-white text-xs">CERT-7A9B9F0E1D</p>
                </div>
                <div className="text-[8px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded w-fit relative z-10">
                  SIGNED ON-DEVICE
                </div>
              </div>
            </motion.div>
          )}

          {activeScene === 3 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-32 h-32 flex items-center justify-center"
            >
              <div className="w-24 h-24 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden flex items-center justify-center">
                {customVideos.security ? (
                  <video
                    src="/media/protection/security-animation.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Lock className="w-6 h-6 text-zinc-500" />
                    
                    {/* Dotted mesh grid overlay */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-dashed border-white/20" />
                      ))}
                    </div>
                    
                    {/* Laser scan animation */}
                    <motion.div
                      animate={{ y: [-48, 48, -48] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-[1px] bg-white/50 shadow-[0_0_8px_#fff]"
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeScene === 4 && (
            <motion.div
              key="scene-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Central original content */}
              <div className="w-16 h-16 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center z-10">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              
              {/* Linked Socials */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute w-36 h-36 border border-white/5 rounded-full flex items-center justify-center"
              >
                <div className="absolute -top-3 p-2 bg-zinc-900 border border-white/10 rounded-full"><Instagram className="w-3.5 h-3.5 text-zinc-400" /></div>
                <div className="absolute -right-3 p-2 bg-zinc-900 border border-white/10 rounded-full"><Facebook className="w-3.5 h-3.5 text-zinc-400" /></div>
                <div className="absolute -bottom-3 p-2 bg-zinc-900 border border-white/10 rounded-full"><Youtube className="w-3.5 h-3.5 text-zinc-400" /></div>
                <div className="absolute -left-3 p-2 bg-zinc-900 border border-white/10 rounded-full"><XIcon className="w-3.5 h-3.5 text-zinc-400" /></div>
              </motion.div>
            </motion.div>
          )}

          {activeScene === 5 && (
            <motion.div
              key="scene-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-40 h-40 flex items-center justify-center"
            >
              {/* Core shield */}
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 overflow-hidden relative">
                {customVideos.monitoring ? (
                  <video
                    src="/media/protection/monitoring-animation.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Eye className="w-5 h-5 text-white" />
                )}
              </div>
              
              {!customVideos.monitoring && (
                <>
                  {/* Radar expanding waves */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.3, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.8, ease: "easeOut" }}
                      className="absolute w-24 h-24 rounded-full border border-white/20 pointer-events-none"
                    />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {activeScene === 6 && (
            <motion.div
              key="scene-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative flex items-center justify-center gap-3">
                {customVideos.deepfake ? (
                  <div className="w-48 h-32 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                    <video
                      src="/media/protection/deepfake-animation.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-20 rounded-lg border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center p-2 opacity-60">
                      <AlertTriangle className="w-4 h-4 text-red-500 mb-1" />
                      <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-mono">Impostor</span>
                    </div>
                    <div className="w-20 h-24 rounded-xl border border-white/15 bg-white/5 flex flex-col items-center justify-center p-2 z-10 relative">
                      <Shield className="w-5 h-5 text-emerald-400 mb-1" />
                      <span className="text-[8px] text-zinc-300 uppercase tracking-wider font-mono">Original</span>
                      {/* Target scanner lock */}
                      <div className="absolute -inset-1 border border-emerald-500/30 rounded-2xl animate-pulse" />
                    </div>
                    <div className="w-16 h-20 rounded-lg border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center p-2 opacity-60">
                      <AlertTriangle className="w-4 h-4 text-red-500 mb-1" />
                      <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-mono">Deepfake</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {(activeScene === 8 || activeScene === 7) && (
            <motion.div
              key="scene-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden relative">
                {customVideos.security ? (
                  <video
                    src="/media/protection/security-animation.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Custody Secured</p>
                <p className="text-[10px] text-zinc-500 font-mono">Threats Blocked • Proof Logged</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Description Text Section */}
      <div className="h-28 flex flex-col justify-end space-y-2 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="space-y-1"
          >
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Scene 0{activeScene + 1} &mdash; Pipeline Stage</span>
            <h4 className="text-base font-medium text-white">{scenes[activeScene].title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{scenes[activeScene].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}
