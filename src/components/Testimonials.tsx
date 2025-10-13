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
      avatar: "/avatars/avatar-1.png",
    },
    {
      quote:
        "The security features give us peace of mind when sharing sensitive documents. It's enterprise-grade protection made simple.",
      author: "Michael Chen",
      position: "Head of Security at DataFlow",
      avatar: "/avatars/avatar-2.png",
    },
    {
      quote:
        "We've cut our file management overhead by 60%. The AI organization is incredibly intuitive and powerful.",
      author: "Leila Rodriguez",
      position: "Operations Director at CreativeStudio",
      avatar: "/avatars/avatar-3.png",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full py-20 px-6 md:px-12 overflow-hidden bg-background"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <img
          src="/skie-1.png"
          alt="Decorative background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Header Section */}
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={
            inView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 30 }
          }
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-lg font-body text-muted-foreground">
            See how our platform transforms file sharing and collaboration for businesses
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-6 md:p-8 rounded-2xl border border-border bg-background/70 backdrop-blur-md shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={
                inView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Rating Stars */}
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-icons text-amber-400 text-lg"
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-base md:text-lg font-body text-foreground/90 italic mb-6">
                “{testimonial.quote}”
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover bg-muted"
                />
                <div>
                  <h4 className="font-heading font-semibold text-foreground">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm font-body text-muted-foreground">
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
