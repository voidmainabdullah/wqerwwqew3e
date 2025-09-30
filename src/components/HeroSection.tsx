import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TaskBoard from './TaskBoard';
import { Files, Cloud, Shield } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
const HeroSection = () => {
  const {
    actualTheme
  } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const {
    scrollY
  } = useScroll();

  // Transform scroll position to glow line width and opacity
  const glowWidth = useTransform(scrollY, [0, 300], ["0%", "100%"]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0, 1]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  return <section className="relative w-full min-h-screen px-6 md:px-12 flex items-center overflow-hidden bg-background">
      {/* Geometric background pattern */}
     <div className="absolute inset-0 light-box-grid opacity-20"></div>
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl bg-stone-800"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl"></div>
      
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 mx-0 my-[120px]">
        {/* Left Column - Content */}
        <div className="space-y-6 md:space-y-8 px-4 md:px-0">
          

          <div className="space-y-6">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.1] xl:text-6xl font-heading font-bold">
              Ultimate Transfer  Globally 
              <br />
               Secure. Fast. In Your Control
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"></span>
            </motion.h1>
            
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="text-muted-foreground max-w-lg leading-relaxed text-base md:text-lg font-body">
              Revolutionary file sharing platform that puts security, speed, and collaboration at the forefront of your workflow.
            </motion.p>
          </div>

          <motion.div className="flex flex-col sm:flex-row gap-4 items-start" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.6
        }}>
            <Button variant="default" className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto icon-text" asChild>
              <a href="/auth" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <span className="material-icons md-18">arrow_right</span>
                Get Started
              </a>
            </Button>
            <Button variant="outline" className="border-2 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold transition-all duration-300 w-full sm:w-auto icon-text hover:scale-105" asChild>
              <a href="/dashboard">
                <span className="material-icons md-18">dashboard</span>
                Go To Dashboard
              </a>
            </Button>
          </motion.div>

          {/* Enhanced Anonymous Share Button */}
          <motion.div className="flex justify-center pt-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.8
        }}>
            <Button variant="ghost" className="anonymous-share-btn relative overflow-hidden group border-2 border-dashed border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-2xl font-heading font-semibold transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25" asChild>
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
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.8
        }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="material-icons md-18 text-primary">security</span>
              </div>
              <span className="text-xs sm:text-sm font-body font-medium text-muted-foreground">AWS-259 Encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="material-icons md-18 text-accent">cloud</span>
              </div>
              <span className="text-xs sm:text-sm font-body font-medium text-muted-foreground">Unlimited bandwidth</span>
              <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="material-icons md-18 text-accent">admin_panel_settings</span>
              </div>
              <span className="text-xs sm:text-sm font-body font-medium text-muted-foreground">Fully Access</span>
              </div>
              <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="material-icons md-18 text-accent">admin_panel_settings</span>
              </div>
              <span className="text-xs sm:text-sm font-body font-medium text-muted-foreground">Fully Access</span>
              </div>
               
            </div>
          </motion.div>
        </div>

          {/* Enhanced Feature Badges */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8" initial={{
        {/* Right Column - Interactive Demo */}
        <motion.div className="relative px-4 md:px-0" initial={{
        opacity: 0,
        x: 50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.8,
        delay: 0.3
      }}>
          {/* Floating File Cards Preview */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="material-icons md-24 text-primary">folder</span>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-heading font-semibold text-foreground">Project Files</h3>
                    <p className="text-xs md:text-sm font-body text-muted-foreground">24 files • 2.3 GB</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card bg-rose-400"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card bg-blue-500"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-heading font-medium bg-zinc-800">+3</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
          delay: 1.0
                  <span className="material-icons md-18 text-primary">description</span>
            {/* Security Badge */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons md-24 text-blue-600 dark:text-blue-400">security</span>
                </div>
                <div>
                  <span className="text-sm font-heading font-bold text-blue-700 dark:text-blue-300">AES-256 Encryption</span>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-body">Military Grade</p>
                </div>
                </div>
                  <span className="material-icons md-18 text-muted-foreground">video_file</span>

            {/* Bandwidth Badge */}
            <div className="group bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-2xl p-4 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons md-24 text-emerald-600 dark:text-emerald-400">cloud</span>
                </div>
                <div>
                  <span className="text-sm font-heading font-bold text-emerald-700 dark:text-emerald-300">Unlimited Bandwidth</span>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-body">No Limits</p>
                </div>
            
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="material-icons md-18 text-accent">security</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-heading font-medium text-foreground">Secure Upload</p>
                  <p className="text-xs font-body text-muted-foreground">End-to-end encrypted</p>
                </div>
                <div className="w-8 md:w-12 h-2 bg-muted rounded-full overflow-hidden">
            </div>

            {/* Control Badge */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-2xl p-4 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            </div>

            {/* Speed Badge */}
            <div className="group bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-4 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons md-24 text-amber-600 dark:text-amber-400">flash_on</span>
                </div>
                <div>
                  <span className="text-sm font-heading font-bold text-amber-700 dark:text-amber-300">Lightning Fast</span>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-body">Instant Transfer</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Animated White Glow Line */}
      <motion.div className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent ${actualTheme === 'light' ? 'via-neutral-800' : 'via-neutral-800'}`} style={{
      width: glowWidth,
      opacity: glowOpacity,
      boxShadow: actualTheme === 'light' ? "0 0 20px rgba(38, 38, 38, 0.8), 0 0 40px rgba(38, 38, 38, 0.4)" : "0 0 20px rgba(38, 38, 38, 0.8), 0 0 40px rgba(38, 38, 38, 0.4)"
    }} />
    </section>
              );
};
 export default HeroSection;