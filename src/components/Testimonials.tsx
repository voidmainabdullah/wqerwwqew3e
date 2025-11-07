import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Folder as FolderIcon, Brain, Users, Cpu } from "lucide-react";

// ---------------------------
// Number ticker hook
// ---------------------------
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

// ---------------------------
// Sparkline Chart Component
// ---------------------------
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
        <linearGradient id="sparkGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#sparkGradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// ---------------------------
// Folder Structure Component
// ---------------------------
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

  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (id) => setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8 shadow-lg">
      <div className="text-sm text-white/70 mb-4 font-semibold">Folder Structure</div>
      <div className="space-y-4">
        {tree.map((folder, idx) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/2 rounded-lg p-3 border border-white/10 hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => toggleFolder(folder.id)}
          >
            <div className="flex items-center justify-between text-white/90 font-medium mb-2">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                {folder.name}
              </div>
              <div className="text-xs text-white/50">{folder.children.length} items</div>
            </div>
            {expandedFolders[folder.id] && (
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
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------
// AI Organizer Component
// ---------------------------
const AIOrganizerWidget = () => {
  const nodes = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ id: i })), []);
  const suggestions = ["Sort Files", "Tag Important", "Merge Duplicates", "Auto Backup", "Clean Cache", "AI Categorize"];

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8 shadow-lg">
      <div className="text-sm text-white/70 mb-4 font-semibold">AI Organizer</div>
      <div className="relative flex justify-center items-center h-44 mb-4">
        <Brain className="w-14 h-14 text-white/90 animate-pulse" />
        {nodes.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: [0.8, 1.2, 1] }}
            transition={{ delay: i * 0.15, repeat: Infinity, duration: 2 }}
            className="absolute w-6 h-6 rounded-full bg-white/20 border border-white/10"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + i * 13}%`,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 p-2 rounded-lg text-xs text-white/70 flex justify-center items-center shadow-sm transition-all duration-200"
          >
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------
// Global Sharing Widget Component
// ---------------------------
const GlobalSharingWidget = () => {
  const [rotation, setRotation] = useState(0);
  const avatars = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ id: i, progress: Math.random() })), []);
  const points = useMemo(() => Array.from({ length: 8 }).map(() => ({ x: Math.random() * 200, y: Math.random() * 200 })), []);

  useEffect(() => {
    const interval = setInterval(() => setRotation((r) => (r + 0.2) % 360), 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/8 mt-6 relative overflow-hidden shadow-lg">
      <div className="text-sm text-white/70 mb-3 font-semibold">Global File Sharing</div>
      <div className="flex justify-center items-center h-52 relative">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="w-36 h-36 bg-white/10 rounded-full flex items-center justify-center shadow-inner relative"
        >
          <div className="absolute text-white/40 text-3xl">🌐</div>
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{ top: `${p.y}%`, left: `${p.x}%` }}
            />
          ))}
          {avatars.map((a) => (
            <div
              key={a.id}
              className="absolute w-5 h-5 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-[8px]"
              style={{
                top: `${Math.random() * 70}%`,
                left: `${Math.random() * 70}%`,
              }}
            >
              {Math.round(a.progress * 100)}%
            </div>
          ))}
        </motion.div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/50">
          1.3M Files Shared Globally
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// Metrics Widget Component
// ---------------------------
const MetricsWidget = ({ filesTransferred, activeTeams, uptime, processingSpeed }) => {
  const fmtNumber = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-semibold">{fmtNumber(filesTransferred)}</div>
        <div className="text-xs text-white/50 mt-1">Files Transferred</div>
      </div>
      <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-semibold">{activeTeams}</div>
        <div className="text-xs text-white/50 mt-1">Active Teams</div>
      </div>
      <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-semibold">{uptime}%</div>
        <div className="text-xs text-white/50 mt-1">Uptime</div>
      </div>
      <div className="p-4 bg-white/5 border border-white/8 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-semibold">{processingSpeed}GB/s</div>
        <div className="text-xs text-white/50 mt-1">Processing Speed</div>
      </div>
    </div>
  );
};

// ---------------------------
// Main Dashboard Component
// ---------------------------
export default function FileSharingDashboard() {
  const filesTransferred = useTicker(0, 1300000, 1600, []);
  const activeTeams = useTicker(0, 812, 1500, []);
  const processingSpeed = useTicker(1, 3.6, 1700, []);
  const uptime = useTicker(95, 99, 1400, []);
  const sparkSets = useMemo(() => Array.from({ length: 3 }).map(() => Array.from({ length: 16 }).map(() => Math.random() * 100)), []);

  return (
    <section className="relative w-full bg-black text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <MetricsWidget filesTransferred={filesTransferred} activeTeams={activeTeams} uptime={uptime} processingSpeed={processingSpeed} />
        <FolderStructureWidget seed={6} />
        <AIOrganizerWidget />
        <GlobalSharingWidget />
        <div className="mt-6">
          <SparkLine points={sparkSets[0]} width={800} height={36} />
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AIOrganizerWidget />
          <FolderStructureWidget seed={4} />
        </div>
        <div className="mt-12">
          <GlobalSharingWidget />
        </div>
      </div>
    </section>
  );
}
