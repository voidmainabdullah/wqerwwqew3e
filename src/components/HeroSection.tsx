import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const HeroSection = () => {
const { actualTheme } = useTheme();
const [isVisible, setIsVisible] = useState(false);
const { scrollY } = useScroll();

// Transform scroll position to glow line width and opacity
const glowWidth = useTransform(scrollY, [0, 300], ["0%", "100%"]);
const glowOpacity = useTransform(scrollY, [0, 300], [0, 1]);

useEffect(() => {
const timer = setTimeout(() => setIsVisible(true), 300);
return () => clearTimeout(timer);
}, []);

return ( <section className="relative w-full min-h-screen px-6 md:px-12 flex items-center overflow-hidden bg-background">
{/* Background patterns */} <div className="absolute inset-0 light-box-grid opacity-20"></div> <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl bg-stone-800"></div> <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl"></div>

```
  <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 mx-0 my-[120px]">
    
    {/* Left Column */}
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.1] xl:text-6xl font-heading font-bold"
        >
          Ultimate Transfer Globally <br />
          Secure. Fast. In Your Control
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-muted-foreground max-w-lg leading-relaxed text-base md:text-lg font-body"
        >
          Revolutionary file sharing platform that puts security, speed, and collaboration at the forefront of your workflow.
        </motion.p>
      </div>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Button asChild variant="default" className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
          <a href="/auth" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
            Get Started
          </a>
        </Button>

        <Button asChild variant="outline" className="border-2 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold transition-all duration-300 w-full sm:w-auto hover:scale-105">
          <a href="/dashboard">Go To Dashboard</a>
        </Button>
      </motion.div>

      {/* Anonymous Share */}
      <motion.div
        className="flex justify-center pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Button asChild variant="ghost" className="anonymous-share-btn relative overflow-hidden group border-2 border-dashed border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-2xl font-heading font-semibold transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
          <a href="/code" className="flex items-center gap-3">
            <div className="relative">
              <span className="material-icons md-24 text-emerald-600 dark:text-emerald-400">add_circle</span>
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold">Share Anonymous</span>
              <span className="text-xs opacity-75 font-body">No account needed</span>
            </div>
          </a>
        </Button>
      </motion.div>
    </div>

    {/* Right Column Example */}
    <motion.div
      className="relative px-4 md:px-0"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Example Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
        <h3 className="font-heading font-semibold text-foreground">Project Files</h3>
        <p className="text-sm font-body text-muted-foreground">24 files • 2.3 GB</p>
      </div>
    </motion.div>
  </div>

  {/* Glow Line */}
  <motion.div
    className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent ${actualTheme === 'light' ? 'via-neutral-800' : 'via-neutral-800'}`}
    style={{
      width: glowWidth,
      opacity: glowOpacity,
      boxShadow: "0 0 20px rgba(38,38,38,0.8), 0 0 40px rgba(38,38,38,0.4)",
    }}
  />
</section>

);
};

export default HeroSection;
