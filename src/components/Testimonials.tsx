import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Star,
  Globe,
  Users,
  Shield,
  Send,
  MapPin,
  Activity,
  CheckCircle,
} from "lucide-react";

/**
 * Testimonials.tsx
 * Ultra cinematic "Trusted by leading teams across the globe"
 * - black soft theme with emerald neon accent
 * - glowing grid + particle trust network background
 * - 6 animated testimonial cards, parallax image
 *
 * Requirements:
 * - framer-motion
 * - react-intersection-observer
 * - lucide-react
 * - Tailwind CSS
 */

/* ---------------------------
   Theme helpers
   --------------------------- */
const EMERALD = "from-green-400 to-emerald-400";
const SOFT_BG = "bg-gradient-to-b from-[#030303] via-[#070707] to-[#0b0b0b]";
const CARD = "bg-[#0b0b0b] border border-[#151515]";
const NEON = "shadow-[0_0_30px_rgba(16,185,129,0.12)]";

/* ---------------------------
   Testimonial data (6)
   --------------------------- */
const TESTIMONIALS = [
  {
    quote:
      "Our team collaboration improved by 300% after switching to this platform. File sharing is seamless and secure.",
    author: "Sarah Johnson",
    position: "Product Manager at TechCorp",
    avatar: "/avatar-1.png",
    location: "San Francisco, CA",
  },
  {
    quote:
      "The security features give us peace of mind when sharing sensitive documents. It's enterprise-grade protection made simple.",
    author: "Michael Chen",
    position: "Head of Security at DataFlow",
    avatar: "/avatar-2.png",
    location: "London, UK",
  },
  {
    quote:
      "We've cut our file management overhead by 60%. The AI organization is incredibly intuitive and powerful.",
    author: "Leila Rodriguez",
    position: "Operations Director at CreativeStudio",
    avatar: "/avatar-3.png",
    location: "Madrid, ES",
  },
  {
    quote:
      "Integration was effortless — the SDK and API allowed us to plug into our existing platform quickly, with enterprise controls.",
    author: "Aamir Khan",
    position: "CTO at FinEdge",
    avatar: "/avatar-4.png",
    location: "Karachi, PK",
  },
  {
    quote:
      "The live monitoring and analytics helped us proactively catch transfer anomalies. Our SLAs improved dramatically.",
    author: "Nora Svensson",
    position: "DevOps Lead at CloudWorks",
    avatar: "/avatar-5.png",
    location: "Stockholm, SE",
  },
  {
    quote:
      "Our marketing and design teams now share assets without bottlenecks. Versioning and previews are game changers.",
    author: "Diego Alvarez",
    position: "Head of Design at PixelForge",
    avatar: "/avatar-6.png",
    location: "Mexico City, MX",
  },
];

/* ---------------------------
   Motion variants
   --------------------------- */
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  hover: { scale: 1.02, y: -6 },
};

/* ---------------------------
   Small components
   --------------------------- */
const Badge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 bg-white/6 px-3 py-1 rounded-full text-xs font-medium text-gray-200 border border-white/6">
    <Star className="w-3 h-3 text-amber-400" />
    {children}
  </div>
);

const RatingStars = ({ size = 16 }: { size?: number }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 text-amber-400 mr-0.5" />
    ))}
  </div>
);

/* ---------------------------
   Dynamic network background
   --------------------------- */
