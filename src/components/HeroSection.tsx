import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, LayoutDashboard } from "lucide-react";

/* ===================== Helpers & Small Icon Components ===================== */

const IconFile = ({
  type = "file"
}: {
  type?: string;
}) => {
  const common = "w-5 h-5";
  switch (type) {
    case "pdf":
      return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <text x="6" y="16" fill="currentColor" fontSize="9" fontWeight="700">PDF</text>
        </svg>;
    case "doc":
      return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <text x="5.5" y="16" fill="currentColor" fontSize="9" fontWeight="700">DOC</text>
        </svg>;
    case "img":
      return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="9" r="1.8" fill="currentColor" />
          <path d="M5 16l4-5 6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>;
    case "video":
      return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 8l4-3v14l-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>;
    default:
      return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>;
  }
};
const IconShare = ({
  className = ""
}: {
  className?: string;
}) => <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
const IconDownload = ({
  className = ""
}: {
  className?: string;
}) => <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 15v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;

/* ===================== Utility Types & Functions ===================== */

type UploadFile = {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // 'pdf','doc','img','video','other'
  progress: number; // 0-100
  status: "queued" | "uploading" | "done" | "error";
  thumbnail?: string; // data URL (optional)
  shared?: boolean;
};
const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* ===================== Main Hero Component ===================== */

