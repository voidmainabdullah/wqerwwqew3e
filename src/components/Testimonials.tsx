import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Testimonials = () => {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  const testimonials = [
    {
      quote:
        "Our team collaboration improved by 300% after switching to SkieShare. File sharing is seamless and secure.",
      author: "Sarah Johnson",
      position: "Product Manager at TechCorp",
      avatar: "bg-green-500/30",
    },
    {
      quote:
        "The security features give us peace of mind when sharing sensitive documents. It's enterprise-grade protection made simple.",
      author: "Michael Chen",
      position: "Head of Security at DataFlow",
      avatar: "bg-green-400/20",
    },
    {
      quote:
        "We've cut our file management overhead by 60%. The AI organization is incredibly intuitive and powerful.",
      author: "Leila Rodriguez",
      position: "Operations Director at CreativeStudio",
      avatar: "bg-green-600/40",
    },
    {
      quote:
        "SkieShare simplified how we manage project files. Our workflow is faster, cleaner, and more transparent.",
      author: "David Kim",
      position: "Team Lead at CodeSprint",
      avatar: "bg-green-300/30",
    },
    {
      quote:
        "We love the visual feedback and smooth collaboration tools. It truly feels next-gen for our remote team.",
      author: "Amira Patel",
      position: "UI/UX Head at NovaDesigns",
      avatar: "bg-green-500/20",
    },
    {
      quote:
        "From upload to delivery, everything is instant. SkieShare just redefined our client delivery process.",
      author: "Lucas Meyer",
      position: "Creative Director at PixelFlow",
      avatar: "bg-green-500/40",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full py-24 px-6 md:px-12 bg-black overflow-hidden"
    >
      {/* Glowing Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)] opacity-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute -top-1/2 left-1/2 transform -translate-x-1/2 w-[1200px] h-[1200px] bg-green-500/10 blur-[180px] rounded-full"></div>

      {/* Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-5 mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Trusted by <span className="text-green-400">Innovators</span> Worldwide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover why thousands of creative professionals and global teams rely on SkieShare for
            secure, smooth, and intelligent file sharing.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -80 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="relative p-6 rounded-2xl bg-gradient-to-b from-gray-900/70 to-black/80 border border-gray-800 hover:border-green-400/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-500 backdrop-blur-sm"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

              {/* Stars */}
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-icons text-green-400/80 mr-1 text-sm">
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 italic text-base leading-relaxed mb-6">
                “{testimonial.quote}”
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full ${testimonial.avatar} border border-green-400/20`}
                ></div>
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-400 text-xs">{testimonial.position}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Looping Logos */}
        <div className="relative mt-24 overflow-hidden">
          <motion.div
            className="flex gap-12"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...Array(12)].map((_, i) => (
              <img
                key={i}
                src="/testi.logo.png"
                alt="Brand Logo"
                className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </motion.div>
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-black to-transparent"></div>
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-black to-transparent"></div>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none blur-3xl"></div>
    </section>
  );
};

export default Testimonials;
