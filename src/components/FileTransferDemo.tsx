import React, { useState } from "react";
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
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };

  const features = [
    {
      title: "Secure File Storage",
      description:
        "Enterprise-grade encryption and security for all your important files and documents.",
      expandedDescription:
        "Store files with military-grade AES-256 encryption. Files are encrypted both in transit and at rest. Access controls ensure only authorized users can view sensitive content. Automated backups and version history keep your data safe.",
      icon: <Shield className="w-6 h-6 text-primary" />,
    },
    {
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with real-time file sharing and collaboration tools.",
      expandedDescription:
        "Share instantly with team members and external partners. Get real-time notifications for file updates, comments, and project progress — all within your workspace.",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      title: "Smart File Organization",
      description:
        "AI-powered organization and search to find files faster than ever.",
      expandedDescription:
        "Automatically categorize and tag files. Smart folders organize content by project or custom rules. Use advanced search with metadata or content recognition for instant results.",
      icon: <Files className="w-6 h-6 text-primary" />,
    },
    {
      title: "Access Control",
      description:
        "Granular permissions and access control to keep sensitive files secure.",
      expandedDescription:
        "Set detailed permissions for each file and folder. Manage who can view, edit, or share. Time-limited links and audit logs give you full visibility.",
      icon: <Lock className="w-6 h-6 text-primary" />,
    },
    {
      title: "Instant Sharing",
      description:
        "Share files with anyone, anywhere using secure links and updates.",
      expandedDescription:
        "Generate secure links with expiry dates or password protection. Real-time sync ensures everyone always has the latest version.",
      icon: <Share2 className="w-6 h-6 text-primary" />,
    },
    {
      title: "Lightning Fast",
      description:
        "Optimized performance for instant uploads, downloads, and sync.",
      expandedDescription:
        "Powered by CDN and compression for lightning-fast transfers. Resume interrupted uploads and keep files automatically updated across devices.",
      icon: <Zap className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-16 md:py-24 px-4 md:px-8 bg-card/30"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground mb-4">
            Built for the Future of File Sharing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Experience next-generation tools that redefine collaboration,
            security, and performance for your entire team.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 cosmic-glass">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl border border-border flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent mb-6 shadow-md group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <Collapsible
                  open={openFeature === index}
                  onOpenChange={() => toggleFeature(index)}
                >
                  <CollapsibleTrigger className="w-full text-left flex items-start justify-between group">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        openFeature === index ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-border">
                      <motion.p
                        className="text-sm text-muted-foreground leading-relaxed mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={
                          openFeature === index ? { opacity: 1, y: 0 } : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        {feature.expandedDescription}
                      </motion.p>
                      <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors duration-200">
                        Learn more →
                      </button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
