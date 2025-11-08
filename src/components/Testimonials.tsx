import React from "react";

const EarthLoader = () => {
  const meridians = Array.from({ length: 36 }, (_, i) => i + 1);
  const latitudes = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="w-64 h-64 mx-auto mb-12 perspective-[1000px]">
      <div className="relative w-full h-full rounded-full animate-spin-slow [transform-style:preserve-3d]">
        {/* Meridians */}
        {meridians.map((i) => (
          <div
            key={i}
            className="absolute w-full h-full border border-white rounded-full"
            style={{ transform: `rotateX(${i * 10}deg)` }}
          />
        ))}

        {/* Latitudes */}
        {latitudes.map((i) => {
          const size = 300 - i * 40;
          const offset = i * 20;
          return (
            <div
              key={i}
              className="absolute border border-white rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${offset}px`,
                left: `${offset}px`,
                transform: "rotateY(90deg)",
              }}
            />
          );
        })}

        {/* Axis */}
        <div className="absolute w-[600px] h-[2px] bg-gradient-to-l from-transparent via-white to-transparent top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[600px] h-[2px] bg-gradient-to-l from-transparent via-white to-transparent top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 [rotateX:90deg]" />
      </div>
    </div>
  );
};

export default EarthLoader;
