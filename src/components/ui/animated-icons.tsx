import React from "react";

interface AnimatedFogProps {
  show: boolean;
  className?: string;
}

export const AnimatedFog: React.FC<AnimatedFogProps> = ({ show, className = "" }) => {
  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in ${className}`}
    >
      {/* Fog layers */}
      <div className="absolute w-[150%] h-[150%] bg-gradient-to-r from-white/10 via-white/5 to-transparent blur-3xl animate-fog-move" />
      <div className="absolute w-[120%] h-[120%] bg-gradient-to-l from-white/5 via-white/10 to-transparent blur-2xl animate-fog-move-delayed" />
    </div>
  );
};

interface EmptyStateFogProps {
  text: string;
  className?: string;
}

export const EmptyStateFog: React.FC<EmptyStateFogProps> = ({ text, className = "" }) => {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in ${className}`}
    >
      {/* Subtle foggy glow */}
      <div className="absolute w-[100%] h-[100%] bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-2xl animate-fog-move opacity-50" />
      <span className="text-xs text-white/70 relative z-10">{text}</span>
    </div>
  );
};
