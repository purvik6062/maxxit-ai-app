"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa6";

function InfluencerMetrics() {
  const influencer = {
    twitterHandle: "cryptostasher",
    subscribers: ["p_99", "harvey14", "meetpaladiya44", "chain"], // Still used for count
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
      colors: { left: "bg-teal-400", right: "bg-blue-500" },
      labels: { left: "Herded", right: "Hidden" },
    },
    {
      label: "Conviction vs Hype",
      value: userData.convictionVsHype,
      display: userData.convictionVsHype,
      max: 10,
      isPercentage: false,
      colors: { left: "bg-amber-500", right: "bg-purple-500" },
      labels: { left: "Conviction", right: "Hype" },
    },
    {
      label: "Meme vs Institutional",
      value: userData.memeVsInstitutional,
      display: userData.memeVsInstitutional,
      max: 10,
      isPercentage: false,
      colors: { left: "bg-cyan-400", right: "bg-pink-500" },
      labels: { left: "Meme", right: "Institutional" },
    },
  ];

  const renderMetricIndicator = (value: number, leftColor: string, rightColor: string) => {
    const normalizedValue = Math.max(-50, Math.min(50, value * 5));
    const leftPercentage = ((normalizedValue + 50) / 100) * 100;
    const rightPercentage = 100 - leftPercentage;

    return (
      <div className="w-full flex flex-col gap-1">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="flex h-full w-full">
            <div
              className={`${leftColor} h-full transition-all duration-300`}
              style={{ width: `${leftPercentage}%` }}
            ></div>
            <div
              className={`${rightColor} h-full transition-all duration-300`}
              style={{ width: `${rightPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

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
          className="relative w-24 h-24"
        >
          <Image
            src={userProfileUrl}
            alt={twitterHandle}
            width={500}
            height={500}
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
        <div className="flex w-full gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{twitterHandle}</h1>
            <p className="text-sm text-gray-400">@{userData.username}</p>
          </div>
          <div className="font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded-xl">
            <div className="flex items-center justify-center text-2xl font-bold">
              {subscribers.length}
            </div>
            <div className="text-sm flex items-center">
              Subscribers
            </div>
          </div>
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
                <div>

                  {renderMetricIndicator(metric.value, metric.colors.left, metric.colors.right)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default InfluencerMetrics;