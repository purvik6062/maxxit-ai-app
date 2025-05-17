"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLoginModal } from "@/context/LoginModalContext";

interface InfluencerProfileHeaderProps {
  userProfileUrl: string;
  twitterHandle: string;
  username: string;
  subscribers: any[];
  publicMetrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  impactFactor?: number;
  subscriptionPrice?: number;
  onSubscribe?: (agent: any) => void;
  subscribedHandles?: string[];
  subscribingHandle?: string | null;
}

function InfluencerProfileHeader({
  userProfileUrl,
  twitterHandle,
  username,
  subscribers,
  publicMetrics,
  impactFactor = 0,
  subscriptionPrice,
  onSubscribe,
  subscribedHandles = [],
  subscribingHandle = null,
}: InfluencerProfileHeaderProps) {
  const { data: session } = useSession();
  const { showLoginModal } = useLoginModal();

  const socialMetrics = [
    {
      label: "Followers",
      value: publicMetrics.followers_count?.toLocaleString(),
    },
    {
      label: "Following",
      value: publicMetrics.following_count?.toLocaleString(),
    },
    { label: "Tweets", value: publicMetrics.tweet_count?.toLocaleString() },
  ];

  const cleanHandle = username;
  const isSubscribed = subscribedHandles.includes(cleanHandle);
  const isCurrentlySubscribing = subscribingHandle === cleanHandle;

  // Create agent object to match the structure expected by onSubscribe
  const handleSubscribe = () => {
    if (!session) {
      showLoginModal(
        "Please login to subscribe to this analyst",
        window.location.pathname
      );
      return;
    }

    if (onSubscribe) {
      const agent = {
        twitterHandle: username,
        name: twitterHandle,
        profileUrl: userProfileUrl,
        impactFactor,
        subscriptionPrice,
        followers: publicMetrics.followers_count,
      };
      onSubscribe(agent);
    }
  };

  return (
    <div
      className="font-leagueSpartan flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sm:mb-8 bg-profile-header rounded-xl py-4 sm:py-6 px-6 sm:px-10"
      style={{ border: "1px solid #6C7077" }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
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
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h1 className="font-leagueSpartan text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              {twitterHandle}
            </h1>
            <div className="relative font-medium text-gray-300 bg-[#14896E] px-3 py-1 rounded-md h-fit left-2 -top-2">
              {subscribers.length} Subscribers
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <p className="text-xs sm:text-sm text-gray-400">@{username}</p>
            <div>
              <Link
                href={`https://x.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title={`Visit @${username} on X`}
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full sm:w-auto gap-4">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {socialMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                {metric.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {onSubscribe && (
          <button
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md min-w-[140px] ${
              isSubscribed || isCurrentlySubscribing
                ? "bg-gradient-to-r from-green-600/50 to-green-500/50 text-green-200 border border-green-500/30"
                : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white border border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            } ${isCurrentlySubscribing ? "animate-pulse" : ""}`}
            onClick={handleSubscribe}
            disabled={isSubscribed || isCurrentlySubscribing}
          >
            {isCurrentlySubscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
              <>
                <FaCrown size={14} className="mr-2 text-yellow-300" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <FaCrown size={14} className="mr-2 text-yellow-300" />
                <span>Subscribe ({subscriptionPrice} Credits)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default InfluencerProfileHeader;
