// FileTransferDemo.tsx
// Minimal Pro Studio — professional, calm, cinematic showcase section
// React + Tailwind + framer-motion + lucide-react required
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import {
  Database,
  UploadCloud,
  DownloadCloud,
  Monitor,
  Shield,
  Lock,
  Star,
  Clock,
  BarChart2,
  Image,
  Folder,
  Layers,
  CloudSnow,
  Zap,
  Settings,
} from "lucide-react";

/**
 * FileTransferDemo (Minimal Pro Studio)
 * - Purely a showcase / visual section (no uploads)
 * - Colors: black / white / blue-600 emphasis
 * - Accessibility minded, responsive, and production-ready markup
 *
 * Usage:
 * <FileTransferDemo initialPreview="/example-dashboard.png" />
 */

type Props = {
  initialPreview?: string;
};

const easing = [0.16, 1, 0.3, 1];

const cardFade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
};

const subtleFloat: Variants = {
  float: {
    y: [0, -6, 0],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
};

const accent = "bg-gradient-to-r from-blue-600 to-blue-500";
const borderAccent = "border-blue-600/30";

const Meter = ({ value = 0 }: { value?: number }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-[#161616]">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg,#2563eb 0%, #60a5fa 70%)",
          boxShadow: "0 6px 18px rgba(37,99,235,0.12)",
        }}
      />
    </div>
  );
};

const TinySpark = ({ value = 0 }: { value?: number }) => {
  // small inline sparkline using few points derived from value
  const v = Math.min(50, Math.max(0, Math.round(value)));
  const points = [v * 0.25, v * 0.4, v * 0.75, v * 0.6, v * 0.9, v].map((n) => Math.max(2, n));
  const max = Math.max(...points);
  const width = 80;
  const height = 24;
  const step = width / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / max) * (height - 4)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" stroke="#60a5fa" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-xs text-neutral-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <motion.div variants={cardFade} className="rounded-xl bg-[#070707] border border-[#141414] p-4 flex gap-3 items-start">
    <div className="p-2 rounded-md bg-white/4 border border-white/6">
      {icon}
    </div>
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-neutral-400 mt-1">{desc}</div>
    </div>
  </motion.div>
);

