import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button"; // retain your Button component
import { useTheme } from "@/contexts/ThemeContext";

/* ===================== Helpers & Small Icon Components ===================== */

const IconFile = ({ type = "file" }: { type?: string }) => {
  const common = "w-5 h-5";
  switch (type) {
    case "pdf":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <text x="6" y="16" fill="currentColor" fontSize="9" fontWeight="700">PDF</text>
        </svg>
      );
    case "doc":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <text x="5.5" y="16" fill="currentColor" fontSize="9" fontWeight="700">DOC</text>
        </svg>
      );
    case "img":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="9" r="1.8" fill="currentColor" />
          <path d="M5 16l4-5 6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "video":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 8l4-3v14l-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};

const IconShare = ({ className = "" }: { className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = ({ className = "" }: { className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 15v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  const { actualTheme } = useTheme();
  const { scrollY } = useScroll();
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
      files.forEach((f) => {
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
    const newFiles: UploadFile[] = Array.from(fileList).map((f) => {
      const lower = (f.type || "").toLowerCase();
      let t: UploadFile["type"] = "other";
      if (lower.includes("pdf") || f.name.toLowerCase().endsWith(".pdf")) t = "pdf";
      else if (
        lower.includes("image") ||
        lower.includes("png") ||
        lower.includes("jpeg") ||
        lower.includes("jpg") ||
        f.name.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/)
      )
        t = "img";
      else if (
        lower.includes("word") ||
        lower.includes("msword") ||
        f.name.toLowerCase().endsWith(".doc") ||
        f.name.toLowerCase().endsWith(".docx")
      )
        t = "doc";
      else if (lower.includes("video") || f.name.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/)) t = "video";

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return {
        id,
        name: f.name,
        size: f.size,
        type: t,
        progress: 0,
        status: "queued" as const,
        thumbnail: t === "img" ? URL.createObjectURL(f) : undefined,
        shared: false,
      };
    });

    setFiles((prev) => {
      const combined = [...newFiles, ...prev].slice(0, 50); // keep latest 50
      const added = newFiles.reduce((s, f) => s + f.size, 0);
      setStorageUsed((u) => Math.min(u + added, capacity));
      return combined;
    });

    // start simulated upload for each new file
    newFiles.forEach((f) => simulateUpload(f.id));
  };

  const simulateUpload = (id: string) => {
    setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, status: "uploading" } : p)));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(6 + Math.random() * 12); // random progress increment
      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, progress: 100, status: "done" } : p)));
      } else {
        setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, progress: Math.min(progress, 99) } : p)));
      }
    }, 350);
  };

  // Remove file
  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) setStorageUsed((u) => Math.max(0, u - removed.size));
      if (removed?.thumbnail) URL.revokeObjectURL(removed.thumbnail);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Toggle share
  const handleToggleShare = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, shared: !f.shared } : f)));
  };

  // Download handler (simulated by creating blob)
  const handleDownload = (f: UploadFile) => {
    const blob = new Blob([`Placeholder content for ${f.name}`], { type: "text/plain" });
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
  const recentThumbnails = files.filter((f) => f.thumbnail).slice(0, 4);

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
  return (
   <section
  aria-label="Hero - File sharing"
  className="relative w-full min-h-screen flex items-start justify-center px-6 pt-24 pb-12 overflow-hidden bg-[#0b0b0b] text-white"
>

      {/* Blue blurred gradient (low opacity) and subtle grid overlay */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(10,90,255,0.08) 0%, rgba(10,90,255,0.02) 40%, rgba(10,90,255,0.03) 100%)",
            filter: "blur(60px)",
            mixBlendMode: "screen",
          }}
        />
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

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left column: Title, description, upload zone */}
        <div className="space-y-6">
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl font-extrabold leading-tight">
           The Ultimate  
File Sharing Platform  


            <br />
            <span className="bg-clip-text text-transparent" style={{ background: "linear-gradient(90deg,#ff7e5f,#feb47b)" }}>
  The Ultimate File Sharing Platform
</span>{" "}
            In Your Control 
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="text-gray-300 max-w-xl">
           Built for teams, creators, and professionals who value privacy and performance.
