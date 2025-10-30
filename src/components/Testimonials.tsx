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
        "Our team collaboration improved by 300% after switching to this platform. File sharing is seamless and secure.",
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
      className="w-full py-20 px-6 md:px-12 bg-black relative overflow-hidden"
    >
      {/* Glowing Grid Background */}
      <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>

      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center space-y-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Trusted by teams worldwide
          </h2>
          <p className="text-lg text-gray-400">
            See how SkieShare transforms file sharing and collaboration for
            global innovators and creative professionals.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative group p-6 rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black/70 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-500/40"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {/* Glow border */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

              {/* Stars */}
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-icons md-18 mr-1 text-green-400/90"
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg text-gray-300 font-light italic mb-8 leading-relaxed">
                “{testimonial.quote}”
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full ${testimonial.avatar} border border-green-400/20`}
                ></div>
                <div>
                  <h4 className="font-semibold text-white">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none blur-3xl"></div>
      </div>
    </section>
  );
};

export default Testimonials;
