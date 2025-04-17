"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Influencer, influencerData } from "@/constants/InfluencerClusterData";

interface InfluencerDetailsProps {
  influencer: Influencer | null;
}

const InfluencerDetails: React.FC<InfluencerDetailsProps> = ({ influencer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-md p-4 rounded-xl shadow-xl my-8 z-20 border border-cyan-500/30 flex items-center justify-between"
    >
      {influencer ? (
        <div className="flex items-center w-full space-x-6">
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={influencer.avatar}
              alt={influencer.name}
              className="w-20 h-20 rounded-full object-cover shadow-lg"
            />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
          </motion.div>
          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {influencer.name}
              </h3>
              <p className="text-sm text-gray-400">
                Specialties: {influencer.specialties.join(", ")}
              </p>
            </div>
            <div className="flex space-x-4">
              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                whileHover={{ y: -2, boxShadow: "0 4px 15px rgba(0, 255, 255, 0.3)" }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-gray-400">Profit</p>
                <p className="text-sm font-semibold text-cyan-300">
                  ${influencer.profit.toLocaleString()}
                </p>
              </motion.div>
              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                whileHover={{ y: -2, boxShadow: "0 4px 15px rgba(0, 255, 255, 0.3)" }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-gray-400">Followers</p>
                <p className="text-sm font-semibold text-cyan-300">
                  {influencer.followers.toLocaleString()}
                </p>
              </motion.div>
              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                whileHover={{ y: -2, boxShadow: "0 4px 15px rgba(0, 255, 255, 0.3)" }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-sm font-semibold text-cyan-300">
                  {influencer.accuracy}%
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center text-lg w-full">
          Select an influencer to view details
        </p>
      )}
    </motion.div>
  );
};

const CosmicWebInfluencerGraph: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredInfluencer, setHoveredInfluencer] = useState<Influencer | null>(null);
  const [frontInfluencer, setFrontInfluencer] = useState<Influencer | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    interface Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speed: number;
      isWhite: boolean;
      opacity: number;
      vx: number;
      vy: number;
    }

    const particles: Particle[] = [];
    const numParticles = 300;
    const mouse = { x: -1000, y: -1000 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          size: Math.random() * 1 + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          isWhite: Math.random() > 0.5,
          opacity: Math.random() * 0.4 + 0.4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const updateMousePosition = (x: number, y: number) => {
      mouse.x = x;
      mouse.y = y;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      updateMousePosition(touch.clientX, touch.clientY);
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.hypot(dx, dy);
        const maxDistance = 100;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * 2;
          particle.vy -= Math.sin(angle) * force * 2;
          particle.opacity = Math.min(particle.opacity + force * 0.3, 1);
        } else {
          particle.opacity = Math.max(particle.opacity - 0.01, 0.4);
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vx += (particle.baseX - particle.x) * particle.speed * 0.02;
        particle.vy += (particle.baseY - particle.y) * particle.speed * 0.02;

        particle.vx *= 0.95;
        particle.vy *= 0.95;

        if (particle.x < 0) particle.x += canvas.width;
        if (particle.x > canvas.width) particle.x -= canvas.width;
        if (particle.y < 0) particle.y += canvas.height;
        if (particle.y > canvas.height) particle.y -= canvas.height;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.isWhite
          ? `hsla(0, 0%, 100%, ${particle.opacity})`
          : `hsla(0, 0%, 0%, ${particle.opacity * 0.5})`;
        ctx.shadowColor = particle.isWhite
          ? `hsla(0, 0%, 100%, 0.6)`
          : `hsla(0, 0%, 0%, 0.3)`;
        ctx.shadowBlur = 8;
        ctx.fill();

        particles.forEach((other) => {
          if (other !== particle) {
            const dist = Math.hypot(particle.x - other.x, particle.y - other.y);
            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = particle.isWhite
                ? `hsla(0, 0%, 100%, ${0.15 * particle.opacity})`
                : `hsla(0, 0%, 0%, ${0.1 * particle.opacity})`;
              ctx.lineWidth = 0.3;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Carousel Rotation
  useEffect(() => {
    let animationFrameId: number;
    const animateCarousel = () => {
      setRotation((prev) => prev + 0.3);
      animationFrameId = requestAnimationFrame(animateCarousel);
    };
    animateCarousel();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Determine Front Influencer
  useEffect(() => {
    const updateFrontInfluencer = () => {
      let maxZ = -Infinity;
      let frontIdx = 0;

      influencerData.forEach((influencer, index) => {
        const baseAngle = index * (360 / influencerData.length);
        const currentAngle = (baseAngle + rotation) % 360;
        const angleRad = (currentAngle * Math.PI) / 180;
        const zPosition = Math.cos(angleRad);

        if (zPosition > maxZ) {
          maxZ = zPosition;
          frontIdx = index;
        }
      });

      setFrontInfluencer(influencerData[frontIdx]);
    };

    updateFrontInfluencer();
    const intervalId = setInterval(updateFrontInfluencer, 100);
    return () => clearInterval(intervalId);
  }, [rotation]);

  // Starfield, Milky Way, Nebulae, and Galaxy Swirl Generation
  useEffect(() => {
    const starfield = document.querySelector(".starfield");
    if (!starfield) return;

    interface Star {
      element: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }

    const stars: Star[] = [];
    let animationFrameId: number;

    const createStar = (isMilkyWay: boolean = false) => {
      const star = document.createElement("div");
      star.className = "star";
      const size = isMilkyWay ? Math.random() * 2 + 1 : Math.random() * 2.5 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      let x, y, color;
      const colorChoice = Math.random();
      if (isMilkyWay) {
        // Larger and denser Milky Way band
        const bandWidth = window.innerWidth * 0.3;
        x = Math.random() * window.innerWidth;
        y = x * 0.4 + (Math.random() * bandWidth - bandWidth / 2) + window.innerHeight * 0.2;
        if (colorChoice < 0.33) {
          color = 'white';
          star.style.background = `radial-gradient(circle, rgba(255,255,255,1), rgba(255,255,255,0.6))`;
          star.style.boxShadow = `0 0 10px rgba(255,255,255,0.9)`;
        } else if (colorChoice < 0.66) {
          color = 'cyan';
          star.style.background = `radial-gradient(circle, rgba(0,255,255,1), rgba(0,255,255,0.8))`;
          star.style.boxShadow = `0 0 10px rgba(0,255,255,0.9)`;
        } else {
          color = 'limegreen';
          star.style.background = `radial-gradient(circle, rgba(50,255,50,1), rgba(50,255,50,0.6))`;
          star.style.boxShadow = `0 0 10px rgba(50,255,50,0.9)`;
        }
        star.style.opacity = `${Math.random() * 0.3 + 0.7}`;
      } else {
        x = Math.random() * window.innerWidth;
        y = Math.random() * window.innerHeight;
        if (colorChoice < 0.33) {
          color = 'white';
          star.style.background = `radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.4))`;
          star.style.boxShadow = `0 0 5px rgba(255,255,255,0.6)`;
        } else if (colorChoice < 0.66) {
          color = 'cyan';
          star.style.background = `radial-gradient(circle, rgba(0,255,255,0.9), rgba(0,255,255,0.4))`;
          star.style.boxShadow = `0 0 5px rgba(0,255,255,0.6)`;
        } else {
          color = 'limegreen';
          star.style.background = `radial-gradient(circle, rgba(50,255,50,0.9), rgba(50,255,50,0.4))`;
          star.style.boxShadow = `0 0 5px rgba(50,255,50,0.6)`;
        }
        star.style.opacity = `${Math.random() * 0.3 + 0.7}`;
      }

      star.style.left = `${(x / window.innerWidth) * 100}%`;
      star.style.top = `${(y / window.innerHeight) * 100}%`;
      starfield.appendChild(star);

      // Fast movement for free particle behavior
      const vx = (Math.random() - 0.5) * 2;
      const vy = (Math.random() - 0.5) * 2;

      stars.push({ element: star, x, y, vx, vy, size, color });
    };

    const createNebula = () => {
      const nebula = document.createElement("div");
      nebula.className = "nebula";
      const size = Math.random() * 400 + 300;
      nebula.style.width = `${size}px`;
      nebula.style.height = `${size * (0.7 + Math.random() * 0.3)}px`;
      // Position away from center (outside 30% central area)
      const left = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      const top = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      nebula.style.left = `${left}%`;
      nebula.style.top = `${top}%`;
      nebula.style.background = `radial-gradient(ellipse at center, rgba(0,255,255,0.4), rgba(128,0,128,0.3), rgba(255,105,180,0.2), transparent)`;
      nebula.style.opacity = "0.5";
      nebula.style.filter = "blur(50px)";
      nebula.style.borderRadius = "50%";
      nebula.style.transform = `rotate(${Math.random() * 360}deg)`;
      nebula.style.animation = `pulse 12s infinite ease-in-out`;
      starfield.appendChild(nebula);
    };

    const createGalaxySwirl = () => {
      const galaxy = document.createElement("div");
      galaxy.className = "galaxy-swirl";
      const size = 300;
      galaxy.style.width = `${size}px`;
      galaxy.style.height = `${size}px`;
      // Position away from center (outside 30% central area)
      const left = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      const top = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      galaxy.style.left = `${left}%`;
      galaxy.style.top = `${top}%`;
      galaxy.style.background = `
        radial-gradient(circle at 30% 30%, rgba(0,255,255,0.4), transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(0,0,255,0.3), transparent 50%),
        radial-gradient(circle, rgba(255,0,255,0.2), transparent 70%)
      `;
      galaxy.style.opacity = "0.4";
      galaxy.style.filter = "blur(40px)";
      galaxy.style.animation = `rotate 20s infinite linear`;
      starfield.appendChild(galaxy);
    };

    // Create 500 regular stars
    for (let i = 0; i < 500; i++) {
      createStar();
    }
    // Create 200 Milky Way stars
    for (let i = 0; i < 200; i++) {
      createStar(true);
    }
    // Create 5 nebulae
    for (let i = 0; i < 2; i++) {
      createNebula();
    }
    // Create 1 galaxy swirl
    createGalaxySwirl();

    const animateSpaceElements = () => {
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen edges
        if (star.x < 0) star.x += window.innerWidth;
        if (star.x > window.innerWidth) star.x -= window.innerWidth;
        if (star.y < 0) star.y += window.innerHeight;
        if (star.y > window.innerHeight) star.y -= window.innerHeight;

        star.element.style.left = `${(star.x / window.innerWidth) * 100}%`;
        star.element.style.top = `${(star.y / window.innerHeight) * 100}%`;
        // Twinkle effect with high minimum opacity
        star.element.style.opacity = `${Math.random() * 0.2 + 0.8}`;
      });

      animationFrameId = requestAnimationFrame(animateSpaceElements);
    };
    animateSpaceElements();

    return () => {
      starfield.innerHTML = "";
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <style>{`
        .star {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
        }
        .nebula {
          position: absolute;
          pointer-events: none;
          z-index: 4;
        }
        .galaxy-swirl {
          position: absolute;
          pointer-events: none;
          z-index: 3;
        }
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ opacity: 0.4 }} />
      <div className="starfield absolute inset-0 z-5" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom right, rgba(0, 5, 15, 0.95), rgba(5, 10, 25, 0.95))`,
          opacity: 0.85,
        }}
      />
      <h1 className="text-4xl font-bold mb-2 mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 z-20">
        Crypto Influencer Constellation
      </h1>
      <p className="text-gray-300 mb-8 text-center max-w-2xl text-lg z-20">
        Discover our top influencers shaping the crypto universe with their insights.
      </p>
      <div className="relative w-full max-w-7xl h-[650px] text-center overflow-hidden z-20">
        <motion.div
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-lg text-cyan-300 text-base font-semibold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)] z-30 border border-cyan-500/50"
          animate={{
            boxShadow: [
              "0 0 15px rgba(0,255,255,0.5)",
              "0 0 25px rgba(0,255,255,0.8)",
              "0 0 15px rgba(0,255,255,0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Top Performing Cluster: 1st Week of April
        </motion.div>
        <div className="absolute w-full h-full top-0 left-0 perspective-[1200px] z-20">
          <div
            ref={sliderRef}
            className="absolute top-[48%] left-1/2 w-0 h-0 [transform-style:preserve-3d] origin-center"
            style={{ transform: `rotateX(-20deg) rotateY(${rotation}deg)` }}
          >
            {influencerData.map((influencer, index) => {
              const baseAngle = index * (360 / influencerData.length);
              const currentAngle = (baseAngle + rotation) % 360;
              const angleRad = (currentAngle * Math.PI) / 180;
              const zPosition = Math.cos(angleRad);
              const scale = 0.7 + (zPosition + 1) * 0.3;
              const baseWidth = 160;
              const baseHeight = 180;
              const width = baseWidth * scale;
              const height = baseHeight * scale;

              return (
                <div
                  key={influencer.id}
                  className="absolute left-[-80px] top-[-90px] [transform-style:preserve-3d] transition-transform duration-300 hover:scale-125"
                  style={{
                    transform: `rotateY(${baseAngle}deg) translateZ(400px) rotateX(5deg)`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  onMouseEnter={() => setHoveredInfluencer(influencer)}
                  onMouseLeave={() => setHoveredInfluencer(null)}
                >
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-full h-full object-cover rounded shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                    aria-label={`Profile image of ${influencer.name}`}
                  />
                  <motion.div
                    className="absolute w-full bg-gray-900/80 text-cyan-300 text-xs font-semibold py-1.5 px-3 rounded-full border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                    style={{ top: `${height + 5}px`, transform: "translateZ(0px)" }}
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 15px rgba(0,255,255,0.7)",
                      backgroundColor: "rgba(0, 255, 255, 0.1)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {influencer.name}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-32 h-20 border-2 border-cyan-400 rounded-full opacity-50"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-28 h-16 border-2 border-blue-500 rounded-full opacity-50"
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-24 h-24 border-2 border-cyan-300 rounded-full opacity-30"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1], y: [0, -5, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full"
                  animate={{
                    x: 50 * Math.cos((i * Math.PI) / 3),
                    y: 50 * Math.sin((i * Math.PI) / 3),
                    scale: [0, 1.2, 0],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                />
              ))}
              <motion.div
                className="text-white text-3xl font-bold px-6 py-3 rounded-lg bg-gray-900/50 backdrop-blur-sm"
                style={{
                  textShadow: "0 0 12px rgba(0, 255, 255, 0.9), 0 0 24px rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
                    "0 0 35px rgba(0, 255, 255, 0.8), 0 0 70px rgba(0, 255, 255, 0.6)",
                    "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                Net ROI: 350%
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <InfluencerDetails influencer={hoveredInfluencer || frontInfluencer} />
    </div>
  );
};

export default CosmicWebInfluencerGraph;