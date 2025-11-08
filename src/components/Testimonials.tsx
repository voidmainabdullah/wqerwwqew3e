import React, { FC, useMemo, useState, useEffect } from "react";
import { Shield, Lock, Code } from "lucide-react";

interface EarthLoaderProps {
  size?: number;
  meridians?: number;
  latitudes?: number;
  rotationSpeed?: number;
  lineColor?: string;
  showWireframe?: boolean;
  interactive?: boolean;
  ariaLabel?: string;
  reduceMotion?: boolean;
}

const orbitingWords = ["E25", "Links", "Teams", "Privacy", "Control", "Global"];

const testimonialsData = [
  { name: "Ali Khan", role: "Designer", message: "SkieShare made our file collaboration seamless!" },
  { name: "Sara Ahmed", role: "Project Manager", message: "Amazing speed and secure file sharing." },
  { name: "Hassan R.", role: "Developer", message: "AI categorization saves hours of work." },
  { name: "Zoya L.", role: "Marketer", message: "Global sharing feature is next-level!" },
  { name: "Omar F.", role: "Team Lead", message: "Clean UI, fast uploads, very reliable." },
  { name: "Fatima N.", role: "Analyst", message: "Loved the security & encryption features." },
  { name: "Bilal S.", role: "Engineer", message: "Collaboration across teams became effortless." },
  { name: "Hina K.", role: "Designer", message: "Modern and professional design, very Apple-like!" },
  { name: "Usman Q.", role: "Consultant", message: "Everything we need for enterprise-level sharing." },
];

const SkieShareSection: FC<EarthLoaderProps> = ({
  size = 350,
  meridians = 36,
  latitudes = 6,
  rotationSpeed = 20,
  lineColor = "#ffffff",
  showWireframe = true,
  interactive = true,
  ariaLabel = "3D rotating Earth",
  reduceMotion = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [angle, setAngle] = useState(0);

  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  // Orbiting angle update
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => setAngle((prev) => prev + 1), 40);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
  };

  return (
    <div className="relative w-full bg-black overflow-hidden py-24">
      {/* Glowing Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-700/20 to-white/5 blur-3xl -z-10"></div>

      {/* Globe Section */}
      <div className="mx-auto relative perspective-[1500px]" style={{ width: size, height: size }}>
        <div
          className={`relative w-full h-full rounded-full ${!reduceMotion ? "animate-spin" : ""}`}
          style={earthStyle}
          onMouseEnter={() => interactive && setIsHovered(true)}
          onMouseLeave={() => interactive && setIsHovered(false)}
        >
          {/* Wireframe */}
          {showWireframe &&
            meridianArray.map((i) => (
              <div
                key={`meridian-${i}`}
                className="absolute w-full h-full rounded-full border border-solid"
                style={{ borderColor: lineColor, transform: `rotateY(${(i * 360) / meridians}deg)` }}
              />
            ))}

          {showWireframe &&
            latitudeArray.map((i) => {
              const ringSize = size * (1 - i / (latitudes * 1.5));
              const offset = (size - ringSize) / 2;
              return (
                <div
                  key={`latitude-${i}`}
                  className="absolute rounded-full border border-solid"
                  style={{
                    width: `${ringSize}px`,
                    height: `${ringSize}px`,
                    top: `${offset}px`,
                    left: `${offset}px`,
                    borderColor: lineColor,
                    transform: "rotateX(90deg)",
                  }}
                />
              );
            })}

          {/* Axis */}
          <div
            className="absolute h-[2px] w-[120%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ background: `linear-gradient(to left, transparent, ${lineColor}, transparent)` }}
          />
          <div
            className="absolute h-[2px] w-[120%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-90"
            style={{ background: `linear-gradient(to left, transparent, ${lineColor}, transparent)` }}
          />

          {/* Hover Icons */}
          {isHovered && (
            <div className="absolute top-2 left-2 flex gap-2">
              <Shield size={24} color={lineColor} />
              <Lock size={24} color={lineColor} />
              <Code size={24} color={lineColor} />
            </div>
          )}

          {/* Orbiting Words */}
          {orbitingWords.map((word, i) => {
            const wordAngle = ((angle + (i * 360) / orbitingWords.length) % 360);
            const radius = size / 2 + 50;
            const rad = (wordAngle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const z = radius * Math.sin(rad);

            const opacity = z < 0 ? 0.1 : 1;
            const scale = z < 0 ? 0.6 : 1;

            return (
              <div
                key={`orbit-word-${i}`}
                className="absolute text-white font-bold select-none pointer-events-none"
                style={{
                  left: `${size / 2 + x - 25}px`,
                  top: `${size / 2 - 10}px`,
                  transform: `scale(${scale})`,
                  opacity,
                  fontSize: "1.2rem",
                  textShadow: "1px 1px 12px rgba(0,0,0,0.7)",
                  transition: "opacity 0.2s, transform 0.2s",
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-24 relative overflow-hidden">
        <h2 className="text-3xl text-white font-extrabold text-center mb-8">Testimonials</h2>
        <div className="flex gap-6 w-full overflow-x-hidden relative">
          <div className="flex gap-6 animate-scroll">
            {testimonialsData.map((testimonial, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-72 p-6 bg-black/70 border border-white/20 rounded-2xl shadow-lg text-white"
              >
                <p className="text-sm italic mb-4">"{testimonial.message}"</p>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll {
            display: flex;
            animation: scroll 40s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default SkieShareSection;
