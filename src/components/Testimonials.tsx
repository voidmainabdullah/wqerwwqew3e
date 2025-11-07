import React, { useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Users,
  Cpu,
  Folder as FolderIcon,
  Share2,
  Lock,
  Radio, 
  Search,
  Cloud,
  Zap,
} from "lucide-react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useTicker = (start = 0, end = 1000, duration = 1600, deps = []) => {
  const [value, setValue] = useState(start);
  useEffect(() => {
    let raf = null;
    let startTime = null;
    const animate = (t) => {
      if (!startTime) startTime = t;
      const elapsed = t - startTime;
      const progress = Math.min(1, elapsed / duration);
      const cur = Math.round(start + (end - start) * easeOutCubic(progress));
      setValue(cur);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return value;
};

const fmtNumber = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const SparkLine = ({ points = [], width = 160, height = 36 }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => ((v - min) / (max - min || 1)) * height;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${Math.round((i / (points.length - 1)) * width)} ${Math.round(height - norm(p))}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id="gSparkline" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#gSparkline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const TransferWave = ({ speed = 0.8, width = 900, height = 120, id = "wave" }) => {
  const waves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 3; i++) {
      const amp = 5 + i * 4;
      const freq = 0.007 + i * 0.0025;
      arr.push({ amp, freq, phase: i * 0.6 });
    }
    return arr;
  }, []);

  const pathFor = (tOffset = 0) => {
    const step = 6;
    let d = "M 0 " + height / 2 + " ";
    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      waves.forEach((w) => {
        y += Math.sin((x + tOffset) * w.freq) * w.amp * speed * (0.6 + Math.random() * 0.18);
      });
      d += `L ${x} ${y} `;
    }
    return d;
  };

  const d = pathFor(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="rounded-xl overflow-hidden">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feBlend in="SourceGraphic" in2="b" mode="normal" />
        </filter>
      </defs>

      <g filter={`url(#${id}-blur)`}>
        <path d={d} stroke={`url(#${id}-g)`} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
      <path d={d} stroke={`url(#${id}-g)`} strokeWidth="1.2" fill="none" strokeLinecap="round" className="opacity-90" />
    </svg>
  );
};

