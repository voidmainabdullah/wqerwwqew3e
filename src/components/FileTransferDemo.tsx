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
  Code,
} from "lucide-react";

/**
 * FileTransferDemo.tsx
 * Professional visual for secure transfer + analytics + API showcase
 * Apple-style: black, white, subtle motion, minimal UI.
 */

type Props = {
  initialFileName?: string;
};

// ---------------- Motion Variants ----------------
const easing = [0.16, 1, 0.3, 1] as const;

const cardFade: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing as any } },
};

// ---------------- Helper Components ----------------
const Meter: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full rounded-full h-2 bg-black border border-white/6 overflow-hidden">
      <div
        className="h-full transition-all rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
        }}
      />
    </div>
  );
};

const TinySparkline: React.FC<{ value: number }> = ({ value }) => {
  const points = Array.from({ length: 7 }, (_, i) =>
    Math.max(3, value * (0.3 + Math.random() * 0.7))
  );
  const max = Math.max(...points);
  const width = 90,
    height = 26;
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
        strokeWidth={1.4}
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

// ---------------- Main Component ----------------
const FileTransferDemo: React.FC<Props> = ({
  initialFileName = "project-archive.zip",
}) => {
  const controls = useAnimation();
  const [progress, setProgress] = useState<number>(12);
  const [speed, setSpeed] = useState<number>(420);
  const [active, setActive] = useState<number>(9);
  const [packets, setPackets] = useState<number>(6);
  const [fileName, setFileName] = useState(initialFileName);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    controls.start("show");
    const t = window.setInterval(() => {
      setProgress((p) => Math.min(99, p + (Math.random() * 1.3 + 0.3)));
      setSpeed((s) => Math.max(100, s + (Math.random() * 40 - 15)));
    }, 1200);
    return () => clearInterval(t);
  }, [controls]);

  // Parallax
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

  // Controls
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

  // ---------------- Return ----------------
  return (
    <section className="relative py-16 px-6 md:px-10 bg-black text-white">
      <div className="max-w-6xl mx-auto" ref={stageRef}>
        {/* HEADER */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={cardFade}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Secure File Transfer — Visual Flow
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Clean Apple-grade presentation: upload → encrypt → transfer →
              storage with AES-256 security.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.05 }}
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

        {/* MAIN GRID */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Transfer */}
            <motion.div
              variants={cardFade}
              className="rounded-2xl p-5 bg-[#060606] border border-white/8"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white/6 border border-white/8">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Current Transfer</div>
                    <div className="text-xs text-white/60 truncate" title={fileName}>
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

              {/* PIPELINE */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { icon: <UploadCloud />, label: "Upload", detail: "Client" },
                  { icon: <Lock />, label: "Encrypt", detail: "AES-256" },
                  { icon: <Cloud />, label: "Transfer", detail: "TLS" },
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
                            <div className="text-sm font-medium">{s.label}</div>
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

              {/* STATS */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Avg Speed</div>
                    <div className="text-sm font-semibold">{Math.round(speed)} MB/s</div>
                  </div>
                  <TinySparkline value={progress} />
                </div>
                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Active Transfers</div>
                    <div className="text-sm font-semibold">{active}</div>
                  </div>
                  <div className="text-xs text-white/60">x{packets}</div>
                </div>
                <div className="p-3 bg-[#050505] border border-white/8 rounded-lg flex justify-between">
                  <div>
                    <div className="text-xs text-white/60">Integrity</div>
                    <div className="text-sm font-semibold">AES-256</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
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
                  ETA: {progress < 99 ? `${Math.round((100 - progress) / 4)}m` : "Done"}
                </div>
              </div>
              <div className="mt-4 bg-[#050505] border border-white/8 rounded-lg p-3">
                <Meter value={progress} />
                <div className="mt-2 flex justify-between text-xs text-white/60">
                  <span>{Math.round((progress / 100) * 2300)} MB</span>
                  <span>{Math.round(speed)} MB/s</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---------------- ANALYTICS SECTION ---------------- */}
        <motion.div
          variants={cardFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl font-semibold">Analytics & Insights</h3>
          <p className="text-sm text-white/60 mt-2 max-w-lg mx-auto">
            SkyShare delivers real-time analytics to monitor performance, regions, and user activity securely.
          </p>

          {/* Graph */}
          <div className="mt-10 mx-auto max-w-3xl bg-[#050505] border border-white/8 rounded-2xl p-6">
            <BarChart2 className="w-6 h-6 text-white/70 mx-auto mb-4" />
            <div className="grid grid-cols-6 gap-3 h-24 items-end">
              {[40, 70, 55, 85, 65, 90].map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${v}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white/70 w-full rounded-md"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-3">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
        </motion.div>

        {/* ---------------- API SHOWCASE SECTION ---------------- */}
        <motion.div
          variants={cardFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center mb-3">
            <Code className="w-6 h-6 text-white/70" />
          </div>
          <h3 className="text-2xl font-semibold">SkyShare API Integration</h3>
          <p className="text-sm text-white/60 mt-2 mb-6">
            Integrate SkyShare directly into your platform with a few lines of code.
          </p>

          <pre className="text-left bg-[#050505] border border-white/8 rounded-xl text-white/80 text-sm p-5 font-mono overflow-x-auto">
{`fetch("https://api.skieshare.io/upload", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: formData,
}).then(r => r.json())
  .then(console.log)
  .catch(console.error);`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
};

export default FileTransferDemo;
