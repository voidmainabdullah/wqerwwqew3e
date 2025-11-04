import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Testimonials = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const testimonials = [
    {
      quote:
        "Our team collaboration improved by 300% after switching to SkyShare. File sharing is now effortless, fast, and secure.",
      author: "Sarah Johnson",
      position: "Product Manager at TechCorp",
      initials: "SJ",
      color: "from-white/10 to-white/5",
    },
    {
      quote:
        "The advanced security protocols give us full peace of mind. It's enterprise-grade simplicity for modern workflows.",
      author: "Michael Chen",
      position: "Head of Security at DataFlow",
      initials: "MC",
      color: "from-white/5 to-white/10",
    },
    {
      quote:
        "We reduced file management overhead by 60%. The AI organization feature feels almost magical in daily operations.",
      author: "Leila Rodriguez",
      position: "Operations Director at CreativeStudio",
      initials: "LR",
      color: "from-white/10 to-transparent",
    },
  ];

  const logos = [
    "/images/logo1.png",
    "/images/logo2.png",
    "/images/logo3.png",
    "/images/logo4.png",
    "/images/logo5.png",
  ];

  return (
    <section
      ref={ref}
      className="w-full py-28 px-4 sm:px-6 md:px-12 bg-black relative overflow-hidden"
    >
      {/* Background Lights */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-24 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 text-transparent">
            Loved by teams worldwide
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
            See how teams are transforming their workflows and collaboration
            using SkyShare.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 1.2,
                delay: index * 0.25,
                ease: "easeInOut",
              }}
              className="relative bg-gradient-to-b from-[#0A0A0A]/90 to-[#050505]/90 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)] flex-1 hover:shadow-[0_0_45px_rgba(255,255,255,0.08)] transition-all duration-700"
            >
              <p className="text-white/80 text-[15px] leading-relaxed mb-8 italic">
                “{testimonial.quote}”
              </p>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} shadow-lg shadow-black/40`}
                >
                  <span className="text-white font-semibold text-sm">
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="text-white/50 text-xs">{testimonial.position}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos Row */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.4 }}
          className="mt-24 flex flex-wrap justify-center items-center gap-10 opacity-90"
        >
          {logos.map((logo, i) => (
            <motion.img
              key={i}
              src={logo}
              alt={`Company ${i + 1}`}
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]"
              whileHover={{ scale: 1.05 }}
            />
          ))}
        </motion.div>

        {/* Showcase Image */}
        <motion.div
          className="mt-24 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.05)]"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-[#0B0B0B]/90 to-[#050505]/90 p-1">
            <div className="rounded-xl overflow-hidden bg-black/90 backdrop-blur-xl">
              <img
                src="/images/showcase.png"
                alt="Platform Showcase"
                className="w-full h-auto object-cover max-h-[520px]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
