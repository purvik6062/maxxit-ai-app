"use client";
import React from "react";
import { motion } from "framer-motion";
import { Influencer } from "./MobileInfluencerCarousel";

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

export default InfluencerDetails; 