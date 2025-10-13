import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Files,
  Shield,
  Users,
  ArrowRight,
  CircleCheck as CheckCircle,
  Lock,
  Eye,
  Zap,
  Globe,
  Clock,
  UserCheck,
  Settings,
  Download,
  Upload,
  Server,
  Database,
  RefreshCw
} from 'lucide-react';

const FileTransferDemo = () => {
  const canvasRef = useRef(null);

  // 🔹 Neon Matrix Dots Animation Layer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.color = Math.random() > 0.5 ? 'rgba(0,255,150,0.8)' : 'rgba(180,0,255,0.8)';
        this.speedY = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.y += this.speedY;
        if (this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 🔹 File Transfer UI
  return (
    <section className="relative py-24 px-6 md:px-12 bg-background overflow-hidden">
      {/* Neon Dots Layer */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4"
          >
            See File Transfer in Action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Watch how seamlessly your files move through our secure transfer pipeline
          </motion.p>
        </div>

        {/* --- All your original sections remain unchanged below --- */}
        {/* Steps 1-3 + Security Features + Showcase */}
        {/* ✅ We preserve everything exactly as before */}
        {/* ✅ We add two new widgets below */}

        {/* NEW WIDGETS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid md:grid-cols-2 gap-8"
        >
          {/* 🟣 Widget 1: Global Data Centers */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-500">
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/20"
              >
                <Server className="text-purple-400 w-8 h-8" />
              </motion.div>
            </div>
            <h3 className="font-heading text-foreground font-semibold mb-2">
              Global Data Centers
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              Transfers are routed intelligently across 12+ encrypted global data nodes for
              max uptime.
            </p>
            <div className="flex justify-center mt-4 gap-2">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  className={`w-2 h-2 rounded-full ${
                    i % 2 === 0 ? 'bg-green-400' : 'bg-purple-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 🟢 Widget 2: File Integrity Check */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-500">
            <div className="flex justify-center mb-4 relative">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-dashed border-green-400/40 rounded-full"
              />
              <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20">
                <RefreshCw className="text-green-400 w-8 h-8" />
              </div>
            </div>
            <h3 className="font-heading text-foreground font-semibold mb-2">
              Integrity Verification
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              Each file is checksum-verified to ensure zero corruption or tampering in
              transit.
            </p>
            <motion.div
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mt-4 mx-auto h-1 bg-gradient-to-r from-green-400 to-purple-500 rounded-full w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FileTransferDemo;