const FileTransferDemo: React.FC<Props> = ({ initialPreview }) => {
  const controls = useAnimation();
  const [preview, setPreview] = useState<string | undefined>(initialPreview);
  const [progress, setProgress] = useState<number>(14); // static starting progress for showcase
  const [speed] = useState<number>(480); // example in MB/s (visual)
  const [sizeMB] = useState<number>(2300);
  const [activeTransfers, setActiveTransfers] = useState<number>(12);
  const [packets] = useState<number>(6);
  const [showMeta, setShowMeta] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    controls.start("show");
    // subtle simulated progress tick for showcase
    let t: number | null = window.setInterval(() => {
      setProgress((p) => {
        const next = p + (Math.random() * 0.9 + 0.2);
        return next >= 99 ? 99 : Number(next.toFixed(2));
      });
    }, 1200);
    return () => {
      if (t) window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // parallax (subtle) for desktop
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `translate3d(${x * 6}px, ${y * 4}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // handlers (showcase-only)
  const handleUseDemo = () => setPreview("/example-dashboard.png");
  const handleClearPreview = () => setPreview(undefined);
  const handleUploadPlaceholder = () => {
    // no backend — just a gentle UX microinteraction
    setShowMeta(true);
    setTimeout(() => setShowMeta(false), 1800);
  };

  return (
    <section className="relative py-16 px-6 md:px-12 bg-gradient-to-b from-[#040405] via-[#060607] to-[#0b0b0b] text-white">
      <div className="max-w-7xl mx-auto" ref={stageRef}>
        {/* header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Minimal Pro Studio — File Transfer Showcase</h2>
            <p className="mt-3 text-neutral-400">
              A calm, professional presentation of a secure file-transfer product. Clean glass cards, subtle motion,
              and a focused blue accent to highlight important controls and metrics.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${accent} text-white`}>
                <Star className="w-4 h-4" /> Studio Theme
              </div>
              <div className="px-3 py-1 rounded-full bg-white/6 text-sm text-neutral-300 border border-white/6">Black • White • Blue</div>
              <div className="px-3 py-1 rounded-full bg-white/6 text-sm text-neutral-300 border border-white/6 hidden md:inline">Sleek & Minimal</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${accent} shadow-sm`}
              onClick={handleUploadPlaceholder}
              aria-label="Request demo action"
            >
              <UploadCloud className="w-4 h-4" /> Request Preview
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-2 rounded-lg bg-transparent text-sm border border-white/6"
              onClick={() => {
                setProgress(6);
                setActiveTransfers(3);
              }}
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* layout */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* left column — cards & metrics */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div variants={cardFade} initial="hidden" animate="show" className={`rounded-2xl p-5 bg-[#060606] border ${borderAccent} shadow-[0_18px_48px_rgba(2,6,23,0.7)]`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/4 border border-white/6">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Secure Stream</div>
                    <div className="text-xs text-neutral-400">Enterprise grade • minimal latency</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-neutral-400">Active transfers</div>
                  <div className="text-lg font-semibold text-white">{activeTransfers}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-neutral-400">Current transfer</div>
                          <div className="text-lg font-semibold text-white">project-archive.zip</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-400">Size</div>
                          <div className="text-sm font-semibold text-white">{sizeMB} MB</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Meter value={progress} />
                        <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                          <div>{Math.round((progress / 100) * sizeMB)} MB</div>
                          <div>{Math.round(speed)} MB/s</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-28 text-center">
                      <div className="text-xs text-neutral-400">ETA</div>
                      <div className="text-lg font-semibold text-white">{progress < 99 ? `${(100 - progress) < 1 ? "Inst" : `${Math.max(1, Math.round((100 - progress) / 4))}m`}` : "Done"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3">
                  <div className="w-full bg-[#050505] border border-[#161616] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-neutral-400">Integrity</div>
                      <div className="text-sm font-semibold text-white">AES-256</div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <TinySpark value={progress} />
                      <div className="ml-auto text-xs text-neutral-400">Verified</div>
                    </div>
                  </div>

                  <div className="w-full bg-[#050505] border border-[#161616] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-neutral-400">Uptime</div>
                      <div className="text-sm font-semibold text-white">99.99%</div>
                    </div>
                    <div className="mt-3 text-xs text-neutral-400">SLA-backed infrastructure</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <Stat label="Avg speed" value={`${Math.round(speed)} MB/s`} />
                <Stat label="Data centers" value="12 regions" />
                <Stat label="Nodes" value="24" />
                <Stat label="Audit logs" value="Enabled" />
              </div>
            </motion.div>

            {/* features */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Feature
                icon={<Shield className="w-5 h-5 text-blue-400" />}
                title="End-to-end encryption"
                desc="Automatic AES-256 encryption during transit and at rest for every file."
              />
              <Feature
                icon={<Zap className="w-5 h-5 text-blue-400" />}
                title="Optimized transfer"
                desc="Bandwidth-aware chunking and parallel streams reduce latency and improve reliability."
              />
              <Feature
                icon={<Layers className="w-5 h-5 text-blue-400" />}
                title="Granular control"
                desc="Expiring links, role-based access, and audit-ready logs for enterprise workflows."
              />
            </motion.div>

            {/* pipeline visual — purely decorative */}
            <motion.div initial="hidden" animate="show" variants={cardFade} className="rounded-2xl bg-[#060606] border border-[#141414] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/4 border border-white/6"><Folder className="w-4 h-4 text-blue-400" /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">Pipeline</div>
                    <div className="text-xs text-neutral-400">Client → Edge → Core</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400">Throughput</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-[#050505] border border-[#171717] p-3">
                  <div className="text-xs text-neutral-400 mb-2">Client</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white/3 border border-white/6 flex items-center justify-center"><Image className="w-4 h-4 text-blue-400" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">Browser</div>
                      <div className="text-xs text-neutral-400">TLS • Parallel chunks</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#050505] border border-[#171717] p-3">
                  <div className="text-xs text-neutral-400 mb-2">Edge</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white/3 border border-white/6 flex items-center justify-center"><CloudSnow className="w-4 h-4 text-blue-400" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">Edge CDN</div>
                      <div className="text-xs text-neutral-400">Caching • Replay-resume</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#050505] border border-[#171717] p-3">
                  <div className="text-xs text-neutral-400 mb-2">Core</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white/3 border border-white/6 flex items-center justify-center"><Database className="w-4 h-4 text-blue-400" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">Storage</div>
                      <div className="text-xs text-neutral-400">Encrypted • Hot & Cold tiers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-full">
                    <div className="text-xs text-neutral-400">Overall throughput</div>
                    <div className="mt-2"><Meter value={Math.min(100, progress + 10)} /></div>
                  </div>

                  <div className="w-36 text-right">
                    <div className="text-xs text-neutral-400">Packets</div>
                    <div className="text-sm font-semibold text-white">{packets}</div>
                    <div className="mt-2"><TinySpark value={progress} /></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        {/* footer CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-12 rounded-2xl p-6 bg-gradient-to-b from-[#050505] to-[#040404] border border-[#141414] text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Ready to present in your studio?</div>
            <div className="text-xs text-neutral-400 mt-1">This section is a polished, professional showcase — plug it into marketing pages or the product tour.</div>
          </div>

          <div className="flex items-center gap-3">
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${accent}`}>Get Studio Theme</button>
            <button className="px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm">Learn more</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FileTransferDemo;

/* Helpers (internal) */
// (kept minimal so single-file usage is easy)
// format bytes: used if you want to quickly show file sizes
function formatBytes(bytes: number | undefined) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
