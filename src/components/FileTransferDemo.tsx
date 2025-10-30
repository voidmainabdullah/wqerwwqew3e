import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import {
  Shield,
  Lock,
  Zap,
  Eye,
  Settings,
  CheckCircle,
  Cloud,
  Upload,
  Download,
  Folder,
  Users,
  ArrowRight,
  Database,
  Clock,
  Star,
} from "lucide-react";

/**
 * Ultra cinematic File Transfer Demo (TSX)
 * - Tailwind CSS required
 * - framer-motion + lucide-react required
 *
 * Usage:
 * <FileTransferDemo initialPreview="/my-dashboard.png" />
 *
 * Replace preview src with your PNG, or use the upload control inside the component.
 */

type Props = {
  initialPreview?: string; // path to dashboard preview PNG
};

const neon = "shadow-[0_0_18px_rgba(34,197,94,0.10)]"; // subtle green neon
const neonStrong = "shadow-[0_0_30px_rgba(34,197,94,0.14)]";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const floatVariant: Variants = {
  float: {
    y: [0, -6, 0],
    transition: { y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  },
};

const pulseVariant: Variants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
};

const Packet = ({ delay = 0, color = "#22c55e" }: { delay?: number; color?: string }) => {
  return (
    <motion.span
      initial={{ x: -40, opacity: 0, scale: 0.7 }}
      animate={{ x: 40, opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: color }}
      aria-hidden
    />
  );
};

const Meter = ({ value }: { value: number }) => {
  return (
    <div className="w-full bg-[#0b0b0b] rounded-full h-2 overflow-hidden border border-[#151515]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background:
            "linear-gradient(90deg, rgba(34,197,94,1) 0%, rgba(56,189,248,1) 60%)",
          boxShadow: "0 0 14px rgba(34,197,94,0.12)",
        }}
      />
    </div>
  );
};

const useSimulatedTransfer = (initial = false) => {
  // Simulates an upload/download progress with speed fluctuations
  const [running, setRunning] = useState(initial);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(48); // MB/s hypothetical
  const [sizeMB, setSizeMB] = useState(2300); // 2.3 GB default
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    let raf: number | null = null;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (!running) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // simple speed fluctuation
      const speedVariance = 8;
      const currentSpeed = Math.max(6, speed + (Math.sin(now / 1000) * speedVariance));
      setSpeed(Math.round(currentSpeed));

      // compute delta progress
      const uploadedMBPerSec = currentSpeed; // MB/s
      const uploadedMB = (uploadedMBPerSec * delta);
      const totalUploaded = (progress / 100) * sizeMB + uploadedMB;
      const newProgress = Math.min(100, (totalUploaded / sizeMB) * 100);
      setProgress(parseFloat(newProgress.toFixed(2)));

      // ETA
      const remainingMB = Math.max(0, sizeMB - (newProgress / 100) * sizeMB);
      const etaSec = remainingMB / uploadedMBPerSec;
      setEta(Number.isFinite(etaSec) ? Math.max(0, Math.round(etaSec)) : null);

      if (newProgress >= 100) {
        setRunning(false);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, progress, speed, sizeMB]);

  const start = (sizeOverride?: number) => {
    if (sizeOverride) setSizeMB(sizeOverride);
    setProgress(0);
    setRunning(true);
  };

  const stop = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setProgress(0);
    setEta(null);
  };

  return { running, progress, speed, sizeMB, eta, start, stop, reset, setSizeMB };
};

const InfoBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 bg-white/6 px-3 py-1 rounded-full text-xs font-medium text-gray-200 border border-white/6">
    <Star className="w-3 h-3 text-green-400" />
    {children}
  </div>
);

const SmallStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-start">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const FileTransferDemo: React.FC<Props> = ({ initialPreview }) => {
  const controls = useAnimation();
  const { running, progress, speed, sizeMB, eta, start, stop, reset, setSizeMB } = useSimulatedTransfer(false);
  const [preview, setPreview] = useState<string | undefined>(initialPreview);
  const [localFileName, setLocalFileName] = useState<string>("project-files.zip");
  const [selectedSizeMB, setSelectedSizeMB] = useState<number>(2300);
  const [packets, setPackets] = useState<number>(6);
  const [showSettings, setShowSettings] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // animate entrance
    controls.start("show");
  }, [controls]);

  useEffect(() => {
    // mouse parallax
    const onMove = (e: MouseEvent) => {
      const r = stageRef.current;
      if (!r) return;
      const bounds = r.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width - 0.5;
      const y = (e.clientY - bounds.top) / bounds.height - 0.5;
      setParallax({ x: x * 12, y: y * 8 });
    };
    const el = stageRef.current;
    el?.addEventListener("mousemove", onMove);
    return () => {
      el?.removeEventListener("mousemove", onMove);
    };
  }, []);

  // small file input for dashboard preview
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onSelectPreview = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLocalFileName(file.name);
  };

  // helper to format ETA seconds
  const formatETA = (sec: number | null) => {
    if (sec === null) return "--";
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // simulated packet stream (positions are driven by CSS grid and motion)
  const PacketRow = ({ count = 6 }: { count?: number }) => {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0.35 }}
            animate={{ y: [-2, -8, -2], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8 + i * 0.12, delay: i * 0.06, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full"
            style={{ background: `rgba(34,197,94,${0.25 + (i / count) * 0.8})`, boxShadow: `0 0 ${6 + i}px rgba(34,197,94,0.12)` }}
          />
        ))}
      </div>
    );
  };

  return (
    <section
      ref={stageRef}
      className="relative py-20 px-6 md:px-12 overflow-hidden bg-gradient-to-b from-[#040404] via-[#070707] to-[#0b0b0b] text-white"
      aria-labelledby="file-transfer-demo"
    >
      {/* ambient radial glow layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 w-[640px] h-[640px] rounded-full bg-gradient-to-r from-[#042f1a] to-transparent opacity-40 blur-3xl" />
        <div className="absolute -right-28 -bottom-28 w-[480px] h-[480px] rounded-full bg-gradient-to-r from-[#0b2b2a] to-transparent opacity-30 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <motion.h2
              id="file-transfer-demo"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              See File Transfer in Action
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-3 text-gray-300 max-w-2xl"
            >
              Watch how your files flow through a secure, ultra-fast pipeline — cinematic preview with real-like speed,
              packet visualization, and a customizable dashboard preview card.
            </motion.p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <InfoBadge>
                Premium demo
              </InfoBadge>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/6 rounded-full text-sm text-gray-200 border border-white/6">
                  <strong className="text-white">2.3 GB</strong> sample
                </div>
                <div className="px-3 py-1 bg-white/6 rounded-full text-sm text-gray-200 border border-white/6 hidden sm:inline">
                  <strong>{Math.round(speed)} MB/s</strong> simulated speed
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-white/6 to-white/4 border border-white/8 ${neon} text-sm font-medium`}
              onClick={() => {
                // quick demo start
                setSizeMB(selectedSizeMB);
                start(selectedSizeMB);
              }}
              aria-pressed={running}
            >
              <Upload className="w-4 h-4 text-green-300" />
              Start Demo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
              onClick={() => {
                reset();
                setTimeout(() => {
                  setSizeMB(2300);
                  setLocalFileName("project-files.zip");
                  setPreview(initialPreview);
                }, 80);
              }}
            >
              Reset
            </motion.button>
          </div>
        </div>

        {/* main showcase row */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* left column - steps */}
          <div className="lg:col-span-6 space-y-8">
            {/* pipeline card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-[#0b0b0b] border border-[#151515] rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#07160f] to-[#071b13] border border-[#13231a]">
                    <Folder className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Project Files</h4>
                    <p className="text-xs text-gray-400">24 files • <strong>2.3 GB</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-300">Shared • 5 users</div>
                  <div className="px-3 py-1 rounded-full bg-white/6 border border-white/6 text-xs text-gray-200">Team</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "Document", icon: Upload },
                  { name: "Images", icon: Download },
                  { name: "Video", icon: Cloud },
                ].map((it, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl p-4 bg-[#070707] border border-[#191919] flex flex-col items-start gap-3"
                  >
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white/3 border border-white/6">
                          <it.icon className="text-green-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100">{it.name}</div>
                          <div className="text-xs text-gray-400">sample • 8 files</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">2.3 GB</div>
                      </div>
                    </div>

                    <div className="w-full">
                      <Meter value={Math.min(100, Math.round(progress + i * 4))} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* pipeline visual */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                    <div>
                      <div className="text-xs text-gray-300">Pipeline</div>
                      <div className="text-sm font-semibold text-white">Secure transfer stream</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">AES-256 • {formatBytes(sizeMB * 1024 * 1024)}</div>
                </div>

                <div className="relative bg-[#060606] border border-[#141414] rounded-xl p-4 overflow-hidden">
                  {/* moving packet tracks */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400">Client</div>
                        <div className="text-xs text-gray-300">→</div>
                        <div className="text-xs text-gray-400">Edge</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-white">{progress.toFixed(0)}%</div>
                        <div className="text-xs text-gray-400">{formatETA(eta)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* track */}
                      <div className="flex-1 h-10 rounded-md bg-[#050505] border border-[#191919] flex items-center px-3 gap-4 overflow-hidden relative" aria-hidden>
                        {/* packet flows */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 4.4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-y-0 left-0 flex items-center gap-3 pl-2"
                        >
                          <PacketRow count={packets} />
                        </motion.div>

                        <div className="flex items-center gap-3 z-10 ml-auto">
                          <div className="text-xs text-gray-400">↑</div>
                          <div className="text-xs text-gray-400">↓</div>
                        </div>
                      </div>

                      <div className="w-40">
                        <Meter value={progress} />
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                          <div>{Math.round((progress / 100) * sizeMB)} MB</div>
                          <div>{Math.round(speed)} MB/s</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle overlay glow */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent opacity-5" />
                </div>
              </div>

              {/* actions */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">File size (MB)</label>
                  <input
                    type="number"
                    value={selectedSizeMB}
                    onChange={(e) => setSelectedSizeMB(Math.max(1, Number(e.target.value)))}
                    className="w-28 bg-transparent border border-white/6 rounded-md px-3 py-1 text-sm text-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setSizeMB(selectedSizeMB);
                    start(selectedSizeMB);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-black font-medium"
                >
                  Simulate Upload
                </button>

                <button
                  onClick={() => stop()}
                  className="px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
                >
                  Pause
                </button>

                <button
                  onClick={() => {
                    reset();
                  }}
                  className="px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
                >
                  Stop
                </button>

                <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <div>{eta !== null ? formatETA(eta) : "--"}</div>
                </div>
              </div>
            </motion.div>

            {/* secure step cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="rounded-2xl bg-[#070707] border border-[#161616] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <Lock className="text-green-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Secure Upload</div>
                    <div className="text-xs text-gray-400">Encrypted by default</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">AES-256 · End-to-end encryption ensures files cannot be read in transit.</div>
              </motion.div>

              <motion.div className="rounded-2xl bg-[#070707] border border-[#161616] p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <Eye className="text-green-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Live Monitoring</div>
                    <div className="text-xs text-gray-400">Track uploads in real-time</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-400">Active transfers</div>
                  <div className="text-sm font-semibold text-green-300">24</div>
                </div>
              </motion.div>

              <motion.div className="rounded-2xl bg-[#070707] border border-[#161616] p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <Settings className="text-green-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Full Control</div>
                    <div className="text-xs text-gray-400">Permissions & access</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-400">Granular roles · Expiring links · Audit logs</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* right column - dashboard preview */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="rounded-3xl border border-[#1c1c1c] overflow-hidden p-6 bg-gradient-to-b from-[#050505] to-[#070707] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-white/4 p-2 border border-white/8">
                    <Database className="text-green-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Your Dashboard Preview</div>
                    <div className="text-xs text-gray-400">Drop a PNG or use the upload button</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <InfoBadge>Live Preview</InfoBadge>
                  <button
                    onClick={() => setShowSettings((s) => !s)}
                    className="px-2 py-1 rounded bg-transparent border border-white/6 text-xs text-gray-200"
                  >
                    Settings
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* preview card */}
                <div className="md:col-span-8 col-span-1">
                  <div
                    className={`rounded-xl overflow-hidden border border-[#1e1e1e] ${neonStrong} bg-black/30 backdrop-blur-md transform transition-transform hover:scale-[1.01]`}
                    style={{ minHeight: 260 }}
                  >
                    {preview ? (
                      <img src={preview} alt="Dashboard preview" className="w-full h-full object-cover block" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <div className="text-center">
                          <div className="text-gray-400">No preview selected</div>
                          <div className="text-sm text-gray-300 mt-2">Drop a PNG or click Upload to set a preview image</div>
                          <div className="mt-4 flex items-center gap-3 justify-center">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-black font-semibold"
                            >
                              Upload Preview
                            </button>
                            <button
                              onClick={() => {
                                setPreview("/example-dashboard.png");
                              }}
                              className="px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
                            >
                              Use demo preview
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/webp,image/jpeg"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onSelectPreview(f);
                    }}
                    className="hidden"
                  />
                </div>

                {/* control panel */}
                <div className="md:col-span-4 col-span-1 flex flex-col gap-3">
                  <div className="bg-[#070707] border border-[#191919] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">File</div>
                        <div className="text-sm font-semibold text-white">{localFileName}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-400">Size</div>
                        <div className="text-sm font-semibold text-white">{sizeMB} MB</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Meter value={progress} />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                        <div>{Math.round((progress / 100) * sizeMB)} MB</div>
                        <div>{Math.round(speed)} MB/s</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSizeMB(1200);
                          start(1200);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-white/6 to-white/4 text-sm font-medium"
                      >
                        Quick 1.2 GB
                      </button>
                      <button
                        onClick={() => {
                          setSizeMB(4600);
                          start(4600);
                        }}
                        className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-black text-sm font-medium"
                      >
                        4.6 GB
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#070707] border border-[#191919] rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">Packets</div>
                      <div className="text-sm font-semibold text-white">{packets}</div>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      value={packets}
                      onChange={(e) => setPackets(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-400">Adjust packet visualization density</div>
                  </div>

                  <div className="bg-[#070707] border border-[#191919] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">Preview options</div>
                      <div className="text-sm font-semibold text-white">{preview ? "Custom" : "None"}</div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-black text-sm font-medium"
                      >
                        Upload PNG
                      </button>
                      <button
                        onClick={() => {
                          setPreview(undefined);
                        }}
                        className="px-3 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* cinematic footer metrics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="rounded-2xl bg-gradient-to-b from-[#070707] to-[#040404] border border-[#1b1b1b] p-6 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-400">Avg speed</div>
                  <div className="text-lg font-semibold text-white">{Math.round(speed)} MB/s</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Uptime</div>
                  <div className="text-lg font-semibold text-white">99.9%</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Data Centers</div>
                  <div className="text-lg font-semibold text-white">50+</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400">Premium</div>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-black font-semibold">Active</div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="px-4 py-2 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* bottom security showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18 }}
          className="mt-12 bg-gradient-to-b from-[#070707] to-[#040404] border border-[#161616] rounded-3xl p-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/3 border border-white/8">
                <Shield className="text-green-300" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Security First Architecture</div>
                <div className="text-xs text-gray-400">Every transfer is protected by multiple layers</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">SLA</div>
                <div className="text-sm font-semibold text-white">99.9%</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">Verified</div>
                <div className="text-sm font-semibold text-white">MFA</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">Pages</div>
                <div className="text-sm font-semibold text-white">Docs & Audit</div>
              </div>

              <div className="ml-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-black font-medium"
                >
                  Get Premium
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FileTransferDemo;

/* ============================
   Helper utils (bottom)
   - Kept inside file for single-file convenience
   ============================ */

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
