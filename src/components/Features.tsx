import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Shield, Users, Lock, Zap } from "lucide-react";

const DeveloperExperience = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section
      id="developer-experience"
      ref={ref}
      className="relative w-full bg-gradient-to-b from-background via-card/20 to-background py-24 md:py-32 px-6 md:px-12 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center md:text-left md:flex-col lg:flex-col gap-16">
        {/* Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            First-class <br className="hidden md:block" />
            file-sharing experience
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We’re a team of developers obsessed with making file sharing fast,
            secure, and enjoyable. Our goal is to build the cloud platform we’ve
            always wanted — one that <em>just works</em> beautifully.
          </p>
        </motion.div>

        {/* Showcase Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="w-full flex flex-col lg:flex-row gap-8 items-center justify-center"
        >
          {/* Left “Command Console” Style Panel */}
          <div className="w-full lg:w-1/2 bg-card border border-border/60 rounded-2xl p-6 md:p-8 text-left shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm px-3 py-1 rounded-full bg-green-600/10 text-green-400 font-medium">
                Connected
              </div>
              <div className="text-muted-foreground text-sm">SkyShare CLI</div>
            </div>

            <div className="font-mono text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                <span className="text-green-500">Upload:</span> "project_docs.zip" →
                <span className="text-primary ml-1">Cloud Server #12</span>
              </p>
              <p>
                <span className="text-green-500">Status:</span> 100% complete ✅
              </p>
              <p>
                <span className="text-blue-400">Link generated:</span>{" "}
                https://skyshare.io/s/project_docs
              </p>
              <p className="text-slate-500">
                AES-256 encryption | 0.8s upload time | CDN optimized
              </p>
            </div>

            <div className="mt-6 border-t border-border/40 pt-4">
              <p className="text-muted-foreground text-xs">
                Secure. Verified. Distributed.
              </p>
            </div>
          </div>

          {/* Right “Activity Log” Panel */}
          <div className="w-full lg:w-1/2 bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 font-medium">
                Recent Activity
              </div>
              <span className="text-xs text-muted-foreground">Live updates</span>
            </div>

            <div className="font-mono text-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <p>
                    <span className="text-green-400">Delivered</span> to{" "}
                    <span className="bg-muted px-2 py-0.5 rounded-md">
                      team@skyshare.io
                    </span>
                  </p>
                </div>
                <p className="text-muted-foreground text-xs mt-1 md:mt-0">
                  Oct 31 • 14:23
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                  <p>
                    <span className="text-violet-400">Viewed</span> by{" "}
                    <span className="bg-muted px-2 py-0.5 rounded-md">
                      alex@figma.com
                    </span>
                  </p>
                </div>
                <p className="text-muted-foreground text-xs mt-1 md:mt-0">
                  Oct 31 • 14:25
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <p>
                    <span className="text-orange-400">Edited</span> "UI_Assets.zip"
                  </p>
                </div>
                <p className="text-muted-foreground text-xs mt-1 md:mt-0">
                  Oct 31 • 14:28
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <p>
                    <span className="text-red-400">Deleted</span> "draft.pdf"
                  </p>
                </div>
                <p className="text-muted-foreground text-xs mt-1 md:mt-0">
                  Oct 31 • 14:30
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Section */}
        <motion.div
          className="max-w-6xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {[
            {
              icon: <Shield size={26} />,
              title: "End-to-End Encryption",
              text: "Your files are encrypted at rest, in transit, and in storage with military-grade AES-256 encryption.",
            },
            {
              icon: <Users size={26} />,
              title: "Built for Teams",
              text: "Workspaces, real-time sync, and secure permissions make collaboration effortless and fast.",
            },
            {
              icon: <Lock size={26} />,
              title: "Granular Access Control",
              text: "Decide who can view, edit, or download files. Every access event is logged for transparency.",
            },
            {
              icon: <Zap size={26} />,
              title: "Performance First",
              text: "Optimized through CDN edge caching and smart compression — experience speed that scales globally.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-3 p-6 rounded-xl bg-card/30 border border-border/60 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DeveloperExperience;
