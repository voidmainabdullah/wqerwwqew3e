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

const EarthLoader: FC<EarthLoaderProps> = ({
  size = 300,
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

  // Update orbiting angle
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setAngle((prev) => prev + 1);
    }, 40); // smooth orbit speed
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
  };

  return (
    <div className="mx-auto my-12 relative perspective-[1500px]" style={{ width: size, height: size }} aria-label={ariaLabel}>
      {/* Earth */}
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
              style={{
                borderColor: lineColor,
                transform: `rotateY(${(i * 360) / meridians}deg)`,
              }}
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

        {/* Axis Cross */}
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

        {/* Orbiting Words - 3D depth effect */}
        {orbitingWords.map((word, i) => {
          const wordAngle = ((angle + (i * 360) / orbitingWords.length) % 360);
          const radius = size / 2 + 50; // distance from center
          const rad = (wordAngle * Math.PI) / 180;

          const x = radius * Math.cos(rad);
          const z = radius * Math.sin(rad); // Z used for opacity

          // Back words are more transparent
          const opacity = z < 0 ? 0.1 : 1;

          const scale = z < 0 ? 0.6 : 1; // small scale for back words

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
                textShadow: "1px 1px 8px rgba(0,0,0,0.7)",
                transition: "opacity 0.2s, transform 0.2s",
              }}
            >
              {word}
            </div>
          );
        })}
      </div>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EarthLoader;
