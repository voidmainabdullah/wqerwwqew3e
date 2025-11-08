import React from "react";
import { motion } from "framer-motion";
import { Users, Workflow, FileText, Shield, CloudUpload, Zap, BarChart3, CheckCircle2, Share2, Database } from "lucide-react";
const Testimonials = () => {
  const testimonials = [{
    quote: "Our collaboration improved by 300% after switching to SkyShare — file sharing is now seamless, fast, and secure.",
    author: "Sarah Johnson",
    position: "Product Manager at TechCorp",
    initials: "SJ"
  }, {
    quote: "Enterprise-level security made beautifully simple. Our data sharing finally feels effortless and safe.",
    author: "Michael Chen",
    position: "Head of Security at DataFlow",
    initials: "MC"
  }, {
    quote: "AI-based organization is game-changing — we reduced file clutter by 60% across all teams.",
    author: "Leila Rodriguez",
    position: "Operations Director at CreativeStudio",
    initials: "LR"
  }, {
    quote: "A stunningly designed tool that actually delivers. Uploads, encryption, and sharing — all beautifully smooth.",
    author: "Daniel Reed",
    position: "CTO at NovaLabs",
    initials: "DR"
  }, {
    quote: "From design to performance, everything about SkyShare feels premium — we use it every single day.",
    author: "Amira Patel",
    position: "Brand Director at Orion",
    initials: "AP"
  }, {
    quote: "Our global team loves how intuitive SkyShare feels — even complex workflows are simple now.",
    author: "Kenji Sato",
    position: "Project Lead at CloudStream",
    initials: "KS"
  }];
  const logos = ["/images/logo1.png", "/images/logo2.png", "/images/logo3.png", "/images/logo4.png", "/images/logo5.png", "/images/logo6.png"];
  return <>
      {/* ===== Testimonials Section ===== */}
      <section className="w-full py-28 px-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-white/5 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl sm:text-5xl font-semibold text-white bg-clip-text bg-gradient-to-r from-white to-gray-300 text-transparent">
              Loved by teams worldwide
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              See how professionals and teams revolutionize their workflow using SkyShare.
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative w-full overflow-hidden">
            <motion.div className="flex gap-6" animate={{
            x: ["0%", "-50%"]
          }} transition={{
            repeat: Infinity,
            duration: 35,
            ease: "linear"
          }}>
              {[...testimonials, ...testimonials].map((testimonial, i) => <div key={i} className="min-w-[340px] md:min-w-[400px] bg-gradient-to-b from-[#0A0A0A]/90 to-[#050505]/90 border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all duration-700">
                  <p className="text-white/80 text-[15px] leading-relaxed mb-8 italic">
                    “{testimonial.quote}”
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{testimonial.author}</h4>
                      <p className="text-white/50 text-xs">{testimonial.position}</p>
                    </div>
                  </div>
                </div>)}
            </motion.div>
          </div>

          {/* Logos Row */}
          <div className="relative w-full overflow-hidden mt-20">
            <motion.div className="flex items-center gap-16" animate={{
            x: ["-50%", "0%"]
          }} transition={{
            repeat: Infinity,
            duration: 45,
            ease: "linear"
          }}>
              {[...logos, ...logos].map((logo, i) => {})}
            </motion.div>
          </div>

          {/* Showcase */}
          <motion.div className="mt-24 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.08)]" initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 1.2,
          ease: "easeOut"
        }}>
            <div className="relative bg-gradient-to-br from-[#0B0B0B]/90 to-[#050505]/90 p-1">
              <div className="rounded-xl overflow-hidden bg-black/90 backdrop-blur-xl">
                <img src="/images/showcase.png" alt="Platform Showcase" className="w-full h-auto object-cover max-h-[520px]" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Teams Workflow Structure Section ===== */}
      <section className="w-full py-32 px-6 bg-gradient-to-b from-black to-[#050505] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 blur-[220px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-semibold text-white mb-4">​Get Started To Skieshare</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              SkyShare empowers collaboration through transparent, real-time workflows.
              From uploading to approval — every step is synced, tracked, and secure.
            </p>
          </div>

          {/* Workflow Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[{
            icon: <Users className="w-8 h-8 text-white/80" />,
            title: "Unified Teams",
            desc: "Collaborate across departments with unified permissions and shared spaces."
          }, {
            icon: <CloudUpload className="w-8 h-8 text-white/80" />,
            title: "Instant File Sync",
            desc: "Every update is reflected instantly across all connected devices."
          }, {
            icon: <Shield className="w-8 h-8 text-white/80" />,
            title: "End-to-End Security",
            desc: "AES-256 encryption and audit logs for every file access event."
          }, {
            icon: <Zap className="w-8 h-8 text-white/80" />,
            title: "Real-Time Automation",
            desc: "AI monitors and automates repetitive workflows with smart triggers."
          }, {
            icon: <BarChart3 className="w-8 h-8 text-white/80" />,
            title: "Analytics Dashboard",
            desc: "Visualize upload trends, user actions, and security events in one panel."
          }, {
            icon: <Database className="w-8 h-8 text-white/80" />,
            title: "Data Layer Control",
            desc: "Organize, backup, and distribute enterprise files effortlessly."
          }].map((card, i) => {})}
          </div>

          {/* Workflow Visualization */}
          
        </div>
      </section>
    </>;
};
export default Testimonials;