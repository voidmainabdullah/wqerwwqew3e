import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Shield, Users, Files, Lock, Share2, Zap } from "lucide-react";

const Features = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const features = [
    {
      icon: <Shield size={26} />,
      title: "Secure File Storage",
      description:
        "All files are encrypted with AES-256 both in transit and at rest. Enterprise-grade security ensures your documents remain safe, private, and always accessible to authorized users.",
    },
    {
      icon: <Users size={26} />,
      title: "Real-Time Collaboration",
      description:
        "Work with your team in real time. Share files instantly, leave comments, assign roles, and track progress without switching tools or losing context.",
    },
    {
      icon: <Files size={26} />,
      title: "Smart File Organization",
      description:
        "AI automatically categorizes your uploads by project, content, and context — making search effortless and your workspace always organized.",
    },
    {
      icon: <Lock size={26} />,
      title: "Advanced Access Control",
      description:
        "Granular permission settings give you full control. Decide who can view, edit, or share — and keep your confidential files secure at every level.",
    },
    {
      icon: <Share2 size={26} />,
      title: "Instant Sharing",
      description:
        "Create secure share links in seconds. Set expiration dates, protect with passwords, and manage visibility from a single dashboard.",
    },
    {
      icon: <Zap size={26} />,
      title: "Lightning Fast Performance",
      description:
        "Powered by global CDN and smart compression, uploads and downloads are instant — no matter your location or file size.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-20 md:py-28 px-6 md:px-10 bg-card/30 backdrop-blur-sm"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Built for the Future of Secure File Sharing
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          SkyShare combines top-tier encryption, real-time collaboration, and
          intelligent automation — empowering teams to share, manage, and
          protect their data effortlessly.
        </motion.p>
      </div>

      {/* Image Section */}
      <motion.section
        className="w-full px-4 sm:px-8 lg:px-16 py-10"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-700/30">
            <img
              src="/showcase2.png"
              alt="SkyShare platform showcasing secure collaboration"
              className="w-full h-full md:h-[500px] sm:h-[400px] h-[250px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </motion.section>

      {/* Textual Feature List */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mt-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
