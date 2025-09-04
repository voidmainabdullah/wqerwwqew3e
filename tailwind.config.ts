import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Button Theme Colors
        button: {
          "primary-bg": "hsl(var(--button-primary-bg))",
          "primary-text": "hsl(var(--button-primary-text))",
          "primary-hover": "hsl(var(--button-primary-hover))",
          "secondary-bg": "hsl(var(--button-secondary-bg))",
          "secondary-text": "hsl(var(--button-secondary-text))",
          "secondary-hover": "hsl(var(--button-secondary-hover))",
          "outline-border": "hsl(var(--button-outline-border))",
          "outline-hover": "hsl(var(--button-outline-hover))",
          "ghost-hover": "hsl(var(--button-ghost-hover))",
        },
        // Enhanced Analytics Color System (4-Color Palette)
        analytics: {
          red: "hsl(var(--analytics-red))",
          "red-hover": "hsl(var(--analytics-red-hover))",
          "red-bg": "hsl(var(--analytics-red-bg))",
          yellow: "hsl(var(--analytics-yellow))",
          "yellow-hover": "hsl(var(--analytics-yellow-hover))",
          "yellow-bg": "hsl(var(--analytics-yellow-bg))",
          green: "hsl(var(--analytics-green))",
          "green-hover": "hsl(var(--analytics-green-hover))",
          "green-bg": "hsl(var(--analytics-green-bg))",
          purple: "hsl(var(--analytics-purple))",
          "purple-hover": "hsl(var(--analytics-purple-hover))",
          "purple-bg": "hsl(var(--analytics-purple-bg))",
        },
        // Enhanced Brand Colors (Extended Palette)
        brand: {
          primary: "hsl(var(--brand-primary))",
          "primary-hover": "hsl(var(--brand-primary-hover))",
          "primary-light": "hsl(var(--brand-primary-light))",
          secondary: "hsl(var(--brand-secondary))",
          "secondary-hover": "hsl(var(--brand-secondary-hover))",
          accent: "hsl(var(--brand-accent))",
          "accent-hover": "hsl(var(--brand-accent-hover))",
          "accent-light": "hsl(var(--brand-accent-light))",
          neutral: "hsl(var(--brand-neutral))",
          "neutral-hover": "hsl(var(--brand-neutral-hover))",
        },
        // Status Colors (With Background Variants)
        status: {
          success: "hsl(var(--status-success))",
          "success-bg": "hsl(var(--status-success-bg))",
          warning: "hsl(var(--status-warning))",
          "warning-bg": "hsl(var(--status-warning-bg))",
          error: "hsl(var(--status-error))",
          "error-bg": "hsl(var(--status-error-bg))",
          info: "hsl(var(--status-info))",
          "info-bg": "hsl(var(--status-info-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'brand': '0 4px 14px 0 hsl(var(--brand-accent) / 0.15)',
        'brand-lg': '0 10px 40px -12px hsl(var(--brand-accent) / 0.25)',
        'analytics-red': '0 4px 14px 0 hsl(var(--analytics-red) / 0.15)',
        'analytics-yellow': '0 4px 14px 0 hsl(var(--analytics-yellow) / 0.15)',
        'analytics-green': '0 4px 14px 0 hsl(var(--analytics-green) / 0.15)',
        'analytics-purple': '0 4px 14px 0 hsl(var(--analytics-purple) / 0.15)',
        'analytics': '0 2px 8px 0 currentColor / 0.1',
        'glow': '0 0 20px currentColor / 0.3',
        'glow-lg': '0 0 40px currentColor / 0.4',
      },
      backdropBlur: {
        'brand': '12px',
        'glass': '16px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "icon-pulse": {
          "0%, 100%": { 
            transform: "scale(1)", 
            opacity: "1" 
          },
          "50%": { 
            transform: "scale(1.05)", 
            opacity: "0.8" 
          },
        },
        "brand-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 currentColor" 
          },
          "50%": { 
            boxShadow: "0 0 20px 5px currentColor / 0.3" 
          },
        },
        "icon-bounce": {
          "0%, 100%": { 
            transform: "scale(1)" 
          },
          "50%": { 
            transform: "scale(1.1)" 
          },
        },
        "card-lift": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-4px) scale(1.01)" },
        },
        "theme-transition": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "logo-glow": {
          "0%, 100%": { 
            filter: "brightness(1) drop-shadow(0 0 0px currentColor)" 
          },
          "50%": { 
            filter: "brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "icon-pulse": "icon-pulse 2s ease-in-out infinite",
        "brand-glow": "brand-glow 3s ease-in-out infinite",
        "icon-bounce": "icon-bounce 0.6s ease-out",
        "card-lift": "card-lift 0.3s ease-out forwards",
        "theme-transition": "theme-transition 0.3s ease-out",
        "logo-glow": "logo-glow 4s ease-in-out infinite",
      },
      spacing: {
        'header': 'var(--header-height)',
        'page-top': 'var(--page-padding-top)',
      },
      maxWidth: {
        'content': 'var(--content-max-width)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;