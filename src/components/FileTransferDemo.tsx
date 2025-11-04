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
  Folder,
  Activity,
} from "lucide-react";

/**
 * FileTransferDemo.tsx
 * A professional, black-and-white visual showcase for a secure file transfer pipeline.
 * - Clean studio UI (Tailwind)
 * - framer-motion subtle animations
 * - Lucide-react icons
 */

type Props = {
  initialFileName?: string;
};

// Motion Variants
const easing = [0.16, 1, 0.3, 1] as const;

const cardFade: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing as any } },
};

// UI Helpers
const Meter: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full rounded-full h-2 bg-black border border-white/6 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))",
        }}
      />
    </div>
  );
};

const TinySparkline: React.FC<{ value: number }> = ({ value }) => {
  const v = Math.min(70, Math.max(2, Math.round(value)));
  const points = [v * 0.15, v * 0.4, v * 0.7, v * 0.45, v * 0.85, v];
  const max = Math.max(...points);
  const width = 80;
  const height = 24;
  const step = width / (points.length - 1);
  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / max) * (height - 4)}`
    )
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={d}
        fill="none"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.95 }}
      />
    </svg>
  );
};

const StatBlock: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-white/60">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

// Format bytes helper
const formatBytes = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB"][i];
};

// --------------------------- MAIN COMPONENT ---------------------------
const FileTransferDemo: React.FC<Props> = ({ initialFileName = "project-archive.zip" }) => {
  const controls = useAnimation();
  const [progress, setProgress] = useState<number>(14);
  const [speed, setSpeed] = useState<number>(420);
  const [active, setActive] = useState<number>(9);
  const [packets, setPackets] = useState<number>(6);
  const [fileName, setFileName] = useState(initialFileName);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Animate progress + speed
  useEffect(() => {
    controls.start("show");
    const t = window.setInterval(() => {
      setProgress((p) => Math.min(99, p + (Math.random() * 1.2 + 0.4)));
      setSpeed((s) => Math.max(120, Math.round(s + (Math.random() * 40 - 20))));
    }, 1100);
    return () => clearInterval(t);
  }, [controls]);

  // Slight parallax movement
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

  // Mini actions
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
        <motion.div
          initial="hidden"
          animate="show"
          variants={cardFade}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Secure File Transfer — Visual Flow
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Clean, minimal presentation of a secure transfer pipeline: upload →
              encryption → transfer → encrypted storage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleBoost}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
            >
              Speed Boost
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-white/10 text-sm"
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Section */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div
              variants={cardFade}
              className="rounded-2xl p-5 bg-[#060606] border border-white/8"
            >
              {/* Transfer Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/6 border border-white/8">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Current Transfer</div>
                    <div
                      className="text-xs text-white/60 truncate"
                      title={fileName}
                    >
                      {fileName}
                    </div>
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

              {/* Step Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { icon: <UploadCloud />, label: "Upload", detail: "Client" },
                  { icon: <Lock />, label: "Encrypt", detail: "AES-256" },
                  { icon: <Cloud />, label: "Transfer", detail: "TLS Layer" },
                  { icon: <Database />, label: "Store", detail: "Encrypted" },
                ].map((s, i) => {
                  const stepProgress = Math.max(6, Math.min(100, progress - i * 15));
                  return (
                    <div
                      key={i}
                      className="rounded-lg bg-[#050505] border border-white/6 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-white/6 border border-white/8">
                            {s.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {s.label}
                            </div>
                            <div className="text-xs text-white/60">{s.detail}</div>
                          </div>
                        </div>
                        <div className="text-xs text-white/60">
                          {Math.round(stepProgress)}%
                        </div>
                      </div>
                      <div className="mt-2 w-full h-1 bg-black border border-white/6 rounded overflow-hidden">
                        <div
                          style={{ width: `${stepProgress}%` }}
                          className="h-full bg-white/80 transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini Stats */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Avg Speed</div>
                    <div className="text-sm font-semibold text-white">
                      {Math.round(speed)} MB/s
                    </div>
                  </div>
                  <TinySparkline value={progress} />
                </div>

                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Active Transfers</div>
                    <div className="text-sm font-semibold text-white">{active}</div>
                  </div>
                  <div className="text-xs text-white/60">x{packets}</div>
                </div>

                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Integrity</div>
                    <div className="text-sm font-semibold text-white">AES-256</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-white/70" />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBlock label="Data Centers" value="12 Regions" />
                <StatBlock label="Nodes" value="24" />
                <StatBlock label="SLA" value="99.99%" />
                <StatBlock label="Audit Logs" value="Enabled" />
              </div>
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div
              variants={cardFade}
              className="rounded-2xl p-5 bg-[#070707] border border-white/8"
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <Activity className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-semibold">Visualizer</div>
                    <div className="text-xs text-white/60">Live Snapshot</div>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  ETA:{" "}
                  {progress < 99
                    ? `${Math.max(1, Math.round((100 - progress) / 4))}m`
                    : "Done"}
                </div>
              </div>

              <div className="mt-4 bg-[#050505] border border-white/8 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-white/60">Filename</div>
                    <div className="text-sm font-semibold truncate">
                      {fileName}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">
                    {formatBytes((progress / 100) * 2300000000)}
                  </div>
                </div>
                <div className="mt-3">
                  <Meter value={progress} />
                  <div className="mt-2 flex justify-between text-xs text-white/60">
                    <span>{Math.round((progress / 100) * 2300)} MB</span>
                    <span>{Math.round(speed)} MB/s</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-[#050505] border border-white/8 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-white/60">Security</div>
                    <div className="text-sm font-semibold text-white">
                      AES-256 • TLS
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-white/70" />
                </div>
                <p className="mt-2 text-xs text-white/60">
                  End-to-end encryption with integrity checks and audit logs.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FileTransferDemo;
