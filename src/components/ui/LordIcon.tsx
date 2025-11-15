import React, { useRef, useEffect } from 'react';

// Declare the custom lord-icon element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}

interface LordIconProps {
  src: string;
  trigger?: 'hover' | 'click' | 'loop' | 'morph';
  colors?: string;
  size?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Upgraded LordIcon component
 * - Animates on parent hover (icon + text)
 * - Manual trigger for full control
 */
export const LordIcon: React.FC<LordIconProps> = ({
  src,
  trigger = 'hover',
  colors,
  size = 32,
  className = '',
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
}) => {
  const iconRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load Lordicon script if not loaded
    if (!document.querySelector('script[src*="lord-icon"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const finalColors = colors || `primary:${primaryColor},secondary:${secondaryColor}`;

  // Handlers for parent hover
  const handleMouseEnter = () => {
    if (iconRef.current && (trigger === 'hover' || trigger === 'manual')) {
      (iconRef.current as any).play?.();
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current && (trigger === 'hover' || trigger === 'manual')) {
      (iconRef.current as any).reset?.();
    }
  };

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <lord-icon
        ref={iconRef}
        src={src}
        trigger="manual" // manual trigger to control hover
        colors={finalColors}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

// Predefined LordIcon URLs for quick use
export const LordIcons = {
  home: 'https://cdn.lordicon.com/fhlrrido.json',
  dashboard: 'https://cdn.lordicon.com/gzqofmcx.json',
  settings: 'https://cdn.lordicon.com/lecprnjb.json',
  logout: 'https://cdn.lordicon.com/gwvmctbb.json',
  user: 'https://cdn.lordicon.com/dxjqoygy.json',
  crown: 'https://cdn.lordicon.com/qxdsfyuw.json',
  menu: 'https://cdn.lordicon.com/ipnwkgdy.json',
  close: 'https://cdn.lordicon.com/nqtddedc.json',
  arrowDown: 'https://cdn.lordicon.com/xcrjfuzb.json',
  fileStack: 'https://cdn.lordicon.com/ukdwhewu.json',
  users: 'https://cdn.lordicon.com/ucjqqgja.json',
  lord: 'https://cdn.lordicon.com/piurhpdv.json',
  shield: 'https://cdn.lordicon.com/kbtmbyzy.json',
  ana: 'https://cdn.lordicon.com/erxuunyq.json',
  code: 'https://cdn.lordicon.com/fhtaantg.json',
  book: 'https://cdn.lordicon.com/wxnxiano.json',
  newspaper: 'https://cdn.lordicon.com/nocovwne.json',
  briefcase: 'https://cdn.lordicon.com/iuqrftwp.json',
  support: 'https://cdn.lordicon.com/nkmsrxys.json',
  dollar: 'https://cdn.lordicon.com/qhgmphtg.json',
  dot: 'https://cdn.lordicon.com/gqzfzudq.json',
};
