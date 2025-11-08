import React from "react";

const testimonials = [
  {
    name: "John Doe",
    title: "CEO, Company",
    message:
      "This platform completely transformed how we share files. Super sleek and intuitive!",
  },
  {
    name: "Jane Smith",
    title: "Product Manager",
    message:
      "Incredible experience. The UI is minimal, fast, and Apple-level clean.",
  },
  {
    name: "Alice Johnson",
    title: "Designer",
    message:
      "I love the black & white aesthetic. Everything feels professional and premium.",
  },
];

const EarthLoader = () => {
  return (
    <div className="w-64 h-64 relative mx-auto mb-12 perspective-3d">
      {/* Earth sphere */}
      <div className="w-full h-full rounded-full relative animate-spin-slow transform-style-preserve-3d">
        {/* Meridians */}
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full border border-black rounded-full"
            style={{ transform: `rotateX(${(i + 1) * 10}deg)` }}
          />
        ))}
        {/* Latitudes */}
        {[...Array(6)].map((_, i) => {
          const size = 300 - i * 40;
          const offset = i * 20;
          return (
            <div
              key={i}
              className="absolute border border-black rounded-full"
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
        <div className="absolute w-[600px] h-[2px] bg-gradient-to-l from-transparent via-black to-transparent top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[600px] h-[2px] bg-gradient-to-l from-transparent via-black to-transparent top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rotate-x-90" />
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <div className="bg-black text-white py-20">
      <EarthLoader />
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <p className="text-sm mb-4">{t.message}</p>
            <h3 className="font-semibold">{t.name}</h3>
            <span className="text-gray-400 text-xs">{t.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
