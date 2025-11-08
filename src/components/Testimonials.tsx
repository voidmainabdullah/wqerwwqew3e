import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CloudUpload,
  Shield,
  Zap,
  BarChart3,
  Database,
  CheckCircle2,
  Share2,
} from "lucide-react";

/**
 * Testimonials.tsx
 * A large, production-ready Testimonials + Global Share section for SkyShare.
 * - Tailwind for styling
 * - Framer Motion for animations
 * - Interactive EarthWidget (Canvas) with draggable rotation and activity dots
 * - StatsGrid, Logos carousel, Testimonial carousel, CTA
 *
 * Usage: import Testimonials from './Testimonials'; and place in your page.
 * Dependencies: framer-motion, lucide-react, react
 */

// ----------------------------- Types ---------------------------------

type Testimonial = {
  quote: string;
  author: string;
  position: string;
  initials: string;
};

type ActivityPoint = {
  id: string;
  country: string;
  lat: number; // degrees
  lon: number; // degrees
  activeFiles: number;
  lastSeen: string; // ISO date
};

// -------------------------- Helper Utilities --------------------------

const clamp = (v: number, a = -Infinity, b = Infinity) => Math.max(a, Math.min(b, v));

// convert degrees to radians
const rad = (d: number) => (d * Math.PI) / 180;

