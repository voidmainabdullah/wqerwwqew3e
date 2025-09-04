import React from 'react';
import { motion } from 'framer-motion';
import { Files, Shield, Users, ArrowRight, CheckCircle, Lock, Eye, Zap, Globe, Clock, UserCheck, Settings, Download, Upload } from 'lucide-react';
const FileTransferDemo = () => {
  return <section className="py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            See File Transfer in Action
          </motion.h2>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how seamlessly your files move through our secure transfer pipeline
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Step 1: File Selection */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Files className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Project Files</h3>
                    <p className="text-sm text-muted-foreground">24 files • 2.3 GB</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-card"></div>
                  <div className="w-8 h-8 rounded-full bg-accent/30 border-2 border-card"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">+3</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.div animate={{
                scale: [1, 1.05, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0
              }} className="aspect-square rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Files className="h-4 w-4 text-primary" />
                </motion.div>
                <motion.div animate={{
                scale: [1, 1.05, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.3
              }} className="aspect-square rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Files className="h-4 w-4 text-accent" />
                </motion.div>
                <motion.div animate={{
                scale: [1, 1.05, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.6
              }} className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Files className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
            
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Step 1: Select Files
              </span>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div animate={{
            x: [0, 10, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }} className="text-muted-foreground">
              <ArrowRight className="h-8 w-8" />
            </motion.div>
          </div>

          {/* Step 2: Secure Transfer */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Secure Upload</p>
                  <p className="text-sm text-muted-foreground">End-to-end encrypted</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">67%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{
                  width: "0%"
                }} animate={{
                  width: "67%"
                }} transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }} className="h-full bg-accent rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>256-bit AES encryption</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
                <motion.span animate={{
                rotate: 360
              }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }} className="w-2 h-2 bg-accent rounded-full" />
                Step 2: Secure Transfer
              </span>
            </div>
          </motion.div>
        </div>

        {/* Step 3: Completion */}
        <motion.div initial={{
        opacity: 0,
        y: 50
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.6
      }} className="mt-12 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Transfer Complete</p>
                <p className="text-sm text-muted-foreground">All files shared successfully</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Shared with 5 people</span>
              </div>
              <motion.span animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 1.5,
              repeat: Infinity
            }} className="text-green-400">
                <CheckCircle className="h-5 w-5" />
              </motion.span>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Step 3: Completed
            </span>
          </div>
        </motion.div>

        {/* Additional Security & Control Features */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Encryption Security */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-zinc-800">
                <motion.div animate={{
                rotate: [0, 360]
              }} transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }} className="absolute inset-2 border-2 border-primary/30 border-t-primary rounded-full bg-transparent" />
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Advanced Encryption</h3>
                <p className="text-sm text-muted-foreground">Military-grade AES-256</p>
              </div>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => <motion.div key={i} animate={{
                opacity: [0.3, 1, 0.3]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }} className="w-2 h-1 rounded-full bg-green-300" />)}
              </div>
            </div>
          </motion.div>

          {/* Full Control */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-zinc-700">
                <motion.div animate={{
                scale: [1, 1.1, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }}>
                  <Settings className="h-6 w-6 text-accent" />
                </motion.div>
                <motion.div animate={{
                rotate: [0, 180, 360]
              }} transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }} className="absolute top-1 right-1 w-3 h-3 rounded-full bg-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Full Control</h3>
                <p className="text-sm text-muted-foreground">Permissions & Access</p>
              </div>
              <div className="flex justify-center space-x-1 bg-transparent">
                <motion.div animate={{
                y: [0, -4, 0]
              }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0
              }} className="w-1 h-6 rounded-full bg-slate-100" />
                <motion.div animate={{
                y: [0, -4, 0]
              }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2
              }} className="w-1 h-4 rounded-full bg-green-300" />
                <motion.div animate={{
                y: [0, -4, 0]
              }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.4
              }} className="w-1 h-8 rounded-full bg-gray-100" />
              </div>
            </div>
          </motion.div>

          {/* Real-time Monitoring */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16 rounded-full bg-black/10 dark:bg-neutral-800/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-black dark:text-neutral-800" />
                <motion.div animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="absolute inset-0 rounded-full border-2 border-black/30 dark:border-neutral-800/30 bg-zinc-800" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Live Monitoring</h3>
                <p className="text-sm text-muted-foreground">Real-time analytics</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active transfers</span>
                  <motion.span animate={{
                  opacity: [0.5, 1, 0.5]
                }} transition={{
                  duration: 1,
                  repeat: Infinity
                }} className="font-medium text-green-400">
                    24
                  </motion.span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Users online</span>
                  <motion.span animate={{
                  opacity: [0.5, 1, 0.5]
                }} transition={{
                  duration: 1.2,
                  repeat: Infinity
                }} className="font-medium text-green-400">
                    1.2k
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lightning Speed */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center space-y-4">
               <div className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-zinc-800 text-white">
                <motion.div animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }} transition={{
                duration: 1.5,
                repeat: Infinity
              }}>
                  <Zap className="h-6 w-6 text-black dark:text-neutral-800 bg-transparent" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Lightning Speed</h3>
                <p className="text-sm text-muted-foreground">Ultra-fast transfers</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Upload className="h-4 w-4 text-black dark:text-white bg-transparent" />
                <span className="text-foreground font-medium">125 MB/s</span>
                <Download className="h-4 w-4 text-black dark:text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security Showcase */}
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.5
      }} className="mt-16 bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-500">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Security First Architecture</h3>
            <p className="text-muted-foreground">Every transfer is protected by multiple layers of security</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Encryption Layer */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <motion.div animate={{
                rotate: [0, 360]
              }} transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }} className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full" />
                <Shield className="h-8 w-8 text-primary" />
                <motion.div animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3]
              }} transition={{
                duration: 3,
                repeat: Infinity
              }} className="absolute inset-0 rounded-full bg-blue-800" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">End-to-End Encryption</h4>
                <p className="text-sm text-muted-foreground">Files encrypted before leaving your device</p>
              </div>
            </div>

            {/* Access Control */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-zinc-800">
                <UserCheck className="h-8 w-8 text-accent" />
                <motion.div animate={{
                rotate: [0, -360]
              }} transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }} className="absolute inset-2 border border-accent/40 border-dotted rounded-full bg-[#1bb428]/[0.08]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Secure Verified +</h4>
                <p className="text-sm text-muted-foreground">Multi-factor authentication required</p>
              </div>
            </div>

            {/* Global Network */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-black/10 dark:bg-neutral-800/10 flex items-center justify-center">
                <Globe className="h-8 w-8 text-black dark:text-neutral-800" />
                <motion.div animate={{
                scale: [1, 1.4, 1]
              }} transition={{
                duration: 4,
                repeat: Infinity
              }} className="absolute inset-0 border border-black/30 dark:border-neutral-800/30 rounded-full" />
                <motion.div animate={{
                scale: [1, 1.2, 1]
              }} transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1
              }} className="absolute inset-1 border border-black/20 dark:border-neutral-800/20 rounded-full bg-zinc-800" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Global Infrastructure</h4>
                <p className="text-sm text-muted-foreground">Distributed across 50+ data centers</p>
              </div>
            </div>
          </div>

          {/* Real-time Status Indicators */}
          <div className="mt-8 flex justify-center space-x-8">
            <div className="flex items-center gap-2">
              <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }} className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-sm text-muted-foreground">All systems operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">99.9% uptime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default FileTransferDemo;