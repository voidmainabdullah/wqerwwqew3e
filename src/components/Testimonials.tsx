import React, { useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Users,
  Cloud,
  Cpu,
  Zap,
  Lock,
  Activity,
  Folder as FolderIcon,
  Share2,
  Database,
  Radio,
  Search,
  Plus,
  RefreshCcw,
  LogOut,
} from "lucide-react";

const fmtNumber = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useTicker = (start = 0, end = 1000, duration = 1800, deps = []) => {
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

const GlassShell = ({ children, className = "" }) => (
  <div className={`rounded-2xl backdrop-blur-[6px] bg-white/3 border border-white/6 shadow-[0_8px_40px_rgba(255,255,255,0.03)] ${className}`}>
    {children}
  </div>
);

const SparkLine = ({ points = [], width = 180, height = 44 }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => ((v - min) / (max - min || 1)) * height;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${Math.round((i / (points.length - 1)) * width)} ${Math.round(height - norm(p))}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const WorkflowTimeline = ({ steps = [] }) => {
  return (
    <div className="relative w-full flex items-center justify-between max-w-6xl mx-auto px-2">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/6" />
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.06 }} className="relative flex flex-col items-center text-white w-20">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/8 backdrop-blur-md shadow-[0_20px_50px_rgba(255,255,255,0.03)]">
            {s.icon}
          </div>
          <div className="mt-3 text-xs text-white/60 text-center">{s.label}</div>
          <div className="absolute -top-6 w-[2px] h-6 bg-gradient-to-b from-white/40 to-white/10 rounded-full animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

const TransferWave = ({ speed = 0.8, width = 900, height = 120 }) => {
  const waves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 3; i++) {
      const amp = 6 + i * 5;
      const freq = 0.008 + i * 0.003;
      arr.push({ amp, freq, phase: i * 0.8 });
    }
    return arr;
  }, []);
  const pathFor = (tOffset = 0) => {
    const step = 6;
    let d = "M 0 " + height / 2 + " ";
    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      waves.forEach((w) => {
        y += Math.sin((x + tOffset) * w.freq) * w.amp * speed * (0.6 + Math.random() * 0.3);
      });
      d += `L ${x} ${y} `;
    }
    return d;
  };
  const d = pathFor(0);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="rounded-xl overflow-hidden">
      <defs>
        <linearGradient id="waveG2" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} stroke="url(#waveG2)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const FolderTreeVisual = ({ seed = 6 }) => {
  const branches = useMemo(() => {
    const result = [];
    for (let i = 0; i < seed; i++) {
      const depth = 2 + Math.floor(Math.random() * 3);
      const children = Array.from({ length: 2 + Math.floor(Math.random() * 4) }).map((_, j) => ({
        name: `folder-${i + 1}-${j + 1}`,
        files: 2 + Math.floor(Math.random() * 12),
      }));
      result.push({ name: `Project-${i + 1}`, children, size: `${Math.floor(50 + Math.random() * 900)} MB` });
    }
    return result;
  }, [seed]);

  return (
    <div className="w-full">
      <div className="text-sm text-white/70 mb-3">Folder Structure</div>
      <div className="bg-transparent rounded-md space-y-3">
        {branches.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-white/90 font-medium">{b.name}</div>
                <div className="text-xs text-white/40">{b.size}</div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {b.children.map((c, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -6 }} animate={{ opacity: [0.7, 1, 0.7], y: [0, -4, 0] }} transition={{ duration: 2 + idx * 0.2, repeat: Infinity }} className="flex items-center justify-between text-xs text-white/60 bg-white/3 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center text-xs">{idx + 1}</div>
                      <div>{c.name}</div>
                    </div>
                    <div className="text-xs text-white/40">{c.files} files</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveActivityFeed = ({ entries = [] }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-white/70">Activity Log</div>
        <div className="text-xs text-white/40">real-time • audit-ready</div>
      </div>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {entries.map((e, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: i * 0.03 }} className="flex items-start gap-3 text-white/70">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold">{e.userInitials}</div>
            <div className="flex-1 text-sm">
              <div className="text-white/80">{e.action}</div>
              <div className="text-xs text-white/40">{e.time}</div>
            </div>
            <div className="text-xs text-white/40">{e.size}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function TeamWorkflowUltra() {
  const filesTransferred = useTicker(0, 1300000, 1800, []);
  const activeTeams = useTicker(0, 812, 1600, []);
  const uptime = useTicker(95, 99, 1500, []);
  const processingSpeed = useTicker(1, 3.6, 2000, []);

  const [feed, setFeed] = useState(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      userInitials: ["AJ", "MB", "RN", "ZT", "KL", "AL", "MB", "RN"][i % 8],
      action: `${["uploaded", "shared", "approved", "archived"][i % 4]} “Project-Design-v${i + 1}.pdf”`,
      time: `${Math.max(1, i * 5)}m ago`,
      size: `${(Math.random() * 12).toFixed(1)} MB`,
    }))
  );

  const anim = useAnimation();
  const [realtime, setRealtime] = useState(true);

  useEffect(() => {
    anim.start({
      scale: realtime ? [1, 1.03, 1] : [1, 0.98, 1],
      transition: { duration: 2.4, repeat: Infinity },
    });
  }, [realtime, anim]);

  useEffect(() => {
    if (!realtime) return;
    const iv = setInterval(() => {
      setFeed((prev) => {
        const next = [
          {
            userInitials: ["AL", "MB", "RN", "ZT"][Math.floor(Math.random() * 4)],
            action: `${["uploaded", "moved", "synced", "shared"][Math.floor(Math.random() * 4)]} “${["report", "design", "video", "dataset"][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 900)}.zip”`,
            time: "now",
            size: `${(Math.random() * 45).toFixed(1)} MB`,
          },
          ...prev.slice(0, 7),
        ];
        return next;
      });
    }, 2400);
    return () => clearInterval(iv);
  }, [realtime]);

  const steps = [
    { icon: <FolderIcon className="w-5 h-5 text-white/90" />, label: "Upload" },
    { icon: <Users className="w-5 h-5 text-white/90" />, label: "Collaborate" },
    { icon: <Cpu className="w-5 h-5 text-white/90" />, label: "AI Organize" },
    { icon: <Lock className="w-5 h-5 text-white/90" />, label: "Secure Sync" },
    { icon: <Share2 className="w-5 h-5 text-white/90" />, label: "Deliver" },
  ];

  const sparkSets = useMemo(() => Array.from({ length: 4 }).map(() => Array.from({ length: 18 }).map(() => Math.random() * 100)), []);

  const seoText =
    "SkyShare brings enterprise-grade file management to distributed teams. The platform unifies file transfer, smart AI classification, and secure multi-team collaboration in a single interface. Real-time sync, automated pipelines, and a visual folder tree reduce time-to-delivery and prevent duplication. SkyShare's lightweight audit trails and encryption ensure compliance while keeping workflows fast and transparent. Designed for product, design, marketing, and ops teams, it scales from startups to enterprises.";

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-100px] top-[-80px] w-[640px] h-[640px] bg-white/6 blur-[150px] rounded-full" />
        <div className="absolute right-[-80px] bottom-[-60px] w-[520px] h-[520px] bg-white/4 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full w-12 h-12 bg-white/4 flex items-center justify-center border border-white/8">
              <Cpu className="w-6 h-6 text-white/90" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Team Workflow Intelligence</h1>
              <p className="text-sm text-white/60 mt-1">A unified view for secure file sharing, AI pipelines, and team health.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/50">Mode</div>
            <motion.button animate={anim} onClick={() => setRealtime((r) => !r)} className={`px-3 py-2 rounded-full flex items-center gap-2 text-sm ${realtime ? "bg-white/6 border border-white/8" : "bg-white/3 border border-white/6"}`}>
              <Radio className="w-4 h-4" />
              {realtime ? "Realtime" : "Snapshot"}
            </motion.button>
            <div className="hidden sm:flex items-center gap-2 bg-white/3 rounded-full px-3 py-2 border border-white/6">
              <Search className="w-4 h-4 text-white/80" />
              <input placeholder="Search files, teams or folders..." className="bg-transparent text-sm outline-none placeholder:text-white/40 w-48" aria-label="search" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <GlassShell className="p-4">
              <WorkflowTimeline steps={steps} />
            </GlassShell>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassShell className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-white/70">Live Transfer Wave</div>
                  <div className="text-xs text-white/40">throughput • latency</div>
                </div>
                <TransferWave speed={processingSpeed / 3.6} width={800} height={110} />
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="text-white/60">Avg speed</div>
                    <div className="text-white font-medium">{(processingSpeed * 120).toFixed(1)} MB/s</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-white/60">Latency</div>
                    <div className="text-white font-medium">23 ms</div>
                  </div>
                </div>
              </GlassShell>

              <GlassShell className="p-4">
                <div className="text-sm text-white/70 mb-3">AI Insights</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/50">Auto-classified</div>
                    <div className="text-sm text-white">45%</div>
                  </div>
                  <div className="text-xs text-white/50">Anomalies detected</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <SparkLine points={sparkSets[0]} width={220} height={40} />
                    </div>
                    <div className="text-sm text-white/80">+12%</div>
                  </div>
                  <div className="text-xs text-white/40">Recommendations: Archive stale public builds • Flag large shared bundles</div>
                </div>
              </GlassShell>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassShell className="p-4">
                <div className="text-sm text-white/70 mb-3">File Management</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FolderTreeVisual seed={5} />
                </div>
              </GlassShell>

              <GlassShell className="p-4">
                <div className="text-sm text-white/70 mb-3">Activity Feed</div>
                <LiveActivityFeed entries={feed} />
              </GlassShell>
            </div>

            <GlassShell className="p-5">
              <div className="text-sm text-white/70 mb-3">Recent Deliveries</div>
              <div className="flex gap-3 overflow-x-auto py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} className="min-w-[200px] px-3 py-2 rounded-lg bg-white/3 border border-white/7">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/80">Project-{Math.floor(Math.random() * 900)}</div>
                      <div className="text-xs text-white/40">v{Math.floor(Math.random() * 12) + 1}</div>
                    </div>
                    <div className="mt-2 text-xs text-white/60">Delivered to: Team Beta • 2 files • 120 MB</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                      <div>Signed</div>
                      <div>{Math.floor(Math.random() * 24)}m ago</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassShell>

            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">About SkyShare</div>
              <p className="text-xs text-white/60 leading-relaxed">
                {seoText}
              </p>
            </GlassShell>
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">Overview</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Files Transferred</div>
                  <div className="text-sm text-white font-medium">{fmtNumber(filesTransferred)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Active Teams</div>
                  <div className="text-sm text-white font-medium">{activeTeams}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Uptime</div>
                  <div className="text-sm text-white font-medium">{uptime}%</div>
                </div>
                <div className="mt-2 h-[1px] bg-white/6" />
                <div className="text-xs text-white/60 mt-2">Controls</div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 rounded-full text-sm bg-white/6 border border-white/8">Pause Streams</button>
                  <button className="py-2 px-3 rounded-full bg-white/3 border border-white/7 text-sm">Reset</button>
                </div>
              </div>
            </GlassShell>

            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">Quick Filters</div>
              <div className="flex flex-col gap-2 text-xs text-white/60">
                <div className="flex items-center justify-between"><div>All Teams</div><div className="text-white/80">812</div></div>
                <div className="flex items-center justify-between"><div>Shared with external</div><div className="text-white/80">42</div></div>
                <div className="flex items-center justify-between"><div>Flagged</div><div className="text-white/80">7</div></div>
              </div>
            </GlassShell>

            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">Active Sessions</div>
              <div className="space-y-2 text-xs text-white/70">
                {["AJ", "MB", "RN", "ZT", "KL"].map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">{u}</div>
                      <div>
                        <div className="text-white/90">User {i + 1}</div>
                        <div className="text-white/40 text-xs">Working on: repo-{Math.floor(Math.random() * 140)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/50">live</div>
                  </div>
                ))}
              </div>
            </GlassShell>

            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">Quick Actions</div>
              <div className="flex flex-col gap-2">
                <button className="w-full py-2 rounded-full bg-white/6 border border-white/8 flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Shared Space</button>
                <button className="w-full py-2 rounded-full bg-transparent border border-white/8 flex items-center justify-center gap-2 text-sm"><RefreshCcw className="w-4 h-4" /> Re-sync All</button>
                <button className="w-full py-2 rounded-full bg-transparent border border-white/8 flex items-center justify-center gap-2 text-sm"><LogOut className="w-4 h-4" /> End Session</button>
              </div>
            </GlassShell>

            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">Mini Charts</div>
              <div className="space-y-3">
                {sparkSets.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="text-xs text-white/60">Throughput {i + 1}</div>
                    <div className="w-[120px]"><SparkLine points={s} width={120} height={28} /></div>
                  </div>
                ))}
              </div>
            </GlassShell>
          </aside>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassShell className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-white/70">Operational Analytics</div>
                <div className="text-xs text-white/40">last 24 hours</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/50">Top File Types</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white">.png</div>
                      <div className="text-xs text-white/40">42%</div>
                    </div>
                    <div className="w-20"><SparkLine points={sparkSets[1]} width={80} height={26} /></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Top Teams by Transfer</div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between"><div className="text-sm text-white">Design</div><div className="text-xs text-white/40">320 GB</div></div>
                    <div className="mt-2"><div className="h-2 bg-white/6 rounded-full relative"><div style={{ width: "68%" }} className="absolute left-0 top-0 bottom-0 bg-white/12 rounded-full" /></div></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Security Events</div>
                  <div className="mt-2">
                    <div className="text-sm text-white">Malware flagged</div>
                    <div className="text-xs text-white/40">2 events</div>
                    <div className="mt-2 text-xs text-white/50">Automated quarantine applied</div>
                  </div>
                </div>
              </div>
            </GlassShell>
          </div>

          <div>
            <GlassShell className="p-4">
              <div className="text-sm text-white/70 mb-3">SEO & Metadata</div>
              <div className="text-xs text-white/40">
                SkyShare – team workflow intelligence, secure file sharing, enterprise sync. Improve time-to-delivery, reduce duplicate storage, and enable AI-driven organization.
              </div>
              <div className="mt-3 text-xs text-white/50">Keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["file sharing", "team collaboration", "enterprise sync", "secure cloud", "AI organization"].map((k) => (
                  <div key={k} className="text-xs text-white/40 px-2 py-1 bg-white/3 rounded-full border border-white/6">{k}</div>
                ))}
              </div>
            </GlassShell>
          </div>
        </div>

        <footer className="text-center text-white/50 text-xs mt-4">© {new Date().getFullYear()} SkyShare • Secure • Fast • Designed for teams</footer>
      </div>
    </section>
  );
}
