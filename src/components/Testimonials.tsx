import React, { useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Users,
  Cloud,
  Cpu,
  Zap,
  Lock,
  Activity,
  Folder,
  Share2,
  Database,
  Clock,
  RefreshCcw,
  Search,
  Plus,
  Minus,
  Radio,
  Wifi,
  LogIn,
  LogOut,
  BarChart3,
  List,
  Server,
  Eye,
  ArrowUp,
  ArrowDown,
  GitBranch,
} from "lucide-react";

const DURATION = 1.4;

const fmtNumber = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const useTicker = (start = 0, end = 1000, duration = 2000, deps = []) => {
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

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const GlassShell = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl backdrop-blur-[6px] bg-white/3 border border-white/6 shadow-[0_8px_40px_rgba(255,255,255,0.03)] ${className}`}
    >
      {children}
    </div>
  );
};

const StatStream = ({ icon, label, value, delta }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 rounded-full bg-white/5 border border-white/7 flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.02)]">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-white">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
        {delta !== undefined && (
          <div className={`text-xs mt-1 ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </div>
        )}
      </div>
    </div>
  );
};

const SparkLine = ({ points = [], width = 240, height = 60 }) => {
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
    <div className="relative w-full flex items-center justify-between max-w-6xl mx-auto">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/6" />
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: i * 0.08 }}
          className="relative flex flex-col items-center text-white"
        >
          <div className="w-18 h-18 p-2 rounded-full bg-white/5 border border-white/8 backdrop-blur-md shadow-[0_20px_60px_rgba(255,255,255,0.03)]">
            {s.icon}
          </div>
          <div className="mt-4 text-sm text-white/60">{s.label}</div>
          <div className="absolute -top-6 w-[2px] h-6 bg-gradient-to-b from-white/40 to-white/10 rounded-full animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

const TransferWave = ({ speed = 0.8, width = 600, height = 140 }) => {
  const waves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 4; i++) {
      const amp = 8 + i * 6;
      const freq = 0.01 + i * 0.004;
      arr.push({ amp, freq, phase: i * 0.6 + 0.2 });
    }
    return arr;
  }, []);
  const pathFor = (tOffset = 0) => {
    const step = 8;
    let d = "M 0 " + height / 2 + " ";
    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      waves.forEach((w) => {
        y += Math.sin((x + tOffset) * w.freq) * w.amp * speed * (0.6 + Math.random() * 0.4);
      });
      d += `L ${x} ${y} `;
    }
    return d;
  };
  const d = pathFor(0);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="rounded-xl overflow-hidden">
      <defs>
        <linearGradient id="waveG" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} stroke="url(#waveG)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const LiveActivityFeed = ({ entries = [] }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/70">Activity Log</div>
        <div className="text-xs text-white/40">real-time • audit-ready</div>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3">
        {entries.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.03 }}
            className="flex items-start gap-3 text-white/70"
          >
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold">
              {e.userInitials}
            </div>
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

const Heatmap = ({ cols = 12, rows = 5 }) => {
  const matrix = Array.from({ length: rows }).map(() =>
    Array.from({ length: cols }).map(() => Math.random())
  );
  return (
    <svg viewBox={`0 0 ${cols * 14} ${rows * 14}`} width="100%" height={rows * 14} className="rounded-md overflow-hidden">
      {matrix.map((row, r) =>
        row.map((v, c) => {
          const x = c * 14;
          const y = r * 14;
          const opacity = 0.04 + v * 0.16;
          return <rect key={`${r}-${c}`} x={x} y={y} width="12" height="12" rx="2" fill={`rgba(255,255,255,${opacity.toFixed(3)})`} />;
        })
      )}
    </svg>
  );
};

