// FileTransferDemo.tsx
import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Upload,
  Lock,
  ShareNetwork,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    icon: <Upload size={40} className="text-blue-500" />,
    title: "File Uploaded",
    desc: "Your file begins its secure journey through our encrypted system.",
  },
  {
    icon: <Lock size={40} className="text-blue-500" />,
    title: "Encryption",
    desc: "Data is encrypted with 256-bit security before leaving your device.",
  },
  {
    icon: <ShareNetwork size={40} className="text-blue-500" />,
    title: "Share Process",
    desc: "Encrypted link generated — ready to share instantly.",
  },
  {
    icon: <ShieldCheck size={40} className="text-blue-500" />,
    title: "Secured Transfer",
    desc: "Advanced protection ensures file integrity during transfer.",
  },
  {
    icon: <CheckCircle size={40} className="text-green-500" />,
    title: "Transfer Complete",
    desc: "Your file has safely reached its destination.",
  },
];

export default function FileTransferDemo() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section
      id="file-demo"
      className="relative flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white overflow-hidden"
    >
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
        className="text-center mb-16 max-w-2xl"
      >
        <h2 className="text-4xl sm:text-5xl font-bold font-heading text-blue-500 mb-3">
          Seamless File Transfer
        </h2>
        <p className="text-neutral-400 font-body text-lg">
          Experience how your files move securely — step by step — powered by
          minimal design and professional encryption flow.
        </p>
      </motion.div>

      {/* Animated Steps */}
      <div ref={ref} className="w-full max-w-md flex flex-col items-center gap-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: index * 0.4 },
              },
            }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative mb-3">
              <motion.div
                className="flex items-center justify-center w-20 h-20 rounded-full border border-blue-500/40 bg-zinc-900/70 backdrop-blur-sm shadow-lg shadow-blue-900/30"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {step.icon}
              </motion.div>
              {index !== steps.length - 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 50, opacity: 1 }}
                  transition={{
                    delay: index * 0.5 + 0.4,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-full w-px bg-gradient-to-b from-blue-600/80 to-blue-800/0 transform -translate-x-1/2"
                />
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: index * 0.4 + 0.3,
                duration: 0.6,
              }}
              className="space-y-2"
            >
              <h3 className="text-xl font-semibold text-blue-400">
                {step.title}
              </h3>
              <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/2 w-[300px] h-[300px] bg-blue-800/10 rounded-full blur-3xl translate-x-1/2" />
    </section>
  );
}
