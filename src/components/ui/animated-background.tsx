import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Upload,
  Download,
  Cloud,
  Shield,
  Lock,
  Lightning,
  FileText,
  ShareNetwork,
  Database,
  WifiHigh,
  HardDrive,
  Globe,
  Key,
  CheckCircle,
  ArrowsDownUp
} from 'phosphor-react';

interface FloatingIconProps {
  icon: React.ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  size?: number;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ 
  icon: Icon, 
  className = '', 
  delay = 0, 
  duration = 20,
  size = 24 
}) => {
  const { actualTheme } = useTheme();
  
  return (
    <div 
      className={`absolute opacity-20 animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <Icon size={size} className={actualTheme === 'light' ? 'text-slate-400/60' : 'text-blue-300/40'} />
    </div>
  );
};

const DataFlowLine: React.FC<{ className?: string; delay?: number }> = ({ 
  className = '', 
  delay = 0 
}) => {
  const { actualTheme } = useTheme();
  
  return (
    <div 
      className={`absolute h-px animate-data-flow ${
        actualTheme === 'light' 
          ? 'bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent'
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

const PulsingOrb: React.FC<{ className?: string; delay?: number; size?: string }> = ({ 
  className = '', 
  delay = 0,
  size = 'w-4 h-4'
}) => {
  const { actualTheme } = useTheme();
  
  return (
    <div 
      className={`absolute ${size} rounded-full animate-pulse-glow ${
        actualTheme === 'light' ? 'bg-indigo-400/20' : 'bg-blue-500/20'
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

export const AnimatedBackground: React.FC = () => {
  const { actualTheme } = useTheme();
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${
      actualTheme === 'light' 
        ? 'bg-gradient-to-br from-white via-slate-50 to-indigo-50' 
        : 'bg-gradient-to-r from-black to-black'
    }`}>
      {/* Grid Pattern Overlay */}
      <div className={`absolute inset-0 ${actualTheme === 'light' ? 'opacity-5' : 'opacity-10'}`}>
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(${actualTheme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${actualTheme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating File Sharing Icons */}
      <FloatingIcon icon={Upload} className={`top-10 left-10 ${actualTheme === 'light' ? 'text-slate-400/40' : ''}`} delay={0} size={28} />
      <FloatingIcon icon={Download} className={`top-20 right-20 ${actualTheme === 'light' ? 'text-indigo-400/40' : ''}`} delay={2} size={24} />
      <FloatingIcon icon={Cloud} className={`top-32 left-1/4 ${actualTheme === 'light' ? 'text-blue-600/40' : ''}`} delay={4} size={32} />
      <FloatingIcon icon={ShareNetwork} className={`top-16 right-1/3 ${actualTheme === 'light' ? 'text-slate-500/40' : ''}`} delay={1} size={26} />
      <FloatingIcon icon={FileText} className={`bottom-32 left-16 ${actualTheme === 'light' ? 'text-indigo-400/40' : ''}`} delay={3} size={24} />
      <FloatingIcon icon={Database} className={`bottom-20 right-16 ${actualTheme === 'light' ? 'text-blue-600/40' : ''}`} delay={5} size={28} />
      <FloatingIcon icon={Database} className={`top-1/2 left-8 ${actualTheme === 'light' ? 'text-slate-400/40' : ''}`} delay={2.5} size={24} />
      <FloatingIcon icon={HardDrive} className={`top-1/3 right-8 ${actualTheme === 'light' ? 'text-indigo-500/40' : ''}`} delay={4.5} size={26} />

      {/* Security Icons */}
      <FloatingIcon icon={Shield} className={`top-24 left-1/3 ${actualTheme === 'light' ? 'text-slate-500/40' : ''}`} delay={1.5} size={30} />
      <FloatingIcon icon={Lock} className={`bottom-24 right-1/4 ${actualTheme === 'light' ? 'text-blue-600/40' : ''}`} delay={3.5} size={24} />
      <FloatingIcon icon={Key} className={`top-1/2 right-1/4 ${actualTheme === 'light' ? 'text-indigo-400/40' : ''}`} delay={0.5} size={22} />
      <FloatingIcon icon={CheckCircle} className={`bottom-16 left-1/3 ${actualTheme === 'light' ? 'text-slate-400/40' : ''}`} delay={4} size={26} />

      {/* Speed and Technology Icons */}
      <FloatingIcon icon={Lightning} className={`top-40 right-12 ${actualTheme === 'light' ? 'text-indigo-500/40' : ''}`} delay={2} size={28} />
      <FloatingIcon icon={WifiHigh} className={`bottom-40 left-12 ${actualTheme === 'light' ? 'text-blue-600/40' : ''}`} delay={1} size={24} />
      <FloatingIcon icon={Globe} className={`top-1/4 left-1/2 ${actualTheme === 'light' ? 'text-slate-500/40' : ''}`} delay={3} size={26} />
      <FloatingIcon icon={ArrowsDownUp} className={`bottom-1/3 right-1/3 ${actualTheme === 'light' ? 'text-indigo-400/40' : ''}`} delay={4.5} size={24} />

      {/* Data Flow Lines */}
      <DataFlowLine className={`top-1/4 left-0 w-1/3 rotate-12 ${actualTheme === 'light' ? 'bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent' : ''}`} delay={0} />
      <DataFlowLine className={`top-1/2 right-0 w-1/4 -rotate-12 ${actualTheme === 'light' ? 'bg-gradient-to-r from-transparent via-blue-600/20 to-transparent' : ''}`} delay={2} />
      <DataFlowLine className={`bottom-1/3 left-1/4 w-1/2 rotate-6 ${actualTheme === 'light' ? 'bg-gradient-to-r from-transparent via-slate-400/20 to-transparent' : ''}`} delay={4} />
      <DataFlowLine className={`top-3/4 right-1/4 w-1/3 -rotate-6 ${actualTheme === 'light' ? 'bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent' : ''}`} delay={1} />

      {/* Pulsing Orbs */}
      <PulsingOrb className={`top-12 left-1/2 ${actualTheme === 'light' ? 'bg-indigo-400/20' : 'bg-blue-500/20'}`} delay={0} size="w-6 h-6" />
      <PulsingOrb className={`bottom-12 right-1/2 ${actualTheme === 'light' ? 'bg-blue-600/20' : 'bg-blue-500/20'}`} delay={2} size="w-4 h-4" />
      <PulsingOrb className={`top-1/3 left-12 ${actualTheme === 'light' ? 'bg-slate-400/20' : 'bg-blue-500/20'}`} delay={1} size="w-5 h-5" />
      <PulsingOrb className={`bottom-1/4 right-12 ${actualTheme === 'light' ? 'bg-indigo-500/20' : 'bg-blue-500/20'}`} delay={3} size="w-3 h-3" />
      <PulsingOrb className={`top-2/3 right-1/3 ${actualTheme === 'light' ? 'bg-blue-600/20' : 'bg-blue-500/20'}`} delay={1.5} size="w-4 h-4" />

      {/* Large Background Orbs for Depth */}
      <div className={`absolute top-10 -left-20 w-40 h-40 rounded-full blur-3xl animate-pulse-slow ${
        actualTheme === 'light' ? 'bg-indigo-400/10' : 'bg-blue-500/10'
      }`} />
      <div className={`absolute bottom-10 -right-20 w-60 h-60 rounded-full blur-3xl animate-pulse-slow ${
        actualTheme === 'light' ? 'bg-blue-600/10' : 'bg-cyan-500/10'
      }`} style={{ animationDelay: '3s' }} />
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${
        actualTheme === 'light' ? 'bg-slate-400/5' : 'bg-blue-400/5'
      }`} style={{ animationDelay: '1.5s' }} />

      {/* Scanning Lines Effect */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent animate-pulse ${
          actualTheme === 'light' ? 'via-indigo-400/30' : 'via-blue-400/50'
        }`} />
        <div className={`absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent to-transparent animate-pulse ${
          actualTheme === 'light' ? 'via-blue-600/20' : 'via-blue-400/30'
        }`} />
      </div>

      {/* Particle Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              actualTheme === 'light' 
                ? i % 3 === 0 ? 'bg-indigo-400/20' : i % 3 === 1 ? 'bg-blue-600/20' : 'bg-slate-400/20'
                : 'bg-blue-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};