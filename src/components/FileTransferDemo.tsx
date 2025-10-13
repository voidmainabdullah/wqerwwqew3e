import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  Users,
  Files,
  Lock,
  Share2,
  Zap,
  ChevronDown,
} from "lucide-react";

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const toggleFeature = (index: number) =>
    setOpenFeature(openFeature === index ? null : index);

  useEffect(() => {
    const canvas = document.getElementById("glow-bg");
    const ctx = canvas.getContext("2d");
    let particles: any[] = [];
    const particleCount = 60;
    const colors = ["#007AFF", "#00C9A7", "#5D5FEF", "#00D8FF", "#1E90FF"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.getElementById("features")?.offsetHeight || 600;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 0.6,
        velocityY: (Math.random() - 0.5) * 0.6,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      update();
      requestAnimationFrame(draw);
    };

    const update = () => {
      particles.forEach((p) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        if (p.x < 0 || p.x > canvas.width) p.velocityX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.velocityY *= -1;
      });
    };

    draw();
  }, []);

  const features = [
    {
      title: "Secure File Storage",
      description:
        "Enterprise-grade encryption and protection for all your important files.",
      expandedDescription:
        "Store files with military-grade AES-256 encryption, both in transit and at rest. Control access and monitor activity with full audit trails.",
      icon: <Shield size={26} />,
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live updates and sharing.",
      expandedDescription:
        "Collaborate instantly across teams with live file syncing, version history, and in-app commenting for effortless teamwork.",
      icon: <Users size={26} />,
    },
    {
      title: "Smart File Organization",
      description: "AI-powered file management and lightning-fast search.",
      expandedDescription:
        "Files are automatically categorized and tagged. Use advanced search with smart filters and visual recognition to find anything in seconds.",
      icon: <Files size={26} />,
    },
    {
      title: "Access Control",
      description: "Granular permissions to protect sensitive files.",
      expandedDescription:
        "Set custom access levels, control editing rights, and enable time-limited links with audit logs for every activity.",
      icon: <Lock size={26} />,
    },
    {
      title: "Instant Sharing",
      description: "Share files securely with custom links and passwords.",
      expandedDescription:
        "Generate private links with expiry dates or access keys. Ensure full security while maintaining instant collaboration access.",
      icon: <Share2 size={26} />,
    },
    {
      title: "Lightning Fast",
      description: "Optimized for performance and instant file operations.",
      expandedDescription:
        "Experience ultra-fast uploads with CDN optimization, compression, and real-time background syncing for teams of any size.",
      icon: <Zap size={26} />,
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full py-20 px-4 md:px-8 overflow-hidden bg-gradient-to-br from-[#05060c] via-[#0a0f1c] to-[#091021]"
      ref={ref}
    >
      {/* 3D Glow Background */}
      <canvas
        id="glow-bg"
        className="absolute inset-0 w-full h-full opacity-40"
      ></canvas>
      <div className="relative max-w-7xl mx-auto z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Built for the Future of File Sharing
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Experience next-generation technology designed for security,
            performance, and seamless collaboration.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              animate={
                inView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 50 }
              }
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              <Collapsible
                open={openFeature === index}
                onOpenChange={() => toggleFeature(index)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      openFeature === index ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <p className="text-gray-400 mt-4 leading-relaxed text-sm md:text-base">
                    {feature.expandedDescription}
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                    Learn more →
                  </button>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