const NetworkBackground: React.FC = () => {
  // Create a grid of nodes and connect some with animated lines
  const nodes = [
    { x: 8, y: 20 },
    { x: 22, y: 12 },
    { x: 38, y: 24 },
    { x: 55, y: 10 },
    { x: 70, y: 26 },
    { x: 84, y: 18 },
    { x: 18, y: 40 },
    { x: 46, y: 44 },
    { x: 72, y: 42 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nodeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* lines */}
        {nodes.map((a, i) =>
          nodes.slice(i + 1, i + 4).map((b, j) => {
            const key = `ln-${i}-${j}`;
            return (
              <motion.line
                key={key}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="url(#nodeGrad)"
                strokeWidth={0.8}
                initial={{ opacity: 0.06 }}
                animate={{ opacity: [0.06, 0.35, 0.06] }}
                transition={{ duration: 6 + (i + j) * 0.6, repeat: Infinity, ease: "easeInOut" }}
              />
            );
          })
        )}

        {/* nodes */}
        {nodes.map((n, i) => (
          <motion.circle
            key={`nd-${i}`}
            cx={`${n.x}%`}
            cy={`${n.y}%`}
            r={3.6}
            fill="url(#nodeGrad)"
            style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.14))" }}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
};

/* ---------------------------
   Testimonial Card (big, cinematic)
   --------------------------- */
const TestimonialCard: React.FC<{
  testimonial: typeof TESTIMONIALS[number];
  index: number;
  inView: boolean;
}> = ({ testimonial, index, inView }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("show");
    }
  }, [controls, inView]);

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      whileHover="hover"
      className={`${CARD} rounded-2xl p-6 hover:shadow-[0_18px_60px_rgba(16,185,129,0.06)] transition-all`}
      style={{ transformOrigin: "center" }}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-full overflow-hidden border border-white/6 bg-[#070707] flex items-center justify-center"
            aria-hidden
          >
            {/* avatar image if exists else initial */}
            {testimonial.avatar ? (
              <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" />
            ) : (
              <div className="text-sm font-semibold text-white">{testimonial.author.split(" ")[0][0]}</div>
            )}
          </div>

          {/* floating mini badge */}
          <motion.div
            initial={{ scale: 0.8, y: -6, opacity: 0 }}
            animate={{ scale: [1, 0.98, 1], y: [-6, -10, -6], opacity: [0, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
            className="absolute -right-2 -top-2 bg-gradient-to-br from-green-400 to-emerald-400 p-1 rounded-full shadow-lg"
            aria-hidden
            title={testimonial.position}
          >
            <CheckCircle className="w-3 h-3 text-black" />
          </motion.div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">{testimonial.author}</h4>
              <div className="text-xs text-gray-400">{testimonial.position}</div>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-green-300" />
              {testimonial.location}
            </div>
          </div>

          <div className="mt-4">
            <blockquote className="text-gray-200 text-lg italic leading-relaxed">“{testimonial.quote}”</blockquote>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RatingStars />
              <div className="text-xs text-gray-400">Enterprise</div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-white/6 to-white/4 border border-white/8 text-sm text-gray-200"
            >
              <Send className="w-4 h-4 text-green-300" />
              Refer a team
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/* ---------------------------
   Showcase Image with parallax
   --------------------------- */
const ShowcaseImage: React.FC<{ src?: string }> = ({ src = "/showcase.png" }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // small tilt
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
      setPos({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl overflow-hidden border border-[#1a1a1a] bg-black/20 backdrop-blur-md"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <img src={src} alt="Trusted showcase" className="w-full h-auto object-cover md:h-[420px] sm:h-[320px] h-[220px]" />
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-md bg-white/6 border border-white/6 text-xs text-gray-200">LIVE</div>
          <div className="text-xs text-gray-400">Preview</div>
        </div>
        <div className="text-xs text-gray-400">Updated: <strong className="text-white">Oct 2025</strong></div>
      </div>
    </div>
  );
};

/* ---------------------------
   Main export component
   --------------------------- */
const Testimonials: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.18, triggerOnce: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("show");
  }, [controls, inView]);

  return (
    <section ref={ref} className={`${SOFT_BG} relative py-20 overflow-hidden`} aria-labelledby="trusted-heading">
      {/* background network + grid */}
      <NetworkBackground />
      <div className="pointer-events-none absolute inset-0 -z-20">
        {/* subtle vertical gradient glow */}
        <div className="absolute left-0 top-0 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-[#042f1a] to-transparent opacity-30 blur-3xl" />
        <div className="absolute right-0 bottom-0 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#053227] to-transparent opacity-24 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 id="trusted-heading" className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Trusted by leading teams across the globe
          </h2>
          <p className="mt-3 text-gray-300">
            Industry leaders rely on our secure, fast, and scalable file platform — built for collaboration, compliance,
            and scale.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Badge>Enterprise grade</Badge>
            <div className="px-3 py-1 rounded-full bg-white/6 border border-white/6 text-sm text-gray-200">Global SLA</div>
            <div className="px-3 py-1 rounded-full bg-white/6 border border-white/6 text-sm text-gray-200">MFA</div>
          </div>
        </motion.div>

        {/* main grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* left — testimonials */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.slice(0, 4).map((t, i) => (
                <TestimonialCard key={i} testimonial={t} index={i} inView={inView} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.slice(4, 6).map((t, i) => (
                <TestimonialCard key={`b-${i}`} testimonial={t} index={i + 4} inView={inView} />
              ))}
            </div>

            {/* logos row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 rounded-xl p-4 bg-[#070707] border border-[#151515] flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-6 flex-wrap">
                {/* sample logos (replace with svg or img) */}
                <div className="text-gray-400 text-xs flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-300" />
                  <span>2000+ teams</span>
                </div>
                <div className="text-gray-400 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-300" />
                  <span>Enterprise security</span>
                </div>
                <div className="text-gray-400 text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-300" />
                  <span>Global coverage</span>
                </div>
                <div className="text-gray-400 text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-300" />
                  <span>Real-time analytics</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">Trusted across sectors</div>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-black text-sm font-semibold">Request demo</div>
              </div>
            </motion.div>
          </motion.div>

          {/* right — showcase / CTA */}
          <motion.aside
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            <ShowcaseImage src="/showcase.png" />

            <div className={`${CARD} rounded-2xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Performance snapshot</div>
                  <div className="text-lg font-semibold text-white">Enterprise cluster A</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400">SLA</div>
                  <div className="px-2 py-1 rounded-full bg-white/6 text-xs text-gray-200">99.9%</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Avg throughput</div>
                  <div className="text-sm font-semibold text-white">85 MB/s</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Active DCs</div>
                  <div className="text-sm font-semibold text-white">52</div>
                </div>

                <div className="col-span-2 mt-2">
                  <div className="text-xs text-gray-400 mb-2">Live packet stream</div>
                  <div className="w-full rounded-full bg-[#0b0b0b] h-3 relative overflow-hidden border border-[#141414]">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400"
                      style={{ opacity: 0.18 }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-400">Ready to scale with your enterprise?</div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-white/6 to-white/4 border border-white/8 text-sm text-gray-200">
                    Contact Sales
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-black font-semibold">
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* small trust badges */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-xs text-gray-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                SOC 2 Compliant
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-xs text-gray-200 flex items-center gap-2">
                <Server className="w-4 h-4 text-green-300" />
                Multi-region
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-xs text-gray-200 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-300" />
                99.9% SLA
              </div>
            </div>
          </motion.aside>
        </div>

        {/* CTA cinematic footer */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.18 }}
          className="mt-12 rounded-3xl p-8 bg-gradient-to-b from-[#070707] to-[#040404] border border-[#161616] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="text-xl font-bold text-white">Ready to scale collaboration?</div>
            <div className="text-gray-300 mt-1">Join thousands of teams using SkieShare for secure file transfers.</div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-3 rounded-lg bg-transparent border border-white/8 text-sm text-gray-200">
              Contact Sales
            </button>
            <button className="px-5 py-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-black font-semibold">
              Start Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