const TimelineStrip = ({ steps = [] }) => (
  <div className="w-full">
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/8" />
      <div className="relative flex items-center justify-between max-w-6xl mx-auto px-2">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.06 }} className="flex flex-col items-center text-white w-20">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/8 flex items-center justify-center shadow-[0_18px_50px_rgba(255,255,255,0.03)]">
              {s.icon}
            </div>
            <div className="mt-3 text-xs text-white/60 text-center">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const VerticalFolderTree = ({ seed = 3, pulseSeed = 3 }) => {
  const tree = useMemo(() => {
    return Array.from({ length: seed }).map((_, i) => {
      const children = Array.from({ length: 2 + (i % 3) }).map((__, j) => ({
        id: `${i}-${j}`,
        name: `folder-${i + 1}-${j + 1}`,
        files: 2 + Math.floor(Math.random() * 9),
        sizeMB: Math.floor(4 + Math.random() * 220),
      }));
      return { id: `root-${i}`, name: `Project-${i + 1}`, size: `${Math.floor(40 + Math.random() * 900)} MB`, children };
    });
  }, [seed]);

  const pulseIndices = useMemo(() => Array.from({ length: Math.min(seed, pulseSeed) }).map(() => Math.floor(Math.random() * seed)), [seed, pulseSeed]);

  return (
    <div className="w-full">
      <div className="text-sm text-white/70 mb-3">Folder Structure</div>

      <div className="space-y-5">
        {tree.map((node, idx) => {
          const isPulsing = pulseIndices.includes(idx);
          return (
            <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.04 }} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-12 h-12 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center relative overflow-visible`}>
                  <FolderIcon className="w-5 h-5 text-white/90" />
                  {isPulsing && (
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0.08 }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.08, 0.18, 0.08] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg border border-white/6"
                    />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-white/90 font-medium">{node.name}</div>
                  <div className="text-xs text-white/40">{node.size}</div>
                </div>

                <div className="mt-3 pl-3 border-l border-white/6 space-y-2">
                  {node.children.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: [0.85, 1, 0.85], y: [0, -3, 0] }}
                      transition={{ duration: 2 + i * 0.22, repeat: Infinity }}
                      className="flex items-center justify-between text-xs text-white/60 bg-white/3 rounded px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</div>
                        <div className="truncate">{c.name}</div>
                      </div>
                      <div className="text-xs text-white/40">{c.files} files • {c.sizeMB}MB</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default function TeamWorkflowUltra() {
  const filesTransferred = useTicker(0, 1300000, 1600, []);
  const activeTeams = useTicker(0, 812, 1500, []);
  const uptime = useTicker(95, 99, 1400, []);
  const processingSpeed = useTicker(1, 3.6, 1700, []);

  const anim = useAnimation();
  const [realtime, setRealtime] = useState(true);

  useEffect(() => {
    anim.start({
      scale: realtime ? [1, 1.025, 1] : [1, 0.985, 1],
      transition: { duration: 2.6, repeat: Infinity },
    });
  }, [realtime, anim]);

  const sparkSets = useMemo(() => Array.from({ length: 3 }).map(() => Array.from({ length: 16 }).map(() => Math.random() * 100)), []);

  const seoText =
    "SkyShare is a modern file management intelligence platform built for teams. It consolidates secure file transfers, automated organization, and a visual folder hierarchy so teams reduce duplication and accelerate delivery. With real-time sync, lightweight audit trails, and encrypted sharing, SkyShare empowers product, design, and operations teams to move faster without sacrificing compliance. The platform’s visual folder tree and live metrics surface the state of work — from active transfers to system health — making handoffs predictable and scalable.";

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-12">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          className="absolute left-[-120px] top-[-80px] w-[720px] h-[720px] rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0.0))",
            filter: "blur(140px)",
          }}
          animate={{ x: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-100px] bottom-[-60px] w-[560px] h-[560px] rounded-full"
          style={{
            background: "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.04), rgba(255,255,255,0.0))",
            filter: "blur(120px)",
          }}
          animate={{ x: [0, -18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="max-w-[1100px] mx-auto relative z-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full w-12 h-12 bg-white/4 flex items-center justify-center border border-white/8">
              <Cpu className="w-6 h-6 text-white/90" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">Team Workflow Intelligence</h1>
              <p className="text-sm text-white/60 mt-1 max-w-[640px]">
                Visual file management, integrated metrics, and cinematic system signals for modern distributed teams.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/50 hidden sm:block">Mode</div>
            <motion.button
              animate={anim}
              onClick={() => setRealtime((r) => !r)}
              className={`px-3 py-2 rounded-full flex items-center gap-2 text-sm ${realtime ? "bg-white/6 border border-white/8" : "bg-white/3 border border-white/6"}`}
            >
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">{realtime ? "Realtime" : "Snapshot"}</span>
            </motion.button>
            <div className="hidden md:flex items-center gap-2 bg-white/3 rounded-full px-3 py-2 border border-white/6">
              <Search className="w-4 h-4 text-white/80" />
              <input placeholder="Search files or folders..." className="bg-transparent text-sm outline-none placeholder:text-white/40 w-44" aria-label="search" />
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <TimelineStrip
              steps={[
                { icon: <FolderIcon className="w-5 h-5 text-white/90" />, label: "Upload" },
                { icon: <Users className="w-5 h-5 text-white/90" />, label: "Collaborate" },
                { icon: <Cpu className="w-5 h-5 text-white/90" />, label: "AI Organize" },
                { icon: <Lock className="w-5 h-5 text-white/90" />, label: "Secure Sync" },
                { icon: <Share2 className="w-5 h-5 text-white/90" />, label: "Deliver" },
              ]}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))" }} />
              </div>

              <div className="py-4 px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 md:justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-white/70 mb-2">Live Metrics</div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
                      <div className="flex-1">
                        <div className="text-white text-3xl font-semibold leading-none">{fmtNumber(filesTransferred)}</div>
                        <div className="text-xs text-white/50 mt-1">Files transferred</div>
                      </div>

                      <div className="w-full sm:w-[360px] mt-4 sm:mt-0">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                          <div>Active Teams</div>
                          <div className="text-white font-medium">{activeTeams}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                          <div>Uptime</div>
                          <div className="text-white font-medium">{uptime}%</div>
                        </div>
                        <div className="text-xs text-white/60">Processing Speed</div>
                        <div className="text-white font-medium text-lg mb-2">{(processingSpeed * 120).toFixed(1)} MB/s</div>
                        <div className="w-full"><SparkLine points={sparkSets[0]} width={320} height={36} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="rounded-xl overflow-hidden border border-white/6">
                    <div className="p-3 bg-black/40">
                      <TransferWave speed={processingSpeed / 3.6} width={960} height={84} id="main-wave" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="rounded-2xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <VerticalFolderTree seed={6} pulseSeed={3} />
                </div>

                <div className="lg:col-span-5">
                  <div className="text-sm text-white/70 mb-3">System Snapshot</div>
                  <div className="rounded-md bg-white/3 border border-white/6 p-3">
                    <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                      <div>
                        <div className="text-white/80">Connected Nodes</div>
                        <div className="text-white font-medium">1,240</div>
                      </div>
                      <div>
                        <div className="text-white/80">Encrypted Streams</div>
                        <div className="text-white font-medium">100%</div>
                      </div>
                      <div>
                        <div className="text-white/80">Auto-archiving</div>
                        <div className="text-white font-medium">Enabled</div>
                      </div>
                      <div>
                        <div className="text-white/80">Active Pipelines</div>
                        <div className="text-white font-medium">22</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-white/60">
                      SkyShare surfaces the most relevant operational signals: transfer volume, pipeline health, and folder composition — all without clutter. Hover (or tap) a folder to surface context and metrics (future interactive enhancement).
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-white/70 mb-2">Mini Trend</div>
                    <div className="rounded-md bg-white/3 border border-white/6 p-3">
                      <div className="w-full"><SparkLine points={sparkSets[1]} width={340} height={36} /></div>
                      <div className="mt-2 text-xs text-white/60">Short-term throughput trend</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-white/70 mb-2">Quick Note</div>
                    <div className="text-xs text-white/60">
                      Folder tree is the primary source of truth — it visualizes project composition, file counts, and apparent hot nodes. The live band above ties flow into metrics so teams see both structure and motion.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="rounded-2xl p-4">
              <div className="text-sm text-white/70 mb-3">About SkyShare</div>
              <p className="text-xs text-white/60 leading-relaxed">
                {seoText}
              </p>
            </div>
          </motion.div>
        </div>

        <footer className="text-center text-white/50 text-xs mt-2">© {new Date().getFullYear()} SkyShare • Secure • Fast • Designed for teams</footer>
      </div>
    </section>
  );
}
