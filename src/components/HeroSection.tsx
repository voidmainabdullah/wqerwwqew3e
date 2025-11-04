import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/* ================== Apple Black & White Theme Hero Section ================== */
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
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 sm:px-10 md:px-16 overflow-hidden bg-gradient-to-b from-[#0b0b0b] via-[#111] to-[#1a1a1a] text-white transition-all duration-700">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-32 right-20 w-96 h-96 bg-white/10 rounded-full blur-[180px]"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-[160px]"></div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center z-10 py-24 sm:py-28 md:py-32">
        {/* Left Section */}
        <div className="space-y-6 sm:space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white"
          >
            Effortless. Secure.{" "}
            <span className="bg-gradient-to-r from-white via-gray-400 to-white bg-clip-text text-transparent">
              File Sharing
            </span>
            <br /> that Scales with You.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-400 max-w-lg text-base sm:text-lg leading-relaxed"
          >
            Experience next-level file sharing — built for speed, privacy, and simplicity.
            Inspired by Apple’s dark minimal design philosophy.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Button
              variant="default"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
              asChild
            >
              <a href="/auth" className="flex items-center gap-2">
                <span className="material-icons">arrow_forward</span>
                Get Started
              </a>
            </Button>

            <Button
              variant="outline"
              className="border-2 border-gray-700 text-white hover:bg-[#1c1c1c] transition-all h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl font-semibold w-full sm:w-auto"
              asChild
            >
              <a href="/auth" className="flex items-center gap-2">
                <span className="material-icons">dashboard</span>
                Dashboard
              </a>
            </Button>

            <Button
              variant="ghost"
              className="relative group overflow-hidden h-12 sm:h-14 px-8 rounded-xl border border-gray-600 bg-gradient-to-br from-black via-[#0f0f0f] to-[#1b1b1b] text-white font-semibold shadow-md hover:shadow-gray-400/30 w-full sm:w-auto transition-all"
              asChild
            >
              <a href="/code" className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping opacity-50"></div>
                </div>
                <span className="material-icons text-white group-hover:scale-110 transition-transform">
                  upload
                </span>
                <span className="group-hover:text-gray-200 transition-colors">
                  Upload File
                </span>
              </a>
            </Button>
          </motion.div>

          {/* Floating Stats Card */}
          <motion.div
            className="pt-10 flex justify-center sm:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card />
          </motion.div>
        </div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative -translate-y-3 space-y-5"
        >
          {/* Project Files Card */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-all duration-500 mx-[55px] my-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <span className="material-icons text-white">folder</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Project Files</h3>
                  <p className="text-xs text-gray-400">24 files • 2.3 GB</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-gradient-to-br from-gray-200 to-gray-400"></div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-gradient-to-br from-gray-500 to-gray-700"></div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-zinc-900 flex items-center justify-center text-xs font-semibold text-white">
                  +3
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["description", "image", "video_file"].map((icon, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-white/5 border border-[#2a2a2a] flex items-center justify-center hover:scale-105 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="material-icons text-white/80">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Upload Card */}
          <div className="bg-gradient-to-b from-[#111] to-[#0b0b0b] border border-[#2a2a2a] rounded-2xl p-5 shadow-[0_6px_25px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-all duration-500 mx-[65px] mt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
                <span className="material-icons text-white">security</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Secure Upload</p>
                <p className="text-xs text-gray-400">End-to-end encrypted</p>
              </div>
              <div className="w-14 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-10 h-full bg-white rounded-full transition-all duration-700"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Glow line at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{
          width: glowWidth,
          opacity: glowOpacity,
          boxShadow: "0 0 25px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)",
        }}
      />
    </section>
  );
};

/* Floating Stats Card */
const Card = () => (
  <div className="relative w-[300px] sm:w-[320px] h-[250px] rounded-xl p-[1px] bg-gradient-radial from-gray-100 via-gray-800 to-black overflow-hidden">
    <div className="absolute w-[6px] aspect-square bg-white rounded-full shadow-[0_0_12px_#ffffff] animate-[moveDot_6s_linear_infinite]"></div>
    <div className="relative w-full h-full flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-gradient-radial from-gray-700 to-black text-white overflow-hidden">
      <div className="absolute w-[200px] h-[40px] bg-white opacity-20 rounded-full blur-md rotate-[35deg] top-0 left-0"></div>
      <div className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
        1.2M+
      </div>
      <div className="text-sm sm:text-base">Files Shared</div>
    </div>

    <style>{`
      @keyframes moveDot {
        0%, 100% { top: 10%; right: 10%; }
        25% { top: 10%; right: calc(100% - 35px); }
        50% { top: calc(100% - 30px); right: calc(100% - 35px); }
        75% { top: calc(100% - 30px); right: 10%; }
      }
    `}</style>
  </div>
);

export default HeroSection;
