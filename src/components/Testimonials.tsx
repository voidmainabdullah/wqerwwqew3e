import React, { FC, useMemo, useState, useEffect } from "react";
import { ShieldCheckIcon, LockClosedIcon, CodeBracketIcon } from "@heroicons/react/24/outline";

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
  /** Number of animated file dots around globe */
  fileCount?: number;
  /** File dot color */
  fileColor?: string;
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
  fileCount = 8,
  fileColor = "#00f",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [filePositions, setFilePositions] = useState<{ x: number; y: number; z: number }[]>([]);

  // Meridians & latitudes arrays
  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i + 1), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  // Initialize file dots positions randomly around globe
  useEffect(() => {
    const positions = Array.from({ length: fileCount }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
    }));
    setFilePositions(positions);
  }, [fileCount]);

  return (
    <div
      className="relative mx-auto mb-12 perspective-[1200px]"
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
    >
      {/* Earth Sphere */}
      <div
        className={`relative w-full h-full rounded-full ${!reduceMotion ? "animate-spin" : ""}`}
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          animation: !reduceMotion ? `spin ${rotationSpeed}s linear infinite` : undefined,
        }}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        {/* Wireframe Meridians */}
        {showWireframe &&
          meridianArray.map((i) => (
            <div
              key={`meridian-${i}`}
              className="absolute w-full h-full rounded-full border"
              style={{
                borderColor: lineColor,
                transform: `rotateX(${i * (360 / meridians)}deg)`,
              }}
            />
          ))}

        {/* Wireframe Latitudes */}
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

        {/* Axis Lines */}
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

        {/* Animated File Dots */}
        {filePositions.map((pos, idx) => {
          const radius = size / 2 - 10;
          const x = pos.x * radius;
          const y = pos.y * radius;
          const z = pos.z * radius;
          return (
            <div
              key={`file-${idx}`}
              className="absolute w-3 h-3 rounded-full bg-blue-500 shadow-lg"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                animation: `fileOrbit ${5 + idx}s linear infinite`,
                backgroundColor: fileColor,
              }}
            />
          );
        })}
      </div>

      {/* Security Widget */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
        <span className="text-white text-xs font-medium">Secure</span>
      </div>

      {/* Lock Widget */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
        <LockClosedIcon className="w-5 h-5 text-red-400" />
        <span className="text-white text-xs font-medium">Encrypted</span>
      </div>

      {/* Code Widget */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
        <CodeBracketIcon className="w-5 h-5 text-blue-400" />
        <span className="text-white text-xs font-medium">Code</span>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @keyframes fileOrbit {
            0% { transform: translate3d(var(--x), var(--y), var(--z)) rotateY(0deg); }
            100% { transform: translate3d(var(--x), var(--y), var(--z)) rotateY(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EarthLoader;

