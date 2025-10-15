import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Files,
  Shield,
  Users,
  Share2,
  Lock,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const features = [
    {
      title: "Secure File Storage",
      description:
        "Enterprise-grade encryption and security for all your important files and documents.",
      expandedDescription:
        "Store files with military-grade AES-256 encryption. All files are encrypted both in transit and at rest. Access controls ensure only authorized team members can view sensitive documents. Automated backups and version history keep your data safe.",
      icon: <Shield size={26} />,
    },
    {
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with real-time file sharing and collaboration tools.",
      expandedDescription:
        "Share files instantly with team members and external collaborators. Real-time notifications keep everyone updated on file changes. Comment on files, assign tasks, and track project progress all within the platform.",
      icon: <Users size={26} />,
    },
    {
      title: "Smart File Organization",
      description:
        "AI-powered organization and search to find files faster than ever before.",
      expandedDescription:
        "Automatically categorize and tag files based on content. Smart folders organize files by project, date, or custom criteria. Advanced search finds files instantly using content, metadata, or visual recognition.",
      icon: <Files size={26} />,
    },
    {
      title: "Access Control",
      description:
        "Granular permissions and access controls to keep sensitive files secure.",
      expandedDescription:
        "Set detailed permissions for each file and folder. Control who can view, edit, or share files. Time-limited access links expire automatically. Audit trails track all file access and modifications.",
      icon: <Lock size={26} />,
    },
    {
      title: "Instant Sharing",
      description:
        "Share files with anyone, anywhere with secure links and real-time updates.",
      expandedDescription:
        "Generate secure sharing links with custom expiration dates. Password protect sensitive files. Real-time sync ensures everyone has the latest version. Share directly from your workflow without interruption.",
      icon: <Share2 size={26} />,
    },
    {
      title: "Lightning Fast",
      description:
        "Optimized performance for instant uploads, downloads, and file operations.",
      expandedDescription:
        "Advanced compression and CDN delivery ensure lightning-fast file transfers. Resume interrupted uploads automatically. Background sync keeps files updated across all devices. Optimized for teams of any size.",
      icon: <Zap size={26} />,
    },
  ];

  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };

  return (
    <section
      id="features"
      className="w-full py-16 md:py-24 px-4 md:px-8 bg-card/30 backdrop-blur-sm"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for the Future of File Sharing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience next-generation features designed to revolutionize how
            teams collaborate and share files securely.
          </p>
        </motion.div>
{/* Image Section */}
<section className="w-full px-4 sm:px-8 lg:px-16 py-10"> 
  <div className="max-w-7xl mx-auto">
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-700/30">
      <img
        src="/showcase2.png"
        alt="Descriptive Alt Text"
        className="w-full h-40 object-cover md:h-[500px] sm:h-[400px] h-[250px]"
      />
    </div>
  </div>
</section>
        

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative group bg-card border border-border/60 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/40 hover:-translate-y-1.5">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                <Collapsible
                  open={openFeature === index}
                  onOpenChange={() => toggleFeature(index)}
                >
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-muted-foreground ml-3 transition-transform duration-300 ${
                          openFeature === index ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        openFeature === index ? { opacity: 1, y: 0 } : {}
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-sm text-muted-foreground border-t border-border/60 pt-4 leading-relaxed mb-4">
                        {feature.expandedDescription}
                      </p>
                      <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm">
                        Learn more
                        <span className="material-icons text-sm">
                          arrow_forward
                        </span>
                      </button>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Image Section */}
<section className="w-full px-4 sm:px-8 lg:px-16 py-10">
  <div className="max-w-7xl mx-auto">
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-700/30">
      <img
        src="/showcase2.png"
        alt="Descriptive Alt Text"
        className="w-full h-full  md:h-[500px] sm:h-[400px] h-[250px]"
      />
    </div>
  </div>
</section>

    </section>
  );
};

export default Features;
