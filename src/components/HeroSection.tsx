import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/* ================== Upgraded Hero Section ================== */
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
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 sm:px-10 md:px-16 overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 light-box-grid opacity-[0.15] pointer-events-none"></div>
      <div className="absolute top-32 right-20 w-96 h-96 bg-zinc-900 rounded-full blur-[160px] opacity-40"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-[120px]"></div>

      {/* Content Wrapper */}
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center z-10 py-24 sm:py-28 md:py-32">
        {/* Left Section */}
        <div className="space-y-6 sm:space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-foreground tracking-tight"
          >
            Effortless. Secure.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              File Sharing
            </span>
            <br /> that Scales with You.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground max-w-lg text-base sm:text-lg leading-relaxed font-body"
          >
            Experience the next generation of file sharing. Built for teams,
            creators, and professionals who value privacy, control, and speed —
            all in one sleek platform.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Button
              variant="default"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-zinc-600 text-neutral-800 w-full sm:w-auto"
              asChild 
            >
              <a href="/auth" className="flex items-center gap-2">
                <span className="material-icons">arrow_forward</span>
                Get Started
              </a>
            </Button>

            <Button
              variant="outline"
              className="border-2 border-neutral-300 dark:border-neutral-700 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl font-semibold w-full sm:w-auto"
              asChild
            >
              <a href="/auth" className="flex items-center gap-2">
                <span className="material-icons">dashboard</span>
                Go to Dashboard 
              </a>  
            </Button>

            <Button
              variant="ghost"
              className="relative group overflow-hidden h-12 sm:h-14 px-8 rounded-xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-semibold shadow-md hover:shadow-blue-500/30 w-full sm:w-auto transition-all"
              asChild
            >
              <a href="/code" className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-50"></div>
                </div>
                <span className="material-icons text-blue-400 group-hover:scale-110 transition-transform">
                  upload
                </span>
                <span className="group-hover:text-blue-400 transition-colors">
                  Share Fast
                </span>
              </a>
            </Button>
          </motion.div>

          {/* Features Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center gap-3 sm:gap-5 pt-6"
          >
            {[
              ["lock", "256-Bit Encryption"],
              ["cloud_upload", "Unlimited Cloud Storage"],
              ["admin_panel_settings", "Smart Access Control"],
              ["analytics", "File Insights & Analytics"],
              ["speed", "Lightning-Fast Uploads"],
            ].map(([icon, text], i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-slate-700/40 bg-zinc-800/70 rounded-xl px-3 py-2 text-slate-300 shadow-sm hover:shadow-md hover:bg-zinc-700/60 transition-all duration-200"
              >
                <span className="material-icons md-18 text-neutral-300">
                  {icon}
                </span>
                <span className="text-xs sm:text-sm font-medium">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Statistic Card */}
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
          className="relative"
        >
          <div className="space-y-5">
            {/* Project Files Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-400">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="material-icons text-primary">folder</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Project Files
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      24 files • 2.3 GB
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-card bg-rose-400"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-card bg-blue-500"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-card bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                    +3
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["description", "image", "video_file"].map((icon, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <span className="material-icons text-primary">{icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secure Upload Mini Card */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg translate-x-4 hover:translate-x-0 transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="material-icons text-accent">security</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Secure Upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    End-to-end encrypted
                  </p>
                </div>
                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-8 h-full bg-accent rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Glow Line */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
        style={{
          width: glowWidth,
          opacity: glowOpacity,
          boxShadow:
            "0 0 25px rgba(38,38,38,0.8), 0 0 40px rgba(38,38,38,0.4)",
        }}
      />
    </section>
  );
};

/* ================== Floating Stats Card ================== */
const Card = () => {
  return (
    <div className="relative w-[300px] sm:w-[320px] h-[250px] rounded-xl p-[1px] bg-gradient-radial from-gray-100 via-gray-800 to-black overflow-hidden">
      <div className="absolute w-[6px] aspect-square bg-white rounded-full shadow-[0_0_12px_#ffffff] animate-[moveDot_6s_linear_infinite]"></div>

      <div className="relative w-full h-full flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-gradient-radial from-gray-600 to-black text-white overflow-hidden">
        <div className="absolute w-[200px] h-[40px] bg-gray-200 opacity-40 rounded-full blur-md rotate-[35deg] top-0 left-0"></div>
        <div className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
          1.2M+
        </div>
        <div className="text-sm sm:text-base">Files Shared</div>

        {/* Subtle Grid Lines */}
        <div className="absolute top-[10%] left-0 w-full h-[1px] bg-gradient-to-r from-gray-400 to-gray-800"></div>
        <div className="absolute bottom-[10%] left-0 w-full h-[1px] bg-gray-700"></div>
        <div className="absolute left-[10%] top-0 h-full w-[1px] bg-gradient-to-b from-gray-500 to-gray-800"></div>
        <div className="absolute right-[10%] top-0 h-full w-[1px] bg-gray-800"></div>
      </div>

      <style>{`
        @keyframes moveDot {
          0%, 100% {
            top: 10%;
            right: 10%;
          }
          25% {
            top: 10%;
            right: calc(100% - 35px);
          }
          50% {
            top: calc(100% - 30px);
            right: calc(100% - 35px);
          }
          75% {
            top: calc(100% - 30px);
            right: 10%;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
 