const HeroSection: React.FC = () => {
  const {
    actualTheme
  } = useTheme();
  const navigate = useNavigate();
  const {
    scrollY
  } = useScroll();
  const glowWidth = useTransform(scrollY, [0, 300], ["0%", "100%"]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0, 1]);

  // Upload state (local simulation)
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [storageUsed, setStorageUsed] = useState<number>(1024 * 1024 * 1024 * 2.3); // example 2.3GB used
  const [capacity] = useState<number>(1024 * 1024 * 1024 * 10); // 10GB
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    return () => {
      // revoke object URLs created for thumbnails
      files.forEach(f => {
        if (f.thumbnail) URL.revokeObjectURL(f.thumbnail);
      });
      setFiles([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag & drop handlers
  useEffect(() => {
    const node = dropRef.current;
    if (!node) return;
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      const dt = e.dataTransfer;
      if (!dt) return;
      const dropped = Array.from(dt.files);
      handleAddFiles(dropped);
    };
    node.addEventListener("dragenter", prevent);
    node.addEventListener("dragover", prevent);
    node.addEventListener("dragleave", prevent);
    node.addEventListener("drop", onDrop);
    return () => {
      node.removeEventListener("dragenter", prevent);
      node.removeEventListener("dragover", prevent);
      node.removeEventListener("dragleave", prevent);
      node.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropRef.current]);

  // Add files and start fake upload
  const handleAddFiles = (fileList: File[]) => {
    if (!fileList?.length) return;
    const newFiles: UploadFile[] = Array.from(fileList).map(f => {
      const lower = (f.type || "").toLowerCase();
      let t: UploadFile["type"] = "other";
      if (lower.includes("pdf") || f.name.toLowerCase().endsWith(".pdf")) t = "pdf";else if (lower.includes("image") || lower.includes("png") || lower.includes("jpeg") || lower.includes("jpg") || f.name.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/)) t = "img";else if (lower.includes("word") || lower.includes("msword") || f.name.toLowerCase().endsWith(".doc") || f.name.toLowerCase().endsWith(".docx")) t = "doc";else if (lower.includes("video") || f.name.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/)) t = "video";
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return {
        id,
        name: f.name,
        size: f.size,
        type: t,
        progress: 0,
        status: "queued" as const,
        thumbnail: t === "img" ? URL.createObjectURL(f) : undefined,
        shared: false
      };
    });
    setFiles(prev => {
      const combined = [...newFiles, ...prev].slice(0, 50); // keep latest 50
      const added = newFiles.reduce((s, f) => s + f.size, 0);
      setStorageUsed(u => Math.min(u + added, capacity));
      return combined;
    });

    // start simulated upload for each new file
    newFiles.forEach(f => simulateUpload(f.id));
  };
  const simulateUpload = (id: string) => {
    setFiles(prev => prev.map(p => p.id === id ? {
      ...p,
      status: "uploading"
    } : p));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(6 + Math.random() * 12); // random progress increment
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(p => p.id === id ? {
          ...p,
          progress: 100,
          status: "done"
        } : p));
      } else {
        setFiles(prev => prev.map(p => p.id === id ? {
          ...p,
          progress: Math.min(progress, 99)
        } : p));
      }
    }, 350);
  };

  // Remove file
  const handleRemove = (id: string) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed) setStorageUsed(u => Math.max(0, u - removed.size));
      if (removed?.thumbnail) URL.revokeObjectURL(removed.thumbnail);
      return prev.filter(f => f.id !== id);
    });
  };

  // Toggle share
  const handleToggleShare = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? {
      ...f,
      shared: !f.shared
    } : f));
  };

  // Download handler (simulated by creating blob)
  const handleDownload = (f: UploadFile) => {
    const blob = new Blob([`Placeholder content for ${f.name}`], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // select files via input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) handleAddFiles(list);
    if (inputRef.current) inputRef.current.value = "";
  };

  // quick recent preview list (files with thumbnails)
  const recentThumbnails = files.filter(f => f.thumbnail).slice(0, 4);

  // accessibility: keyboard-trigger file select
  const handleKeyOpen = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      inputRef.current?.click();
    }
  };

  // Input ref (for click-browse)
  // defined here to avoid linter referencing before declaration
  // (kept above as well)
  // const inputRef = useRef<HTMLInputElement | null>(null);

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  return <section aria-label="Hero - File sharing" className="relative w-full min-h-screen flex items-start justify-center px-4 md:px-6 pt-24 pb-12 overflow-x-hidden bg-[#0b0b0b] text-white">

      {/* Blue blurred gradient (low opacity) and subtle grid overlay */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
        background: "linear-gradient(120deg, rgba(10,90,255,0.08) 0%, rgba(10,90,255,0.02) 40%, rgba(10,90,255,0.03) 100%)",
        filter: "blur(60px)",
        mixBlendMode: "screen"
      }} />
        {/* grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" aria-hidden>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left column: Title, description, upload zone */}
        <div className="space-y-6">
          <motion.h1 initial={{
          opacity: 0,
          y: 18
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} style={{
          fontFamily: "'Exo', sans-serif"
        }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Share Files.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Fast & Secure.
            </span>
            <br />
            <span className=" bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 ">
              Always In Your Control
            </span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 18
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.15
        }} style={{
          fontFamily: "'Urbanist', sans-serif"
        }} className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">Upload massive files instantly with end-to-end encryption. Zero storage limits. Built for teams who value speed, privacy, and complete control.</motion.p>

         {/* CTA Buttons */}
         <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
  {/* Primary CTA */}
  <Button onClick={() => navigate("/auth")} size="lg" className="flex items-center justify-center px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold rounded-xl shadow-lg transition-all text-white bg-transparent w-full sm:w-auto">
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
    Get Started
  </Button>

  {/* Outline CTA */}
  <Button onClick={() => navigate("/dashboard")} size="lg" variant="outline" className="flex items-center justify-center px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold rounded-xl border border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-500 transition-all w-full sm:w-auto">
    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
    Go to Dashboard
  </Button>
        </motion.div>


          {/* Simplified Upload / Drag & Drop Zone */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }}>
            <div ref={dropRef} role="button" tabIndex={0} onKeyDown={handleKeyOpen} aria-label="Upload files (drag and drop or click to select)" onClick={() => inputRef.current?.click()} className="relative w-full rounded-2xl border bg-gradient-to-b from-[#0f0f0f] to-[#0b0b0b] p-6 sm:p-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-300/50 hover:border-zinc-600/50 transition-all">
              <input ref={inputRef} type="file" multiple aria-hidden className="hidden" onChange={handleInputChange} />

              <div className="flex flex-col items-center justify-center text-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-stone-600/20 bg-[#eef0f3]/10">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-300" />
                </div>

                <div>
                  <p className="text-base sm:text-lg font-medium text-white mb-1">
                    Drag & drop files here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    or click to browse • PDF, DOC, JPG, PNG, MP4 • Max 2GB
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column: combined Storage + Shared + Project Files + Secure Upload (merged) */}
        <aside className="space-y-6">
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.5
        }} className="rounded-3xl border border-white/8 p-6 bg-gradient-to-b from-[#0f0f0f] to-[#070707] w-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            {/* Header: Title & actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Shared Storage & Project Files</h3>
                <p className="text-xs text-gray-400 mt-1">Collaboration, storage, and secure uploads — all in one place.</p>
              </div>

              <div className="flex items-center gap-2">
                
                <Button className="px-3 py-1 rounded-md border border-white/10 bg-zinc-100 text-slate-50">Share</Button>
              </div>
            </div>

            {/* Top stats row */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Storage Used</div>
                <div className="text-lg font-semibold mt-1">{formatBytes(storageUsed)} <span className="text-sm text-gray-400">/ {formatBytes(capacity)}</span></div>
                <div className="mt-3 w-full bg-white/6 h-2 rounded overflow-hidden">
                  <div className="h-full bg-white" style={{
                  width: `${Math.min(100, storageUsed / capacity * 100)}%`
                }} />
                </div>
              </div>

              <div className="w-44 text-right">
                <div className="text-xs text-gray-400">Files</div>
                <div className="text-lg font-semibold mt-1">{files.length}</div>
                <div className="mt-2 flex justify-end gap-2">
                  <button className="px-2 py-1 rounded-md border border-white/8 hover:bg-white/6 text-sm">Manage</button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-6 border-t border-white/6 pt-4 grid grid-cols-1 gap-4">
              {/* Shared folders list (example list - can map dynamic) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/8">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 7h6l2 3h8v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Project Files</div>
                      <div className="text-xs text-gray-400">24 files • 2.3 GB</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md hover:bg-white/6" title="Download all">
                      <IconDownload className="w-4 h-4 text-white/90" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-white/6" title="Share folder">
                      <IconShare className="w-4 h-4 text-white/90" />
                    </button>
                  </div>
                </div>

                {/* mini grid preview inside card (3 items) */}
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {["description", "image", "video_file"].map((icon, i) => <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/6 flex items-center justify-center">
                      <span className="text-xs text-gray-200 uppercase">{icon}</span>
                    </div>)}
                </div>
              </div>

              {/* Secure Upload mini card */}
              <div className="p-3 rounded-lg bg-white/4 border border-white/6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center border border-white/8">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Secure Upload</div>
                    <div className="text-xs text-gray-400">End-to-end encrypted • Auto virus check</div>
                  </div>
                </div>

                <div className="w-28">
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{
                    width: "80%"
                  }} />
                  </div>
                </div>
              </div>

              {/* Recent Files (small list) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Recent Uploads</div>
                  <div className="text-xs text-gray-400">See all</div>
                </div>

                <div className="space-y-2">
                  {files.slice(0, 4).map(f => <div key={f.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/8 overflow-hidden">
                          {f.thumbnail ? <img src={f.thumbnail} alt={f.name} className="w-full h-full object-cover" /> : <IconFile type={f.type} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{f.name}</div>
                          <div className="text-xs text-gray-400">{formatBytes(f.size)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload(f)} className="p-2 rounded-md hover:bg-white/6" title="Download">
                          <IconDownload className="w-4 h-4 text-white/90" />
                        </button>
                        <button onClick={() => handleToggleShare(f.id)} className={`p-2 rounded-md hover:bg-white/6 ${f.shared ? "text-blue-200" : "text-white/80"}`} title="Share">
                          <IconShare className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemove(f.id)} className="p-2 rounded-md hover:bg-red-600/30 text-red-400" title="Remove">
                          ×
                        </button>
                      </div>
                    </div>)}
                  {files.length === 0 && <div className="text-xs text-gray-400">No recent uploads</div>}
                </div>
              </div>

              {/* Extra space for text/data (right-side reserved area) */}
              <div className="mt-2 border-t border-white/6 pt-4">
                <div className="text-sm font-medium">Details / Notes</div>
                <div className="mt-2 text-xs text-gray-400 p-3 rounded-lg bg-white/3">
                  Add additional descriptions, project notes, or administrative instructions here. This area is reserved for future content like analytics, folder policies, or short descriptions.
                </div>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* bottom glow line controlled by scroll */}
      <motion.div className="absolute bottom-0 left-0 h-px" style={{
      width: glowWidth,
      opacity: glowOpacity,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
      boxShadow: "0 0 25px rgba(255,255,255,0.04)"
    }} aria-hidden />
    </section>;
};
export default HeroSection;
