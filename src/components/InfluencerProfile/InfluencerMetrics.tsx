"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InfluencerProfileHeader from "./InfluencerProfileHeader";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useCredits } from "@/context/CreditsContext";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";

interface InfluencerMetricsProps {
  influencerId?: string | string[];
}

function InfluencerMetrics({ influencerId }: InfluencerMetricsProps = {}) {
  const id = influencerId;
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const { credits, updateCredits } = useCredits();

  // Subscription state
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const [subscribingHandle, setSubscribingHandle] = useState<string | null>(
    null
  );
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      console.error("No influencer ID provided");
      setError("No influencer ID provided");
      setLoading(false);
      return;
    }

    const idString = Array.isArray(id) ? id[0] : id;
    const isValidMongoID = /^[0-9a-fA-F]{24}$/.test(idString);
    console.log("ID validation:", { id: idString, isValidMongoID });

    const fetchInfluencer = async () => {
      try {
        setLoading(true);
        console.log("Fetching influencer data for ID:", idString);
        const response = await fetch(
          `/api/get-influencer-metrics/${idString}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from API:", errorData);
          throw new Error(
            response.status === 404
              ? "Influencer not found"
              : `Failed to fetch influencer data: ${
                  errorData.error || response.statusText
                }`
          );
        }

        const data = await response.json();
        console.log("Influencer data received:", data);
        setInfluencer(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching influencer data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencer();
  }, [id]);

  // Fetch subscribed handles
  useEffect(() => {
    const fetchSubscribedHandles = async () => {
      if (!session || !session.user?.id) return;

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
      }
    };

    fetchSubscribedHandles();
  }, [session]);

  const handleSubscribeInitiate = (agent: any) => {
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
      // Trigger the onboarding modal through a custom event
      window.dispatchEvent(new Event("showOnboarding"));
      return;
    }

    setCurrentAgent(agent);
    setShowSubscribeModal(true);
  };

  const handleSubscribe = async () => {
    if (!session || !session.user?.id || !currentAgent) {
      toast.error("Please login with Twitter/X first", {
        position: "top-center",
      });
      return;
    }

    const cleanHandle = currentAgent.twitterHandle.replace("@", "");
    setSubscribingHandle(cleanHandle);

    const subscriptionFee = currentAgent.subscriptionPrice;

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

      // Don't close the modal immediately, change it to success state
      setSubscribingHandle(null);

      // Success is now shown in the modal UI, no need for toast
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 rounded-full animate-pulse" />
          <div className="flex w-full flex-col sm:flex-row sm:gap-4 sm:justify-between">
            <div>
              <div className="h-6 w-32 sm:w-40 bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-10 w-20 sm:h-12 sm:w-24 bg-gray-800 rounded-xl animate-pulse mt-4 sm:mt-0" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8 sm:mb-10">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-16 sm:h-20 bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="h-4 w-24 sm:w-32 bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 text-center">
        <p className="text-base sm:text-lg text-red-500">{error}</p>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-500 mt-4">
          Influencer Profile
        </h2>
        <p className="text-sm sm:text-base text-gray-400 mt-2 sm:mt-4">
          Your influencer profile is being set up. Please check back soon to see
          your metrics.
        </p>
        <p className="text-sm sm:text-base text-gray-400 mt-2">
          It may take a few moments for your profile data to be processed.
        </p>
      </div>
    );
  }

  if (!influencer) {
    return null;
  }

  const { userData, twitterHandle, subscribers, subscriptionPrice } =
    influencer;
  const { publicMetrics, userProfileUrl, mindshare } = userData;

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
        <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
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
      className="max-w-7xl mx-auto my-4"
    >
      {/* Header Section */}
      <InfluencerProfileHeader
        userProfileUrl={userProfileUrl}
        twitterHandle={twitterHandle}
        username={userData.username}
        subscribers={subscribers}
        publicMetrics={publicMetrics}
        impactFactor={userData.impactFactor || 0}
        subscriptionPrice={subscriptionPrice}
        onSubscribe={handleSubscribeInitiate}
        subscribedHandles={subscribedHandles}
        subscribingHandle={subscribingHandle}
      />

      {/* Influence Metrics */}
      <div className="mb-8 sm:mb-10 bg-[#0E1725] py-8 sm:py-10 px-6 sm:px-10 rounded-xl">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-4 sm:mb-5 font-leagueSpartan">
          Influence Metrics
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {influenceMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-300">
                  {metric.label}
                </span>
              </div>
              {metric.isPercentage ? (
                <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{
                      delay: index * 0.1 + 0.2,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                  />
                </div>
              ) : (
                <div>
                  {renderMetricIndicator(
                    metric.value,
                    metric.colors.left,
                    metric.colors.right
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscription Confirmation Modal */}
      {showSubscribeModal && currentAgent && (
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
                currentAgent.twitterHandle.replace("@", "")
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
                    {currentAgent.name}
                  </span>{" "}
                  for one month.
                </p>

                <div className="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-800/30">
                  <p className="text-green-300 text-sm mb-3">
                    We'll send you signals directly to your Telegram account.
                    Make sure you have connected your Telegram account in your
                    profile.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Credits Used:</span>
                    <span className="text-lg font-medium text-yellow-400">
                      {currentAgent.subscriptionPrice} Credits
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
                      src={
                        currentAgent.profileUrl ||
                        `https://picsum.photos/seed/${encodeURIComponent(
                          currentAgent.twitterHandle
                        )}/64/64`
                      }
                      alt={currentAgent.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-400/50"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Subscribe to {currentAgent.name}
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
                      {currentAgent.subscriptionPrice} Credits
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Your Balance:</span>
                    <span className="text-lg font-medium text-blue-400">
                      {credits} Credits
                    </span>
                  </div>
                  {credits !== null &&
                    credits < currentAgent.subscriptionPrice && (
                      <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
                        <p className="text-red-300 text-sm mb-2">
                          You don't have enough credits for this subscription.
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
                      credits < currentAgent.subscriptionPrice
                    }
                    className={`flex items-center justify-center px-5 py-2.5 
                      ${
                        credits !== null &&
                        credits < currentAgent.subscriptionPrice
                          ? "bg-red-700/50 text-red-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                      } 
                      rounded-lg font-medium transition-all duration-200`}
                  >
                    {credits !== null &&
                    credits < currentAgent.subscriptionPrice
                      ? "Insufficient Credits"
                      : "Confirm Subscription"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default InfluencerMetrics;
