"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function InfluencerMetrics() {
  const influencer = {
    twitterHandle: "cryptostasher",
    subscribers: ["p_99", "harvey14", "meetpaladiya44", "chain"],
    userData: {
      userId: "1380310247575851008",
      username: "cryptostasher",
      verified: false,
      publicMetrics: {
        followers_count: 33810,
        following_count: 324,
        tweet_count: 3268,
        listed_count: 243,
        like_count: 2537,
        media_count: 917,
      },
      userProfileUrl: "https://pbs.twimg.com/profile_images/1855572086648897536/-EjWHVds_normal.jpg",
      mindshare: 0.69,
      herdedVsHidden: 7,
      convictionVsHype: 7,
      memeVsInstitutional: 7,
    },
  };

  const [isHovered, setIsHovered] = useState(false);
  const { userData, twitterHandle, subscribers } = influencer;
  const { publicMetrics, userProfileUrl, verified, mindshare } = userData;

  const socialMetrics = [
    { label: "Followers", value: publicMetrics.followers_count.toLocaleString() },
    { label: "Following", value: publicMetrics.following_count.toLocaleString() },
    { label: "Tweets", value: publicMetrics.tweet_count.toLocaleString() },
    { label: "Likes", value: publicMetrics.like_count.toLocaleString() },
    { label: "Media", value: publicMetrics.media_count.toLocaleString() },
    { label: "Lists", value: publicMetrics.listed_count.toLocaleString() },
  ];

  const influenceMetrics = [
    {
      label: "Mindshare",
      value: mindshare * 100,
      display: `${(mindshare * 100).toFixed(1)}%`,
      max: 100,
      isPercentage: true,
    },
    {
      label: "Herded vs Hidden",
      value: userData.herdedVsHidden,
      display: userData.herdedVsHidden,
      max: 10,
      isPercentage: false,
    },
    {
      label: "Conviction vs Hype",
      value: userData.convictionVsHype,
      display: userData.convictionVsHype,
      max: 10,
      isPercentage: false,
    },
    {
      label: "Meme vs Institutional",
      value: userData.memeVsInstitutional,
      display: userData.memeVsInstitutional,
      max: 10,
      isPercentage: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto bg-gray-950/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800/50"
    >
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative"
        >
          <Image
            src={userProfileUrl}
            alt={twitterHandle}
            width={80}
            height={80}
            className="rounded-full border-2 border-gray-700 shadow-lg"
            priority
          />
          {verified && (
            <span className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1.5 shadow-md">
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{twitterHandle}</h1>
          <p className="text-sm text-gray-400">@{userData.username}</p>
        </div>
      </div>

      {/* Social Metrics */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5">Social Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {socialMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="relative overflow-hidden p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:bg-gray-900/80 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <p className="text-xs text-gray-400">{metric.label}</p>
              <p className="text-lg font-semibold text-white">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Influence Metrics */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5">Influence Metrics</h2>
        <div className="space-y-6">
          {influenceMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{metric.label}</span>
                <span className="text-sm font-medium text-white">{metric.display}</span>
              </div>
              {metric.isPercentage ? (
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              ) : (
                <div className="w-full h-2 bg-gray-800 rounded-full relative overflow-hidden">
                  <div className="absolute left-1/2 w-px h-4 bg-gray-500 -translate-x-1/2 -translate-y-1/2" />
                  <motion.div
                    className={`h-2 rounded-full ${metric.value >= 0
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "bg-gradient-to-r from-red-500 to-pink-500"
                      }`}
                    initial={{ width: 0, x: 0 }}
                    animate={{
                      width: `${(Math.abs(metric.value) / metric.max) * 50}%`,
                      x: metric.value >= 0 ? "0%" : "-100%",
                    }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                    style={{
                      left: metric.value >= 0 ? "50%" : "auto",
                      right: metric.value < 0 ? "50%" : "auto",
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscribers */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-5">Top Subscribers</h2>
        <div className="flex flex-wrap gap-3">
          {subscribers.map((subscriber, index) => (
            <motion.span
              key={subscriber}
              className="px-3 py-1 text-sm text-blue-300 bg-blue-900/30 rounded-full hover:bg-blue-900/50 hover:text-blue-200 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              @{subscriber}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default InfluencerMetrics;