const TeamWorkflowUltra = () => {
  const filesTransferred = useTicker(0, 1300000, 2000, []);
  const activeTeams = useTicker(0, 812, 1700, []);
  const uptime = useTicker(95, 99, 1600, []);
  const processingSpeed = useTicker(1, 3.6, 2000, []);

  const [feed, setFeed] = useState(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      userInitials: ["AJ", "MB", "RN", "ZT", "KL", "AL", "MB", "RN"][i % 8],
      action: `${["uploaded", "shared", "approved", "archived"][i % 4]} “Project-Design-v${i + 1}.pdf”`,
      time: `${Math.max(1, i * 5)}m ago`,
      size: `${(Math.random() * 12).toFixed(1)} MB`,
    }))
  );

  const [realtime, setRealtime] = useState(true);
  const anim = useAnimation();

  useEffect(() => {
    anim.start({
      scale: realtime ? [1, 1.04, 1] : [1, 0.98, 1],
      transition: { duration: 2.2, repeat: Infinity },
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
    }, 2200);
    return () => clearInterval(iv);
  }, [realtime]);

  const steps = [
    { icon: <Folder className="w-6 h-6 text-white/80" />, label: "Upload" },
    { icon: <Users className="w-6 h-6 text-white/80" />, label: "Collaborate" },
    { icon: <Cpu className="w-6 h-6 text-white/80" />, label: "AI Organize" },
    { icon: <Lock className="w-6 h-6 text-white/80" />, label: "Secure Sync" },
    { icon: <Share2 className="w-6 h-6 text-white/80" />, label: "Deliver" },
  ];

  const sparkSets = useMemo(() => {
    return Array.from({ length: 6 }).map(() =>
      Array.from({ length: 18 }).map(() => Math.random() * 100)
    );
  }, []);

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-24 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-120px] top-[-80px] w-[680px] h-[680px] bg-white/6 blur-[170px] rounded-full" />
        <div className="absolute right-[-100px] bottom-[-60px] w-[560px] h-[560px] bg-white/4 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-8xl mx-auto relative z-10 space-y-12">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full w-14 h-14 bg-white/4 flex items-center justify-center border border-white/8 shadow-[0_12px_40px_rgba(255,255,255,0.03)]">
              <Cpu className="w-7 h-7 text-white/90" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Team Workflow Intelligence</h1>
              <p className="text-sm text-white/60 mt-1">Live operational view — file sync, AI pipelines, team health.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-white/50">Mode</div>
            <motion.button
              animate={anim}
              onClick={() => setRealtime((r) => !r)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm ${
                realtime ? "bg-white/6 border border-white/8" : "bg-white/3 border border-white/6"
              }`}
            >
              <Radio className="w-4 h-4" />
              {realtime ? "Realtime" : "Snapshot"}
            </motion.button>

            <div className="flex items-center gap-2 bg-white/3 rounded-full px-3 py-2 border border-white/6">
              <Search className="w-4 h-4 text-white/80" />
              <input placeholder="Quick search files or teams..." className="bg-transparent text-sm outline-none placeholder:text-white/40" aria-label="search" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <GlassShell className="p-6">
                <div className="px-2">
                  <WorkflowTimeline steps={steps} />
                </div>
              </GlassShell>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <div className="md:col-span-2">
                <GlassShell className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-white/70">Live Transfer Wave</div>
                        <div className="text-xs text-white/40">throughput • latency</div>
                      </div>
                      <TransferWave speed={processingSpeed / 3.6} />
                      <div className="mt-4 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="text-white/60 text-xs">Avg speed</div>
                          <div className="text-white font-medium text-sm">{(processingSpeed * 120).toFixed(1)} MB/s</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-white/60 text-xs">Latency</div>
                          <div className="text-white font-medium text-sm">23 ms</div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                          <div className="text-white/60 text-xs">Connections</div>
                          <div className="text-white font-medium text-sm">1,240</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[260px]">
                      <div className="flex flex-col gap-4">
                        <StatStream icon={<Cloud className="w-5 h-5 text-white/80" />} label="Files Transferred" value={fmtNumber(filesTransferred)} />
                        <div className="h-[1px] bg-white/6 my-2" />
                        <div className="text-xs text-white/50">Quick Insights</div>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="text-sm text-white/80">Active pipelines</div>
                          <div className="text-sm text-white/60">22</div>
                        </div>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="text-sm text-white/80">Pending approvals</div>
                          <div className="text-sm text-white/60">3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassShell>
              </div>

              <div>
                <GlassShell className="p-6">
                  <div className="text-sm text-white/70 mb-3">AI Insights</div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">Auto-classified files</div>
                      <div className="text-sm text-white">45%</div>
                    </div>
                    <div className="text-xs text-white/50">Anomalies detected</div>
                    <div className="flex items-center gap-3">
                      <div className="w-full">
                        <SparkLine points={sparkSets[0]} width={200} height={40} />
                      </div>
                      <div className="text-sm text-white/80">+12%</div>
                    </div>
                    <div className="text-xs text-white/40">Recommendations: Archive stale public builds • Flag large shared bundles</div>
                  </div>
                </GlassShell>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <GlassShell className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative w-full h-[320px]">
                        <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white/4 flex items-center justify-center border border-white/8 shadow-[0_26px_70px_rgba(255,255,255,0.03)]">
                          <Cpu className="w-8 h-8 text-white/90" />
                        </motion.div>

                        {[
                          { icon: <Users className="w-5 h-5" />, label: "Team Alpha" },
                          { icon: <Database className="w-5 h-5" />, label: "CloudOps" },
                          { icon: <Share2 className="w-5 h-5" />, label: "Delivery" },
                          { icon: <Lock className="w-5 h-5" />, label: "Security" },
                          { icon: <Zap className="w-5 h-5" />, label: "Automation" },
                        ].map((n, i) => {
                          const angle = (i / 5) * Math.PI * 2;
                          const r = 130;
                          const x = Math.cos(angle) * r;
                          const y = Math.sin(angle) * r;
                          return (
                            <motion.div
                              key={i}
                              animate={{ x: [x, x + 6 * Math.cos(i)], y: [y, y + 6 * Math.sin(i)] }}
                              transition={{ duration: 4 + i * 0.2, repeat: Infinity, repeatType: "reverse" }}
                              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                              style={{ transformOrigin: "center" }}
                            >
                              <div className="w-14 h-14 rounded-full flex items-center justify-center border border-white/8 bg-white/3">
                                {n.icon}
                              </div>
                              <div className="text-xs text-white/50">{n.label}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full md:w-[260px]">
                      <div className="text-sm text-white/70 mb-3">Regional Sync Heatmap</div>
                      <Heatmap rows={6} cols={6} />
                      <div className="text-xs text-white/40 mt-2">High activity nodes highlighted • Hover for details (future)</div>
                    </div>
                  </div>
                </GlassShell>
              </div>

              <div>
                <GlassShell className="p-5">
                  <LiveActivityFeed entries={feed} />
                </GlassShell>
              </div>
            </div>

            <div>
              <GlassShell className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/70">Recent Deliveries</div>
                  <div className="text-xs text-white/40">audit • share links</div>
                </div>
                <div className="flex gap-4 overflow-x-auto py-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.03 }} className="min-w-[220px] p-3 rounded-lg bg-white/3 border border-white/7">
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
            </div>
          </div>

          <div className="space-y-8">
            <GlassShell className="p-6">
              <div className="text-sm text-white/70 mb-3">Overview</div>
              <div className="flex flex-col gap-3">
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

            <GlassShell className="p-6">
              <div className="text-sm text-white/70 mb-3">Quick Filters</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div>All Teams</div>
                  <div className="text-white/80">812</div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div>Shared with external</div>
                  <div className="text-white/80">42</div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div>Flagged</div>
                  <div className="text-white/80">7</div>
                </div>
              </div>
            </GlassShell>

            <GlassShell className="p-6">
              <div className="text-sm text-white/70 mb-3">Active Sessions</div>
              <div className="space-y-2">
                {["AJ", "MB", "RN", "ZT", "KL"].map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-white/70">
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

            <GlassShell className="p-6">
              <div className="text-sm text-white/70 mb-3">Quick Actions</div>
              <div className="flex flex-col gap-2">
                <button className="w-full py-2 rounded-full bg-white/6 border border-white/8 flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> New Shared Space
                </button>
                <button className="w-full py-2 rounded-full bg-transparent border border-white/8 flex items-center justify-center gap-2 text-sm">
                  <RefreshCcw className="w-4 h-4" /> Re-sync All
                </button>
                <button className="w-full py-2 rounded-full bg-transparent border border-white/8 flex items-center justify-center gap-2 text-sm">
                  <LogOut className="w-4 h-4" /> End Session
                </button>
              </div>
            </GlassShell>

            <GlassShell className="p-6">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassShell className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-white/70">Operational Analytics</div>
                <div className="text-xs text-white/40">last 24 hours</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white">Design</div>
                      <div className="text-xs text-white/40">320 GB</div>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 bg-white/6 rounded-full relative">
                        <div style={{ width: "68%" }} className="absolute left-0 top-0 bottom-0 bg-white/12 rounded-full" />
                      </div>
                    </div>
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
            <GlassShell className="p-6">
              <div className="text-sm text-white/70 mb-3">SEO & Metadata</div>
              <div className="text-xs text-white/40">
                SkyShare – team workflow intelligence, secure file sharing, enterprise sync. Improve time-to-delivery, reduce duplicate storage, and enable AI-driven organization. Built for distributed teams and high-volume pipelines.
              </div>

              <div className="mt-4 text-xs text-white/50">Keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["file sharing", "team collaboration", "enterprise sync", "secure cloud", "AI organization"].map((k) => (
                  <div key={k} className="text-xs text-white/40 px-2 py-1 bg-white/3 rounded-full border border-white/6">{k}</div>
                ))}
              </div>
            </GlassShell>
          </div>
        </div>

        <footer className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} SkyShare • Secure • Fast • Designed for teams
        </footer>
      </div>
    </section>
  );
};

export default TeamWorkflowUltra;
