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
  const testimonials = [{
    quote: "Our team collaboration improved by 300% after switching to this platform. File sharing is seamless and secure.",
    author: "Sarah Johnson",
    position: "Product Manager at TechCorp",
    avatar: "bg-primary/30"
  }, {
    quote: "The security features give us peace of mind when sharing sensitive documents. It's enterprise-grade protection made simple.",
    author: "Michael Chen",
    position: "Head of Security at DataFlow",
    avatar: "bg-primary/20"
  }, {
    quote: "We've cut our file management overhead by 60%. The AI organization is incredibly intuitive and powerful.",
    author: "Leila Rodriguez",
    position: "Operations Director at CreativeStudio",
    avatar: "bg-primary/40"
  }];
  {/* Image Section */}
<section className="w-full px-4 sm:px-8 lg:px-16 py-10">
  <div className="max-w-7xl mx-auto">
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-700/30">
      <img
        src="/showcase.png"
        alt="Descriptive Alt Text"
        className="w-full h-auto object-cover md:h-[500px] sm:h-[400px] h-[250px]"
      />
    </div>
  </div>
</section>

  return <section className="w-full py-20 px-6 md:px-12 bg-card relative overflow-hidden" ref={ref}>
      {/* Background grid */}
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <motion.div className="text-center space-y-4 max-w-3xl mx-auto" initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {
        opacity: 0,
        y: 30
      }} transition={{
        duration: 0.6
      }}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tighter text-foreground">
            Trusted by teams worldwide
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            See how our platform transforms file sharing and collaboration for businesses
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <motion.div key={index} className="p-6 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300" initial={{
          opacity: 0,
          y: 30
        }} animate={inView ? {
          opacity: 1,
          y: 0
        } : {
          opacity: 0,
          y: 30
        }} transition={{
          duration: 0.6,
          delay: index * 0.2
        }}>
              <div className="mb-6">
                {[...Array(5)].map((_, i) => <span key={i} className="material-icons md-18 mr-1 text-amber-400">star</span>)}
              </div>
              <p className="text-lg font-body mb-8 text-foreground/90 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${testimonial.avatar} bg-muted`}></div>
                <div>
                  <h4 className="font-heading font-medium text-foreground">{testimonial.author}</h4>
                  <p className="text-sm font-body text-muted-foreground">{testimonial.position}</p>
                </div>
              </div> 
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default Testimonials;