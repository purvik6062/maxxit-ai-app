"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Users, CheckCircle, Award } from "lucide-react";

type Influencer = {
  id: string;
  name: string;
  profit: number;
  followers: number;
  accuracy: number;
  recentPredictions: number;
  avatar: string;
  specialties: string[];
  color: string;
};

export default function EnhancedCosmicWebInfluencerGraph() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredInfluencer, setHoveredInfluencer] = useState<Influencer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const influencerData: Influencer[] = [
    {
      id: "inf1",
      name: "CryptoMaster",
      profit: 18320,
      followers: 245000,
      accuracy: 92,
      recentPredictions: 24,
      avatar: "https://picsum.photos/id/300/200",
      specialties: ["Bitcoin", "Ethereum", "Altcoins"],
      color: "#00c2ff",
    },
    {
      id: "inf2",
      name: "TokenWhisperer",
      profit: 15100,
      followers: 198000,
      accuracy: 89,
      recentPredictions: 31,
      avatar: "https://picsum.photos/id/600/200",
      specialties: ["DeFi", "NFTs", "Solana"],
      color: "#0073ff",
    },
    {
      id: "inf3",
      name: "BlockchainOracle",
      profit: 12750,
      followers: 173000,
      accuracy: 87,
      recentPredictions: 19,
      avatar: "https://picsum.photos/id/400/200",
      specialties: ["Technical Analysis", "Long-term Holds", "Market Cycles"],
      color: "#4d00ff",
    },
    {
      id: "inf4",
      name: "CoinVoyager",
      profit: 10820,
      followers: 156000,
      accuracy: 84,
      recentPredictions: 27,
      avatar: "https://picsum.photos/id/300/300",
      specialties: ["Emerging Markets", "Layer 2", "Gaming Tokens"],
      color: "#7b00ff",
    },
    {
      id: "inf5",
      name: "SatoshiDisciple",
      profit: 9650,
      followers: 132000,
      accuracy: 83,
      recentPredictions: 22,
      avatar: "https://picsum.photos/id/300/400",
      specialties: ["Bitcoin", "Mining", "On-chain Analysis"],
      color: "#a800ff",
    },
    {
      id: "inf6",
      name: "AltcoinArchitect",
      profit: 8340,
      followers: 118000,
      accuracy: 81,
      recentPredictions: 29,
      avatar: "https://picsum.photos/id/500/300",
      specialties: ["Altcoins", "ICOs", "New Listings"],
      color: "#d400ff",
    },
  ];

  // Constellation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const particleCount = 100;
    const mouse = { x: 0, y: 0 };
    let isMouseActive = false;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(0, 12, 36, 0.8)");
      gradient.addColorStop(1, "rgba(0, 24, 72, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5;
        const opacity = Math.random() * 0.8 + 0.2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.forEach((p2, j) => {
          if (i >= j) return;
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(0, 150, 255, ${0.8 - dist / 100})`);
            gradient.addColorStop(1, `rgba(100, 200, 255, ${0.8 - dist / 100})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Connect particles to mouse
        if (isMouseActive) {
          const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (distToMouse < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);

            const gradient = ctx.createLinearGradient(p1.x, p1.y, mouse.x, mouse.y);
            gradient.addColorStop(0, `rgba(0, 150, 255, ${0.8 - distToMouse / 150})`);
            gradient.addColorStop(1, `rgba(100, 200, 255, ${0.8 - distToMouse / 150})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    setIsLoaded(true);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty("--quantity", influencerData.length.toString());
    }
  }, [influencerData]);

  return (
    <div className="min-h-screen bg-[#010b1f] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010b1f] via-[#01123a] to-[#010b1f] opacity-40" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#00c2ff] to-[#0073ff]">
            Crypto Influencer Constellation
          </h1>
          <p className="text-[#a0c4ff] mb-2 text-center max-w-2xl mx-auto text-lg">
            Discover our top influencers shaping the crypto universe with their insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="bg-gradient-to-r from-[#0073ff] to-[#00c2ff] text-white text-base font-semibold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(0,115,255,0.5)]">
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Performing Cluster: 1st Week of April
            </span>
          </div>
        </motion.div>

        {/* Carousel Container - Fixed to match original CosmicWebInfluencerGraph */}
        <div className="relative w-full h-[600px] text-center overflow-hidden">
          <div className="absolute w-full h-full top-0 left-0 perspective-[1200px]">
            <div
              ref={sliderRef}
              className="absolute top-[48%] left-1/2 w-0 h-0 [transform-style:preserve-3d] animate-autoRun origin-center"
              style={{
                transform: "rotateX(-20deg) rotateZ(0deg)", // Removed tilt to match original
                animationDuration: "25s",
              }}
            >
              {influencerData.map((influencer, index) => (
                <div
                  key={influencer.id}
                  className="absolute w-[180px] h-[180px] left-[-90px] top-[-90px] [transform-style:preserve-3d]" // Increased size to match original
                  style={{
                    transform: `rotateY(${index * (360 / influencerData.length)}deg) translateZ(250px) rotateX(0deg)`, // Removed tilt
                  }}
                  onMouseEnter={() => setHoveredInfluencer(influencer)}
                  onMouseLeave={() => setHoveredInfluencer(null)}
                >
                  <div className="relative w-full h-full group">
                    {/* Card with Image */}
                    <img
                      src={influencer.avatar || "/placeholder.svg"}
                      alt={influencer.name}
                      className="w-full h-full object-cover rounded shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                    />
                    
                    {/* Name Label Below Image */}
                    <div
                      className="absolute w-full top-[185px] bg-gradient-to-r from-[#0073ff] to-[#00c2ff] text-white text-xs font-semibold py-1 px-3 rounded-full"
                      style={{ transform: "translateZ(0px)" }}
                    >
                      {influencer.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Display - Centered in the middle of the constellation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-gradient-to-r from-[#0073ff] to-[#00c2ff] text-white text-xl font-bold py-1.5 px-6 rounded-full shadow-[0_0_15px_rgba(0,115,255,0.5)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span>Net ROI: 350%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip/Info Card - Now positioned below the carousel */}
        <AnimatePresence>
          {hoveredInfluencer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md" // Positioned at bottom center
              style={{
                background: `linear-gradient(to right, #041b3c, #051029)`,
                boxShadow: `0 0 30px ${hoveredInfluencer.color}30, 0 0 10px ${hoveredInfluencer.color}20`,
                borderTop: `1px solid ${hoveredInfluencer.color}50`,
                borderLeft: `1px solid ${hoveredInfluencer.color}30`,
                borderRight: `1px solid ${hoveredInfluencer.color}30`,
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-2"
                  style={{ borderColor: hoveredInfluencer.color }}
                >
                  <img
                    src={hoveredInfluencer.avatar || "/placeholder.svg"}
                    alt={hoveredInfluencer.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: hoveredInfluencer.color }}>
                    {hoveredInfluencer.name}
                  </h3>

                  <div className="mt-2">
                    <div className="flex items-center text-[#a0c4ff] mb-1">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <div>Profit: ${hoveredInfluencer.profit.toLocaleString()}</div>
                    </div>

                    <div className="flex items-center text-[#a0c4ff] mb-1">
                      <Users className="w-4 h-4 mr-2" />
                      <div>Followers: {hoveredInfluencer.followers.toLocaleString()}</div>
                    </div>

                    <div className="flex items-center text-[#a0c4ff] mb-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <div>Accuracy: {hoveredInfluencer.accuracy}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-[#6d9cff] mb-1">Specialties</div>
                <div className="flex flex-wrap gap-2">
                  {hoveredInfluencer.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${hoveredInfluencer.color}20`,
                        border: `1px solid ${hoveredInfluencer.color}40`,
                        color: hoveredInfluencer.color,
                      }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        
        @keyframes autoRun {
          0% { transform: rotateY(0); }
          100% { transform: rotateY(360deg); }
        }
        
        .animate-autoRun {
          animation: autoRun 25s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 3s infinite;
        }
        
        .perspective-\\[1200px\\] {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
}