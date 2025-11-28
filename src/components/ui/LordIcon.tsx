import React, { useRef, useEffect, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
        delay?: number;
      };
    }
  }
}

interface LordIconProps {
  src: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
  gap?: number;
  trigger?: 'hover' | 'loop' | 'click' | 'morph'; // optional custom trigger
  className?: string;
}

export const LordIcon: React.FC<LordIconProps> = ({
  src,
  size = 32,
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
  label,
  gap = 8,
  trigger = 'hover',
  className,
}) => {
  const iconRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Dynamically load Lordicon script once
  useEffect(() => {
    if (!document.getElementById('lord-icon-script')) {
      const script = document.createElement('script');
      script.id = 'lord-icon-script';
      script.src = 'https://cdn.lordicon.com/lusqsztk.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Optional manual click play
  const handleClick = () => {
    if (iconRef.current && (iconRef.current as any).play) {
      (iconRef.current as any).play();
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        cursor: label ? 'pointer' : 'default',
      }}
      onClick={handleClick}
    >
      {scriptLoaded ? (
        <lord-icon
          ref={iconRef}
          src={src}
          trigger={trigger}
          colors={`primary:${primaryColor},secondary:${secondaryColor}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      ) : (
        <div style={{ width: size, height: size }} /> // fallback empty box
      )}
      {label && <span style={{ pointerEvents: 'none' }}>{label}</span>}
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
