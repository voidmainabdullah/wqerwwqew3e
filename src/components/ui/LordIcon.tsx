import React, { useRef, useEffect, useState } from 'react';

// TypeScript declaration for custom lord-icon element
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
  size?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
  gap?: number;
  scaleOnHover?: number; // optional scale effect
  transitionTime?: string; // optional transition time
}

export const LordIcon: React.FC<LordIconProps> = ({
  src,
  size = 32,
  className = '',
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
  label,
  gap = 8,
  scaleOnHover = 1.1,
  transitionTime = '0.2s',
}) => {
  const iconRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  // Load Lordicon script dynamically
  useEffect(() => {
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

  // Wait a bit to ensure the custom element is fully upgraded
  useEffect(() => {
    if (!scriptLoaded) return;

    const timer = setTimeout(() => setElementReady(true), 50);
    return () => clearTimeout(timer);
  }, [scriptLoaded]);

  const handleMouseEnter = () => {
    if (iconRef.current && elementReady) {
      (iconRef.current as any).play?.();
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current && elementReady) {
      (iconRef.current as any).reset?.();
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        cursor: 'pointer',
        transition: `transform ${transitionTime}`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Scale effect on hover
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `scale(${scaleOnHover})`;
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      <lord-icon
        ref={iconRef}
        src={src}
        trigger="manual"
        colors={`primary:${primaryColor},secondary:${secondaryColor}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {label && <span>{label}</span>}
    </div>
  );
};

// Predefined LordIcon URLs
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
