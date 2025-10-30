import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Zap,
  Eye,
  Settings,
  CheckCircle2,
  CloudUpload,
  CloudDownload,
  Folder,
  ArrowRight,
} from "lucide-react";

const FileTransferDemo = () => {
  return (
    <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#101010] text-gray-200 overflow-hidden relative">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,120,255,0.15)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg"
          >
            Experience Seamless File Sharing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto"
          >
            Secure. Fast. Modern. Designed for professionals who value performance and trust.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-10 items-center">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-[#0f0f0f] border border-[#1c1c1c] p-8 rounded-2xl hover:shadow-[0_0_25px_rgba(0,140,255,0.25)] transition-all"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Folder className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  Step 1: Select Files
                </h3>
                <p className="text-sm text-gray-400">Upload your projects securely</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[CloudUpload, CloudDownload, Shield].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="aspect-square rounded-xl bg-[#141414] border border-[#222] flex items-center justify-center"
                >
                  <Icon className="text-blue-400" size={22} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hidden lg:flex justify-center"
          >
            <ArrowRight className="text-gray-500" size={48} />
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-[#0f0f0f] border border-[#1c1c1c] p-8 rounded-2xl hover:shadow-[0_0_25px_rgba(0,255,140,0.25)] transition-all"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Lock className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  Step 2: Secure Transfer
                </h3>
                <p className="text-sm text-gray-400">End-to-end encryption</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress</span>
                <span className="text-white font-semibold">72%</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "72%" }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                ></motion.div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Shield size={14} /> AES-256 Encryption
              </p>
            </div>
          </motion.div>
        </div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-md mx-auto bg-[#0f0f0f] border border-[#1c1c1c] p-8 rounded-2xl text-center hover:shadow-[0_0_30px_rgba(0,255,140,0.25)]"
        >
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle2 className="text-green-400" size={26} />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Step 3: Transfer Complete
            </h3>
            <p className="text-sm text-gray-400">
              All files delivered successfully
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm"
          >
            <CheckCircle2 size={16} /> Completed
          </motion.div>
        </motion.div>

        {/* Dashboard Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-24 bg-[#0c0c0c] border border-[#1b1b1b] rounded-2xl p-8 shadow-[0_0_40px_rgba(0,120,255,0.2)]"
        >
          <h3 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Your Dashboard Preview
          </h3>

          <div className="rounded-xl overflow-hidden shadow-2xl border border-[#1f1f1f] bg-black/30 backdrop-blur-lg hover:scale-[1.02] transition-transform">
            {/* ↓ Replace this image with your dashboard PNG */}
            <img
              src="/your-dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="text-center text-gray-400 mt-4 text-sm">
            Add your own <code>.png</code> dashboard screenshot above for instant visual impact.
          </p>
        </motion.div>

        {/* Security & Speed Highlights */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Shield,
              title: "Advanced Encryption",
              desc: "Military-grade AES-256 protection",
              glow: "from-blue-400 to-cyan-400",
            },
            {
              icon: Eye,
              title: "Live Monitoring",
              desc: "Real-time analytics & tracking",
              glow: "from-purple-400 to-pink-400",
            },
            {
              icon: Settings,
              title: "Total Control",
              desc: "Full admin control panel",
              glow: "from-green-400 to-lime-400",
            },
            {
              icon: Zap,
              title: "Lightning Speed",
              desc: "Up to 125MB/s transfer rate",
              glow: "from-yellow-400 to-orange-400",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-[#0f0f0f] border border-[#1c1c1c] p-6 rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] text-center"
            >
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${f.glow} blur-xl opacity-30`}></div>
                <f.icon className="relative text-white" size={28} />
              </div>
              <h4 className="text-lg font-semibold text-white">{f.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FileTransferDemo;
