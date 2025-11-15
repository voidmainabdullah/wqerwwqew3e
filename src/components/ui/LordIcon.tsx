import React, { useRef, useEffect, useState } from 'react';

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
        delay?: number;
      };
    }
  }
}

interface LordIconProps {
  src: string;
  size?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
  gap?: number;
}

/**
 * Fully working LordIcon component
 * - Animates on parent hover (icon or label)
 * - Waits for Lordicon script to load
 * - Supports optional label
 */
export const LordIcon: React.FC<LordIconProps> = ({
  src,
  size = 32,
  className = '',
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
  label,
  gap = 8,
}) => {
  const iconRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load lord-icon script if not already loaded
    if (!document.querySelector('script[src*="lord-icon"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const handleMouseEnter = () => {
    if (scriptLoaded && iconRef.current) {
      (iconRef.current as any).play?.();
    }
  };

  const handleMouseLeave = () => {
    if (scriptLoaded && iconRef.current) {
      (iconRef.current as any).reset?.();
    }
  };

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, cursor: 'pointer' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <lord-icon
        ref={iconRef} // ✅ ref on lord-icon itself
        src={src}
        trigger="manual" // manual trigger to control hover
        colors={`primary:${primaryColor},secondary:${secondaryColor}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {label && <span>{label}</span>}
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
