import React, { useRef, useEffect } from 'react';

// Declare the custom lord-icon element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
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

export const LordIcon: React.FC<LordIconProps> = ({
  src,
  trigger = 'hover',
  colors,
  size = 32,
  className = '',
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
}) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load lord-icon script if not already loaded
    if (!document.querySelector('script[src*="lord-icon"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Build colors string if not provided
  const finalColors = colors || `primary:${primaryColor},secondary:${secondaryColor}`;

  return (
    <div ref={iconRef} className={className}>
      <lord-icon
        src={src}
        trigger={trigger}
        colors={finalColors}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

// Common LordIcon presets for navigation
export const LordIcons = {
  home: 'https://cdn.lordicon.com/efxgwrkc.json',
  dashboard: 'https://cdn.lordicon.com/efxgwrkc.json',
  settings: 'https://cdn.lordicon.com/lecprnjb.json',
  logout: 'https://cdn.lordicon.com/gwvmctbb.json',
  user: 'https://cdn.lordicon.com/dxjqoygy.json',
  crown: 'https://cdn.lordicon.com/qxdsfyuw.json',
  menu: 'https://cdn.lordicon.com/ipnwkgdy.json',
  close: 'https://cdn.lordicon.com/nqtddedc.json',
  arrowDown: 'https://cdn.lordicon.com/xcrjfuzb.json',
  fileStack: 'https://cdn.lordicon.com/dqxvvqzi.json',
  users: 'https://cdn.lordicon.com/bimokqfw.json',
  shield: 'https://cdn.lordicon.com/kbtmbyzy.json',
  ana:'https://cdn.lordicon.com/erxuunyq.json',
  code: 'https://cdn.lordicon.com/fhtaantg.json',
  book: 'https://cdn.lordicon.com/wxnxiano.json',
  newspaper: 'https://cdn.lordicon.com/nocovwne.json',
  briefcase: 'https://cdn.lordicon.com/iuqrftwp.json',
  support: 'https://cdn.lordicon.com/nkmsrxys.json',
  dollar: 'https://cdn.lordicon.com/qhgmphtg.json',
  dot: 'https://cdn.lordicon.com/gqzfzudq.json',
};
