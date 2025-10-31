import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Testimonials = () => {
  const {
    ref,
    inView
  } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const testimonials = [
    {
      quote: "Our team collaboration improved by 300% after switching to this platform. File sharing is seamless and secure.",
      author: "Sarah Johnson",
      position: "Product Manager at TechCorp",
      initials: "SJ",
      color: "from-slate-600 to-slate-700"
    },
    {
      quote: "The security features give us peace of mind when sharing sensitive documents. It's enterprise-grade protection made simple.",
      author: "Michael Chen",
      position: "Head of Security at DataFlow",
      initials: "MC",
      color: "from-slate-500 to-slate-600"
    },
    {
      quote: "We've cut our file management overhead by 60%. The AI organization is incredibly intuitive and powerful.",
      author: "Leila Rodriguez",
      position: "Operations Director at CreativeStudio",
      initials: "LR",
      color: "from-slate-700 to-slate-800"
    }
  ];

  return (
    <section className="w-full py-24 px-4 sm:px-6 md:px-12 bg-black relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-slate-900/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-slate-900/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center space-y-3 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Loved by teams worldwide
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how professionals and teams transform their file sharing workflow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-br from-slate-900/50 to-slate-950 border border-slate-800/50 rounded-xl p-7 hover:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 to-slate-800/0 group-hover:from-slate-800/5 group-hover:to-slate-800/10 rounded-xl transition-all duration-300 pointer-events-none"></div>

              <div className="relative">
                <p className="text-slate-300 leading-relaxed mb-6 text-base font-light">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-sm font-semibold text-white">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm tracking-tight">{testimonial.author}</h4>
                    <p className="text-slate-400 text-xs font-light tracking-wide">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 rounded-xl overflow-hidden border border-slate-800/50 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="relative bg-gradient-to-br from-slate-900 to-black p-1">
            <div className="rounded-lg overflow-hidden bg-black/80 backdrop-blur-sm">
              <img
                src="/showcase.png"
                alt="Platform showcase"
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;