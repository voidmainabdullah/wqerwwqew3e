import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

/* ================= NAVBAR ================= */
const Navbar = () => (
  <header className="fixed top-0 w-full z-40 backdrop-blur-xl bg-black/40 border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-white font-semibold text-xl tracking-tight">
        Skie<span className="text-neutral-400">Share</span>
      </h1>
      <nav className="hidden sm:flex gap-6 text-sm text-neutral-300">
        {["Features", "Security", "Pricing", "About"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="hover:text-white transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>
      <Button
        variant="outline"
        className="text-white border-white/30 hover:bg-white/10"
        asChild
      >
        <a href="/auth">Sign In</a>
      </Button>
    </div>
  </header>
);

/* ================= HERO SECTION (yours, adjusted) ================= */
const HeroSection = () => {
  const { actualTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const glowWidth = useTransform(scrollY, [0, 300], ["0%", "100%"]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0, 1]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 sm:px-10 md:px-16 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center z-10 py-24 sm:py-28 md:py-32">
        {/* LEFT SECTION */}
        <div className="space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight"
          >
            Seamless, Secure <br />
            <span className="text-neutral-400">File Sharing</span> for the Future.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-neutral-400 max-w-lg text-lg leading-relaxed"
          >
            SkieShare empowers teams and creators to share, manage, and track files
            effortlessly — built for privacy, precision, and performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Button
              className="bg-white text-black h-12 sm:h-14 px-8 rounded-xl font-semibold hover:bg-neutral-200 transition-all"
              asChild
            >
              <a href="/auth">Get Started</a>
            </Button>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 h-12 sm:h-14 px-8 rounded-xl font-semibold"
              asChild
            >
              <a href="/auth">Dashboard</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center gap-4 pt-6"
          >
            {[
              ["lock", "256-Bit Encryption"],
              ["upload", "Unlimited Transfers"],
              ["bolt", "Fast CDN Delivery"],
              ["insights", "Smart Analytics"],
            ].map(([icon, text], i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-300"
              >
                <span className="material-icons text-white/70">{icon}</span>
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
            <h3 className="text-lg font-semibold text-white mb-3">
              Recent Uploads
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {["image", "description", "video_file"].map((icon, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <span className="material-icons text-white/70">{icon}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ width: glowWidth, opacity: glowOpacity }}
      />
    </section>
  );
};

/* ================= FEATURES GRID ================= */
const FeaturesGrid = () => {
  const features = [
    {
      icon: "cloud_done",
      title: "Reliable Cloud",
      desc: "Your files, always available — powered by redundant global edge storage.",
    },
    {
      icon: "lock",
      title: "Privacy First",
      desc: "Every transfer is AES-256 encrypted and protected by zero-knowledge policy.",
    },
    {
      icon: "bolt",
      title: "Ultra-Fast Transfers",
      desc: "Accelerated multi-thread uploads and instant link generation.",
    },
    {
      icon: "analytics",
      title: "Insightful Analytics",
      desc: "Track who views, downloads, and interacts with your shared links.",
    },
  ];
  return (
    <section id="features" className="py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
          >
            <span className="material-icons text-3xl text-white/80 mb-4 block">
              {f.icon}
            </span>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-neutral-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ================= SECURITY STRIP ================= */
const SecurityStrip = () => (
  <div className="py-12 bg-white/5 border-y border-white/10 text-center text-neutral-300 text-sm">
    Protected by military-grade encryption • GDPR & SOC2 compliant • ISO/IEC 27001 certified
  </div>
);

/* ================= TESTIMONIALS ================= */
const Testimonials = () => {
  const reviews = [
    {
      name: "Ayan M.",
      role: "Content Creator",
      text: "SkieShare feels like the Apple of file sharing — smooth, minimalist, and powerful.",
    },
    {
      name: "Nadia R.",
      role: "Product Manager",
      text: "Our team now shares securely with clients in seconds — the UI is flawless.",
    },
    {
      name: "Zohaib I.",
      role: "Photographer",
      text: "Uploading 4K videos is seamless. Nothing else compares in elegance.",
    },
  ];

  return (
    <section id="reviews" className="py-32 bg-black text-white">
      <h2 className="text-center text-3xl font-semibold mb-16">
        Loved by professionals worldwide 🌍
      </h2>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            <p className="text-neutral-300 text-sm mb-4 italic">“{r.text}”</p>
            <div className="text-white font-semibold">{r.name}</div>
            <div className="text-neutral-400 text-xs">{r.role}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ================= PRICING PREVIEW ================= */
const PricingPreview = () => (
  <section id="pricing" className="py-32 bg-white text-black">
    <div className="max-w-6xl mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
      <p className="text-neutral-600 mb-12">
        Start for free, scale as you grow — no hidden fees.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: "Free", price: "$0", desc: "5 GB uploads, 7-day links" },
          { name: "Pro", price: "$9/mo", desc: "100 GB, analytics, branding" },
          { name: "Enterprise", price: "Custom", desc: "Unlimited storage, SLA" },
        ].map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 border border-black/10 rounded-2xl shadow-md hover:shadow-xl transition-all"
          >
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <div className="text-4xl font-bold mt-3">{plan.price}</div>
            <p className="text-neutral-600 text-sm mt-2">{plan.desc}</p>
            <Button className="mt-6 w-full bg-black text-white hover:bg-neutral-800 rounded-xl">
              Choose Plan
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ================= CTA ================= */
const CTASection = () => (
  <section className="py-32 bg-black text-white text-center">
    <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
      Ready to elevate your sharing experience?
    </h2>
    <p className="text-neutral-400 max-w-xl mx-auto mb-8">
      Join thousands of teams using SkieShare for effortless, private, and professional file delivery.
    </p>
    <Button className="bg-white text-black px-8 py-6 rounded-xl font-semibold hover:bg-neutral-200 transition-all">
      Start Free Today
    </Button>
  </section>
);

/* ================= MAIN EXPORT ================= */
export default function SkieShareLanding() {
  return (
    <main className="font-sans bg-black text-white">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <SecurityStrip />
      <Testimonials />
      <PricingPreview />
      <CTASection />
      <footer className="py-8 text-center text-sm text-neutral-500 border-t border-white/10">
        © {new Date().getFullYear()} SkieShare. All rights reserved.
      </footer>
    </main>
  );
}
