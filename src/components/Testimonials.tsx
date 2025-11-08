import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * Testimonials.tsx
 * - Black & White Earth widget (canvas) above
 * - Testimonials cards below (Apple-style)
 *
 * Requirements:
 *  - Tailwind CSS
 *  - framer-motion
 *
 * Usage:
 *  import Testimonials from "./Testimonials";
 *  <Testimonials />
 */

// Simple testimonial type
type Testimonial = {
  quote: string;
  author: string;
  title: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "SkyShare tightened our delivery pipeline — sharing large files is now effortless and trustworthy.",
    author: "Sara Johnson",
    title: "Product Manager — Nova Labs",
    initials: "SJ",
  },
  {
    quote:
      "A minimal, fast, and secure sharing experience. Saved our team hours every week.",
    author: "Michael Chen",
    title: "Head of Ops — DataFlow",
    initials: "MC",
  },
  {
    quote:
      "Design and reliability — both feel thoughtful. Our team adopted SkyShare in one week.",
    author: "Amira Patel",
    title: "Creative Lead — Orion",
    initials: "AP",
  },
];

// -------------------- Earth Widget (black & white) --------------------
const useEarthCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, size = 360) => {
  const rotRef = useRef({ x: 0.45, y: 0 }); // rotation in radians (x = tilt, y = yaw)
  const targetRef = useRef({ x: 0.45, y: 0 });
  const rafRef = useRef<number | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      const w = size;
      const h = size;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // draw function (black & white only)
    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2 - 8;

      // smoothly interpolate toward target
      rotRef.current.x += (targetRef.current.x - rotRef.current.x) * 0.08;
      rotRef.current.y += (targetRef.current.y - rotRef.current.y) * 0.08;

      ctx.clearRect(0, 0, w, h);

      // outer subtle vignette (BW)
      const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.4);
      grad.addColorStop(0, "rgba(255,255,255,0.02)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.75)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // globe base
      ctx.save();
      ctx.translate(cx, cy);

      // subtle dark disc
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.2, r * 0.1, 0, 0, r);
      g.addColorStop(0, "rgba(255,255,255,0.02)");
      g.addColorStop(0.6, "rgba(0,0,0,0.6)");
      g.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // subtle rim light (white thin)
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // meridians (fine white strokes, low alpha)
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "#ffffff";
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        const angle = (i / 18) * Math.PI * 2;
        ctx.ellipse(0, 0, r, r * 0.85, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // lighting: a faint gloss
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.01)";
      ctx.ellipse(-r * 0.45, -r * 0.5, r * 0.7, r * 0.34, -0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // draw a few "activity dots" purely in B/W to add life
      // compute rotated positions from a static list (lat/lon)
      const points = [
        { lat: 37.7, lon: -122.4 }, // SF
        { lat: 51.5, lon: -0.12 }, // London
        { lat: 24.86, lon: 67.01 }, // Karachi
        { lat: 28.6, lon: 77.2 }, // Delhi
        { lat: -23.55, lon: -46.63 }, // Sao Paulo
      ];

      const rotX = rotRef.current.x;
      const rotY = rotRef.current.y;

      // helper: degrees -> rad
      const deg = (d: number) => (d * Math.PI) / 180;
      const latLonToCartesian = (lat: number, lon: number) => {
        const phi = Math.PI / 2 - deg(lat);
        const theta = deg(lon);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        return { x, y, z };
      };
      const rotate = (p: { x: number; y: number; z: number }) => {
        // rotate X (pitch)
        let y = p.y * Math.cos(rotX) - p.z * Math.sin(rotX);
        let z = p.y * Math.sin(rotX) + p.z * Math.cos(rotX);
        let x = p.x;
        // rotate Y (yaw)
        const nx = x * Math.cos(rotY) + z * Math.sin(rotY);
        const nz = -x * Math.sin(rotY) + z * Math.cos(rotY);
        return { x: nx, y, z: nz };
      };

      ctx.save();
      ctx.translate(cx, cy);
      points.forEach((pt, i) => {
        const cart = latLonToCartesian(pt.lat, pt.lon);
        const rpos = rotate(cart);
        if (rpos.z <= -0.25) return; // back side
        const sx = rpos.x * r;
        const sy = -rpos.y * r * 0.85;
        const depth = (rpos.z + 1) / 2;
        const sizeDot = 2 + i % 3;
        // dot (white with subtle alpha depending on depth)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.9 * depth})`;
        ctx.arc(sx, sy, sizeDot, 0, Math.PI * 2);
        ctx.fill();

        // halo (very subtle)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.06 * depth})`;
        ctx.arc(sx, sy, sizeDot * 3.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    let last = performance.now();
    const autoSpeed = 0.18; // radians/sec
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;

      // if not dragging, slowly auto-rotate target yaw
      if (!dragging.current) {
        targetRef.current.y += autoSpeed * dt * 0.45;
      }
      // gently ease target into rotRef handled in draw
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // pointer events for drag and hover tilt
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      dragStart.current.x = e.clientX;
      dragStart.current.y = e.clientY;
      dragStart.current.startX = targetRef.current.x;
      dragStart.current.startY = targetRef.current.y;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const sens = 0.007; // sensitivity
      targetRef.current.y = dragStart.current.startY + dx * sens;
      targetRef.current.x = Math.max(-1.1, Math.min(1.5, dragStart.current.startX + dy * sens));
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try {
        canvas.releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    const onEnter = () => {
      // tilt a bit on hover (target)
      targetRef.current.x = rotRef.current.x - 0.08;
    };
    const onLeave = () => {
      // unwind tilt
      targetRef.current.x = 0.45;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);
    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, size]);
};

// -------------------- Main Component --------------------
const Testimonials: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEarthCanvas(canvasRef, 360);

  // simple stagger animations for cards
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };
  const card = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <section className="w-full bg-black text-white py-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold">Loved by teams worldwide</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            Minimal. Fast. Secure. Designed with focus — sharing large files feels effortless.
          </p>
        </div>

        {/* Earth (centered above testimonials) */}
        <div className="w-full flex justify-center">
          <div className="relative">
            <div
              className="rounded-full bg-gradient-to-b from-black to-[#050505] p-3"
              style={{ boxShadow: "0 30px 70px rgba(0,0,0,0.8)" }}
            >
              <canvas
                ref={canvasRef}
                className="rounded-full shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                width={360}
                height={360}
                style={{ width: 360, height: 360, display: "block", cursor: "grab" }}
              />
            </div>
            {/* small center badge (white dot) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/80 border border-white/8 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={card}
              className="bg-gradient-to-b from-[#070707]/80 to-[#000000]/90 border border-white/6 p-6 rounded-2xl shadow-lg hover:shadow-[0_30px_90px_rgba(0,0,0,0.85)] transition-transform transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center text-white font-semibold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.author}</div>
                  <div className="text-xs text-white/60">{t.title}</div>
                </div>
              </div>
              <p className="text-white/80 italic leading-relaxed">{`“${t.quote}”`}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* small CTA (optional) */}
        <div className="mt-4">
          <a
            href="#"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-black font-medium shadow hover:scale-[1.01] transition-transform"
          >
            Try SkyShare Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
