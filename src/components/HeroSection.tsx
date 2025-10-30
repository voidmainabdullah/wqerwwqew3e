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
    <StyledWrapper>
      <div className="outer">
        <div className="dot" />
        <div className="card">
          <div className="ray" />
          <div className="text">750k</div>
          <div>Views</div>
          <div className="line topl" />
          <div className="line leftl" />
          <div className="line bottoml" />
          <div className="line rightl" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .outer {
    width: 300px;
    height: 250px;
    border-radius: 10px;
    padding: 1px;
    background: radial-gradient(circle 230px at 0% 0%, #ffffff, #0c0d0d);
    position: relative;
  }

  .dot {
    width: 5px;
    aspect-ratio: 1;
    position: absolute;
    background-color: #fff;
    box-shadow: 0 0 10px #ffffff;
    border-radius: 100px;
    z-index: 2;
    right: 10%;
    top: 10%;
    animation: moveDot 6s linear infinite;
  }

  @keyframes moveDot {
    0%,
    100% {
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

  .card {
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 9px;
    border: solid 1px #202222;
    background-size: 20px 20px;
    background: radial-gradient(circle 280px at 0% 0%, #444444, #0c0d0d);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-direction: column;
    color: #fff;
  }
  .ray {
    width: 220px;
    height: 45px;
    border-radius: 100px;
    position: absolute;
    background-color: #c7c7c7;
    opacity: 0.4;
    box-shadow: 0 0 50px #fff;
    filter: blur(10px);
    transform-origin: 10%;
    top: 0%;
    left: 0;
    transform: rotate(40deg);
  }

  .card .text {
    font-weight: bolder;
    font-size: 4rem;
    background: linear-gradient(45deg, #000000 4%, #fff, #000);
    background-clip: text;
    color: transparent;
  }

  .line {
    width: 100%;
    height: 1px;
    position: absolute;
    background-color: #2c2c2c;
  }
  .topl {
    top: 10%;
    background: linear-gradient(90deg, #888888 30%, #1d1f1f 70%);
  }
  .bottoml {
    bottom: 10%;
  }
  .leftl {
    left: 10%;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, #747474 30%, #222424 70%);
  }
  .rightl {
    right: 10%;
    width: 1px;
    height: 100%;
  }`;

export default HeroSection;
