import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';

interface PageFooterProps {
  showLogo?: boolean;
  className?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({ 
  showLogo = true, 
  className = '' 
}) => {
  const { actualTheme } = useTheme();
  
  return (
    <footer className={`w-full py-8 px-6 border-t border-border/50 bg-card/30 backdrop-blur-sm ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Logo Section */}
        {showLogo && (
          <div className="flex justify-center mb-6">
            <div className="scale-90">
              <Logo />
            </div>
          </div>
        )}
        
        {/* Links Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            <a 
              href="/privacy" 
              className="font-body text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              <span className="material-icons md-18">privacy_tip</span>
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="font-body text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              <span className="material-icons md-18">gavel</span>
              Terms of Service
            </a>
            <a 
              href="/support" 
              className="font-body text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              <span className="material-icons md-18">support_agent</span>
              Support
            </a>
            <a 
              href="/contact" 
              className="font-body text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              <span className="material-icons md-18">contact_mail</span>
              Contact
            </a>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="text-center">
          <p className="font-body text-muted-foreground text-sm flex items-center justify-center gap-1">
            <span className="material-icons md-18">copyright</span>
            © 2025 SkieShare. All rights reserved.
          </p>
          <p className="font-body text-muted-foreground text-xs mt-2">
            Secure • Fast • In Your Control
          </p>
        </div>
        
        {/* Security Badge */}
        <div className="flex justify-center mt-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-body ${
            actualTheme === 'light'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-green-900/20 text-green-400 border border-green-800/30'
          }`}>
            <span className="material-icons md-18">verified</span>
            <span>Secured with 256-bit encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
};