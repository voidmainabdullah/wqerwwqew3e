import React, { FC, useMemo, useState } from "react";
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

  const meridianArray = useMemo(
    () => Array.from({ length: meridians }, (_, i) => i),
    [meridians]
  );

  const latitudeArray = useMemo(
    () => Array.from({ length: latitudes }, (_, i) => i),
    [latitudes]
  );

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
  };

  return (
    <div
      className="mx-auto my-12 perspective-[1500px]"
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
    >
      <div
        className={`relative w-full h-full rounded-full ${!reduceMotion ? "animate-spin" : ""}`}
        style={earthStyle}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        {/* Meridians */}
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

        {/* Latitudes */}
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
          style={{
            background: `linear-gradient(to left, transparent, ${lineColor}, transparent)`,
          }}
        />
        <div
          className="absolute h-[2px] w-[120%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-90"
          style={{
            background: `linear-gradient(to left, transparent, ${lineColor}, transparent)`,
          }}
        />

        {/* Optional Security/Encryption Icons */}
        {isHovered && (
          <div className="absolute top-2 left-2 flex gap-2">
            <Shield size={24} color={lineColor} />
            <Lock size={24} color={lineColor} />
            <Code size={24} color={lineColor} />
          </div>
        )}
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
