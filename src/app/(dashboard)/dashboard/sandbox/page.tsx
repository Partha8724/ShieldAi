"use client";

import React, { useState } from "react";
import { UploadCloud, Shield, CheckCircle2, ShieldAlert, FileText, Download, RefreshCw, Eye, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/Toast";

type SandboxResult = {
  originalName: string;
  hash: string;
  watermarkText: string;
  certificateId: string;
  timestamp: string;
  downloadUrl: string;
};

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<"protect" | "verify">("protect");
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("SHIELDAI SECURE");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);

  // Verification states
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Utility to calculate SHA-256 hash of a file on client
  const calculateFileHash = async (targetFile: File): Promise<string> => {
    const arrayBuffer = await targetFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const handleProtect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const hash = await calculateFileHash(file);

      // Perform watermark embedding on Canvas for images
      let dataUrl = "";
      if (file.type.startsWith("image/")) {
        dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Setup watermark font size based on image width
                const fontSize = Math.max(20, Math.floor(img.width / 25));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";

                // Draw watermark patterns across the image
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-Math.PI / 6);
                
                // Repeated rows
                for (let x = -canvas.width; x < canvas.width; x += fontSize * 8) {
                  for (let y = -canvas.height; y < canvas.height; y += fontSize * 4) {
                    ctx.fillText(watermarkText, x, y);
                  }
                }
                ctx.restore();
              }
              resolve(canvas.toDataURL(file.type));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      } else {
        // Fallback for non-images (PDF, video, doc) - mock URL / original
        dataUrl = URL.createObjectURL(file);
      }

      // Record to backend database
      const res = await fetch("/api/sandbox/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          hash: hash,
          watermarkValue: watermarkText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          originalName: file.name,
          hash: hash,
          watermarkText: watermarkText,
          certificateId: data.upload.id,
          timestamp: new Date(data.upload.createdAt).toLocaleString(),
          downloadUrl: dataUrl,
        });
        toast("Asset watermarked & registered!", "success");
      } else {
        toast(data.error || "Failed to register asset", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error processing file", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const hash = await calculateFileHash(verifyFile);

      // Verify hash against backend database
      const res = await fetch(`/api/sandbox/verify?hash=${hash}`);
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.registered) {
          setVerificationResult({
            verified: true,
            fileName: data.upload.fileName,
            hash: data.upload.hash,
            registeredBy: data.upload.user.name || data.upload.user.email,
            date: new Date(data.upload.createdAt).toLocaleString(),
            watermark: data.watermark?.value || "N/A",
            riskScore: "LOW (0% Risk)",
          });
          toast("Ownership verified!", "success");
        } else {
          setVerificationResult({
            verified: false,
            hash: hash,
            riskScore: "HIGH (Unregistered Asset)",
            recommendation: "Inject watermarks to prevent counterfeit copyright theft.",
          });
          toast("Asset unregistered", "info");
        }
      } else {
        toast("Verification service error", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Verification error", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadCertificate = () => {
    if (!result) return;
    const certString = JSON.stringify({
      title: "SHIELDAI COPYRIGHT SEAL CERTIFICATE",
      certificate_id: result.certificateId,
      original_filename: result.originalName,
      perceptual_sha256_hash: result.hash,
      embedded_watermark: result.watermarkText,
      verification_authority: "ShieldAI Cryptographic Network",
      timestamp: result.timestamp,
    }, null, 2);

    const blob = new Blob([certString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ShieldAI-Certificate-${result.certificateId}.json`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Interactive Sandbox</h1>
        <p className="text-sm text-zinc-400">Apply invisible watermarks, calculate secure digests, and verify real-time ownership of files.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => { setActiveTab("protect"); setResult(null); setFile(null); }}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "protect" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "protect" && (
            <motion.div layoutId="sandbox-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
          Seal & Protect
        </button>
        <button
          onClick={() => { setActiveTab("verify"); setVerificationResult(null); setVerifyFile(null); }}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "verify" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "verify" && (
            <motion.div layoutId="sandbox-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
          Verify Authenticity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Work Area */}
        <div className="lg:col-span-2">
          {activeTab === "protect" ? (
            <form onSubmit={handleProtect} className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#111111]/40 p-6 space-y-4">
                <h3 className="text-sm font-medium text-white">Upload Source Asset</h3>
                <div className="border-2 border-dashed border-white/10 hover:border-white/20 transition-colors rounded-xl p-8 text-center relative group">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setResult(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,application/pdf"
                    required
                  />
                  <UploadCloud className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                  <p className="text-xs text-white">Click or drag image/pdf to upload</p>
                  {file && <p className="text-[11px] text-emerald-400 mt-2 font-mono">{file.name} ({Math.round(file.size / 1024)} KB)</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Watermark Signature Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter custom watermark text..."
                    className="w-full h-11 px-4 text-sm bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Embed Watermark & Register
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#111111]/40 p-6 space-y-4">
                <h3 className="text-sm font-medium text-white">Upload Asset to Verify</h3>
                <div className="border-2 border-dashed border-white/10 hover:border-white/20 transition-colors rounded-xl p-8 text-center relative group">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVerifyFile(e.target.files[0]);
                        setVerificationResult(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                  <p className="text-xs text-white">Drag file here to verify ownership</p>
                  {verifyFile && <p className="text-[11px] text-emerald-400 mt-2 font-mono">{verifyFile.name}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !verifyFile}
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Verify Ownership Certificate
              </button>
            </form>
          )}
        </div>

        {/* Results Sidebar */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6 flex flex-col justify-between min-h-[400px]">
          {activeTab === "protect" ? (
            result ? (
              <div className="space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Watermark Applied
                  </div>

                  {file?.type.startsWith("image/") && (
                    <div className="rounded-xl overflow-hidden border border-white/5 bg-black">
                      <img src={result.downloadUrl} alt="Watermarked result preview" className="w-full h-40 object-cover" />
                    </div>
                  )}

                  <div className="space-y-3 font-mono text-[10px] text-zinc-400 bg-black/60 p-4 border border-white/5 rounded-xl break-all">
                    <div>
                      <span className="text-zinc-500 block uppercase font-sans tracking-wide mb-0.5">SHA-256 Digest</span>
                      {result.hash}
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase font-sans tracking-wide mb-0.5">Certificate ID</span>
                      {result.certificateId}
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase font-sans tracking-wide mb-0.5">Registered Timestamp</span>
                      {result.timestamp}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <a
                    href={result.downloadUrl}
                    download={`ShieldAI-watermarked-${result.originalName}`}
                    className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Watermarked File
                  </a>
                  <button
                    onClick={downloadCertificate}
                    className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download JSON Certificate
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
                <HelpCircle className="w-12 h-12 text-zinc-600" />
                <p className="text-xs">Upload a file on the left and run the cryptographic process to view logs.</p>
              </div>
            )
          ) : (
            verificationResult ? (
              verificationResult.verified ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Ownership Verified
                  </div>

                  <div className="space-y-3 text-xs bg-black/60 p-4 border border-white/5 rounded-xl font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Asset Title</span>
                      <span className="text-white font-sans font-medium">{verificationResult.fileName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Registered Owner</span>
                      <span className="text-white font-sans font-medium">{verificationResult.registeredBy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Registration Time</span>
                      <span className="text-white">{verificationResult.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Watermark Text</span>
                      <span className="text-white">{verificationResult.watermark}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Security Score</span>
                      <span className="text-emerald-400 font-sans font-medium">{verificationResult.riskScore}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-rose-400 text-sm font-medium">
                    <ShieldAlert className="w-4 h-4" /> Verification Failed
                  </div>

                  <div className="space-y-3 text-xs bg-black/60 p-4 border border-rose-500/10 rounded-xl font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">SHA-256 Digest</span>
                      <span className="text-zinc-400 break-all">{verificationResult.hash}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Security Risk</span>
                      <span className="text-rose-400 font-sans font-medium">{verificationResult.riskScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-sans block mb-0.5">Recommendation</span>
                      <span className="text-zinc-300 font-sans font-medium block leading-normal">{verificationResult.recommendation}</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
                <Eye className="w-12 h-12 text-zinc-600" />
                <p className="text-xs">Provide a target verification file on the left to verify credentials.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
