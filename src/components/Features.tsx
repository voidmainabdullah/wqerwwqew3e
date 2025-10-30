import React from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Shield, Users, Share2, Zap, Lock, Cloud } from "lucide-react";

const features = [
  {
    icon: <Shield size={26} />,
    title: "End-to-End Encryption",
    desc: "Your data stays yours — encrypted in transit and at rest with zero-trust architecture, ensuring unmatched privacy and control.",
  },
  {
    icon: <Users size={26} />,
    title: "Collaborate in Real Time",
    desc: "Work with teams seamlessly. Share instantly, edit together, and manage permissions — all in one modern workspace.",
  },
  {
    icon: <Cloud size={26} />,
    title: "Smart Cloud Sync",
    desc: "Your files stay updated everywhere. No sync errors, no outdated versions — just effortless continuity across all your devices.",
  },
  {
    icon: <Lock size={26} />,
    title: "Advanced Access Control",
    desc: "Define who sees what. Manage visibility, expiration, and access levels with precision — from your dashboard.",
  },
  {
    icon: <Share2 size={26} />,
    title: "Secure Sharing Links",
    desc: "Instantly create time-limited, password-protected links. Share confidently with clients, partners, and teams.",
  },
  {
    icon: <Zap size={26} />,
    title: "Fast by Design",
    desc: "Powered by global CDN and compression intelligence — uploads and downloads feel instantaneous anywhere on the planet.",
  },
];

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" },
    }),
  };

  return (
    <section
      ref={ref}
      className="relative w-full py-24 md:py-36 bg-black text-white overflow-hidden"
    >
      {/* Soft gradient glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-black opacity-80 pointer-events-none" />
      <div className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[180px] opacity-20" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[150px] opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center relative z-10 px-6"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent">
          Powering the Future of File Sharing
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          SkyShare brings elegance, security, and speed together — redefining how modern teams share, collaborate, and protect their files.
        </p>
      </motion.div>

      {/* Image Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 md:px-12 mt-16 relative z-10"
      >
        <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
          <img
            src="/showcase2.png"
            alt="SkyShare feature showcase"
            className="w-full h-[280px] sm:h-[420px] md:h-[500px] object-cover object-center"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-6xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6 md:px-12">
        {features.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            animate={controls}
            custom={i}
            className="group p-6 rounded-2xl bg-gradient-to-br from-[#0f0f0f] to-[#111111] border border-gray-800/60 hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(37,99,235,0.4)]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-5 group-hover:bg-blue-500/20 transition-all duration-500">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-white transition-all">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
