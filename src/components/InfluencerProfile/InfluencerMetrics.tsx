"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

function InfluencerMetrics() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchInfluencer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-influencer-metrics/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Influencer not found"
              : "Failed to fetch influencer data"
          );
        }

        const data = await response.json();
        setInfluencer(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencer();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full animate-pulse" />
          <div className="flex w-full gap-4 justify-between">
            <div>
              <div className="h-6 w-40 bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-12 w-24 bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-20 bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 text-center">
        <h2 className="font-leagueSpartan text-xl font-semibold text-red-500">Error</h2>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!influencer) {
    return null;
  }

  const { userData, twitterHandle, subscribers } = influencer;
  const { publicMetrics, userProfileUrl, mindshare } = userData;

  const socialMetrics = [
    { label: "Followers", value: publicMetrics.followers_count?.toLocaleString() },
    { label: "Following", value: publicMetrics.following_count?.toLocaleString() },
    { label: "Tweets", value: publicMetrics.tweet_count?.toLocaleString() },
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
      colors: { left: "bg-green-600", right: "bg-rose-600" },
      labels: { left: "Herded", right: "Hidden" },
    },
    {
      label: "Conviction vs Hype",
      value: userData.convictionVsHype,
      display: userData.convictionVsHype,
      max: 10,
      isPercentage: false,
      colors: { left: "bg-amber-600", right: "bg-violet-600" },
      labels: { left: "Conviction", right: "Hype" },
    },
    {
      label: "Meme vs Institutional",
      value: userData.memeVsInstitutional,
      display: userData.memeVsInstitutional,
      max: 10,
      isPercentage: false,
      colors: { left: "bg-pink-600", right: "bg-teal-500" },
      labels: { left: "Meme", right: "Institutional" },
    },
  ];

  const renderMetricIndicator = (value, leftColor, rightColor) => {
    const normalizedValue = Math.max(-50, Math.min(50, value));
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
      className="max-w-7xl mx-auto my-6 p-6 md:p-8"
    >
      {/* Header Section */}
      <div className="font-leagueSpartan flex justify-between items-center gap-4 mb-8 bg-profile-header rounded-xl py-6 px-10" style={{border: "1px solid #6C7077"}}>
        <div className="flex items-center gap-4">
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
          </motion.div>
          <div>
            <div className="flex">
              <h1 className="font-leagueSpartan text-2xl font-bold text-white tracking-tight">{twitterHandle}</h1>
              <div className="relative font-medium text-gray-300 bg-[#14896E] px-3 py-1 rounded-md h-fit left-2 -top-2">
                <div className="flex items-center justify-center text-sm ">
                  {subscribers.length} Subscribers
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400">@{userData.username}</p>
          </div>
        </div>

        <div className="flex items-end gap-3 ">
          <div className="flex gap-8">
            {socialMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <p className="text-3xl font-semibold text-white">{metric.value}</p>
                <p className="text-sm text-gray-400">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Influence Metrics */}
      <div className="mb-10 bg-[#0E1725] py-12 px-10 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-5 font-leagueSpartan">Influence Metrics</h2>
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
                    className="h-2 bg-gradient-to-r from-blue-500 to-fuchsia-500 rounded-full"
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