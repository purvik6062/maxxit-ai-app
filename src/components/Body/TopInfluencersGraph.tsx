"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Influencer = {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  recentWeekSignals: number;
  recentWeekTokens: number;
  specialties?: string[];
};

type ApiResponse = {
  influencers: Influencer[];
  totalProfit: number;
};

interface InfluencerDetailsProps {
  influencer: Influencer | null;
}

const InfluencerDetails: React.FC<InfluencerDetailsProps> = ({ influencer }) => {
  return (
    <div className="relative w-full max-w-[90%] sm:max-w-3xl md:max-w-4xl mx-auto my-4 sm:my-6 md:my-8 z-20 bg-transparent">
      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full bg-gray-800/70 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-xl z-20 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between overflow-hidden"
      >
        {influencer ? (
          <div className="flex flex-col sm:flex-row items-center w-full space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 z-20">
            <motion.div
              className="relative flex-shrink-0 group"
              whileHover={{ scale: 1.05 }}
            >
              {/* Avatar container with animated fire glow */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 opacity-75 blur-sm animate-avatar-fire-pulse" />
              <div className="relative">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg z-20"
                />
                {/* Inner glow for avatar */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-border-pulse" />
                {/* Overlaying sparks effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/0 to-cyan-400/0 opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
              </div>
            </motion.div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-cyan-400 drop-shadow-md">
                  {influencer.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-sm text-cyan-100/70">
                  Specialties:{' '}
                  <span className="text-cyan-300">
                    {influencer.specialties?.join(', ') || 'Crypto Analysis'}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 md:gap-4">
                {/* Stats cards with fire gradient backgrounds */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-4 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] sm:text-xs text-gray-100">Signals (past 7d)</p>
                    <p className="text-sm sm:text-base font-semibold text-cyan-400 animate-value-pulse">
                      {influencer.recentWeekSignals?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-4 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] sm:text-xs text-gray-100">Tokens (past 7d)</p>
                    <p className="text-sm sm:text-base font-semibold text-cyan-400 animate-value-pulse">
                      {influencer.recentWeekTokens?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-4 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] sm:text-xs text-gray-100">Followers</p>
                    <p className="text-sm sm:text-base font-semibold text-cyan-400 animate-value-pulse">
                      {influencer.followers?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8 z-20">
            <p className="text-cyan-300 text-center text-base sm:text-lg md:text-lg w-full font-medium">
              Select an influencer to view details
            </p>
            <p className="text-cyan-500/70 text-center text-xs sm:text-sm md:text-sm mt-2">
              Explore trending crypto influencers
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const CosmicWebInfluencerGraph: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredInfluencer, setHoveredInfluencer] = useState<Influencer | null>(
    null
  );
  const [frontInfluencer, setFrontInfluencer] = useState<Influencer | null>(
    null
  );
  const [rotation, setRotation] = useState<number>(0);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProfit, setTotalProfit] = useState<number>(0);

  // Fetch influencers from API
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        // Check if we're in a browser environment where localStorage is available
        if (typeof window !== 'undefined') {
          // Check if data exists in localStorage and is not expired
          try {
            const cachedData = localStorage.getItem('topWeeklyInfluencers');

            if (cachedData) {
              const { data, timestamp } = JSON.parse(cachedData);
              const now = new Date().getTime();
              const cacheTime = new Date(timestamp).getTime();
              const daysDiff = (now - cacheTime) / (1000 * 60 * 60 * 24);

              // If cache is less than 7 days old, use it
              if (daysDiff < 7) {
                setInfluencers(data.influencers);
                setTotalProfit(data.totalProfit);
                setLoading(false);
                return;
              } else {
                // Remove expired cache
                localStorage.removeItem('topWeeklyInfluencers');
              }
            }
          } catch (e) {
            console.error("Error accessing localStorage:", e);
            // Continue to fetch from API if localStorage fails
          }
        }

        // If no valid cache or not in browser, fetch from API
        const response = await fetch("/api/top-weekly-influencers");
        if (!response.ok) {
          throw new Error("Failed to fetch influencers");
        }
        const data: ApiResponse = await response.json();

        // Store in localStorage with timestamp if available
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('topWeeklyInfluencers', JSON.stringify({
              data,
              timestamp: new Date().toISOString()
            }));
          } catch (e) {
            console.error("Error writing to localStorage:", e);
            // Continue even if localStorage fails
          }
        }

        setInfluencers(data.influencers);
        setTotalProfit(data.totalProfit);
        setLoading(false);
      } catch (err) {
        setError("Error loading influencers");
        console.error(err);
      }
    };

    fetchInfluencers();
  }, []);

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
      opacity: number;
      vx: number;
      vy: number;
    }

    const isMobile = window.innerWidth <= 768;
    const numParticles = isMobile ? 50 : 150; // Fewer particles on mobile
    const particles: Particle[] = [];
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
          size: Math.random() * (isMobile ? 0.8 : 1) + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.4 + 0.4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    resizeCanvas();
    const debouncedResize = debounce(resizeCanvas, 100);
    window.addEventListener("resize", debouncedResize);

    const updateMousePosition = (x: number, y: number) => {
      mouse.x = x;
      mouse.y = y;
    };

    const handleMouseMove = (e: MouseEvent) =>
      updateMousePosition(e.clientX, e.clientY);
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
      ctx.fillStyle = "rgba(7, 11, 19, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.hypot(dx, dy);
        const maxDistance = isMobile ? 50 : 100;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * (isMobile ? 1 : 1.5);
          particle.vy -= Math.sin(angle) * force * (isMobile ? 1 : 1.5);
          particle.opacity = Math.min(particle.opacity + force * 0.2, 1);
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
        ctx.fillStyle = `hsla(180, 50%, 70%, ${particle.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dist = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (dist < (isMobile ? 30 : 50)) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(180, 50%, 70%, ${0.1 * particle.opacity})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", debouncedResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Starfield
  useEffect(() => {
    const starfield = document.querySelector(".starfield");
    if (!starfield) return;
    const canvas = document.createElement("canvas");
    canvas.className = "starfield-canvas";
    starfield.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    interface Star {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }

    const isMobile = window.innerWidth <= 768;
    const numStars = isMobile ? 200 : 500; // Fewer stars on mobile
    const stars: Star[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        const isMilkyWay = i < (isMobile ? 50 : 150);
        const bandWidth = canvas.width * 0.3;
        const x = Math.random() * canvas.width;
        const y = isMilkyWay
          ? x * 0.4 +
          (Math.random() * bandWidth - bandWidth / 2) +
          canvas.height * 0.2
          : Math.random() * canvas.height;
        const colorChoice = Math.random();
        let color: string;
        if (colorChoice < 0.5) {
          color = `hsla(180, 70%, 70%, ${Math.random() * 0.3 + 0.7})`;
        } else if (colorChoice < 0.8) {
          color = `hsla(120, 70%, 60%, ${Math.random() * 0.3 + 0.7})`;
        } else {
          color = `hsla(0, 0%, 90%, ${Math.random() * 0.3 + 0.7})`;
        }
        stars.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          size: isMilkyWay
            ? Math.random() * (isMobile ? 1.5 : 2) + 1
            : Math.random() * (isMobile ? 1 : 1.5) + 0.5,
          opacity: Math.random() * 0.3 + 0.7,
          color,
        });
      }
    };

    resizeCanvas();
    const debouncedResize = debounce(resizeCanvas, 100);
    window.addEventListener("resize", debouncedResize);

    const createNebula = () => {
      const nebula = document.createElement("div");
      nebula.className = "nebula";
      const size = isMobile ? 200 : 400;
      nebula.style.width = `${size}px`;
      nebula.style.height = `${size * 0.8}px`;
      nebula.style.left = `${Math.random() * 80}%`;
      nebula.style.top = `${Math.random() * 80}%`;
      nebula.style.background = `radial-gradient(ellipse at center, rgba(0,255,255,0.3), rgba(128,0,128,0.2), transparent)`;
      nebula.style.opacity = "0.4";
      nebula.style.filter = `blur(${isMobile ? 30 : 50}px)`;
      starfield.appendChild(nebula);
    };

    const createGalaxySwirl = () => {
      const galaxy = document.createElement("div");
      galaxy.className = "galaxy-swirl";
      const size = isMobile ? 150 : 300;
      galaxy.style.width = `${size}px`;
      galaxy.style.height = `${size}px`;
      galaxy.style.left = `${Math.random() * 80}%`;
      galaxy.style.top = `${Math.random() * 80}%`;
      galaxy.style.background = `radial-gradient(circle, rgba(0,255,255,0.3), transparent 70%)`;
      galaxy.style.opacity = "0.3";
      galaxy.style.filter = `blur(${isMobile ? 20 : 40}px)`;
      starfield.appendChild(galaxy);
    };

    createNebula();
    createGalaxySwirl();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x += canvas.width;
        if (star.x > canvas.width) star.x -= canvas.width;
        if (star.y < 0) star.y += canvas.height;
        if (star.y > canvas.height) star.y -= canvas.height;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", debouncedResize);
      starfield.innerHTML = "";
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Carousel Rotation
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const isMobile = window.innerWidth <= 768;
    const rotationSpeed = isMobile ? 0.2 : 0.3;

    const animateCarousel = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      // Update rotation at a controlled rate (e.g., 60 FPS)
      if (deltaTime > 16.67) { // Approximately 60 FPS
        setRotation((prev) => prev + rotationSpeed);
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(animateCarousel);
    };

    animationFrameId = requestAnimationFrame(animateCarousel);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Front Influencer
  useEffect(() => {
    const updateFrontInfluencer = () => {
      if (influencers.length === 0) return;

      let maxZ = -Infinity;
      let frontIdx = 0;

      influencers.forEach((influencer, index) => {
        const baseAngle = index * (360 / influencers.length);
        const currentAngle = (baseAngle + rotation) % 360;
        const angleRad = (currentAngle * Math.PI) / 180;
        const zPosition = Math.cos(angleRad);

        if (zPosition > maxZ) {
          maxZ = zPosition;
          frontIdx = index;
        }
      });

      setFrontInfluencer(influencers[frontIdx]);
    };

    if (influencers.length > 0) {
      updateFrontInfluencer();
      const intervalId = setInterval(updateFrontInfluencer, 500);
      return () => clearInterval(intervalId);
    }
  }, [rotation, influencers]);

  function getCurrentWeekOfMonthLabel(date = new Date()): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const dayOfWeek = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  
    const adjustedDate = dayOfMonth + dayOfWeek;
    const weekNumber = Math.ceil(adjustedDate / 7);
  
    const ordinal = (n: number) =>
      n + (["th", "st", "nd", "rd"][(n % 10 > 3 || Math.floor(n % 100 / 10) === 1) ? 0 : n % 10]);
  
    const monthYear = date.toLocaleDateString('en-US', options); // ✅ fixed
    return `Top Performing Cluster: ${ordinal(weekNumber)} Week of ${monthYear}`;
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <canvas ref={canvasRef} className="canvas-background" />
        <div className="starfield relative">
          <div className="overlay" />
        </div>
        <motion.div
          className="z-20 bg-gray-900/50 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 20px rgba(0, 255, 255, 0.3)",
              "0 0 30px rgba(0, 255, 255, 0.5)",
              "0 0 20px rgba(0, 255, 255, 0.3)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/maxxit.gif"
            alt="Loading animation"
            width={80}
            height={80}
            unoptimized
            priority
            className="sm:w-[120px] sm:h-[120px]"
          />
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <canvas ref={canvasRef} className="canvas-background" />
        <div className="starfield relative">
          <div className="overlay" />
        </div>
        <div className="bg-gray-900/70 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-red-500/50 shadow-lg z-20">
          <p className="text-red-400 text-base sm:text-lg">{error}</p>
          <button
            className="mt-4 px-4 sm:px-6 py-2 bg-gray-800 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-gray-700 text-sm sm:text-base"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-leagueSpartan min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start sm:justify-center relative overflow-hidden">
      <canvas ref={canvasRef} className="canvas-background" />
      <div className="starfield relative">
        <div className="overlay" />
      </div>
      <h1 className="font-leagueSpartan text-2xl sm:text-4xl font-bold mb-2 mt-10 sm:mt-16 text-cyan-400 z-20">
        Crypto Influencer Constellation
      </h1>
      <p className="text-gray-300 mb-4 sm:mb-8 text-center max-w-xl sm:max-w-2xl text-sm sm:text-lg z-20 px-4">
        Discover our top influencers shaping the crypto universe with their
        insights.
      </p>

      <div className="bg-gray-900/80 backdrop-blur-lg text-cyan-300 text-xs sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)] z-30 border border-cyan-500/50">
      {getCurrentWeekOfMonthLabel(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}
      </div>
      <div className="relative w-full max-w-7xl h-[500px] sm:h-[650px] text-center overflow-hidden z-20">

        <div className="absolute w-full h-full top-0 left-0 perspective-[800px] sm:perspective-[1200px] z-20">
          <div
            ref={sliderRef}
            className="absolute top-[48%] left-1/2 w-0 h-0 [transform-style:preserve-3d] origin-center"
            style={{ transform: `rotateX(${window.innerWidth <= 768 ? -25 : -20}deg) rotateY(${rotation}deg)` }}
          >
            {influencers.map((influencer, index) => {
              const baseAngle = index * (360 / influencers.length);
              const currentAngle = (baseAngle + rotation) % 360;
              const angleRad = (currentAngle * Math.PI) / 180;
              const zPosition = Math.cos(angleRad);
              const scale = 0.7 + (zPosition + 1) * 0.3;
              const baseWidth = window.innerWidth <= 768 ? 120 : 160;
              const baseHeight = window.innerWidth <= 768 ? 140 : 180;
              const width = baseWidth * scale;
              const height = baseHeight * scale;

              return (
                <div
                  key={influencer.id}
                  className="absolute left-[-60px] sm:left-[-80px] top-[-70px] sm:top-[-90px] [transform-style:preserve-3d] transition-transform duration-300 hover:scale-125 touch-pan-y"
                  style={{
                    transform: `rotateY(${baseAngle}deg) translateZ(${window.innerWidth <= 768 ? 250 : 400
                      }px) rotateX(5deg)`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  onMouseEnter={() => setHoveredInfluencer(influencer)}
                  onMouseLeave={() => setHoveredInfluencer(null)}
                  onTouchStart={() => setHoveredInfluencer(influencer)}
                >
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-full h-full object-cover rounded shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                    aria-label={`Profile image of ${influencer.name}`}
                  />
                  <motion.div
                    className="absolute w-full bg-gray-900/80 text-cyan-300 text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 px-2 sm:px-3 rounded-full border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                    style={{
                      top: `${height + 5}px`,
                      transform: "translateZ(0px)",
                    }}
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 15px rgba(0,255,255,0.7)",
                    }}
                  >
                    {influencer.name}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div
            className="text-white text-xl md:text-3xl font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-900/50 backdrop-blur-sm"
            style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)" }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 20px rgba(0, 255, 255, 0.5)",
                "0 0 30px rgba(0, 255, 255, 0.8)",
                "0 0 20px rgba(0, 255, 255, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Net ROI: {totalProfit.toFixed(2).toLocaleString()}%
          </motion.div>
        </div>
      </div>
      <InfluencerDetails influencer={hoveredInfluencer || frontInfluencer} />
    </div>
  );
};

// Debounce helper
function debounce(fn: () => void, ms: number) {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, ms);
  };
}

export default CosmicWebInfluencerGraph;