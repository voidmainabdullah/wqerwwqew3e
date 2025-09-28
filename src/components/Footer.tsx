import React from 'react';
import Logo from './Logo';
const Footer = () => {
  return <footer className="w-full py-16 px-6 md:px-12 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="scale-110">
              <Logo />
            </div>
            <p className="text-muted-foreground max-w-xs">
              Modern task management for teams that value clarity, focus, and results.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3.01s-2.018 1.192-3.14 1.53a4.48 4.48 0 00-7.86 3v1a10.66 10.66 0 01-9-4.53s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83C21.94 5.674 23 3.01 23 3.01z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 9h4v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2c.313-1.732.467-3.482.46-5.33a29.005 29.005 0 00-.46-5.33z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">star</span>
                Features
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">integration_instructions</span>
                Integrations
              </a></li>
              <li><a href="#pricing" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">payments</span>
                Pricing
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">update</span>
                Updates
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">map</span>
                Roadmap
              </a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">info</span>
                About
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">article</span>
                Blog
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">work</span>
                Careers
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">campaign</span>
                Press
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">contact_mail</span>
                Contact
              </a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">description</span>
                Documentation
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">help_center</span>
                Help Center
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">school</span>
                Guides & Tutorials
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">code</span>
                API Reference
              </a></li>
              <li><a href="#" className="font-body text-muted-foreground hover:text-foreground transition-colors icon-text">
                <span className="material-icons md-18">groups</span>
                Community
              </a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center font-body text-muted-foreground text-sm">
          <div className="icon-text">
            <span className="material-icons md-18">copyright</span>
            © 2025 DropThrow. All rights reserved.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors icon-text">
              <span className="material-icons md-18">privacy_tip</span>
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors icon-text">
              <span className="material-icons md-18">gavel</span>
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors icon-text">
              <span className="material-icons md-18">cookie</span>
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;