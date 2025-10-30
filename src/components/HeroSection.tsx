import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/* ================== Hero Section ================== */
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
    <section className="relative w-full min-h-screen px-6 md:px-12 flex items-center overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 light-box-grid opacity-20"></div>
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl bg-zinc-900"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl"></div>

      {/* Main Layout */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 my-[120px]">
        {/* Left Section */}
        <div className="space-y-6 md:space-y-8 px-4 md:px-0">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground font-heading font-bold leading-[1.1]"
          >
            Ultimate Transfer Globally
            <br />
            Secure. Fast. In Your Control
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"></span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground max-w-lg text-base md:text-lg font-body leading-relaxed"
          >
            Revolutionary file sharing platform that puts security, speed, and
            collaboration at the forefront of your workflow.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              variant="default"
              className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto icon-text"
              asChild
            >
              <a href="/auth" className="bg-slate-100 text-neutral-700">
                <span className="material-icons md-18">arrow_right</span>
                Get Started
              </a>
            </Button>

            <Button
              variant="outline"
              className="border-2 border-neutral-300 text-foreground hover:bg-neutral-100 hover:text-foreground dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-800 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold transition-all duration-300 w-full sm:w-auto icon-text"
              asChild
            >
              <a href="/auth" className="bg-white">
                <span className="material-icons md-24">dashboard</span>
                Go To Dashboard
              </a>
            </Button>

            <Button
              variant="ghost"
              className="relative overflow-hidden group w-full sm:w-auto h-14 md:h-16 px-8 rounded-xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-heading font-semibold text-base md:text-lg shadow-md hover:shadow-blue-500/30 transition-all duration-300"
              asChild
            >
              <a href="/code" className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-50"></div>
                </div>
                <span className="material-icons text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  upload
                </span>
                <span className="relative z-10 group-hover:text-blue-400 transition-colors duration-300">
                  Upload File
                </span>
              </a>
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
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
                className="flex items-center gap-2 border border-slate-700/40 rounded-xl px-3 py-2 bg-zinc-800 shadow-sm hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-600">
                  <span className="material-icons md-18 text-neutral-300">
                    {icon}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-300">
                  {text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Feature Card */}
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
          className="relative px-4 md:px-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="space-y-4">
            {/* Project Files Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="material-icons md-24 text-primary">
                      folder
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-heading font-semibold text-foreground">
                      Project Files
                    </h3>
                    <p className="text-xs md:text-sm font-body text-muted-foreground">
                      24 files • 2.3 GB
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card bg-rose-400"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card bg-blue-500"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-heading font-medium bg-zinc-800">
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
                    <span className="material-icons md-18 text-primary">
                      {icon}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secure Upload Card */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg translate-x-8 hover:translate-x-0 transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="material-icons md-18 text-accent">
                    security
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-heading font-medium text-foreground">
                    Secure Upload
                  </p>
                  <p className="text-xs font-body text-muted-foreground">
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
        className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent ${
          actualTheme === "light" ? "via-neutral-800" : "via-neutral-800"
        }`}
        style={{
          width: glowWidth,
          opacity: glowOpacity,
          boxShadow:
            "0 0 20px rgba(38, 38, 38, 0.8), 0 0 40px rgba(38, 38, 38, 0.4)",
        }}
      />
    </section>
  );
};

/* ================== Card Component ================== */
const Card = () => {
  return (
    <div className="flex justify-center items-center p-6">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[20px] shadow-lg overflow-hidden w-[330px] text-white transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1.5 hover:shadow-xl">
        <div className="flex flex-col items-start p-7">
          <div className="bg-green-500/15 rounded-full p-3.5 mb-3.5">
            <svg
              width={28}
              height={29}
              viewBox="0 0 28 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.7222 9.04435V6.71102C23.7222 5.42235 22.6775 4.37769 21.3888 4.37769L6.61106 4.37769C5.32239 4.37769 4.27773 5.42235 4.27773 6.71102V9.04435C4.27773 10.333 5.32239 11.3777 6.61106 11.3777H21.3888C22.6775 11.3777 23.7222 10.333 23.7222 9.04435Z"
                stroke="#23C55E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.7222 21.4888V19.1555C23.7222 17.8668 22.6775 16.8221 21.3888 16.8221H15.9444C14.6557 16.8221 13.6111 17.8668 13.6111 19.1555V21.4888C13.6111 22.7775 14.6557 23.8221 15.9444 23.8221H21.3888C22.6775 23.8221 23.7222 22.7775 23.7222 21.4888Z"
                stroke="#23C55E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-xl font-semibold text-green-500 my-3">
            Fast & Secure Sharing
          </div>

          <div className="text-[0.95rem] leading-relaxed opacity-85">
            Transfer large files instantly with AES-256 encryption and cloud
            backup protection.
          </div>

          <div className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-green-500 transition-all duration-300 hover:text-green-600 hover:translate-x-1 group">
            Learn More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 19"
              height={19}
              width={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                stroke="currentColor"
                fill="currentColor"
                d="M3 9.09985C3 9.23792 2.88807 9.34985 2.75 9.34985C2.61193 9.34985 2.5 9.23792 2.5 9.09985C2.5 8.96178 2.61193 8.84985 2.75 8.84985C2.88807 8.84985 3 8.96178 3 9.09985Z"
              />
              <path
                stroke="currentColor"
                fill="currentColor"
                d="M9.25 2.84985C9.25 2.98792 9.13807 3.09985 9 3.09985C8.86193 3.09985 8.75 2.98792 8.75 2.84985C8.75 2.71178 8.86193 2.59985 9 2.59985C9.13807 2.59985 9.25 2.71178 9.25 2.84985Z"
              />
              <path
                strokeLinejoin="round"
                stroke="currentColor"
                fill="currentColor"
                d="M5.5 9.09985H14.5L10.5 5.09985L11.5 4.09985L17 9.59985L11.5 15.0999L10.5 14.0999L14.5 10.0999H5.5V9.09985Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
