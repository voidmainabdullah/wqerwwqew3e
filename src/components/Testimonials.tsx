// Testimonials.tsx
import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

/* -------------------- EARTH WIDGET -------------------- */
const EarthWidget = () => {
  return (
    <StyledWrapper className="flex justify-center items-center py-12">
      <div className="sphere">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={`m-${i}`} className="meridian" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`l-${i}`} className="latitude" />
        ))}
        <div className="axis" />
        <div className="axis" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .sphere {
    width: 260px;
    height: 260px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transform-style: preserve-3d;
    border-radius: 50%;
    animation: rotate 12s linear infinite;
  }

  .sphere .meridian {
    position: absolute;
    width: 260px;
    height: 260px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform-style: preserve-3d;
  }

  ${Array.from({ length: 36 })
    .map(
      (_, i) =>
        `.sphere .meridian:nth-child(${i + 1}) { transform: rotateX(${
          10 * i
        }deg); }`
    )
    .join("\n")}

  .sphere .latitude {
    position: absolute;
    width: 260px;
    height: 260px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transform: rotateY(90deg);
    border-radius: 50%;
  }

  .sphere .axis {
    position: absolute;
    width: 520px;
    height: 1.5px;
    top: 50%;
    left: -130px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
  }

  .sphere .axis + .axis {
    transform: rotateX(90deg);
  }

  @keyframes rotate {
    0% {
      transform: rotateX(30deg) rotateY(0deg) rotateZ(60deg);
    }
    100% {
      transform: rotateX(30deg) rotateY(360deg) rotateZ(60deg);
    }
  }
`;

/* -------------------- TESTIMONIALS SECTION -------------------- */
const testimonials = [
  {
    name: "Sarah Williams",
    role: "Creative Director, Visionary Studio",
    quote:
      "SkieShare transformed how our teams share design files. It feels seamless, private, and beautifully minimal — exactly how sharing should be.",
    image:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100&h=100&fit=crop",
  },
  {
    name: "David Liu",
    role: "Product Manager, NovaCloud",
    quote:
      "The simplicity and precision of this platform mirrors Apple’s design philosophy. Sharing files securely has never felt this elegant.",
    image:
      "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop",
  },
  {
    name: "Amira Khan",
    role: "Developer, OrbitWorks",
    quote:
      "A platform that doesn’t get in your way — just pure, focused file sharing with zero distractions. Perfect for modern teams.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  {
    name: "Lucas Smith",
    role: "Founder, BlackBox Agency",
    quote:
      "Feels like the future of collaboration. Every pixel is intentional, and performance is flawless.",
    image:
      "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=100&h=100&fit=crop",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-black text-white w-full flex flex-col items-center py-24">
      {/* Earth Widget */}
      <EarthWidget />

      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-semibold text-center mt-10 mb-6 tracking-tight"
      >
        Trusted by Visionaries Worldwide
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-gray-400 text-center max-w-xl mb-16"
      >
        Real experiences from teams who value privacy, clarity, and elegance in
        their workflow.
      </motion.p>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-12 max-w-7xl">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="rounded-2xl bg-neutral-900/70 backdrop-blur-xl border border-white/10 p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-16 h-16 rounded-full mb-4 object-cover border border-white/20"
            />
            <p className="text-gray-300 italic mb-4 leading-relaxed">
              “{t.quote}”
            </p>
            <h4 className="font-semibold text-white">{t.name}</h4>
            <span className="text-sm text-gray-500">{t.role}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
