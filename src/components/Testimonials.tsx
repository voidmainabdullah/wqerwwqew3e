import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Cloud,
  Cpu,
  Zap,
  Lock,
  Activity,
  Folder,
  Share2,
  Database,
} from "lucide-react";

const TeamWorkflow2025 = () => {
  return (
    <section className="relative w-full py-32 px-6 bg-black overflow-hidden">
      {/* Animated Glow Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/10 blur-[250px]" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-white/5 blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Team Workflow Intelligence
          </motion.h2>
          <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
            Real-time visibility into team activity, file distribution, and AI-assisted automation.
            Built for speed, security, and smart collaboration.
          </p>
        </div>

        {/* --- Workflow Timeline (Animated line with icons) --- */}
        <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto mb-32">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10" />
          {[
            { icon: <Folder />, label: "Upload" },
            { icon: <Users />, label: "Collaborate" },
            { icon: <Cpu />, label: "AI Organize" },
            { icon: <Lock />, label: "Secure Sync" },
            { icon: <Share2 />, label: "Deliver" },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.15 }}
              className="relative flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.08)] border border-white/10">
                {step.icon}
              </div>
              <p className="mt-4 text-sm text-white/60">{step.label}</p>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-[-6px] w-[2px] h-[20px] bg-blue-400/50 rounded-full"
              />
            </motion.div>
          ))}
        </div>

        {/* --- Live Metrics Stream --- */}
        <div className="grid md:grid-cols-4 gap-8 mb-32 text-center">
          {[
            { icon: <Cloud />, value: "1.2 TB", label: "Files Transferred" },
            { icon: <Activity />, value: "98%", label: "Uptime" },
            { icon: <Users />, value: "450+", label: "Active Teams" },
            { icon: <Zap />, value: "3.5x", label: "Faster Processing" },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="text-white/80 mb-4 flex justify-center">{metric.icon}</div>
              <motion.h3
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-3xl font-semibold text-white"
              >
                {metric.value}
              </motion.h3>
              <p className="text-sm text-white/50 mt-2">{metric.label}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-gradient-to-r from-blue-400/40 to-white/10 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* --- Team Network Flow (Interactive Rings) --- */}
        <div className="relative w-full h-[400px] flex items-center justify-center">
          {/* Central Node */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.08)]"
          >
            <Cpu className="w-10 h-10 text-white/80" />
          </motion.div>

          {/* Orbiting Team Nodes */}
          {[
            { icon: <Users />, label: "Team Alpha" },
            { icon: <Database />, label: "CloudOps" },
            { icon: <Share2 />, label: "Delivery" },
            { icon: <Lock />, label: "Security" },
            { icon: <Zap />, label: "Automation" },
          ].map((node, i) => (
            <motion.div
              key={i}
              className="absolute flex flex-col items-center text-center"
              style={{
                transform: `rotate(${i * 72}deg) translateY(-180px) rotate(-${i * 72}deg)`,
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md">
                {node.icon}
              </div>
              <p className="text-xs mt-3 text-white/50">{node.label}</p>
            </motion.div>
          ))}
        </div>

        {/* --- Closing Line --- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white/50 text-sm mt-24"
        >
          SkyShare: Empowering next-generation teamwork with precision, security, and intelligence.
        </motion.p>
      </div>
    </section>
  );
};

export default TeamWorkflow2025;
