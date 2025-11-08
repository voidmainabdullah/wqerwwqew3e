import React, { FC, useMemo, useState } from "react";
import styled, { keyframes, css } from "styled-components";

/**
 * Props interface for EarthLoader component
 */
interface EarthLoaderProps {
  /** Size of the Earth widget in pixels */
  size?: number;
  /** Number of meridians (vertical lines) */
  meridians?: number;
  /** Number of latitudes (horizontal rings) */
  latitudes?: number;
  /** Animation speed in seconds per rotation */
  rotationSpeed?: number;
  /** Base color for lines */
  lineColor?: string;
  /** Toggle wireframe visibility */
  showWireframe?: boolean;
  /** Enable interactive hover effects */
  interactive?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Reduced motion preference support */
  reduceMotion?: boolean;
}

/**
 * Keyframes for Earth rotation
 */
const spin = keyframes`
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
`;

/**
 * Styled container with 3D perspective
 */
const EarthContainer = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  margin: 0 auto;
  perspective: 1200px;
`;

/**
 * Styled Earth sphere with rotation animation
 */
const EarthSphere = styled.div<{
  rotationSpeed: number;
  reduceMotion?: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transform-style: preserve-3d;
  ${({ reduceMotion, rotationSpeed }) =>
    !reduceMotion &&
    css`
      animation: ${spin} ${rotationSpeed}s linear infinite;
    `}
`;

/**
 * Styled meridian and latitude lines
 */
const EarthLine = styled.div<{
  transformStyle: string;
  size?: number;
  top?: number;
  left?: number;
  lineColor: string;
}>`
  position: absolute;
  border: 1px solid ${({ lineColor }) => lineColor};
  border-radius: 50%;
  width: ${({ size }) => (size ? `${size}px` : "100%")};
  height: ${({ size }) => (size ? `${size}px` : "100%")};
  top: ${({ top }) => (top ? `${top}px` : "0")};
  left: ${({ left }) => (left ? `${left}px` : "0")};
  transform: ${({ transformStyle }) => transformStyle};
  pointer-events: none;
  opacity: 0.8;
  transition: transform 0.3s ease;
`;

/**
 * Styled axis lines
 */
const EarthAxis = styled.div<{ rotateX?: number; lineColor: string }>`
  position: absolute;
  width: 600px;
  height: 2px;
  background: linear-gradient(
    to left,
    transparent,
    ${({ lineColor }) => lineColor},
    transparent
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) ${({ rotateX }) => rotateX && `rotateX(${rotateX}deg)`};
  opacity: 0.6;
`;

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

  // Memoized arrays for meridians and latitudes
  const meridianArray = useMemo(() => Array.from({ length: meridians }, (_, i) => i + 1), [meridians]);
  const latitudeArray = useMemo(() => Array.from({ length: latitudes }, (_, i) => i), [latitudes]);

  return (
    <EarthContainer size={size} aria-label={ariaLabel}>
      <EarthSphere
        rotationSpeed={rotationSpeed}
        reduceMotion={reduceMotion}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        {showWireframe &&
          meridianArray.map((i) => (
            <EarthLine
              key={`meridian-${i}`}
              transformStyle={`rotateX(${i * (360 / meridians)}deg)`}
              lineColor={lineColor}
            />
          ))}

        {showWireframe &&
          latitudeArray.map((i) => {
            const lineSize = size + 44 - i * 40;
            const offset = i * 20;
            return (
              <EarthLine
                key={`latitude-${i}`}
                size={lineSize}
                top={offset}
                left={offset}
                transformStyle="rotateY(90deg)"
                lineColor={lineColor}
              />
            );
          })}

        {/* Axis */}
        <EarthAxis lineColor={lineColor} />
        <EarthAxis lineColor={lineColor} rotateX={90} />
      </EarthSphere>
    </EarthContainer>
  );
};

export default EarthLoader;

/**
 * TODO: Unit Tests
 * ----------------
 * - Test rendering with default props
 * - Test custom sizes and colors
 * - Test hover interactions when interactive is true
 * - Test reduced motion disables animation
 * - Accessibility label is present
 */
