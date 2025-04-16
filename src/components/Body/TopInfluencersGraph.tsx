"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Influencer, influencerData } from "@/constants/InfluencerClusterData";

export default function CosmicWebInfluencerGraph() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredInfluencer, setHoveredInfluencer] = useState<Influencer | null>(null);

  // Constellation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const particleCount = 50;
    let mouse = { x: 0, y: 0 };
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
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
      });

      // Draw connections when mouse is active
      if (isMouseActive) {
        particles.forEach((p1, i) => {
          particles.forEach((p2, j) => {
            if (i >= j) return;
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 100})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });

          // Connect particles to mouse
          const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (distToMouse < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distToMouse / 150})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative">


      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 z-20">
        Crypto Influencer Constellation
      </h1>
      <p className="text-gray-300 mb-8 text-center max-w-2xl text-lg z-20">
        Discover our top influencers shaping the crypto universe with their insights.
      </p>

      <div className="relative w-full max-w-7xl h-[600px] text-center overflow-hidden z-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-0">
          <canvas ref={canvasRef} className="absolute inset-0 z-10" style={{ opacity: 0.5 }} />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, transparent 0 50px, #ffffff22 50px 51px), repeating-linear-gradient(to bottom, transparent 0 50px, #ffffff22 50px 51px)",
            }}
          />
        </div>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-base font-semibold py-1.5 px-4 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          Top Performing Cluster: 1st Week of April
        </div>


        {/* Carousel Container */}
        <div className="absolute w-full h-full top-0 left-0 perspective-[1200px] z-20">
          <div
            ref={sliderRef}
            className="absolute top-[48%] left-1/2 w-0 h-0 [transform-style:preserve-3d] animate-autoRun origin-center"
            style={{
              transform: "rotateX(25deg) rotateZ(-10deg)",
              animationDuration: "25s",
            }}
          >
            {influencerData.map((influencer, index) => (
              <div
                key={influencer.id}
                className="absolute w-[120px] h-[135px] left-[-90px] top-[-112.5px] [transform-style:preserve-3d] transition-transform duration-300 hover:scale-110"
                style={{
                  transform: `rotateY(${(index * (360 / influencerData.length))}deg) translateZ(250px) rotateX(-5deg)`,
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
                <div
                  className="absolute w-full top-[140px] bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-semibold py-1 px-3 rounded-full"
                  style={{ transform: "translateZ(0px)" }}
                >
                  {influencer.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip/Info Card */}
        <AnimatePresence>
          {hoveredInfluencer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-40 max-w-xs"
            >
              <h3 className="text-lg font-bold text-cyan-400">{hoveredInfluencer.name}</h3>
              <p className="text-sm text-gray-300">Profit: ${hoveredInfluencer.profit.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Followers: {hoveredInfluencer.followers.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Accuracy: {hoveredInfluencer.accuracy}%</p>
              <p className="text-sm text-gray-300">
                Specialties: {hoveredInfluencer.specialties.join(", ")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 text-xl left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold py-1.5 px-4 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          Net ROI: 350%
        </div>
      </div>
    </div>
  );
}