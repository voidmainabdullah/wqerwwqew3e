import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'phosphor-react';
import { motion } from 'framer-motion';

export const SecurityNotice: React.FC = () => {
  const securityFeatures = [
    {
      icon: <Shield className="h-4 w-4" />,
      text: "End-to-end encryption"
    },
    {
      icon: <Lock className="h-4 w-4" />,
      text: "Secure authentication"
    },
    {
      icon: <Eye className="h-4 w-4" />,
      text: "Privacy protected"
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "GDPR compliant"
    }
  ];

  return (
    <motion.div 
      className="bg-muted/50 p-4 rounded-lg border border-border/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">Your data is secure</p>
          <p className="text-muted-foreground">
            We use industry-standard encryption to protect your account and files.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 text-xs text-muted-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
          >
            <span className="text-primary">{feature.icon}</span>
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};