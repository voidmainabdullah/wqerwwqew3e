// FileTransferDemo.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import {
  UploadCloud,
  Lock,
  Cloud,
  Database,
  ShieldCheck,
  BarChart2,
  Zap,
  Folder,
  Clock,
  Activity
} from "lucide-react";

/**
 * FileTransferDemo
 * Clean, black/white studio showcase of secure file transfer pipeline.
 * - TailwindCSS for layout (expects tailwind in project)
 * - framer-motion for subtle animations
 * - lucide-react icons
 *
 * Paste into your component tree: <FileTransferDemo />
 */

type Props = {
  initialFileName?: string;
};

const easing = [0.16, 1, 0.3, 1] as const;

const cardFade: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing as any } },
};

const pulse = {
  hidden: { scale: 0.95, opacity: 0.6 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.9, yoyo: Infinity } },
};

const accentGradient = "bg-gradient-to-r from-white to-white/80"; // subtle white-on-black accent

// ---------- Small components ----------
const Meter: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full rounded-full h-2 bg-black border border-white/6 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))",
          boxShadow: "0 6px 18px rgba(255,255,255,0.03)",
        }}
        aria-hidden
      />
    </div>
  );
};

const TinySparkline: React.FC<{ value: number }> = ({ value }) => {
  const v = Math.min(70, Math.max(2, Math.round(value)));
  const points = [v * 0.15, v * 0.4, v * 0.7, v * 0.45, v * 0.85, v].map((n) => Math.max(2, n));
  const max = Math.max(...points);
  const width = 80;
  const height = 24;
  const step = width / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / max) * (height - 4)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" stroke="white" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.95 }} />
    </svg>
  );
};

const StatBlock: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-white/60">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

