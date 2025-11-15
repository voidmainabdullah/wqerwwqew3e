import React from 'react';

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
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
  gap?: number;
}

export const LordIcon: React.FC<LordIconProps> = ({
  src,
  size = 32,
  primaryColor = '#ffffff',
  secondaryColor = '#ffffff',
  label,
  gap = 8,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        cursor: 'pointer',
      }}
    >
      <lord-icon
        src={src}
        trigger="hover" // Let Lordicon handle hover animation
        colors={`primary:${primaryColor},secondary:${secondaryColor}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {label && (
        <span style={{ pointerEvents: 'none' /* allow hover to pass through to icon */ }}>
          {label}
        </span>
      )}
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
