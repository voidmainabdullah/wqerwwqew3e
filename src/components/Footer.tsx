import React from 'react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="w-full py-16 px-6 md:px-12 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="scale-110">
              <Logo />
            </div>
            <p className="text-muted-foreground max-w-xs">
              Secure, fast, and reliable file sharing powered by military-grade encryption and unlimited cloud storage.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {["twitter", "linkedin", "facebook", "youtube"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="material-icons">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Product</h4>
            <ul className="space-y-3">
              {[
                { text: "Features", link: "#features" },
                { text: "Integrations", link: "#" },
                { text: "Pricing", link: "#pricing" },
                { text: "Updates", link: "#" },
                { text: "Roadmap", link: "#" },
              ].map((item, i) => (
                <li key={i}>
                  <a
                    href={item.link}
                    className="font-body text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>{item.text}</span>
                    <span className="material-icons text-xs opacity-70 group-hover:opacity-100">north_east</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Company</h4>
            <ul className="space-y-3">
              {[
                "About",
                "Blog",
                "Careers",
                "Press",
                "Contact",
              ].map((text, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="font-body text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>{text}</span>
                    <span className="material-icons text-xs opacity-70">north_east</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-foreground">Resources</h4>
            <ul className="space-y-3">
              {[
                "Documentation",
                "Help Center",
                "Guides & Tutorials",
                "API Reference",
                "Community",
              ].map((text, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="font-body text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>{text}</span>
                    <span className="material-icons text-xs opacity-70">north_east</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center font-body text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <span className="material-icons md-18">copyright</span>
            © 2025 Skieshare. All rights reserved.
          </div>

          <div className="flex gap-6 mt-4 md:mt-0">
            {["Privacy", "Terms", "Cookies"].map((text, i) => (
              <a
                key={i}
                href="#"
                className="hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <span>{text}</span>
                <span className="material-icons text-[14px] opacity-70">north_east</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