// convert lat/lon to 3D coordinates on unit sphere
function latLonToCartesian(lat: number, lon: number) {
  const phi = rad(90 - lat);
  const theta = rad(lon + 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

// Rotate point by rotationX (pitch) and rotationY (yaw)
function rotatePoint(p: { x: number; y: number; z: number }, rotX: number, rotY: number) {
  // rotX around X axis, rotY around Y axis
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);

  // rotate around X
  let y = p.y * cosX - p.z * sinX;
  let z = p.y * sinX + p.z * cosX;
  let x = p.x;

  // rotate around Y
  const nx = x * cosY + z * sinY;
  const nz = -x * sinY + z * cosY;

  return { x: nx, y, z: nz };
}

// --------------------------- Earth Widget -----------------------------

/**
 * EarthWidget
 * - draws a globe on a canvas
 * - displays activity dots based on lat/lon
 * - supports drag rotate and auto-rotation
 */
const EarthWidget: React.FC<{
  points: ActivityPoint[];
  size?: number; // px
  glowColor?: string;
}> = ({ points, size = 420, glowColor = "#5b8cff" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // rotation state (radians)
  const rotRef = useRef({ x: rad(25), y: 0 });
  const targetRotRef = useRef({ x: rad(25), y: 0 });

  // drag state
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startRotX: 0, startRotY: 0 });

  // auto-rotate speed (radians / sec)
  const autoRotateSpeed = 0.12; // around Y

  // pixel ratio handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [size]);

  // drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 8;

    // smooth interpolate rotation towards targetRot
    rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.08;
    rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.08;

    // clear
    ctx.clearRect(0, 0, w, h);

    // draw outer glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.6);
    glow.addColorStop(0, `${glowColor}22`);
    glow.addColorStop(0.6, `${glowColor}06`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // build subtle backdrop grid (latitude)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0);
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#ffffff";
    for (let i = -80; i <= 80; i += 20) {
      ctx.beginPath();
      const r = radius * Math.cos(rad(i));
      ctx.ellipse(0, 0, r, r * 0.65, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // draw globe base with faint land shadow
    ctx.save();
    ctx.translate(cx, cy);

    // sphere gradient
    const g = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.2, 0, 0, radius);
    g.addColorStop(0, "rgba(255,255,255,0.03)");
    g.addColorStop(0.5, "rgba(255,255,255,0.01)");
    g.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // subtle rim
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // draw meridians for depth
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      const angle = (i / 24) * Math.PI * 2;
      ctx.ellipse(0, 0, radius, radius * 0.9, angle, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // draw activity points
    const rotX = rotRef.current.x;
    const rotY = rotRef.current.y;

    // sort by z for painter's algorithm
    const drawn = points
      .map((pt) => {
        const cart = latLonToCartesian(pt.lat, pt.lon);
        const rotated = rotatePoint(cart, rotX, rotY);
        // perspective projection: we only draw points with z > -0.2 (front hemisphere)
        return { ...pt, cart, rotated };
      })
      .filter((d) => d.rotated.z > -0.35)
      .sort((a, b) => b.rotated.z - a.rotated.z);

    // draw connection arcs (animated subtle lines from random region)
    ctx.save();
    ctx.translate(cx, cy);
    drawn.forEach((d, i) => {
      const screenX = d.rotated.x * radius;
      const screenY = -d.rotated.y * radius * 0.85;
      const depth = clamp((d.rotated.z + 1) / 2, 0, 1);

      // connection pulse
      const pulse = Math.sin(Date.now() / 800 + i) * 0.5 + 0.5;

      // dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.9 * depth})`;
      const dotSize = 3 + Math.log(1 + d.activeFiles) * 1.6 * depth;
      ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
      ctx.fill();

      // halo
      ctx.beginPath();
      ctx.fillStyle = `rgba(91,140,255,${0.14 * pulse * depth})`;
      ctx.arc(screenX, screenY, dotSize * 3.2 * (0.6 + 0.6 * pulse), 0, Math.PI * 2);
      ctx.fill();

      // thin connecting line to center for effect
      ctx.beginPath();
      ctx.strokeStyle = `rgba(91,140,255,${0.06 * depth})`;
      ctx.moveTo(0, 0);
      ctx.lineTo(screenX * 0.4, screenY * 0.4);
      ctx.stroke();
    });
    ctx.restore();

    // gloss reflection
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.ellipse(-radius * 0.45, -radius * 0.6, radius * 0.72, radius * 0.36, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [points, glowColor]);

  // animation loop
  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;

      // auto-rotate target
      if (!dragState.current.dragging) {
        targetRotRef.current.y += autoRotateSpeed * dt * 0.6; // gentle auto spin
      }

      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // pointer handlers for drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      dragState.current.dragging = true;
      dragState.current.startX = e.clientX;
      dragState.current.startY = e.clientY;
      dragState.current.startRotX = targetRotRef.current.x;
      dragState.current.startRotY = targetRotRef.current.y;
    };

    const onMove = (e: PointerEvent) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;

      // sensitivity
      const sens = 0.007;
      targetRotRef.current.y = dragState.current.startRotY + dx * sens;
      targetRotRef.current.x = clamp(dragState.current.startRotX + dy * sens, rad(-60), rad(80));
    };

    const onUp = (e: PointerEvent) => {
      dragState.current.dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (e) {}
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // hover tooltip (simple - uses mouse position + nearest point)
  const [hoverInfo, setHoverInfo] = useState<null | { point: ActivityPoint; x: number; y: number }>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = () => canvas.getBoundingClientRect();

    const onMove = (e: MouseEvent) => {
      const r = rect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      // compute nearest active drawn point to mouse
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2 - 8;
      const rotX = rotRef.current.x;
      const rotY = rotRef.current.y;

      let nearest: null | { pt: ActivityPoint; sx: number; sy: number; dist: number } = null;
      points.forEach((pt) => {
        const cart = latLonToCartesian(pt.lat, pt.lon);
        const rotated = rotatePoint(cart, rotX, rotY);
        if (rotated.z <= -0.2) return;
        const sx = cx + rotated.x * radius;
        const sy = cy - rotated.y * radius * 0.85;
        const d = Math.hypot(mx - sx, my - sy);
        if (!nearest || d < nearest.dist) {
          nearest = { pt, sx, sy, dist: d };
        }
      });

      if (nearest && nearest.dist < 28) {
        setHoverInfo({ point: nearest.pt, x: nearest.sx, y: nearest.sy });
      } else {
        setHoverInfo(null);
      }
    };

    const onLeave = () => setHoverInfo(null);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [points]);

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-full shadow-2xl"
          style={{ width: size, height: size, touchAction: "none", cursor: "grab" }}
        />

        {/* center badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/80 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="white" fillOpacity="0.9" />
              <path d="M3 20C3 15.5817 6.58172 12 11 12H13C17.4183 12 21 15.5817 21 20V21H3V20Z" fill="white" fillOpacity="0.06" />
            </svg>
          </div>
        </div>

        {/* tooltip */}
        {hoverInfo && (
          <div
            className="absolute z-40 pointer-events-none"
            style={{ transform: `translate(${hoverInfo.x}px, ${hoverInfo.y - 54}px)` }}
          >
            <div className="max-w-xs bg-black/90 border border-white/10 p-3 rounded-xl shadow-lg text-white text-xs backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{hoverInfo.point.country}</div>
                  <div className="text-[11px] text-white/60">{hoverInfo.point.activeFiles} active</div>
                </div>
                <div className="text-[10px] text-white/40">{new Date(hoverInfo.point.lastSeen).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------- Testimonials Component --------------------

const Testimonials: React.FC = () => {
  // dummy testimonials data
  const testimonials: Testimonial[] = [
    {
      quote:
        "Our collaboration improved by 300% after switching to SkyShare — file sharing is now seamless, fast, and secure.",
      author: "Sarah Johnson",
      position: "Product Manager at TechCorp",
      initials: "SJ",
    },
    {
      quote:
        "Enterprise-level security made beautifully simple. Our data sharing finally feels effortless and safe.",
      author: "Michael Chen",
      position: "Head of Security at DataFlow",
      initials: "MC",
    },
    {
      quote:
        "AI-based organization is game-changing — we reduced file clutter by 60% across all teams.",
      author: "Leila Rodriguez",
      position: "Operations Director at CreativeStudio",
      initials: "LR",
    },
    {
      quote:
        "A stunningly designed tool that actually delivers. Uploads, encryption, and sharing — all beautifully smooth.",
      author: "Daniel Reed",
      position: "CTO at NovaLabs",
      initials: "DR",
    },
    {
      quote: "From design to performance, everything about SkyShare feels premium — we use it every single day.",
      author: "Amira Patel",
      position: "Brand Director at Orion",
      initials: "AP",
    },
    {
      quote: "Our global team loves how intuitive SkyShare feels — even complex workflows are simple now.",
      author: "Kenji Sato",
      position: "Project Lead at CloudStream",
      initials: "KS",
    },
  ];

  // sample activity points
  const activityPoints: ActivityPoint[] = [
    { id: "us", country: "United States", lat: 37.1, lon: -95.7, activeFiles: 128, lastSeen: new Date().toISOString() },
    { id: "pk", country: "Pakistan", lat: 30.3753, lon: 69.3451, activeFiles: 48, lastSeen: new Date().toISOString() },
    { id: "gb", country: "United Kingdom", lat: 55.3781, lon: -3.4360, activeFiles: 80, lastSeen: new Date().toISOString() },
    { id: "in", country: "India", lat: 20.5937, lon: 78.9629, activeFiles: 199, lastSeen: new Date().toISOString() },
    { id: "de", country: "Germany", lat: 51.1657, lon: 10.4515, activeFiles: 67, lastSeen: new Date().toISOString() },
    { id: "jp", country: "Japan", lat: 36.2048, lon: 138.2529, activeFiles: 31, lastSeen: new Date().toISOString() },
    { id: "br", country: "Brazil", lat: -14.2350, lon: -51.9253, activeFiles: 21, lastSeen: new Date().toISOString() },
    { id: "au", country: "Australia", lat: -25.2744, lon: 133.7751, activeFiles: 9, lastSeen: new Date().toISOString() },
  ];

  const logos = [
    "/images/logo1.png",
    "/images/logo2.png",
    "/images/logo3.png",
    "/images/logo4.png",
    "/images/logo5.png",
    "/images/logo6.png",
  ];

  // carousel index
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  // small stats (derived)
  const totalActiveFiles = activityPoints.reduce((s, p) => s + p.activeFiles, 0);
  const onlineRegions = activityPoints.length;

  return (
    <section className="w-full bg-black text-white py-20 px-6 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/8 w-[680px] h-[680px] bg-gradient-to-br from-[#0B1220] via-[#0F1724] to-transparent rounded-full blur-[200px] opacity-50" />
        <div className="absolute bottom-10 right-10 w-[520px] h-[520px] bg-gradient-to-tr from-[#06102a] to-transparent rounded-full blur-[180px] opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Testimonials + Logos */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-semibold">Loved by teams worldwide</h2>
            <p className="text-white/60 max-w-2xl">See how professionals and teams revolutionize their workflow using SkyShare.</p>
          </div>

          {/* Testimonial Card (carousel) */}
          <motion.div
            key={index}
            initial={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 12 }}
            transition={{ duration: 0.9 }}
            className="bg-gradient-to-b from-[#0A0A0A]/80 to-[#050505]/80 border border-white/10 p-8 rounded-2xl shadow-xl"
          >
            <p className="text-white/80 italic text-lg leading-relaxed mb-6">“{testimonials[index].quote}”</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {testimonials[index].initials}
              </div>
              <div>
                <div className="text-white font-medium">{testimonials[index].author}</div>
                <div className="text-white/60 text-sm">{testimonials[index].position}</div>
              </div>
            </div>
          </motion.div>

          {/* Logos carousel */}
          <div className="mt-6">
            <div className="relative overflow-hidden">
              <motion.div
                className="flex items-center gap-12"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
              >
                {[...logos, ...logos].map((logo, i) => (
                  <img
                    src={logo}
                    key={i}
                    className="h-10 opacity-70 hover:opacity-100 transition-all duration-400 grayscale hover:grayscale-0"
                    alt={`partner-${i}`}
                    draggable={false}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* small CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-black font-medium shadow hover:scale-[1.01] transition-transform"
            >
              Try SkyShare Free
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-white/10 text-white/90 hover:bg-white/5 transition"
            >
              Request Demo
            </a>
          </div>
        </div>

        {/* Right: Earth widget + Stats */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earth + global sharing panel */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#080808]/80 to-[#050505]/80 border border-white/10 p-6 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="w-[420px] h-[420px] relative">
                  <EarthWidget points={activityPoints} size={420} glowColor="#5b8cff" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">Global sharing — live</h3>
                    <p className="text-white/60 text-sm max-w-md">
                      Visualize active uploads, top regions, and live activity across our global network. Hover the globe to see details.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-white/50">Regions online</div>
                    <div className="text-xl font-semibold">{onlineRegions}</div>
                  </div>
                </div>

                {/* stats grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                    <div className="text-sm text-white/60">Active file transfers</div>
                    <div className="text-2xl font-semibold mt-2">{totalActiveFiles}</div>
                    <div className="text-xs text-white/50 mt-1">Across {onlineRegions} regions</div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                    <div className="text-sm text-white/60">Avg transfer speed</div>
                    <div className="text-2xl font-semibold mt-2">{(Math.random() * (18 - 6) + 6).toFixed(1)} Mbps</div>
                    <div className="text-xs text-white/50 mt-1">Based on recent 24h samples</div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                    <div className="text-sm text-white/60">Connected users</div>
                    <div className="text-2xl font-semibold mt-2">{Math.floor(Math.random() * (9423 - 2200) + 2200)}</div>
                    <div className="text-xs text-white/50 mt-1">Currently active</div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                    <div className="text-sm text-white/60">Sync success rate</div>
                    <div className="text-2xl font-semibold mt-2">{(99.2 + Math.random() * 0.6).toFixed(2)}%</div>
                    <div className="text-xs text-white/50 mt-1">Last 24 hours</div>
                  </div>
                </div>

                {/* top regions list */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">Top regions (by active files)</div>
                    <div className="text-xs text-white/50">Updated now</div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {activityPoints
                      .slice()
                      .sort((a, b) => b.activeFiles - a.activeFiles)
                      .slice(0, 4)
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-black/40 border border-white/4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/6 flex items-center justify-center font-medium text-sm">{r.country.slice(0,2).toUpperCase()}</div>
                            <div>
                              <div className="text-sm font-medium">{r.country}</div>
                              <div className="text-xs text-white/50">{r.activeFiles} active</div>
                            </div>
                          </div>
                          <div className="text-sm text-white/60">{Math.floor((r.activeFiles / totalActiveFiles) * 100)}%</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automation / Features small cards */}
          <div className="col-span-1 p-6 rounded-2xl border border-white/8 bg-gradient-to-b from-[#080808] to-[#050505]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Teams & Permissions</div>
                <div className="text-xs text-white/60">Fine-grained control per folder and file</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Enterprise Security</div>
                <div className="text-xs text-white/60">AES-256, granular audit logs</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Automations</div>
                <div className="text-xs text-white/60">Smart triggers, AI categorization</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-white/6">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Analytics</div>
                <div className="text-xs text-white/60">User and transfer insights</div>
              </div>
            </div>
          </div>

          {/* Security / Performance small card */}
          <div className="col-span-1 p-6 rounded-2xl border border-white/8 bg-gradient-to-b from-[#080808] to-[#050505]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Resilient Uploads</div>
                <div className="text-xs text-white/60">Resume on failure, parallel segments</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Global CDN</div>
                <div className="text-xs text-white/60">Fast distribution and caching</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-md bg-white/6">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Integrity Checks</div>
                <div className="text-xs text-white/60">Checksums and verification</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-white/6">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Easy Sharing</div>
                <div className="text-xs text-white/60">Secure links, expirations, and passwords</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full width Feature showcase */}
        <div className="lg:col-span-12 mt-6">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
            <div className="relative bg-gradient-to-br from-[#0B0B0B]/90 to-[#050505]/90 p-1">
              <div className="rounded-xl overflow-hidden bg-black/90 backdrop-blur-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">Trusted at scale</h3>
                  <p className="text-white/60 mt-2">SkyShare powers secure, high-volume workflows for teams across industries. From creatives to engineering teams — share, collaborate, and track with confidence.</p>

                  <div className="mt-6 grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                      <div className="text-sm text-white/60">Monthly transfers</div>
                      <div className="text-xl font-semibold mt-1">{Math.floor(Math.random() * 200000 + 40000).toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                      <div className="text-sm text-white/60">Avg file size</div>
                      <div className="text-xl font-semibold mt-1">{(Math.random() * (400 - 10) + 10).toFixed(0)} MB</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/60 border border-white/6">
                      <div className="text-sm text-white/60">99.9% uptime</div>
                      <div className="text-xl font-semibold mt-1">Operational</div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-96 rounded-lg overflow-hidden border border-white/8">
                  <img src="/images/showcase.png" alt="showcase" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