Upload, store, and share files securely with end-to-end encryption.
Experience lightning-fast transfers and seamless collaboration anywhere.
Organize projects, manage access, and track sharing activity with ease.
All in a beautifully minimal, black-and-white interface inspired by Apple.
Fast. Secure. Effortless — your cloud, your control.
          </motion.p>

          {/* Upload / Drag & Drop Zone */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div
              ref={dropRef}
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyOpen}
              aria-label="Upload files (drag and drop or click to select)"
              onClick={() => inputRef.current?.click()}
              className="relative w-full rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#0f0f0f] to-[#0b0b0b] p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 hover:border-white/20 transition-all"
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                aria-hidden
                className="hidden"
                onChange={handleInputChange}
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-white/5">
                  {/* drag icon */}
                  <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="15" width="18" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">Drag & drop files here</p>
                      <p className="text-xs text-gray-400">or click to browse (PDF, DOC, JPG, PNG, MP4)</p>
                    </div>

                    <div className="ml-4 text-xs text-gray-400">
                      <strong>{formatBytes(storageUsed)}</strong> of {formatBytes(capacity)} used
                      <div className="w-44 h-2 bg-white/5 rounded-full mt-2 overflow-hidden" aria-hidden>
                        <div
                          className="h-full bg-white"
                          style={{ width: `${Math.min(100, (storageUsed / capacity) * 100)}%`, opacity: 0.9 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* quick file-type badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["pdf", "doc", "img", "video", "other"].map((t) => (
                      <div key={t} className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 border border-white/6 text-xs text-gray-200">
                        <IconFile type={t === "other" ? "file" : t} />
                        <span className="uppercase">{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* recent thumbnails */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Recent</p>
                    <div className="flex items-center gap-3">
                      {recentThumbnails.length ? (
                        recentThumbnails.map((f) => (
                          <div key={f.id} className="w-14 h-14 rounded-lg overflow-hidden border border-white/6 bg-white/3">
                            <img src={f.thumbnail} alt={f.name} className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">No recent images</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* visual indicator bottom */}
              <div className="mt-4 flex items-center gap-3">
                <div className="text-xs text-gray-400">Accepted: PDF, DOC, JPG, PNG, MP4</div>
                <div className="ml-auto text-xs text-gray-400">Max file size: 2GB</div>
              </div>
            </div>
          </motion.div>

          {/* Upload queue (progress bars) */}
          <div aria-live="polite" className="mt-4 space-y-3">
            {files.map((f) => (
              <div key={f.id} className="rounded-md border border-white/6 p-3 bg-white/3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 border border-white/6">
                  <IconFile type={f.type === "other" ? "file" : f.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        {f.shared && <span className="text-xs px-2 py-0.5 rounded bg-white/8">Shared</span>}
                      </div>
                      <div className="text-xs text-gray-400">{formatBytes(f.size)}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        aria-label={`Share ${f.name}`}
                        onClick={() => handleToggleShare(f.id)}
                        className="p-1 rounded-md hover:bg-white/6 transition"
                        title="Share"
                      >
                        <IconShare className="w-4 h-4 text-white/90" />
                      </button>
                      <button
                        aria-label={`Download ${f.name}`}
                        onClick={() => handleDownload(f)}
                        className="p-1 rounded-md hover:bg-white/6 transition"
                        title="Download"
                      >
                        <IconDownload className="w-4 h-4 text-white/90" />
                      </button>
                      <button
                        aria-label={`Remove ${f.name}`}
                        onClick={() => handleRemove(f.id)}
                        className="p-1 rounded-md hover:bg-red-600/30 text-red-400 transition"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* progress bar */}
                  <div className="mt-3 h-2 bg-white/6 rounded-full overflow-hidden" aria-hidden>
                    <div
                      className={`h-full ${f.status === "done" ? "bg-white" : "bg-white/80"}`}
                      style={{ width: `${f.progress}%`, transition: "width 300ms linear" }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <div>{f.status === "uploading" ? `Uploading — ${Math.round(f.progress)}%` : f.status === "done" ? "Uploaded" : f.status}</div>
                    <div>{f.status === "uploading" ? "…" : f.status === "done" ? "Ready" : ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: combined Storage + Shared + Project Files + Secure Upload (merged) */}
        <aside className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-white/8 p-6 bg-gradient-to-b from-[#0f0f0f] to-[#070707] w-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            {/* Header: Title & actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Shared Storage & Project Files</h3>
                <p className="text-xs text-gray-400 mt-1">Collaboration, storage, and secure uploads — all in one place.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button className="px-3 py-1 rounded-md bg-white text-black hover:bg-gray-200">Upload</Button>
                <Button className="px-3 py-1 rounded-md border border-white/10 bg-transparent">Share</Button>
              </div>
            </div>

            {/* Top stats row */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Storage Used</div>
                <div className="text-lg font-semibold mt-1">{formatBytes(storageUsed)} <span className="text-sm text-gray-400">/ {formatBytes(capacity)}</span></div>
                <div className="mt-3 w-full bg-white/6 h-2 rounded overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${Math.min(100, (storageUsed / capacity) * 100)}%` }} />
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
                  {["description", "image", "video_file"].map((icon, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/6 flex items-center justify-center">
                      <span className="text-xs text-gray-200 uppercase">{icon}</span>
                    </div>
                  ))}
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
                    <div className="h-full bg-white" style={{ width: "80%" }} />
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
                  {files.slice(0, 4).map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3">
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
                    </div>
                  ))}
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
      <motion.div
        className="absolute bottom-0 left-0 h-px"
        style={{
          width: glowWidth,
          opacity: glowOpacity,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          boxShadow: "0 0 25px rgba(255,255,255,0.04)",
        }}
        aria-hidden
      />
    </section>
  );
};

export default HeroSection;
