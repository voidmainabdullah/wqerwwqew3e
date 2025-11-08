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
  meridians = 24,
  latitudes = 8,
  rotationSpeed = 30,
  lineColor = "rgba(255, 255, 255, 0.15)",
  showWireframe = true,
  ariaLabel = "3D rotating Earth",
  reduceMotion = false,
}) => {
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);

  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  // Testimonials hover pause
  useEffect(() => {
    const el = testimonialRef.current;
    if (!el) return;
    el.style.animationPlayState = isTestimonialHovered ? "paused" : "running";
  }, [isTestimonialHovered]);

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
  };

  return (
    <div className="relative w-full bg-black overflow-hidden py-24 md:py-32">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent blur-3xl -z-10"></div>

      {/* Earth Globe Section */}
      <div className="mx-auto relative perspective-[1500px] mb-24" style={{ width: size, height: size }}>
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

          {/* Subtle Center Glow */}
          <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl scale-75" />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Join thousands of professionals who rely on SkieShare for secure, efficient file sharing.
          </p>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsTestimonialHovered(true)}
          onMouseLeave={() => setIsTestimonialHovered(false)}
        >
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 w-full">
            <div
              ref={testimonialRef}
              className="flex gap-6 animate-scroll"
              style={{
                animationPlayState: isTestimonialHovered ? "paused" : "running",
              }}
            >
              {testimonialsData.concat(testimonialsData).map((t, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-80 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] group"
                >
                  <div className="mb-6">
                    <svg className="w-8 h-8 text-white/30 group-hover:text-white/40 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-base leading-relaxed mb-6 text-white/90">
                    {t.message}
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/50">{t.role}</p>
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
