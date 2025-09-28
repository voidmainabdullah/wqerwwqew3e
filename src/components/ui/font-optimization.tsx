import React, { useEffect } from 'react';

/**
 * Font Optimization Component
 * Handles font loading optimization and fallback strategies
 */
export const FontOptimization: React.FC = () => {
  useEffect(() => {
    // Preload critical fonts
    const preloadFonts = () => {
      const fonts = [
        {
          family: 'Unbounded',
          weights: ['400', '600', '700'],
          display: 'swap'
        },
        {
          family: 'Rationale',
          weights: ['400'],
          display: 'swap'
        }
      ];

      fonts.forEach(font => {
        font.weights.forEach(weight => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          link.href = `https://fonts.gstatic.com/s/${font.family.toLowerCase()}/v1/${font.family}-${weight}.woff2`;
          document.head.appendChild(link);
        });
      });
    };

    // Check if fonts are loaded
    const checkFontLoad = async () => {
      try {
        await document.fonts.load('400 16px Unbounded');
        await document.fonts.load('400 16px Rationale');
        
        // Add loaded class to body for CSS transitions
        document.body.classList.add('fonts-loaded');
      } catch (error) {
        console.warn('Font loading failed, using fallbacks:', error);
        document.body.classList.add('fonts-fallback');
      }
    };

    // Performance optimization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadFonts();
        checkFontLoad();
      });
    } else {
      setTimeout(() => {
        preloadFonts();
        checkFontLoad();
      }, 100);
    }
  }, []);

  return null;
};

/**
 * Font Loading Performance Tips:
 * 
 * 1. Use font-display: swap for better loading performance
 * 2. Preload critical font weights only
 * 3. Implement fallback fonts that match x-height
 * 4. Use system fonts as fallbacks for better performance
 * 5. Consider using variable fonts for better file size optimization
 * 
 * Current Implementation:
 * - Unbounded: Modern, geometric font for headings
 * - Rationale: Clean, readable font for body text
 * - Material Icons: Consistent iconography system
 * 
 * Fallback Strategy:
 * - Unbounded → Inter → system-ui → sans-serif
 * - Rationale → Inter → system-ui → sans-serif
 * - Material Icons → system emoji → fallback symbols
 */

// Font loading status hook
export const useFontLoadingStatus = () => {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [fontsFailed, setFontsFailed] = React.useState(false);

  React.useEffect(() => {
    const checkFonts = async () => {
      try {
        await Promise.all([
          document.fonts.load('400 16px Unbounded'),
          document.fonts.load('400 16px Rationale')
        ]);
        setFontsLoaded(true);
      } catch (error) {
        setFontsFailed(true);
      }
    };

    if (document.fonts.ready) {
      document.fonts.ready.then(checkFonts);
    } else {
      checkFonts();
    }
  }, []);

  return { fontsLoaded, fontsFailed };
};