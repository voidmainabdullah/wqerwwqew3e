import React, { FC, useMemo, useState } from "react";

interface EarthLoaderProps {
  /** Size of the Earth in pixels */
  size?: number;
  /** Number of meridians (vertical lines) */
  meridians?: number;
  /** Number of latitudes (horizontal rings) */
  latitudes?: number;
  /** Rotation speed in seconds */
  rotationSpeed?: number;
  /** Line color */
  lineColor?: string;
  /** Show wireframe */
  showWireframe?: boolean;
  /** Enable hover interactions */
  interactive?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Reduced motion support */
  reduceMotion?: boolean;
}

const EarthLoader: FC<EarthLoaderProps> = ({
  size = 256,
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
    () => Array.from({ length: meridians }, (_, i) => i + 1),
    [meridians]
  );
  const latitudeArray = useMemo(
    () => Array.from({ length: latitudes }, (_, i) => i),
    [latitudes]
  );

  const earthStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    animation: !reduceMotion
      ? `spin ${rotationSpeed}s linear infinite`
      : undefined,
    transformStyle: "preserve-3d",
  };

  return (
    <div
      className="mx-auto mb-12 perspective-[1200px]"
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
    >
      <div
        className={`relative w-full h-full rounded-full ${
          !reduceMotion ? "animate-spin" : ""
        }`}
        style={earthStyle}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        {/* Meridians */}
        {showWireframe &&
          meridianArray.map((i) => (
            <div
              key={`meridian-${i}`}
              className={`absolute w-full h-full rounded-full border`}
              style={{
                borderColor: lineColor,
                transform: `rotateX(${i * (360 / meridians)}deg)`,
              }}
            />
          ))}

        {/* Latitudes */}
        {showWireframe &&
          latitudeArray.map((i) => {
            const lineSize = size + 44 - i * 40;
            const offset = i * 20;
            return (
              <div
                key={`latitude-${i}`}
                className="absolute rounded-full border"
                style={{
                  width: `${lineSize}px`,
                  height: `${lineSize}px`,
                  top: `${offset}px`,
                  left: `${offset}px`,
                  borderColor: lineColor,
                  transform: "rotateY(90deg)",
                }}
              />
            );
          })}

        {/* Axis */}
        <div
          className="absolute h-[2px] w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `linear-gradient(to left, transparent, ${lineColor}, transparent)`,
          }}
        />
        <div
          className="absolute h-[2px] w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `linear-gradient(to left, transparent, ${lineColor}, transparent)`,
            transform: `translate(-50%, -50%) rotateX(90deg)`,
          }}
        />
      </div>

      {/* Tailwind Animation Keyframes */}
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
