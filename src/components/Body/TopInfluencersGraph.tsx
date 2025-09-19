"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import MobileInfluencerCarousel, {
  Influencer,
} from "./MobileInfluencerCarousel";
import InfluencerDetails from "./InfluencerDetails";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FaCheck } from "react-icons/fa";
import { useCredits } from "@/context/CreditsContext";
import Link from "next/link";
import CustomizeAgentModal from "../Global/CustomizeAgentModal";
import type { CustomizationOptions } from "../Global/OnboardingModals";

type ApiResponse = {
  influencers: Influencer[];
  totalProfit: number; // This is now average ROI
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
  const [isMobile, setIsMobile] = useState(false);

  // Subscription states
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const [subscribingHandle, setSubscribingHandle] = useState<string | null>(
    null
  );
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [currentInfluencer, setCurrentInfluencer] = useState<Influencer | null>(
    null
  );
  const [isLoadingSubscriptionData, setIsLoadingSubscriptionData] =
    useState(true);
  const { data: session } = useSession();
  const { credits, updateCredits, isAgentCustomized } = useCredits();
  const defaultCustomization: CustomizationOptions = {
    r_last6h_pct: 50,
    d_pct_mktvol_6h: 50,
    d_pct_socvol_6h: 50,
    d_pct_sent_6h: 50,
    d_pct_users_6h: 50,
    d_pct_infl_6h: 50,
    d_galaxy_6h: 5,
    neg_d_altrank_6h: 50,
  };
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>(defaultCustomization);

  // Credits state (needed for subscription confirmation)
  // const [credits, setCredits] = useState<number | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch subscribed handles
  useEffect(() => {
    const fetchSubscribedHandles = async () => {
      setIsLoadingSubscriptionData(true);
      if (!session || !session.user?.id) {
        setIsLoadingSubscriptionData(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/get-user?twitterId=${session.user.id}`
        );
        const data = await response.json();

        if (data.success && data.data.subscribedAccounts) {
          const handles = data.data.subscribedAccounts.map(
            (account: { twitterHandle: string }) => account.twitterHandle
          );
          setSubscribedHandles(handles);
        }
      } catch (error) {
        console.error("Failed to fetch subscribed handles:", error);
      } finally {
        setIsLoadingSubscriptionData(false);
      }
    };

    fetchSubscribedHandles();
  }, [session]);

  // Handle subscription initiation
  const handleSubscribeInitiate = (influencer: Influencer) => {
    if (!session || !session.user?.id) {
      toast.error("Please login with Twitter/X first", {
        position: "top-center",
      });
      return;
    }

    if (credits === null) {
      toast.error("Please complete your registration first", {
        position: "top-center",
      });
      return;
    }

    if (isAgentCustomized === false) {
      setIsCustomizeOpen(true);
      return;
    }

    setCurrentInfluencer(influencer);
    setShowSubscribeModal(true);
  };

  // Handle actual subscription
  const handleSubscribe = async () => {
    if (!session || !session.user?.id || !currentInfluencer) {
      toast.error("Please login with Twitter/X first", {
        position: "top-center",
      });
      return;
    }

    const cleanHandle =
      currentInfluencer.twitterHandle?.replace("@", "") ||
      currentInfluencer.name;
    setSubscribingHandle(cleanHandle);

    const subscriptionFee = currentInfluencer.subscriptionPrice || 0;

    try {
      const response = await fetch("/api/subscribe-influencer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterId: session.user.id,
          influencerHandle: cleanHandle,
          subscriptionFee: subscriptionFee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to subscribe");
      }

      setSubscribedHandles((prev) => [...prev, cleanHandle]);
      await updateCredits();

      setSubscribingHandle(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to subscribe",
        {
          position: "top-center",
        }
      );
      setSubscribingHandle(null);
      setShowSubscribeModal(false);
    }
  };

  // Fetch influencers from API
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        // Check if we're in a browser environment where localStorage is available
        if (typeof window !== "undefined") {
          // Check if data exists in localStorage and is not expired
          try {
            const cachedData = localStorage.getItem("topMonthlyInfluencers");

            if (cachedData) {
              const { data, timestamp } = JSON.parse(cachedData);
              const now = new Date().getTime();
              const cacheTime = new Date(timestamp).getTime();
              const daysDiff = (now - cacheTime) / (1000 * 60 * 60 * 24);

              // If cache is less than 1 day old, use it (since we're now showing monthly data)
              if (daysDiff < 1) {
                setInfluencers(data.influencers);
                setTotalProfit(data.totalProfit || 0);
                setLoading(false);
                return;
              } else {
                // Remove expired cache
                localStorage.removeItem("topMonthlyInfluencers");
              }
            }
          } catch (e) {
            console.error("Error accessing localStorage:", e);
            // Continue to fetch from API if localStorage fails
          }
        }

        // If no valid cache or not in browser, fetch from API
        const response = await fetch("/api/top-weekly-influencers-data");
        if (!response.ok) {
          throw new Error("Failed to fetch influencers");
        }
        const data: ApiResponse = await response.json();

        // Store in localStorage with timestamp if available
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "topMonthlyInfluencers",
              JSON.stringify({
                data,
                timestamp: new Date().toISOString(),
              })
            );
          } catch (e) {
            console.error("Error writing to localStorage:", e);
            // Continue even if localStorage fails
          }
        }

        console.log("influencer data: ", data.influencers);

        setInfluencers(data.influencers);
        setTotalProfit(data.totalProfit || 0);
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
    // Skip rotation on mobile
    if (isMobile) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const rotationSpeed = 0.3;

    const animateCarousel = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime > 16.67) {
        setRotation((prev) => prev + rotationSpeed);
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(animateCarousel);
    };

    animationFrameId = requestAnimationFrame(animateCarousel);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobile]);

  // Front Influencer
  useEffect(() => {
    // Skip on mobile as it's handled by Swiper's onSlideChange
    if (isMobile || influencers.length === 0) return;

    const updateFrontInfluencer = () => {
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

    updateFrontInfluencer();
    const intervalId = setInterval(updateFrontInfluencer, 500);
    return () => clearInterval(intervalId);
  }, [rotation, influencers, isMobile]);

  function getCurrentMonthLabel(date = new Date()): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };
    const monthYear = date.toLocaleDateString("en-US", options);
    return `Top Monthly ROI Leaders: ${monthYear}`;
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <canvas ref={canvasRef} className="canvas-background" />
        <div className="starfield relative">
          <div className="overlay" />
        </div>
        <motion.div
          className="z-20 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-lg"
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
      <div className="min-h-screen text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <canvas ref={canvasRef} className="canvas-background" />
        <div className="starfield relative">
          <div className="overlay" />
        </div>
        <div className="backdrop-blur-md p-4 sm:p-6 rounded-xl border border-red-500/50 shadow-lg z-20">
          <p className="text-red-400 text-base sm:text-lg">{error}</p>
          <button
            className="mt-4 px-4 sm:px-6 py-2 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-gray-700 text-sm sm:text-base"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-leagueSpartan min-h-screen text-white flex flex-col items-center justify-start sm:justify-center relative overflow-hidden">
      <canvas ref={canvasRef} className="canvas-background" />
      <div className="starfield relative">
        <div className="overlay" />
      </div>

      <h1 className="font-leagueSpartan text-center sm:text-4xl mb-2 mt-10 sm:mt-16 text-cyan-400 z-20 text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Crypto Influencer Constellation
      </h1>
      <p className="text-gray-300 mb-4 sm:mb-8 text-center max-w-xl sm:max-w-3xl text-sm sm:text-lg z-20 px-4">
        Discover our top influencers by monthly ROI performance{" "}
        <span className="font-bold italic text-cyan-500">Updated daily</span>
      </p>

      <div className="backdrop-blur-lg text-xs sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)] z-30 border border-cyan-500/50 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {getCurrentMonthLabel()}
      </div>

      {isMobile ? (
        // Mobile view
        <>
          <MobileInfluencerCarousel
            influencers={influencers}
            subscribedHandles={subscribedHandles}
            subscribingHandle={subscribingHandle}
            onSubscribe={handleSubscribeInitiate}
            isLoadingSubscriptionData={isLoadingSubscriptionData}
          />
          <div className="my-2">
            <motion.div
              className="flex items-center gap-2 text-cyan-300 text-sm sm:text-base font-leagueSpartan font-semibold text-center py-2 px-4 rounded-full backdrop-blur-sm]"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: [0.6, 1, 0.6],
                x: 0,
                // boxShadow: [
                //   "0 0 10px rgba(0, 255, 255, 0.3)",
                //   "0 0 20px rgba(0, 255, 255, 0.5)",
                //   "0 0 10px rgba(0, 255, 255, 0.3)",
                // ],
              }}
              transition={{
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 0.5, ease: "easeOut" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              Swipe to View
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  x: [0, 5, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  x: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </motion.div>
          </div>

          {/* Net ROI button below the carousel */}
          <div className="mt-10 mb-8 z-30">
            <motion.div
              className="text-white text-xl font-bold px-4 py-2 rounded-lg  backdrop-blur-sm"
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
              Avg Monthly ROI: {(totalProfit || 0).toFixed(2).toLocaleString()}%
            </motion.div>
          </div>
        </>
      ) : (
        // Desktop view with 3D visualization
        <div className="relative w-full max-w-7xl h-[500px] sm:h-[650px] text-center overflow-hidden z-20">
          <div className="absolute w-full h-full top-0 left-0 perspective-[800px] sm:perspective-[1200px] z-20">
            <div
              ref={sliderRef}
              className="absolute top-[48%] left-1/2 w-0 h-0 [transform-style:preserve-3d] origin-center"
              style={{
                transform: `rotateX(${-20}deg) rotateY(${rotation}deg)`,
              }}
            >
              {influencers.map((influencer, index) => {
                const baseAngle = index * (360 / influencers.length);
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
                    className="absolute left-[-80px] top-[-90px] [transform-style:preserve-3d] transition-transform duration-300 hover:scale-125 touch-pan-y"
                    style={{
                      transform: `rotateY(${baseAngle}deg) translateZ(400px) rotateX(5deg)`,
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
                      className="absolute w-full text-cyan-300 text-xs font-semibold py-1.5 px-3 rounded-full border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
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
              className="text-white text-xl md:text-3xl font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm"
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
              Avg Monthly ROI: {(totalProfit || 0).toFixed(2).toLocaleString()}%
            </motion.div>
          </div>
        </div>
      )}
      {!isMobile && (
        <InfluencerDetails influencer={hoveredInfluencer || frontInfluencer} />
      )}

      {/* Subscription Confirmation Modal */}
      {showSubscribeModal && currentInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !subscribingHandle && setShowSubscribeModal(false)}
          />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-[#070915] p-6 shadow-2xl border border-blue-500/30">
            {subscribingHandle ? (
              // Subscribing state
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center mb-6">
                  <svg
                    className="animate-spin h-12 w-12 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Processing Subscription
                </h2>
                <p className="text-gray-400">
                  Please wait while we process your subscription...
                </p>
              </div>
            ) : subscribedHandles.includes(
              currentInfluencer.twitterHandle?.replace("@", "") ||
              currentInfluencer.name
            ) ? (
              // Success state
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center p-3 bg-green-500/15 rounded-full mb-4">
                  <FaCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Successfully Subscribed!
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-700 mx-auto my-3 rounded-full"></div>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  You will now receive trading signals from{" "}
                  <span className="font-semibold text-green-300">
                    {currentInfluencer.name}
                  </span>{" "}
                  for one month.
                </p>

                <div className="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-800/30">
                  <p className="text-green-300 text-sm mb-3">
                    We&apos;ll send you signals directly to your Telegram
                    account. Make sure you have connected your Telegram account
                    in your profile.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Credits Used:</span>
                    <span className="text-lg font-medium text-yellow-400">
                      {currentInfluencer.subscriptionPrice} Credits
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">Remaining Balance:</span>
                    <span className="text-lg font-medium text-blue-400">
                      {credits} Credits
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="w-full px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
              </div>
            ) : (
              // Initial state - confirmation
              <>
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-4">
                    <img
                      src={currentInfluencer.avatar}
                      alt={currentInfluencer.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-400/50"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Subscribe to {currentInfluencer.name}
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    You will receive trading signals from this analyst directly
                    to your Telegram for one month.
                  </p>
                </div>

                <div className="bg-[#111528] rounded-lg p-4 mb-6 border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-300">Subscription Fee:</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {currentInfluencer.subscriptionPrice} Credits
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Your Balance:</span>
                    <span className="text-lg font-medium text-blue-400">
                      {credits} Credits
                    </span>
                  </div>
                  {credits !== null &&
                    credits < (currentInfluencer.subscriptionPrice || 0) && (
                      <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
                        <p className="text-red-300 text-sm mb-2">
                          You don&apos;t have enough credits for this
                          subscription.
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Get More Credits
                        </Link>
                      </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowSubscribeModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={
                      credits !== null &&
                      credits < (currentInfluencer.subscriptionPrice || 0)
                    }
                    className={`flex items-center justify-center px-5 py-2.5 
                      ${credits !== null &&
                        credits < (currentInfluencer.subscriptionPrice || 0)
                        ? "bg-red-700/50 text-red-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                      } 
                      rounded-lg font-medium transition-all duration-200`}
                  >
                    {credits !== null &&
                      credits < (currentInfluencer.subscriptionPrice || 0)
                      ? "Insufficient Credits"
                      : "Confirm Subscription"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <CustomizeAgentModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onSkip={() => setIsCustomizeOpen(false)}
        customizationOptions={customizationOptions}
        setCustomizationOptions={setCustomizationOptions}
      />
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