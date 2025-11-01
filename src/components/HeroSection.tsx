import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/* ================== Loader (3D Sphere) ================== */
const Loader = () => (
  <StyledWrapper>
    <div className="sphere">
      {[...Array(36)].map((_, i) => (
        <div key={`m${i}`} className="meridian" />
      ))}
      {[...Array(12)].map((_, i) => (
        <div key={`l${i}`} className="latitude" />
      ))}
      <div className="axis" />
      <div className="axis" />
    </div>
  </StyledWrapper>
);

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .sphere {
    width: 280px;
    height: 280px;
    position: relative;
    transform-style: preserve-3d;
    animation: rotate 12s linear infinite;
    filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.3));
  }

  .sphere .meridian,
  .sphere .latitude {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0, 180, 255, 0.15);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 180, 255, 0.15);
    transition: border 0.3s ease;
  }

  .sphere .meridian {
    transform: rotateY(calc(var(--i, 0) * 10deg));
  }

  .sphere .latitude {
    transform: rotateX(calc(var(--i, 0) * 15deg));
  }

  @keyframes rotate {
    0% {
      transform: rotateX(30deg) rotateY(0deg);
    }
    100% {
      transform: rotateX(30deg) rotateY(360deg);
    }
  }

  @media (max-width: 768px) {
    .sphere {
      width: 200px;
      height: 200px;
    }
  }
`;

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
      <div className="absolute top-32 right-20 w-96 h-96 bg-blue-900/20 rounded-full blur-[160px] opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px]"></div>

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
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
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

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Button className="h-12 sm:h-14 px-8 rounded-xl bg-blue-600 text-white shadow-lg hover:shadow-blue-400/50">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="h-12 sm:h-14 px-8 rounded-xl border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              Go to Dashboard
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center gap-3 sm:gap-5 pt-6"
          >
            {[
              ["lock", "256-Bit Encryption"],
              ["cloud_upload", "Unlimited Storage"],
              ["admin_panel_settings", "Smart Access"],
              ["analytics", "Detailed Analytics"],
              ["speed", "Ultra-Fast Uploads"],
            ].map(([icon, text], i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/5 rounded-xl px-3 py-2 text-blue-200 hover:bg-blue-500/10 transition-all duration-200"
              >
                <span className="material-icons text-blue-400">{icon}</span>
                <span className="text-xs sm:text-sm font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Section (with 3D Sphere) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex justify-center items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent blur-[80px]" />
          <Loader />
        </motion.div>
      </div>

      {/* Bottom Glow Line */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
        style={{
          width: glowWidth,
          opacity: glowOpacity,
          boxShadow: "0 0 35px rgba(0,150,255,0.4)",
        }}
      />
    </section>
  );
};

export default HeroSection;
