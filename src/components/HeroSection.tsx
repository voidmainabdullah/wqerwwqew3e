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
              <a href="/auth" className="bg-slate-100 text-neutral-700">
                <span className="material-icons md-18">arrow_right</span>
                Get Started
              </a>
            </Button>
            <Button variant="outline" className="border-2 border-neutral-300 text-foreground hover:bg-neutral-100 hover:text-foreground dark:border-neutral-600 dark:hover:bg-neutral-800 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-xl font-heading font-semibold transition-all duration-300 w-full sm:w-auto icon-text" asChild>
              <a href="/auth" className="bg-white">
              <span className="material-icons md-24">dashboard</span>
              Go To Dashbaord
              </a>
            </Button>
          </motion.div>

          {/* Enhanced Anonymous Share Button - Positioned Below */}
          <motion.div 
            className="flex justify-center sm:justify-start mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button 
              variant="ghost" 
              className="anonymous-share-btn text-base md:text-lg h-14 md:h-16 px-8 md:px-10 rounded-2xl font-heading font-semibold transition-all duration-400 relative overflow-hidden group"
              asChild
            >
              <a href="/code" className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="pulse-dot w-3 h-3 rounded-full bg-current"></div>
                  <div className="pulse-ring absolute inset-0 w-3 h-3 rounded-full bg-current opacity-75"></div>
                </div>
                <span className="material-icons md-24">add_circle</span>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-bold">Share Anonymous</span>
                  <span className="text-xs opacity-80 font-body -mt-1">No signup required</span>
                </div>
                <span className="material-icons md-18 opacity-60">arrow_forward</span>
              </a>
            </Button>
          </motion.div>
          {/* Enhanced Feature Badges - Better Aligned */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.8
        }}>
            <div className="feature-badge flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/20">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="material-icons md-18 text-primary">security</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-heading font-semibold text-foreground">AES-256</span>
                <span className="text-xs font-body text-muted-foreground">Encryption</span>
              </div>
            </div>
            
            <div className="feature-badge flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="material-icons md-18 text-accent">cloud</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-heading font-semibold text-foreground">Unlimited</span>
                <span className="text-xs font-body text-muted-foreground">Bandwidth</span>
              </div>
            </div>
            
            <div className="feature-badge flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-600/10 border border-purple-500/20">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <span className="material-icons md-18 text-purple-400">admin_panel_settings</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-heading font-semibold text-foreground">Full</span>
                <span className="text-xs font-body text-muted-foreground">Control</span>
              </div>
            </div>
            
            <div className="feature-badge flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="material-icons md-18 text-amber-400">flash_on</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-heading font-semibold text-foreground">Lightning</span>
                <span className="text-xs font-body text-muted-foreground">Fast</span>
              </div>
            </div>
          </motion.div>
        </div>

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
                <div className="aspect-square rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-icons md-18 text-primary">description</span>
                </div>
                <div className="aspect-square rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="material-icons md-18 text-accent">image</span>
                </div>
                <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
                  <span className="material-icons md-18 text-muted-foreground">video_file</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-3 md:p-4 shadow-lg transform translate-x-4 md:translate-x-8 hover:translate-x-0 transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="material-icons md-18 text-accent">security</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-heading font-medium text-foreground">Secure Upload</p>
                  <p className="text-xs font-body text-muted-foreground">End-to-end encrypted</p>
                </div>
                <div className="w-8 md:w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-6 md:w-8 h-full bg-accent rounded-full"></div>
                </div>
              </div>
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
    </section>;
};
export default HeroSection;