import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-black to-neutral-800 animate-gradient"></div>

      {/* Glow Effect */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Main Content */}
      <div className="relative text-center z-10 animate-fadeIn">
        <h1 className="text-7xl md:text-9xl font-extrabold text-white drop-shadow-lg animate-bounce-slow">
          404
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-400">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-black text-white font-semibold shadow-lg transform transition hover:scale-105 hover:shadow-blue-600/50"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
