import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Cpu,
  Folder as FolderIcon,
  Share2,
  Lock,
  Radio,
  Search,
  Brain,
} from "lucide-react";

// Number ticker hook
const useTicker = (start = 0, end = 1000, duration = 1600, deps = []) => {
  const [value, setValue] = useState(start);
  useEffect(() => {
    let raf = null;
    let startTime = null;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const animate = (t) => {
      if (!startTime) startTime = t;
      const elapsed = t - startTime;
      const progress = Math.min(1, elapsed / duration);
      setValue(Math.round(start + (end - start) * easeOutCubic(progress)));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return value;
};

// Sparkline chart
const SparkLine = ({ points = [], width = 160, height = 36 }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => ((v - min) / (max - min || 1)) * height;
  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${Math.round((i / (points.length - 1)) * width)} ${Math.round(
          height - norm(p)
        )}`
    )
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="gSparkline" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#gSparkline)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

// Folder Structure Widget
const FolderStructureWidget = ({ seed = 5 }) => {
  const tree = useMemo(
    () =>
      Array.from({ length: seed }).map((_, i) => {
        const children = Array.from({ length: 2 + (i % 3) }).map((__, j) => ({
          id: `${i}-${j}`,
          name: `File-${i + 1}-${j + 1}.txt`,
          sizeMB: Math.floor(1 + Math.random() * 200),
        }));
        return { id: `folder-${i}`, name: `Project-${i + 1}`, children };
      }),
    [seed]
  );

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8">
      <div className="text-sm text-white/70 mb-3 font-semibold">Folder Structure</div>
      <div className="space-y-4">
        {tree.map((folder, idx) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/2 rounded-lg p-3 border border-white/10"
          >
            <div className="flex items-center justify-between text-white/90 font-medium mb-2">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                {folder.name}
              </div>
              <div className="text-xs text-white/50">{folder.children.length} items</div>
            </div>
            <div className="space-y-1 pl-6">
              {folder.children.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between text-xs text-white/60 hover:text-white transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center text-[10px]">
                      {file.name.split(".")[1]}
                    </div>
                    {file.name}
                  </div>
                  <div>{file.sizeMB}MB</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// AI Organizer Widget
const AIOrganizerWidget = () => {
  const nodes = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({ id: i })), []);
  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8">
      <div className="text-sm text-white/70 mb-3 font-semibold">AI Organizer</div>
      <div className="relative flex justify-center items-center h-44">
        <Brain className="w-12 h-12 text-white/90 animate-pulse" />
        {nodes.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: [0.8, 1.2, 1] }}
            transition={{ delay: i * 0.15, repeat: Infinity, duration: 2 }}
            className="absolute w-6 h-6 rounded-full bg-white/20 border border-white/10"
            style={{
              top: `${20 + i * 10}%`,
              left: `${10 + i * 14}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Global File Sharing Widget (3D Earth Placeholder)
const GlobalSharingWidget = () => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setRotation((r) => (r + 0.2) % 360), 16);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8 mt-6 relative overflow-hidden">
      <div className="text-sm text-white/70 mb-3 font-semibold">Global File Sharing</div>
      <div className="flex justify-center items-center h-44 relative">
        {/* Placeholder rotating Earth */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center text-white/40 font-bold"
        >
          🌐
        </motion.div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/50">
          1.3M Files Shared Globally
        </div>
      </div>
    </div>
  );
};

// Main Export
export default function FileSharingDashboard() {
  const filesTransferred = useTicker(0, 1300000, 1600, []);
  const activeTeams = useTicker(0, 812, 1500, []);
  const processingSpeed = useTicker(1, 3.6, 1700, []);
  const uptime = useTicker(95, 99, 1400, []);
  const sparkSets = useMemo(
    () => Array.from({ length: 3 }).map(() => Array.from({ length: 16 }).map(() => Math.random() * 100)),
    []
  );

  const fmtNumber = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
  };

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1100px] mx-auto space-y-10">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center">
            <div className="text-2xl font-semibold">{fmtNumber(filesTransferred)}</div>
            <div className="text-xs text-white/50 mt-1">Files Transferred</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center">
            <div className="text-2xl font-semibold">{activeTeams}</div>
            <div className="text-xs text-white/50 mt-1">Active Teams</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center">
            <div className="text-2xl font-semibold">{uptime}%</div>
            <div className="text-xs text-white/50 mt-1">Uptime</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center">
            <div className="text-2xl font-semibold">{processingSpeed}GB/s</div>
            <div className="text-xs text-white/50 mt-1">Processing Speed</div>
          </div>
        </div>

        {/* Widgets */}
        <FolderStructureWidget />
        <AIOrganizerWidget />
        <GlobalSharingWidget />

        {/* Sparkline for visual effect */}
        <div className="mt-6">
          <SparkLine points={sparkSets[0]} width={600} height={36} />
        </div>
      </div>
    </section>
  );
}
