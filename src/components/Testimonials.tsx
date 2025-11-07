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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
};

const fmtNumber = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const Glass = ({ children, className = "" }) => (
  <div className={`rounded-2xl backdrop-blur-[6px] bg-white/3 border border-white/6 shadow-[0_8px_40px_rgba(255,255,255,0.03)] ${className}`}>
    {children}
  </div>
);

const SparkLine = ({ points = [], width = 160, height = 38 }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => ((v - min) / (max - min || 1)) * height;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${Math.round((i / (points.length - 1)) * width)} ${Math.round(height - norm(p))}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id="gSpark" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#gSpark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const WorkflowTimeline = ({ steps = [] }) => {
  return (
    <div className="relative w-full flex items-center justify-between max-w-6xl mx-auto px-2">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/6" />
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.06 }} className="relative flex flex-col items-center text-white w-20">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/8 backdrop-blur-md shadow-[0_18px_50px_rgba(255,255,255,0.03)]">
            {s.icon}
          </div>
          <div className="mt-3 text-xs text-white/60 text-center">{s.label}</div>
          <div className="absolute -top-6 w-[2px] h-6 bg-gradient-to-b from-white/40 to-white/10 rounded-full animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

const TransferWave = ({ speed = 0.8, width = 760, height = 92 }) => {
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
        y += Math.sin((x + tOffset) * w.freq) * w.amp * speed * (0.6 + Math.random() * 0.25);
      });
      d += `L ${x} ${y} `;
    }
    return d;
  };
  const d = pathFor(0);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="rounded-xl overflow-hidden">
      <defs>
        <linearGradient id="wg" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} stroke="url(#wg)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const VerticalFolderTree = ({ seed = 5 }) => {
  const tree = useMemo(() => {
    return Array.from({ length: seed }).map((_, i) => {
      const children = Array.from({ length: 2 + (i % 3) }).map((__, j) => ({
        id: `${i}-${j}`,
        name: `folder-${i + 1}-${j + 1}`,
        files: 2 + Math.floor(Math.random() * 9),
      }));
      return { id: `root-${i}`, name: `Project-${i + 1}`, size: `${Math.floor(40 + Math.random() * 900)} MB`, children };
    });
  }, [seed]);

  return (
    <div className="w-full">
      <div className="text-sm text-white/70 mb-3">Folder Structure</div>
      <div className="space-y-4">
        {tree.map((node, idx) => (
          <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.04 }} className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-white/90 font-medium">{node.name}</div>
                <div className="text-xs text-white/40">{node.size}</div>
              </div>

              <div className="mt-3 pl-2 border-l border-white/6 space-y-2">
                {node.children.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: [0.7, 1, 0.7], y: [0, -3, 0] }} transition={{ duration: 2 + i * 0.2, repeat: Infinity }} className="flex items-center justify-between text-xs text-white/60 bg-white/3 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center text-xs">{i + 1}</div>
                      <div className="truncate">{c.name}</div>
                    </div>
                    <div className="text-xs text-white/40">{c.files} files</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
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
      scale: realtime ? [1, 1.03, 1] : [1, 0.98, 1],
      transition: { duration: 2.4, repeat: Infinity },
    });
  }, [realtime, anim]);

  const sparkSets = useMemo(() => Array.from({ length: 3 }).map(() => Array.from({ length: 16 }).map(() => Math.random() * 100)), []);

  const seoText =
    "SkyShare is a modern file management intelligence platform built for teams. It consolidates secure file transfers, automated organization, and a visual folder hierarchy so teams reduce duplication and accelerate delivery. With real-time sync, lightweight audit trails, and encrypted sharing, SkyShare empowers product, design, and operations teams to move faster without sacrificing compliance. The platform’s visual folder tree and live metrics surface the state of work — from active transfers to system health — making handoffs predictable and scalable.";

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-80px] top-[-60px] w-[560px] h-[560px] bg-white/6 blur-[140px] rounded-full" />
        <div className="absolute right-[-60px] bottom-[-40px] w-[440px] h-[440px] bg-white/4 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1150px] mx-auto relative z-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full w-12 h-12 bg-white/4 flex items-center justify-center border border-white/8">
              <Cpu className="w-6 h-6 text-white/90" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Team Workflow Intelligence</h1>
              <p className="text-sm text-white/60 mt-1">Visual file management, live metrics, and secure team sync.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/50 hidden sm:block">Mode</div>
            <motion.button animate={anim} onClick={() => setRealtime((r) => !r)} className={`px-3 py-2 rounded-full flex items-center gap-2 text-sm ${realtime ? "bg-white/6 border border-white/8" : "bg-white/3 border border-white/6"}`}>
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">{realtime ? "Realtime" : "Snapshot"}</span>
            </motion.button>
            <div className="hidden md:flex items-center gap-2 bg-white/3 rounded-full px-3 py-2 border border-white/6">
              <Search className="w-4 h-4 text-white/80" />
              <input placeholder="Search files or folders..." className="bg-transparent text-sm outline-none placeholder:text-white/40 w-44" aria-label="search" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Glass className="p-4">
              <WorkflowTimeline
                steps={[
                  { icon: <FolderIcon className="w-5 h-5 text-white/90" />, label: "Upload" },
                  { icon: <Users className="w-5 h-5 text-white/90" />, label: "Collaborate" },
                  { icon: <Cpu className="w-5 h-5 text-white/90" />, label: "AI Organize" },
                  { icon: <Lock className="w-5 h-5 text-white/90" />, label: "Secure Sync" },
                  { icon: <Share2 className="w-5 h-5 text-white/90" />, label: "Deliver" },
                ]}
              />
            </Glass>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Glass className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-white/70">Live Metrics</div>
                  <div className="text-xs text-white/40">system • throughput</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div>Files Transferred</div>
                      <div className="text-white font-medium">{fmtNumber(filesTransferred)}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div>Active Teams</div>
                      <div className="text-white font-medium">{activeTeams}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div>Uptime</div>
                      <div className="text-white font-medium">{uptime}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs text-white/60">Processing Speed</div>
                    <div className="text-white font-medium text-lg">{(processingSpeed * 120).toFixed(1)} MB/s</div>
                    <div className="mt-2">
                      <div className="text-xs text-white/60 mb-2">Throughput trend</div>
                      <div className="w-full">
                        <SparkLine points={sparkSets[0]} width={260} height={40} />
                      </div>
                    </div>
                  </div>
                </div>
              </Glass>

              <Glass className="p-4">
                <div className="text-sm text-white/70 mb-3">Transfer Waveform</div>
                <TransferWave speed={processingSpeed / 3.6} width={700} height={88} />
                <div className="mt-3 text-xs text-white/60">Live visual of data flow across pipelines — helpful for spotting latency spikes quickly.</div>
              </Glass>
            </div>

            <Glass className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <VerticalFolderTree seed={6} />
                </div>
                <div>
                  <div className="text-sm text-white/70 mb-3">System Snapshot</div>
                  <div className="space-y-3 text-xs text-white/60">
                    <div className="flex items-center justify-between"><div>Connected Nodes</div><div className="text-white">1,240</div></div>
                    <div className="flex items-center justify-between"><div>Encrypted Streams</div><div className="text-white">100%</div></div>
                    <div className="flex items-center justify-between"><div>Auto-archiving</div><div className="text-white">Enabled</div></div>
                    <div className="mt-2">SkyShare surfaces system state and file relationships without clutter — ideal for fast operational decisions.</div>
                  </div>
                </div>
              </div>
            </Glass>

            <Glass className="p-4">
              <div className="text-sm text-white/70 mb-3">About SkyShare</div>
              <p className="text-xs text-white/60 leading-relaxed">
                {seoText}
              </p>
            </Glass>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Glass className="p-4">
              <div className="text-sm text-white/70 mb-3">Compact Metrics</div>
              <div className="space-y-3 text-xs text-white/60">
                <div className="flex items-center justify-between"><div>Files Transferred</div><div className="text-white font-medium">{fmtNumber(filesTransferred)}</div></div>
                <div className="flex items-center justify-between"><div>Active Teams</div><div className="text-white font-medium">{activeTeams}</div></div>
                <div className="flex items-center justify-between"><div>Uptime</div><div className="text-white font-medium">{uptime}%</div></div>
                <div className="mt-2 h-[1px] bg-white/6" />
                <div className="text-xs text-white/60 mt-2">Status controls</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRealtime((r) => !r)} className="flex-1 py-2 rounded-full text-sm bg-white/6 border border-white/8">{realtime ? "Pause" : "Resume"}</button>
                </div>
              </div>
            </Glass>

            <Glass className="p-4">
              <div className="text-sm text-white/70 mb-3">Mini Trend</div>
              <div className="w-full"><SparkLine points={sparkSets[1]} width={260} height={40} /></div>
              <div className="mt-3 text-xs text-white/60">Quick trendline for immediate context.</div>
            </Glass>

            <Glass className="p-4">
              <div className="text-sm text-white/70 mb-3">Quick Notes</div>
              <div className="text-xs text-white/60">
                Use the folder tree to visualize project composition — folder sizes and file counts update on each sync. SkyShare is optimized to show the most important operational signals at a glance.
              </div>
            </Glass>
          </aside>
        </div>

        <footer className="text-center text-white/50 text-xs mt-2">© {new Date().getFullYear()} SkyShare • Secure • Fast • Designed for teams</footer>
      </div>
    </section>
  );
}
