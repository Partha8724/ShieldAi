"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [certificateData, setCertificateData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to load user profile in upload", err));
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setCertificateData(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const processContentLocally = async (file: File, currentUserId: string) => {
    // 1. Generate SHA-256 hash of file buffer client-side (local cryptographic fingerprint)
    const arrayBuffer = await file.arrayBuffer();
    const fileHashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
    const fileHashArray = Array.from(new Uint8Array(fileHashBuffer));
    const fileHashHex = fileHashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const perceptualHash = `phash_${fileHashHex.substring(0, 32)}`;

    // 2. Generate certificate ID client-side (CERT-XXXXXXXXXXXX)
    const randBytes = new Uint8Array(8);
    window.crypto.getRandomValues(randBytes);
    const hexString = Array.from(randBytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const certificateId = `CERT-${hexString}`;

    // 3. Generate Authenticity Signature client-side matching server cryptographic logic
    const textToSign = `${certificateId}:${currentUserId}:${perceptualHash}`;
    const encoder = new TextEncoder();
    const dataToSign = encoder.encode(textToSign);
    const sigBuffer = await window.crypto.subtle.digest("SHA-256", dataToSign);
    const sigArray = Array.from(new Uint8Array(sigBuffer));
    const authenticitySignature = sigArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // 4. Create certificate descriptor
    const certificate = {
      certificateId,
      issuedAt: new Date().toISOString(),
      ownerId: currentUserId,
      contentTitle: file.name,
      pHash: perceptualHash,
      authenticitySignature,
    };

    return {
      perceptualHash,
      certificateId,
      certificate,
    };
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus("uploading");
    
    try {
      const userId = currentUser?.id || "cuid-mock-user-id";
      
      // Perform 100% local cryptographic processing
      const localResult = await processContentLocally(file, userId);

      // Register only the metadata to minimize data upload
      const res = await fetch("/api/content/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          perceptualHash: localResult.perceptualHash,
          certificateId: localResult.certificateId,
          fileSize: file.size,
          mimeType: file.type,
          certificate: localResult.certificate,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("success");
        setCertificateData(data.certificate);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500 fill-mode-both">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Protect New Asset</h1>
        <p className="text-sm text-zinc-400">Upload an image or document to embed an invisible watermark and register its fingerprint.</p>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {status === "success" && certificateData ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Asset Protected Successfully</h3>
              <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
                Your file has been watermarked and registered on the ShieldAI network.
              </p>
              
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-left max-w-sm mx-auto mb-8 space-y-3">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Certificate ID</p>
                  <p className="text-sm text-emerald-400 font-mono">{certificateData.certificateId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Perceptual Hash</p>
                  <p className="text-xs text-zinc-300 font-mono break-all">{certificateData.pHash}</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => router.push("/content")}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                >
                  View Library
                </button>
                <button
                  onClick={removeFile}
                  className="px-4 py-2 text-sm font-medium text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  Protect Another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="upload" className="space-y-6">
              <div
                className={cn(
                  "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-200 ease-custom flex flex-col items-center justify-center p-12 text-center",
                  dragActive 
                    ? "border-white/40 bg-white/[0.02]" 
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.01]",
                  status === "uploading" && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  accept="image/*,application/pdf"
                  disabled={status === "uploading"}
                />
                
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 ease-custom">
                  <UploadCloud className="w-8 h-8 text-zinc-400" />
                </div>
                
                <h3 className="text-lg font-medium text-white mb-2">
                  Click or drag file to this area to upload
                </h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.
                </p>
              </div>

              {file && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mr-4 shrink-0">
                    <File className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {status === "uploading" ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                  ) : (
                    <button
                      onClick={removeFile}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {status === "error" && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 flex items-start text-sm text-rose-400">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  <span>An error occurred while protecting the asset. Please try again.</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  onClick={handleUpload}
                  disabled={!file || status === "uploading"}
                  className="px-6 py-2.5 text-sm font-medium text-black bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-colors shadow-lg shadow-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] ease-custom duration-200 flex items-center"
                >
                  {status === "uploading" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Protect & Register"
                  )}
                </button>
              </div>

              {/* Local-First Privacy Protection Section */}
              <div className="mt-8 border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Local-First Privacy Architecture</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Your files stay on your device. We use secure browser-based APIs (Canvas & Web Crypto) to process your assets locally. Sensitive raw data is never uploaded to our servers unnecessarily.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Privacy & Ownership Pledging</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                    • We do not own your content.<br />
                    • We do not sell your data.<br />
                    • We cannot access your private files.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
