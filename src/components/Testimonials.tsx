import React, { FC, useEffect, useMemo, useState } from "react";
import { Shield, Lock, Code, Folder, Users, Zap } from "lucide-react";

interface FileNode {
  x: number;
  y: number;
  z: number;
  type: "file" | "folder" | "user";
}

interface EarthLoaderProps {
  size?: number;
  meridians?: number;
  latitudes?: number;
  rotationSpeed?: number;
  lineColor?: string;
  showWireframe?: boolean;
  interactive?: boolean;
  reduceMotion?: boolean;
  fileCount?: number;
  fileColor?: string;
}

const EarthLoader: FC<EarthLoaderProps> = ({
  size = 300,
  meridians = 36,
  latitudes = 6,
  rotationSpeed = 20,
  lineColor = "#ffffff",
  showWireframe = true,
  interactive = true,
  reduceMotion = false,
  fileCount = 12,
  fileColor = "#00f",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [nodes, setNodes] = useState<FileNode[]>([]);

  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i + 1), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  // Generate random positions for files/folders/users
  useEffect(() => {
    const positions: FileNode[] = Array.from({ length: fileCount }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
      type: Math.random() > 0.7 ? "folder" : Math.random() > 0.5 ? "user" : "file",
    }));
    setNodes(positions);
  }, [fileCount]);

  // Function to convert 3D coords to 2D screen projection
  const project = (x: number, y: number, z: number) => {
    const scale = size / 2;
    return {
      left: `${scale + x * scale}px`,
      top: `${scale + y * scale}px`,
    };
  };

  return (
    <div className="relative mx-auto mb-12 perspective-[1200px]" style={{ width: size, height: size }}>
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
        {/* Wireframe meridians */}
        {showWireframe &&
          meridianArray.map((i) => (
            <div
              key={`meridian-${i}`}
              className="absolute w-full h-full rounded-full border border-opacity-30"
              style={{
                borderColor: lineColor,
                transform: `rotateX(${i * (360 / meridians)}deg)`,
              }}
            />
          ))}

        {/* Wireframe latitudes */}
        {showWireframe &&
          latitudeArray.map((i) => {
            const lineSize = size + 44 - i * 40;
            const offset = i * 20;
            return (
              <div
                key={`latitude-${i}`}
                className="absolute rounded-full border border-opacity-30"
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

        {/* Axis cross */}
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

        {/* Nodes: Files/Folders/Users */}
        {nodes.map((node, idx) => {
          const radius = size / 2 - 10;
          const x = node.x * radius;
          const y = node.y * radius;
          const z = node.z * radius;

          let bgColor = fileColor;
          if (node.type === "folder") bgColor = "#ff9800";
          else if (node.type === "user") bgColor = "#4caf50";

          return (
            <div
              key={`node-${idx}`}
              className="absolute w-4 h-4 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-125 transition-transform duration-300"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                backgroundColor: bgColor,
              }}
              title={node.type.toUpperCase()}
            >
              {node.type === "folder" && <Folder className="w-3 h-3 text-white" />}
              {node.type === "user" && <Users className="w-3 h-3 text-white" />}
            </div>
          );
        })}
      </div>

      {/* Widgets */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <SecurityWidget />
        <LockWidget />
        <CodeWidget />
        <GlobalShareWidget />
      </div>

      {/* Tailwind Animations */}
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

// --- Widget Components ---
const SecurityWidget: FC = () => (
  <div className="flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
    <Shield className="w-5 h-5 text-green-400" />
    <span className="text-white text-xs font-medium">Secure</span>
  </div>
);

const LockWidget: FC = () => (
  <div className="flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
    <Lock className="w-5 h-5 text-red-400" />
    <span className="text-white text-xs font-medium">Encrypted</span>
  </div>
);

const CodeWidget: FC = () => (
  <div className="flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
    <Code className="w-5 h-5 text-blue-400" />
    <span className="text-white text-xs font-medium">Code</span>
  </div>
);

const GlobalShareWidget: FC = () => (
  <div className="flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded-lg shadow-md">
    <Zap className="w-5 h-5 text-purple-400" />
    <span className="text-white text-xs font-medium">Global Share</span>
  </div>
);

export default EarthLoader;
