import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Files, Shield, Users, Share2, Lock, Zap } from "lucide-react";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const {
    ref,
    inView
  } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  const features = [{
    title: "Secure File Storage",
    description: "Enterprise-grade encryption and security for all your important files and documents.",
    expandedDescription: "Store files with military-grade AES-256 encryption. All files are encrypted both in transit and at rest. Access controls ensure only authorized team members can view sensitive documents. Automated backups and version history keep your data safe.",
    icon: <Shield size={24} className="text-primary" />
  }, {
    title: "Real-time Collaboration",
    description: "Work together seamlessly with real-time file sharing and collaboration tools.",
    expandedDescription: "Share files instantly with team members and external collaborators. Real-time notifications keep everyone updated on file changes. Comment on files, assign tasks, and track project progress all within the platform.",
    icon: <Users size={24} className="text-primary" />
  }, {
    title: "Smart File Organization",
    description: "AI-powered organization and search to find files faster than ever before.",
    expandedDescription: "Automatically categorize and tag files based on content. Smart folders organize files by project, date, or custom criteria. Advanced search finds files instantly using content, metadata, or visual recognition.",
    icon: <Files size={24} className="text-primary" />
  }, {
    title: "Access Control",
    description: "Granular permissions and access controls to keep sensitive files secure.",
    expandedDescription: "Set detailed permissions for each file and folder. Control who can view, edit, or share files. Time-limited access links expire automatically. Audit trails track all file access and modifications.",
    icon: <Lock size={24} className="text-primary" />
  }, {
    title: "Instant Sharing",
    description: "Share files with anyone, anywhere with secure links and real-time updates.",
    expandedDescription: "Generate secure sharing links with custom expiration dates. Password protect sensitive files. Real-time sync ensures everyone has the latest version. Share directly from your workflow without interruption.",
    icon: <Share2 size={24} className="text-primary" />
  }, {
    title: "Lightning Fast",
    description: "Optimized performance for instant uploads, downloads, and file operations.",
    expandedDescription: "Advanced compression and CDN delivery ensure lightning-fast file transfers. Resume interrupted uploads automatically. Background sync keeps files updated across all devices. Optimized for teams of any size.",
    icon: <Zap size={24} className="text-primary" />
  }];
  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };
  return <section id="features" className="w-full py-12 md:py-24 px-4 md:px-8 bg-card/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="mb-12 md:mb-16 text-center" initial={{
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground mb-4 md:mb-6">
            Built for the future of file sharing
          </h2>
          <p className="text-lg md:text-xl font-body text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Experience next-generation features designed to revolutionize how teams collaborate and share files securely.
          </p>
        </motion.div>

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => <motion.div key={index} className="group" initial={{
          opacity: 0,
          y: 50
        }} animate={inView ? {
          opacity: 1,
          y: 0
        } : {
          opacity: 0,
          y: 50
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }}>
              <div className="h-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/40 hover:-translate-y-2 cosmic-glass">
                {/* Feature Icon */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 ${
                  index === 0 ? 'icon-container-green border-analytics-green/20' :
                  index === 1 ? 'icon-container-purple border-analytics-purple/20' :
                  index === 2 ? 'icon-container-yellow border-analytics-yellow/20' :
                  index === 3 ? 'icon-container-red border-analytics-red/20' :
                  index === 4 ? 'icon-container-purple border-analytics-purple/20' :
                  'icon-container-green border-analytics-green/20'
                }`}>
                  <div className={`analytics-icon transition-colors duration-300 ${
                    index === 0 ? 'analytics-icon-green' :
                    index === 1 ? 'analytics-icon-purple' :
                    index === 2 ? 'analytics-icon-yellow' :
                    index === 3 ? 'analytics-icon-red' :
                    index === 4 ? 'analytics-icon-purple' :
                    'analytics-icon-green'
                  }`}>
                    <span className={`material-icons ${window.innerWidth >= 768 ? 'md-36' : 'md-24'}`}>
                      {index === 0 ? 'security' :
                       index === 1 ? 'groups' :
                       index === 2 ? 'folder_managed' :
                       index === 3 ? 'lock' :
                       index === 4 ? 'share' :
                       'flash_on'}
                    </span>
                  </div>
                </div>

                {/* Feature Content */}
                <Collapsible open={openFeature === index} onOpenChange={() => toggleFeature(index)}>
                  <CollapsibleTrigger className="w-full text-left group/trigger">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <motion.h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3 group-hover/trigger:text-primary transition-colors duration-300" initial={{
                      opacity: 0,
                      y: 15
                    }} animate={inView ? {
                      opacity: 1,
                      y: 0
                    } : {
                      opacity: 0,
                      y: 15
                    }} transition={{
                      duration: 0.8,
                      delay: index * 0.1 + 0.3
                    }}>
                          {feature.title}
                        </motion.h3>
                        <motion.p className="text-sm md:text-base font-body text-muted-foreground leading-relaxed mb-4" initial={{
                      opacity: 0,
                      y: 20
                    }} animate={inView ? {
                      opacity: 1,
                      y: 0
                    } : {
                      opacity: 0,
                      y: 20
                    }} transition={{
                      duration: 1,
                      delay: index * 0.1 + 0.5
                    }}>
                          {feature.description}
                        </motion.p>
                      </div>
                      <span className={`material-icons md-24 text-muted-foreground transition-all duration-300 group-hover/trigger:text-primary flex-shrink-0 ${openFeature === index ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="pt-4 border-t border-border">
                      <motion.p className="text-sm md:text-base font-body text-muted-foreground leading-relaxed mb-6" initial={{
                    opacity: 0,
                    y: 25
                  }} animate={openFeature === index ? {
                    opacity: 1,
                    y: 0
                  } : {
                    opacity: 0,
                    y: 25
                  }} transition={{
                    duration: 0.6,
                    delay: 0.2
                  }}>
                        {feature.expandedDescription}
                      </motion.p>
                      <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-heading font-semibold transition-colors duration-200 text-sm md:text-base">
                        Learn more
                        <span className="material-icons md-18">arrow_forward</span>
                      </button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default Features;