import React, { FC, useMemo, useState, useEffect, useRef } from "react";

interface EarthLoaderProps {
  size?: number;
  meridians?: number;
  latitudes?: number;
  rotationSpeed?: number;
  lineColor?: string;
  showWireframe?: boolean;
  ariaLabel?: string;
  reduceMotion?: boolean;
}

// Global locations for connection visualization
const globalLocations = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, angle: 180 },
  { name: "New York", lat: 40.7128, lng: -74.0060, angle: 240 },
  { name: "London", lat: 51.5074, lng: -0.1278, angle: 300 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, angle: 60 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, angle: 120 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, angle: 0 },
];

const testimonialsData = [
  {
    name: "Ali Khan",
    role: "Designer",
    message: "SkieShare made our file collaboration seamless!",
  },
  {
    name: "Sara Ahmed",
    role: "Project Manager",
    message: "Amazing speed and secure file sharing.",
  },
  {
    name: "Hassan R.",
    role: "Developer",
    message: "AI categorization saves hours of work.",
  },
  {
    name: "Zoya L.",
    role: "Marketer",
    message: "Global sharing feature is next-level!",
  },
  {
    name: "Omar F.",
    role: "Team Lead",
    message: "Clean UI, fast uploads, very reliable.",
  },
  {
    name: "Fatima N.",
    role: "Analyst",
    message: "Loved the security & encryption features.",
  },
  {
    name: "Bilal S.",
    role: "Engineer",
    message: "Collaboration across teams became effortless.",
  },
  {
    name: "Hina K.",
    role: "Designer",
    message: "Modern and professional design, very Apple-like!",
  },
  {
    name: "Usman Q.",
    role: "Consultant",
    message: "Everything we need for enterprise-level sharing.",
  },
];

const SkieShareSection: FC<EarthLoaderProps> = ({
  size = 400,
  meridians = 20,
  latitudes = 10,
  rotationSpeed = 40,
  lineColor = "rgba(255, 255, 255, 0.12)",
  showWireframe = true,
  ariaLabel = "3D rotating Earth showing global connectivity",
  reduceMotion = false,
}) => {
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const [activeConnections, setActiveConnections] = useState<number[]>([]);

  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  // Testimonials hover pause
  useEffect(() => {
    const el = testimonialRef.current;
    if (!el) return;
    el.style.animationPlayState = isTestimonialHovered ? "paused" : "running";
  }, [isTestimonialHovered]);

  // Animate connection lines
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      const randomConnections = Array.from(
        { length: 3 },
        () => Math.floor(Math.random() * globalLocations.length)
      );
      setActiveConnections(randomConnections);
    }, 3000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
  };

  return (
    <div className="relative w-full bg-black overflow-x-hidden py-16 md:py-24 lg:py-32 px-4">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent blur-3xl -z-10" />

      {/* Section Title */}
      <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
          Global File Sharing Network
        </h2>
        <p className="text-base md:text-lg text-white/60">
          Securely share files across continents with enterprise-grade encryption and lightning-fast delivery.
        </p>
      </div>

      {/* Earth Globe Section */}
      <div className="mx-auto relative perspective-[1500px] mb-16 md:mb-24 flex justify-center" style={{ maxWidth: size }}>
        <div
          className="relative w-full h-full rounded-full"
          style={earthStyle}
          aria-label={ariaLabel}
        >
          {/* Wireframe Meridians */}
          {showWireframe &&
            meridianArray.map((i) => (
              <div
                key={`meridian-${i}`}
                className="absolute w-full h-full rounded-full border"
                style={{
                  borderColor: lineColor,
                  borderWidth: '1px',
                  transform: `rotateY(${(i * 360) / meridians}deg)`,
                }}
              />
            ))}

          {/* Wireframe Latitudes */}
          {showWireframe &&
            latitudeArray.map((i) => {
              const ringSize = size * (1 - i / (latitudes * 1.2));
              const offset = (size - ringSize) / 2;
              return (
                <div
                  key={`latitude-${i}`}
                  className="absolute rounded-full border"
                  style={{
                    width: `${ringSize}px`,
                    height: `${ringSize}px`,
                    top: `${offset}px`,
                    left: `${offset}px`,
                    borderColor: lineColor,
                    borderWidth: '1px',
                    transform: "rotateX(90deg)",
                  }}
                />
              );
            })}

          {/* Global Location Markers */}
          {globalLocations.map((location, i) => {
            const angle = location.angle + (reduceMotion ? 0 : 0);
            const radius = size / 2;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad) * 0.5; // Flatten for 3D effect

            return (
              <div
                key={`location-${i}`}
                className="absolute"
                style={{
                  left: `${size / 2 + x}px`,
                  top: `${size / 2 + y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Pulsing dot */}
                <div className="relative">
                  <div 
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    }}
                  />
                  {/* Ripple effect */}
                  <div 
                    className="absolute inset-0 w-2 h-2 bg-white/30 rounded-full animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                </div>
              </div>
            );
          })}

          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            {activeConnections.map((startIdx, i) => {
              const endIdx = (startIdx + 1) % globalLocations.length;
              const start = globalLocations[startIdx];
              const end = globalLocations[endIdx];
              
              const radius = size / 2;
              const startRad = (start.angle * Math.PI) / 180;
              const endRad = (end.angle * Math.PI) / 180;
              
              const x1 = radius + radius * Math.cos(startRad);
              const y1 = radius + radius * Math.sin(startRad) * 0.5;
              const x2 = radius + radius * Math.cos(endRad);
              const y2 = radius + radius * Math.sin(endRad) * 0.5;

              return (
                <line
                  key={`connection-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                  style={{ animationDuration: '1.5s' }}
                />
              );
            })}
          </svg>

          {/* Subtle Center Glow */}
          <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl scale-75" />
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-24 px-4">
        {[
          { label: 'Global Reach', value: '180+ Countries' },
          { label: 'Active Users', value: '2M+' },
          { label: 'Files Shared', value: '50M+' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-white/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials Section */}
      <div className="w-full px-4">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-base md:text-lg text-white/60">
            Join thousands of professionals who rely on SkieShare for secure, efficient file sharing.
          </p>
        </div>

        <div
          className="relative overflow-hidden py-8 md:py-12"
          onMouseEnter={() => setIsTestimonialHovered(true)}
          onMouseLeave={() => setIsTestimonialHovered(false)}
        >
          {/* Skie Shadow Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "url('/skie.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            filter: 'blur(0.5px)',
          }} />
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 md:gap-6 w-full relative z-10">
            <div
              ref={testimonialRef}
              className="flex gap-4 md:gap-6 animate-scroll"
              style={{
                animationPlayState: isTestimonialHovered ? "paused" : "running",
              }}
            >
              {testimonialsData.concat(testimonialsData).map((t, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-72 md:w-80 p-6 md:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] group"
                >
                  <div className="mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white/30 group-hover:text-white/40 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed mb-4 md:mb-6 text-white/90">
                    {t.message}
                  </p>
                  <div className="border-t border-white/10 pt-3 md:pt-4">
                    <p className="font-semibold text-white text-sm md:text-base">{t.name}</p>
                    <p className="text-xs md:text-sm text-white/50">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @keyframes scroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            display: flex;
            animation: scroll 50s linear infinite;
            will-change: transform;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-scroll {
              animation: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SkieShareSection;