// ---------- Main component ----------
const FileTransferDemo: React.FC<Props> = ({ initialFileName = "project-archive.zip" }) => {
  const controls = useAnimation();
  const [progress, setProgress] = useState<number>(14);
  const [speed, setSpeed] = useState<number>(420); // illustrative MB/s
  const [active, setActive] = useState<number>(9);
  const [packets, setPackets] = useState<number>(6);
  const [fileName, setFileName] = useState(initialFileName);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    controls.start("show");
    const t = window.setInterval(() => {
      setProgress((p) => {
        const next = p + (Math.random() * 1.2 + 0.4);
        return next >= 99 ? 99 : Number(next.toFixed(2));
      });
      // simulate small variations
      setSpeed((s) => Math.max(120, Math.round(s + (Math.random() * 40 - 20))));
    }, 1100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // parallax micro movement
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

  // small helper actions (showcase only)
  const handleBoost = () => {
    setProgress((p) => Math.min(99, p + 8));
    setPackets((n) => Math.min(20, n + 2));
    setActive((a) => Math.min(24, a + 2));
  };

  const handleReset = () => {
    setProgress(6);
    setSpeed(420);
    setActive(3);
    setPackets(4);
  };

  return (
    <section className="relative py-12 px-6 md:px-10 bg-black text-white">
      <div className="max-w-6xl mx-auto" ref={stageRef}>
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={cardFade} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Secure File Transfer — Visual Flow</h2>
            <p className="mt-2 text-sm text-white/70">Clean, minimal presentation of how a file moves securely: upload → encryption → transport → encrypted storage.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/6 border border-white/6">
                <UploadCloud className="w-4 h-4" /> Live demo
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-transparent border border-white/6">Black • White • Minimal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={handleBoost} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
              Speed Boost
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleReset} className="px-3 py-2 rounded-lg border border-white/10 text-sm">
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* left: pipeline + stats */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div variants={cardFade} className="rounded-2xl p-5 bg-[#060606] border border-white/8">
              {/* pipeline visual */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white/6 border border-white/8">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Current transfer</div>
                      <div className="text-xs text-white/60 truncate" title={fileName}>{fileName}</div>
                    </div>
                  </div>

                  <div className="text-xs text-white/60 flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-white/60">Progress</div>
                      <div className="text-sm font-semibold">{Math.round(progress)}%</div>
                    </div>
                    <div className="w-36">
                      <Meter value={progress} />
                    </div>
                  </div>
                </div>

                {/* pipeline steps */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { key: "upload", icon: <UploadCloud className="w-4 h-4" />, label: "Upload", detail: "Client" },
                    { key: "encrypt", icon: <Lock className="w-4 h-4" />, label: "Encrypt", detail: "AES-256" },
                    { key: "transfer", icon: <Cloud className="w-4 h-4" />, label: "Transfer", detail: "Parallel streams" },
                    { key: "store", icon: <Database className="w-4 h-4" />, label: "Store", detail: "Encrypted storage" },
                  ].map((s, i) => {
                    const stepProgress = Math.max(0, Math.min(100, progress - i * 15));
                    return (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * i, duration: 0.45 }}
                        className="rounded-lg bg-[#050505] border border-white/6 p-3 flex flex-col items-start gap-2"
                        aria-hidden
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-2 rounded-md bg-white/6 border border-white/8">{s.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{s.label}</div>
                            <div className="text-xs text-white/60">{s.detail}</div>
                          </div>
                          <div className="text-xs text-white/60">{Math.round(Math.max(6, stepProgress))}%</div>
                        </div>
                        <div className="w-full mt-2">
                          <div className="w-full h-1 bg-black border border-white/6 rounded overflow-hidden">
                            <div style={{ width: `${Math.max(6, stepProgress)}%` }} className="h-full bg-white/80 transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* mini analytics row */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg p-3 bg-[#050505] border border-white/8 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Avg speed</div>
                      <div className="text-sm font-semibold text-white">{Math.round(speed)} MB/s</div>
                    </div>
                    <TinySpark value={progress} />
                  </div>

                  <div className="rounded-lg p-3 bg-[#050505] border border-white/8 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Active transfers</div>
                      <div className="text-sm font-semibold text-white">{active}</div>
                    </div>
                    <div className="text-xs text-white/60">packets x{packets}</div>
                  </div>

                  <div className="rounded-lg p-3 bg-[#050505] border border-white/8 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Integrity</div>
                      <div className="text-sm font-semibold text-white">AES-256</div>
                    </div>
                    <div className="p-1 rounded bg-white/6"><ShieldCheck className="w-4 h-4" /></div>
                  </div>
                </div>

                {/* small stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBlock label="Data centers" value="12 regions" />
                  <StatBlock label="Nodes" value="24" />
                  <StatBlock label="SLA" value="99.99%" />
                  <StatBlock label="Audit logs" value="Enabled" />
                </div>
              </div>
            </motion.div>

            {/* pipeline summary / graph */}
            <motion.div variants={cardFade} className="rounded-2xl p-5 bg-[#060606] border border-white/8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/6 border border-white/8"><BarChart2 className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-semibold">Transfer throughput</div>
                    <div className="text-xs text-white/60">Visualized for stakeholders</div>
                  </div>
                </div>

                <div className="text-xs text-white/60">Live</div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  {/* simple animated bars */}
                  <div className="flex items-end gap-2 h-28">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const height = Math.max(6, Math.round(((progress + (Math.sin(i + progress / 12) * 8)) % 100) / 100 * 100));
                      return (
                        <motion.div
                          key={i}
                          animate={{ height: `${6 + (height / 100) * 100}%` }}
                          transition={{ duration: 0.9, yoyo: Infinity, ease: "easeInOut" }}
                          className="w-3 rounded bg-white/70"
                          style={{ minHeight: 8 }}
                          aria-hidden
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="w-40 flex flex-col gap-2">
                  <div className="text-xs text-white/60">Packets</div>
                  <div className="text-lg font-semibold text-white">x{packets}</div>
                  <div className="text-xs text-white/60">Last update: a few seconds</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* right: compact preview / controls */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div variants={cardFade} className="rounded-2xl p-5 bg-gradient-to-b from-[#050505] to-[#070707] border border-white/8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/6 border border-white/8"><Activity className="w-5 h-5" /></div>
                  <div>
                    <div className="text-sm font-semibold">Secure visualizer</div>
                    <div className="text-xs text-white/60">Flow snapshot</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-white/60">ETA</div>
                  <div className="text-sm font-semibold text-white">{progress < 99 ? `${Math.max(1, Math.round((100 - progress) / 4))}m` : "Done"}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="bg-[#050505] border border-white/8 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Filename</div>
                      <div className="text-sm font-semibold text-white truncate" title={fileName}>{fileName}</div>
                    </div>
                    <div className="text-xs text-white/60">{formatBytes(Math.round((progress / 100) * 2300000000))}</div>
                  </div>

                  <div className="mt-3">
                    <Meter value={progress} />
                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                      <div>{Math.round((progress / 100) * 2300)} MB</div>
                      <div>{Math.round(speed)} MB/s</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#050505] border border-white/8 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">Controls</div>
                    <div className="text-sm font-semibold text-white">Interactive</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setProgress((p) => Math.min(99, p + 6))} className="flex-1 px-3 py-2 rounded-lg bg-white text-black text-sm">Advance</button>
                    <button onClick={() => setActive((a) => Math.max(1, a - 1))} className="px-3 py-2 rounded-lg border border-white/8 text-sm">-</button>
                    <button onClick={() => setActive((a) => a + 1)} className="px-3 py-2 rounded-lg border border-white/8 text-sm">+</button>
                  </div>
                </div>

                <div className="bg-[#050505] border border-white/8 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Security</div>
                      <div className="text-sm font-semibold text-white">AES-256 • TLS</div>
                    </div>
                    <div className="p-1 rounded bg-white/6"><Lock className="w-4 h-4" /></div>
                  </div>

                  <div className="mt-3 text-xs text-white/60">End-to-end encryption with integrity checks and audit logs.</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardFade} className="rounded-2xl p-4 bg-[#060606] border border-white/8 flex items-center justify-between">
              <div>
                <div className="text-xs text-white/60">Studio CTA</div>
                <div className="text-sm font-semibold text-white">Use this module in product pages</div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => { /* placeholder */ }} className="px-4 py-2 rounded-lg bg-white text-black text-sm">Get Theme</button>
                <button onClick={() => { /* placeholder */ }} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Learn</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FileTransferDemo;

// ---------- helpers ----------
function formatBytes(bytes: number | undefined) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
