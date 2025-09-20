"use client";
import React, { useState } from "react";
import {
  FaCheck,
  FaExternalLinkAlt,
  FaCrown,
  FaChevronDown,
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, easeOut } from "framer-motion";
import { useSession } from "next-auth/react";
import { useLoginModal } from "@/context/LoginModalContext";
import { useCredits } from "@/context/CreditsContext";
import CustomizeAgentModal, { CustomizationOptions } from "../Global/CustomizeAgentModal";

interface Agent {
  twitterHandle: string;
  name: string;
  profileUrl?: string;
  verified?: boolean;
  impactFactor?: number;
  heartbeat?: number;
  mindshare?: number;
  followers?: number;
  herdedVsHidden?: number;
  convictionVsHype?: number;
  memeVsInstitutional?: number;
  subscribers?: number;
  signals?: number;
  tokens?: number;
  subscriptionPrice?: number;
}

interface MobileAnalystCardProps {
  agent: Agent;
  rank: number;
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (agent: Agent) => void;
  primaryField: string;
  primaryLabel: string;
  formatFollowersCount: (num?: number) => string;
  renderMetricIndicator: (
    value: number,
    leftColor: string,
    rightColor: string
  ) => React.ReactNode;
  isCurrentUser?: boolean;
}

const MobileAnalystCard: React.FC<MobileAnalystCardProps> = ({
  agent,
  rank,
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
  primaryField,
  primaryLabel,
  formatFollowersCount,
  renderMetricIndicator,
  isCurrentUser = false,
}) => {
  const { data: session } = useSession();
  const { showLoginModal } = useLoginModal();
  const { credits, isAgentCustomized } = useCredits();
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

  const cleanHandle = agent.twitterHandle.replace("@", "");
  const isSubscribed = subscribedHandles.includes(cleanHandle);
  const isCurrentlySubscribing = subscribingHandle === cleanHandle;
  const creditCost =
    agent.subscriptionPrice || Math.floor((agent.impactFactor || 0) * 10);

  // State for dropdown
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation variants for dropdown content
  const contentVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: easeOut },
    },
  };

  // Render metric
  const renderMetric = (metric: string) => {
    switch (metric) {
      case "herdedVsHidden":
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-red-400">Herded</span>
                <span className="text-[10px] text-gray-300">vs</span>
                <span className="text-[10px] text-cyan-400">Hidden</span>
              </div>
            </div>
            {renderMetricIndicator(
              agent.herdedVsHidden || 0,
              "bg-red-400",
              "bg-cyan-400"
            )}
          </div>
        );
      case "convictionVsHype":
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-green-400">Conviction</span>
                <span className="text-[10px] text-gray-300">vs</span>
                <span className="text-[10px] text-rose-400">Hype</span>
              </div>
            </div>
            {renderMetricIndicator(
              agent.convictionVsHype || 0,
              "bg-green-500",
              "bg-rose-500"
            )}
          </div>
        );
      case "memeVsInstitutional":
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-yellow-300">Meme</span>
                <span className="text-[10px] text-gray-300">vs</span>
                <span className="text-[10px] text-gray-100">Institutional</span>
              </div>
            </div>
            {renderMetricIndicator(
              agent.memeVsInstitutional || 0,
              "bg-yellow-300",
              "bg-gray-100"
            )}
          </div>
        );
      case "mindshare":
        return (
          <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-700/20">
            <span className="text-[10px] text-blue-400">Mindshare</span>
            <p className="text-xs font-semibold text-white">
              {agent.mindshare != null && agent.mindshare > 0
                ? `${agent.mindshare.toFixed(2)}%`
                : "--"}
            </p>
          </div>
        );
      case "followers":
        return (
          <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-700/20">
            <span className="text-[10px] text-blue-400">Followers</span>
            <p className="text-xs font-semibold text-white">
              {agent.followers != null && agent.followers > 0
                ? formatFollowersCount(agent.followers)
                : "--"}
            </p>
          </div>
        );
      case "credits":
        return (
          <div className="bg-amber-900/20 rounded-lg p-2 border border-amber-700/20">
            <span className="text-[10px] text-amber-400">Credits</span>
            <p className="text-xs font-semibold text-amber-300">
              {creditCost || "--"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      showLoginModal(
        "Please login to subscribe to this analyst",
        window.location.pathname
      );
      return;
    }

    if (credits !== null && credits < creditCost) {
      // Navigate to pricing page if insufficient credits
      window.location.href = "/pricing";
      return;
    }

    if (!isSubscribed && !isCurrentlySubscribing) {
      if (isAgentCustomized === false) {
        setIsCustomizeOpen(true);
        return;
      }
      onSubscribe(agent);
    }
  };

  return (
    <motion.div
      className="impact-card list-item relative bg-gray-900/30 backdrop-blur-md border border-gray-800/20 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300"
      onClick={() =>
        !isExpanded && (window.location.href = `/influencer/${cleanHandle}`)
      }
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-2 py-4 bg-gradient-to-r from-gray-900/50 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full ${isCurrentUser
              ? "bg-blue-700 text-white"
              : "bg-gray-800 text-gray-400"
              } text-xs font-bold flex-shrink-0`}
          >
            {rank}
          </div>
          {agent.twitterHandle && (
            <div className="relative w-8 h-8 flex-shrink-0">
              <img
                src={agent.profileUrl && agent.profileUrl.trim().length > 0
                  ? agent.profileUrl
                  : `https://picsum.photos/seed/${encodeURIComponent(
                    agent.twitterHandle
                  )}/40/40`
                }
                alt={agent.name}
                className={`w-full h-full object-cover rounded-full border ${isCurrentUser ? "border-blue-500" : "border-gray-700/50"
                  }`}
              />
              {agent.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                  <FaCheck className="w-1.5 h-1.5 text-white" />
                </div>
              )}
            </div>
          )}
          <div className="flex-grow overflow-hidden">
            <h4
              className={`text-[12px] max-w-16 xs:max-w-44 sm:max-w-52 md:max-w-full sm:text-sm font-semibold text-white truncate ${isCurrentUser ? "text-blue-300" : ""
                }`}
            >
              {agent.name}
              {isCurrentUser && (
                <span className="ml-1 text-[10px] text-blue-400">(You)</span>
              )}
            </h4>
            <p
              className={`text-[11px] text-gray-400 truncate ${isCurrentUser ? "" : ""
                }`}
            >
              {agent.twitterHandle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-gray-300">
              {primaryLabel}
            </div>
            <div className="text-sm font-bold text-blue-400">
              {agent[primaryField] ?? "--"}
            </div>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown className="w-4 h-4 text-gray-300" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Dropdown Content */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate={isExpanded ? "visible" : "hidden"}
        className="overflow-hidden"
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Metrics */}
          <div className="flex flex-col gap-3">
            {/* Herded vs Hidden */}
            {renderMetric("herdedVsHidden")}
            {/* Conviction vs Hype */}
            {renderMetric("convictionVsHype")}
            {/* Meme vs Institutional */}
            {renderMetric("memeVsInstitutional")}
            {/* Mindshare, Followers and Credits (Side by Side) */}
            <div className="grid grid-cols-3 gap-3">
              {renderMetric("mindshare")}
              {renderMetric("followers")}
              {renderMetric("credits")}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3">
            <Link
              href={`https://x.com/${cleanHandle}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="group flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-xs bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-blue-300 transition-all duration-200 relative overflow-hidden"
            >
              <FaExternalLinkAlt className="w-3 h-3 mr-1" />
              View Profile
              <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <button
              className={`group flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-xs ${isSubscribed || isCurrentlySubscribing
                ? "bg-green-500/20 text-green-300"
                : credits !== null && credits < creditCost
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                } transition-all duration-200 relative overflow-hidden ${isCurrentlySubscribing ? "animate-pulse" : ""
                }`}
              onClick={handleSubscribeClick}
              disabled={isSubscribed || isCurrentlySubscribing}
              title={
                credits !== null && credits < creditCost
                  ? "Click to get more credits"
                  : undefined
              }
            >
              {isCurrentlySubscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <FaCrown size={12} className="mr-1 flex-shrink-0" />
                  Subscribed
                </>
              ) : credits !== null && credits < creditCost ? (
                <>
                  <FaCrown size={12} className="mr-1 flex-shrink-0" />
                  Get More Credits ({creditCost})
                </>
              ) : (
                <>
                  <FaCrown size={12} className="mr-1 flex-shrink-0" />
                  Subscribe ({creditCost})
                </>
              )}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
        <CustomizeAgentModal
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          onSkip={() => setIsCustomizeOpen(false)}
          onContinue={() => {
            // Regular usage: modal will handle API call and close itself
            // This callback is just for interface completion
          }}
          customizationOptions={customizationOptions}
          setCustomizationOptions={setCustomizationOptions}
          hasCustomizedAgent={isAgentCustomized}
          setHasCustomizedAgent={() => {
            // This will be handled by the modal's API call
          }}
          isOnboardingFlow={false}
        />
      </motion.div>
    </motion.div>
  );
};

export default React.memo(MobileAnalystCard);
