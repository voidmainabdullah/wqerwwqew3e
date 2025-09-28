import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from '@/components/ui/animated-background';

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
      {/* Enhanced Animated Background */}
      <AnimatedBackground />
      
      {/* Animated Background */}
      <div className="absolute inset-0 animate-gradient"></div>

      {/* Glow Effect */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Flying File-Sharing Icons with Material Icons */}
      <span className="material-icons md-48 icon-fly left-10 top-20 text-blue-500/30">cloud</span>
      <span className="material-icons md-48 icon-fly left-1/3 top-40 text-gray-400/30 delay-1000">upload</span>
      <span className="material-icons md-48 icon-fly right-20 top-60 text-blue-400/30 delay-500">link</span>
      <span className="material-icons md-48 icon-fly left-1/4 bottom-20 text-gray-500/30 delay-2000">description</span>
      <span className="material-icons md-48 icon-fly right-1/3 bottom-40 text-blue-600/30 delay-1500">security</span>

      {/* Main Content */}
      <div className="relative text-center z-10 animate-fadeIn">
        <h1 className="text-7xl md:text-9xl font-heading font-extrabold text-white drop-shadow-lg animate-bounce-slow">
          404
        </h1>
        <p className="mt-4 text-xl md:text-2xl font-body text-gray-400">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-black text-white font-heading font-semibold shadow-lg transform transition hover:scale-105 hover:shadow-blue-600/50"
        >
          <span className="material-icons md-18">home</span>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;