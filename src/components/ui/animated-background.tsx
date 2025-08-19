import React from 'react';
import { 
  Upload, 
  Download, 
  Cloud, 
  Shield, 
  Lock, 
  Zap, 
  FileText, 
  Share2, 
  Database,
  Wifi,
  Server,
  HardDrive,
  Globe,
  Key,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';

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
  return (
    <div 
      className={`absolute opacity-20 animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <Icon size={size} className="text-blue-300/40" />
    </div>
  );
};

const DataFlowLine: React.FC<{ className?: string; delay?: number }> = ({ 
  className = '', 
  delay = 0 
}) => {
  return (
    <div 
      className={`absolute h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-data-flow ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

const PulsingOrb: React.FC<{ className?: string; delay?: number; size?: string }> = ({ 
  className = '', 
  delay = 0,
  size = 'w-4 h-4'
}) => {
  return (
    <div 
      className={`absolute ${size} bg-blue-500/20 rounded-full animate-pulse-glow ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-blue-600 to-black">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating File Sharing Icons */}
      <FloatingIcon icon={Upload} className="top-10 left-10" delay={0} size={28} />
      <FloatingIcon icon={Download} className="top-20 right-20" delay={2} size={24} />
      <FloatingIcon icon={Cloud} className="top-32 left-1/4" delay={4} size={32} />
      <FloatingIcon icon={Share2} className="top-16 right-1/3" delay={1} size={26} />
      <FloatingIcon icon={FileText} className="bottom-32 left-16" delay={3} size={24} />
      <FloatingIcon icon={Database} className="bottom-20 right-16" delay={5} size={28} />
      <FloatingIcon icon={Server} className="top-1/2 left-8" delay={2.5} size={24} />
      <FloatingIcon icon={HardDrive} className="top-1/3 right-8" delay={4.5} size={26} />

      {/* Security Icons */}
      <FloatingIcon icon={Shield} className="top-24 left-1/3" delay={1.5} size={30} />
      <FloatingIcon icon={Lock} className="bottom-24 right-1/4" delay={3.5} size={24} />
      <FloatingIcon icon={Key} className="top-1/2 right-1/4" delay={0.5} size={22} />
      <FloatingIcon icon={CheckCircle} className="bottom-16 left-1/3" delay={4} size={26} />

      {/* Speed and Technology Icons */}
      <FloatingIcon icon={Zap} className="top-40 right-12" delay={2} size={28} />
      <FloatingIcon icon={Wifi} className="bottom-40 left-12" delay={1} size={24} />
      <FloatingIcon icon={Globe} className="top-1/4 left-1/2" delay={3} size={26} />
      <FloatingIcon icon={ArrowUpDown} className="bottom-1/3 right-1/3" delay={4.5} size={24} />

      {/* Data Flow Lines */}
      <DataFlowLine className="top-1/4 left-0 w-1/3 rotate-12" delay={0} />
      <DataFlowLine className="top-1/2 right-0 w-1/4 -rotate-12" delay={2} />
      <DataFlowLine className="bottom-1/3 left-1/4 w-1/2 rotate-6" delay={4} />
      <DataFlowLine className="top-3/4 right-1/4 w-1/3 -rotate-6" delay={1} />

      {/* Pulsing Orbs */}
      <PulsingOrb className="top-12 left-1/2" delay={0} size="w-6 h-6" />
      <PulsingOrb className="bottom-12 right-1/2" delay={2} size="w-4 h-4" />
      <PulsingOrb className="top-1/3 left-12" delay={1} size="w-5 h-5" />
      <PulsingOrb className="bottom-1/4 right-12" delay={3} size="w-3 h-3" />
      <PulsingOrb className="top-2/3 right-1/3" delay={1.5} size="w-4 h-4" />

      {/* Large Background Orbs for Depth */}
      <div className="absolute top-10 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* Scanning Lines Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-scan-horizontal" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-scan-vertical" />
      </div>

      {/* Particle Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};