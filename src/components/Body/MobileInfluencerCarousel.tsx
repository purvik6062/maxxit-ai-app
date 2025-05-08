"use client";
import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { FaCrown } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

export type Influencer = {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  recentWeekSignals: number;
  recentWeekTokens: number;
  specialties?: string[];
  twitterHandle?: string;
  subscriptionPrice?: number;
};

const swiperCardStyles = `
  .swiper-cards {
    overflow: visible;
  }
  .swiper-slide {
    background: linear-gradient(135deg, #0A0E1A 0%, #1A1E2E 50%, #1A2E3A 100%);
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    transform-style: preserve-3d;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .swiper-slide:not(.swiper-slide-active) {
    box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .swiper-slide:not(.swiper-slide-active)::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.2);
    z-index: -1;
  }
  .swiper-slide-active {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  }
  .blurred-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    opacity: 0.3;
    z-index: -1;
  }
`;

interface MobileInfluencerCarouselProps {
  influencers: Influencer[];
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (influencer: Influencer) => void;
}

const MobileInfluencerCarousel: React.FC<MobileInfluencerCarouselProps> = ({
  influencers,
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
}) => {
  console.log("Influencers:", influencers);
  console.log("Subscribed handles: ", subscribedHandles);
  console.log("Subscribing handles: ", subscribingHandle)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: swiperCardStyles }} />
      <div
        className="w-full px-4 pt-20 pb-4 z-20 mx-auto"
        style={{ maxWidth: "min(400px, 90vw)" }}
      >
        <Swiper
          effect={"cards"}
          grabCursor={true}
          modules={[EffectCards]}
          // loop={true}
          className="w-full h-[380px] xs:h-[400px] sm:h-[420px]"
        >
          {influencers.slice(0, 6).map((influencer) => {
            const cleanHandle = influencer.name;
            const isSubscribed = subscribedHandles.includes(cleanHandle);
            const isCurrentlySubscribing = subscribingHandle === cleanHandle;
            const creditCost = influencer.subscriptionPrice || 0;

            return (
              <SwiperSlide
                key={influencer.id}
                className="backdrop-blur-md rounded-xl border border-gray-700/60 overflow-hidden"
              >
                <div
                  className="blurred-background"
                  style={{ backgroundImage: `url(${influencer.avatar})` }}
                />
                <motion.div
                  className="w-full h-full flex flex-col items-center justify-center p-4 relative"
                  initial={{ opacity: 0.9 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="relative mb-3"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-gray-600/10 rounded-xl -m-1 blur-sm" />
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-md relative z-10"
                    />
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/20 z-20" />
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center gap-1 mb-3"
                    initial={{ y: 5, opacity: 0.8 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <h3 className="text-base xs:text-lg font-bold text-white">
                      {influencer.name}
                    </h3>
                    <p className="text-xs text-gray-400 text-center">
                      {influencer.specialties?.join(", ") || "Crypto Analysis"}
                    </p>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-3 w-full gap-1.5 mt-1"
                    initial={{ y: 5, opacity: 0.8 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <div className="bg-gray-800/80 p-2 rounded-lg text-center border border-gray-700/30">
                      <p className="text-[10px] xs:text-xs text-gray-400">Signals (7d)</p>
                      <p className="text-xs xs:text-sm font-medium text-cyan-400">
                        {influencer.recentWeekSignals?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/80 p-2 rounded-lg text-center border border-gray-700/30">
                      <p className="text-[10px] xs:text-xs text-gray-400">Tokens (7d)</p>
                      <p className="text-xs xs:text-sm font-medium text-cyan-400">
                        {influencer.recentWeekTokens?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/80 p-2 rounded-lg text-center border border-gray-700/30">
                      <p className="text-[10px] xs:text-xs text-gray-400">Followers</p>
                      <p className="text-xs xs:text-sm font-medium text-cyan-400">
                        {influencer.followers?.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>

                  {/* Subscribe button */}
                  <motion.div
                    className="mt-4 w-full"
                    initial={{ y: 5, opacity: 0.8 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <button
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium ${isSubscribed || isCurrentlySubscribing
                        ? "bg-gradient-to-r from-green-600/50 to-green-500/50 text-green-200 border border-green-500/30"
                        : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white border border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        } transition-all duration-200 ${isCurrentlySubscribing ? "animate-pulse" : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSubscribed && !isCurrentlySubscribing && onSubscribe) {
                          onSubscribe(influencer);
                        }
                      }}
                      disabled={isSubscribed || isCurrentlySubscribing || !onSubscribe}
                    >
                      {isCurrentlySubscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : isSubscribed ? (
                        <>
                          <FaCrown className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Subscribed</span>
                        </>
                      ) : (
                        <>
                          <FaCrown className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Subscribe{creditCost > 0 ? ` (${creditCost} Credits)` : ""}</span>
                        </>
                      )}
                    </button>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gradient-to-r from-cyan-500/20 via-cyan-400/20 to-gray-700/20 rounded-full"
                    animate={{
                      width: ["20%", "30%", "20%"],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
};

export default React.memo(MobileInfluencerCarousel);