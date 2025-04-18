// components/HeartbeatDashboard.tsx
"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  FaTrophy,
  FaCrown,
  FaCheck,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
} from "react-icons/fa";
// Assuming a different primary icon might be relevant for "Heartbeat"
import { HeartPulse, TrendingUp, BarChart2, ArrowUpDown } from "lucide-react";
import { LuWandSparkles } from "react-icons/lu"; // Or a different title icon
import gsap from "gsap";
import {
  Loader2,
  AlertCircle,
  SearchX,
  ChevronUp,
  Shield, // Keep for top 3 card example stats
  Users,
  InfoIcon,
} from "lucide-react";
import { RiPulseLine } from "react-icons/ri"; // Keep for top 3 button example
import { useGSAP } from "@gsap/react";
// *** Replace with your actual hook for Heartbeat data ***
import { useHeartbeatLeaderboard } from "@/hooks/useHeartbeatLeaderboard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- UMD Interfaces (Copied directly) ---
interface PublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  like_count: number;
  media_count: number;
}

interface UserData {
  userId: string;
  username: string;
  verified: boolean;
  publicMetrics: PublicMetrics;
  userProfileUrl: string;
  mindshare: number;
  herdedVsHidden: number;
  convictionVsHype: number;
  memeVsInstitutional: number;
}

interface UserResponse {
  _id: string;
  lastUpdated: string;
  userData: UserData;
}

// --- Heartbeat Agent Interface (Adjusted) ---
interface HeartbeatAgentBase {
  name: string;
  handle: string;
  heartbeat?: number; // Primary metric for this dashboard
  // Add any other metrics provided by useHeartbeatData if needed for top 3 cards
  beat?: number;
  signals?: number;
  mindshare?: number;
}

// Combined interface for merged data
interface EnhancedHeartbeatAgent extends HeartbeatAgentBase {
  // Fields from UMD
  userData?: UserData;
  profileUrl?: string;
  verified?: boolean;
  mindshare?: number;
  followers?: number;
  herdedVsHidden?: number;
  convictionVsHype?: number;
  memeVsInstitutional?: number;
}

// --- SortField Type (Adjusted) ---
type SortField =
  | "heartbeat" // Changed from impactFactor
  | "mindshare"
  | "followers"
  | "username"
  | "herdedVsHidden"
  | "convictionVsHype"
  | "memeVsInstitutional";
type SortDirection = "asc" | "desc";

// --- Component Props (Copied, assuming subscription is needed) ---
interface HeartbeatDashboardProps {
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (handle: string) => void;
  setRefreshData: (refresh: () => void) => void; // For the heartbeat data source
  searchText: string;
}

// --- Component Definition ---
const HeartbeatDashboard: React.FC<HeartbeatDashboardProps> = ({
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
  setRefreshData,
  searchText,
}) => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);

  // *** Use the Heartbeat data hook ***
  const {
    agents: heartbeatAgents, // Renamed
    loading: loadingHeartbeat, // Renamed
    error,
    refreshData,
  } = useHeartbeatLeaderboard(); // Using the assumed hook

  // --- State Variables (Copied directly) ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({}); // For Top 3 cards
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  // const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [umdUsers, setUmdUsers] = useState<UserResponse[]>([]);
  const [enhancedAgents, setEnhancedAgents] = useState<
    EnhancedHeartbeatAgent[]
  >([]); // Use specific type
  const [loadingUmd, setLoadingUmd] = useState(true);
  // *** Default sort field changed ***
  const [sortField, setSortField] = useState<SortField>("heartbeat");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [hoveredIconRef, setHoveredIconRef] = useState<EventTarget | null>(
    null
  );
  const router = useRouter();

  // --- Helper Functions (Copied, potentially adjust getRandomStat if needed) ---

  // Example: Keep random stats for top 3, or use real data if useHeartbeatData provides it
  const getRandomStat = (handle: string, type: string): number => {
    const seed = handle
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseValue = (seed % 30) + 50;
    switch (type) {
      case "beat":
        return (baseValue + 5) % 100;
      case "signals":
        return (baseValue + 10) % 100;
      case "mindshare":
        return (baseValue + 15) % 100;
      default:
        return baseValue;
    }
  };

  // --- Tooltip Handlers ---
  const handleTooltipEnter = (
    event: React.MouseEvent<SVGElement>,
    tooltipId: string
  ) => {
    const iconElement = event.currentTarget;
    const rect = iconElement.getBoundingClientRect();

    // Calculate position relative to the document, not just viewport
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX + rect.width / 2; // Center horizontally

    setTooltipCoords({ top, left });
    setShowTooltip(tooltipId);
  };

  const handleTooltipLeave = () => {
    setShowTooltip(null);
    setTooltipCoords(null);
  };

  const toggleStats = (handle: string) => {
    setShowStats((prev) => ({ ...prev, [handle]: !prev[handle] }));
  };

  // --- Hooks for Data Fetching & Merging (Copied, adapted for heartbeat) ---

  // Fetch UMD data (Identical to EL)
  useEffect(() => {
    async function fetchUserMetricsData() {
      /* ...identical code... */
      try {
        const response = await fetch("/api/get-user-profile-data");
        const data: UserResponse[] = await response.json();
        setUmdUsers(data);
        setLoadingUmd(false);
      } catch (error) {
        console.error("Failed to fetch user metrics data:", error);
        setLoadingUmd(false);
      }
    }
    fetchUserMetricsData();
  }, []);

  // Merge data (Adapted for heartbeatAgents)
  useEffect(() => {
    if (!loadingHeartbeat && !loadingUmd && heartbeatAgents.length > 0) {
      // Use heartbeat loading state
      const merged = heartbeatAgents.map((agent) => {
        // Use heartbeat agents
        const matchingUser = umdUsers.find(
          (user) =>
            user.userData.username.toLowerCase() ===
            agent.handle.replace("@", "").toLowerCase()
        );
        return {
          ...agent, // Spread the base heartbeat agent data
          userData: matchingUser?.userData,
          profileUrl: matchingUser?.userData.userProfileUrl || "",
          verified: matchingUser?.userData.verified || false,
          mindshare: matchingUser?.userData.mindshare || 0,
          followers: matchingUser?.userData.publicMetrics?.followers_count || 0,
          herdedVsHidden: matchingUser?.userData.herdedVsHidden || 50,
          convictionVsHype: matchingUser?.userData.convictionVsHype || 50,
          memeVsInstitutional: matchingUser?.userData.memeVsInstitutional || 50,
        };
      });
      setEnhancedAgents(merged); // Set the state with merged data
    }
    // Depend on heartbeat loading state
  }, [heartbeatAgents, umdUsers, loadingHeartbeat, loadingUmd]);

  // Handle refresh (Identical, relies on refreshData from useHeartbeatData)
  React.useEffect(() => {
    const wrappedRefreshData = async () => {
      /* ...identical code... */
      console.log("HeartbeatDashboard: Starting refresh");
      setIsRefreshing(true);
      try {
        await refreshData(); // Call refresh from useHeartbeatData
        console.log("HeartbeatDashboard: Refresh completed");
      } finally {
        setIsRefreshing(false);
      }
    };
    setRefreshData(() => wrappedRefreshData);
  }, [refreshData, setRefreshData]);

  // --- Sorting Logic (Copied, adapted for SortField type and primary metric) ---

  const sortAgents = (field: SortField) => {
    /* ...identical code... */
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const renderMetricIndicator = (
    value: number,
    leftColor: string,
    rightColor: string
  ) => {
    /* ...identical code... */
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

  // Apply GSAP animations (Identical)
  useGSAP(
    () => {
      /* ...identical code... */
      if (!loadingHeartbeat && !loadingUmd && enhancedAgents.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          ".top-card",
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15 }
        );
        tl.fromTo(
          ".list-item",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.03 },
          "-=0.7"
        );
      }
    },
    {
      scope: container,
      dependencies: [loadingHeartbeat, loadingUmd, enhancedAgents],
    }
  ); // Depend on heartbeat loading

  // Get sorted and filteblue agents (Adapted for heartbeat)
  const getSortedAndFilteblueAgents = () => {
    const filteblue = searchText
      ? enhancedAgents.filter(
        /* ...identical filter logic... */
        (agent) =>
          agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
          agent.handle.toLowerCase().includes(searchText.toLowerCase())
      )
      : enhancedAgents;

    return [...filteblue].sort((a, b) => {
      let valueA: any, valueB: any; // Use any temporarily or ensure types align

      switch (sortField) {
        // *** Primary metric changed ***
        case "heartbeat":
          valueA = a.heartbeat || 0;
          valueB = b.heartbeat || 0;
          break;
        case "mindshare":
          valueA = a.mindshare || 0;
          valueB = b.mindshare || 0;
          break;
        case "followers":
          valueA = a.followers || 0;
          valueB = b.followers || 0;
          break;
        case "username":
          valueA = a.handle.toLowerCase();
          valueB = b.handle.toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "herdedVsHidden":
          valueA = a.herdedVsHidden || 0;
          valueB = b.herdedVsHidden || 0;
          break;
        case "convictionVsHype":
          valueA = a.convictionVsHype || 0;
          valueB = b.convictionVsHype || 0;
          break;
        case "memeVsInstitutional":
          valueA = a.memeVsInstitutional || 0;
          valueB = b.memeVsInstitutional || 0;
          break;
        default: // *** Default changed ***
          valueA = a.heartbeat || 0;
          valueB = b.heartbeat || 0;
      }

      // Ensure comparison is numeric for non-string fields
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      // Add fallback or specific handling for other types if necessary
      return 0;
    });
  };

  // --- Render Logic ---

  const loading = loadingHeartbeat || loadingUmd; // Check both loading states

  // Loading State (Identical)
  if (loading) {
    return (
      /* ...identical loading JSX... */
      <div className="bg-gray-900 rounded-xl border border-gray-800/30 shadow-lg p-8 min-h-[30vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mb-4 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
            <Loader2 className="w-14 h-14 text-blue-500/70 animate-spin absolute inset-0" />
          </div>
          <h3 className="text-xl font-medium text-gray-200 mb-1">
            Loading Data
          </h3>
          <p className="text-gray-400 text-sm">Analyzing market heartbeat...</p>{" "}
          {/* Adjusted text */}
        </div>
      </div>
    );
  }

  // Error State (Identical)
  if (error) {
    return (
      /* ...identical error JSX... */
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-blue-400 mb-3" />
        <h3 className="text-xl font-medium text-blue-200 mb-2">
          Failed to load heartbeat data
        </h3>{" "}
        {/* Adjusted text */}
        <p className="text-blue-300/80 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  const sortedAgents = getSortedAndFilteblueAgents();

  // Search Empty State (Identical)
  if (sortedAgents.length === 0 && searchText) {
    return (
      /* ...identical search empty JSX... */
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchX className="w-12 h-12 text-gray-500 mb-3" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">
          No analysts found
        </h3>
        <p className="text-gray-400 text-sm">
          Try adjusting your search criteria
        </p>
      </div>
    );
  }

  const topAgents = sortedAgents.slice(0, 3);
  const remainingAgents = sortedAgents.slice(3);
  const medalColors = [
    /* ...identical medal colors... */ "from-yellow-300 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-700 to-amber-900",
  ];

  // --- Main JSX Structure (Copied, adapted text & primary metric) ---
  return (
    <div ref={container}>
      {/* Dashboard Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <HeartPulse size={18} className="text-blue-400" />{" "}
          {/* Changed Icon */}
          <h2 className="text-lg font-bold text-white">
            Market Heartbeat Dashboard {/* Changed Title */}
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Discover analysts ranked by their real-time market pulse{" "}
          {/* Changed Description */}
        </p>
      </div>

      {/* Header with Sorting (Identical structure, uses updated SortField type) */}
      <div className="p-3 mb-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-2">
            {/* ... Update timestamp, analyst count ... */}
            <div className="relative flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-500/70 absolute animate-ping"></div>
            </div>
            <span className="text-sm text-cyan-400/80">
              Data updated on • {new Date().toLocaleDateString()}
            </span>
            <div className="ml-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400/70" />
              <span className="text-sm text-gray-300">
                {sortedAgents.length} analysts
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {/* Sorting Buttons - *** Use 'heartbeat' for primary sort *** */}
            <div
              onClick={() => sortAgents("heartbeat")} /* ... class logic ... */
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "heartbeat"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800" // Adjusted color maybe
                }`}
            >
              <HeartPulse size={14} /> {/* Changed Icon */}
              <span>Heartbeat</span> {/* Changed Label */}
              {sortField === "heartbeat" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            {/* Other sort buttons (Mindshare, Followers, etc.) identical structure */}
            <div
              onClick={() => sortAgents("mindshare")} /* ... */
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "mindshare"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                }`}
            >
              <BarChart2 size={14} /> <span>Mindshare</span>
              {sortField === "mindshare" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("followers")} /* ... */
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "followers"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                }`}
            >
              <Users size={14} /> <span>Followers</span>
              {sortField === "followers" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            {/* AI Metric Sort Buttons - identical */}
            <div
              onClick={() => sortAgents("herdedVsHidden")}
              /* ... */ className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "herdedVsHidden"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                }`}
            >
              <span>Herded-Hidden</span>{" "}
              {sortField === "herdedVsHidden" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("convictionVsHype")}
              /* ... */ className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "convictionVsHype"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                }`}
            >
              <span>Conviction-Hype</span>{" "}
              {sortField === "convictionVsHype" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("memeVsInstitutional")}
              /* ... */ className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${sortField === "memeVsInstitutional"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                }`}
            >
              <span>Meme-Institutional</span>{" "}
              {sortField === "memeVsInstitutional" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Cards (Identical structure, changed primary metric display) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {topAgents.map((agent, index) => {
          const rank = index + 1; // Simple rank for top 3 display
          const cleanHandle = agent.handle.replace("@", "");
          const isSubscribed = subscribedHandles.includes(cleanHandle);
          const isCurrentlySubscribing = subscribingHandle === cleanHandle;

          // Use actual heartbeat stats if available, else fallback to random
          const beat = agent.beat ?? getRandomStat(agent.handle, "beat");
          const signals =
            agent.signals ?? getRandomStat(agent.handle, "signals");
          const mindshare =
            agent.mindshare ?? getRandomStat(agent.handle, "mindshare");

          return (
            <div
              key={agent.handle} /* ... identical card classes ... */
              className={`impact-card top-card relative overflow-hidden rounded-xl border ${rank === 1
                ? "border-yellow-500/30"
                : rank === 2
                  ? "border-gray-400/30"
                  : "border-amber-700/30"
                } bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-blue-900/20 backdrop-blur-sm`} // Maybe adjust accent color
            >
              {/* ... Top Medal Badge ... */}
              <div className="absolute -right-6 -top-6 w-28 h-24">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${medalColors[rank - 1]
                    } opacity-50 rotate-45`}
                ></div>
              </div>

              <div className="p-5 cursor-pointer" onClick={() => { router.push(`/influencer/${cleanHandle}`) }}>
                {/* ... Rank icon, Profile Pic, Name, Handle ... (Identical) */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${medalColors[rank - 1]
                        } p-0.5`}
                    >
                      <div className="absolute inset-0.5 rounded-full bg-gray-900/80"></div>
                      <FaTrophy
                        className={`relative w-5 h-5 ${rank === 1
                          ? "text-yellow-300"
                          : rank === 2
                            ? "text-gray-300"
                            : "text-amber-700"
                          }`}
                      />
                    </div>
                    <div>
                      <span className="block text-sm text-blue-400 mb-0.5 font-medium">
                        Rank #{rank}
                      </span>
                      <div className="flex items-center gap-2 mb-1">
                        {agent.handle && (
                          <div className="relative w-6 h-6">
                            {" "}
                            {/* ... img + checkmark ... */}
                            <img
                              src={
                                agent.profileUrl?.trim().length > 0
                                  ? agent.profileUrl
                                  : `https://picsum.photos/seed/${encodeURIComponent(
                                    agent.handle
                                  )}/40/40`
                              }
                              alt={agent.name}
                              className="w-full h-full object-cover rounded-full border border-gray-700/50"
                            />
                            {agent.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                                <FaCheck className="w-1 h-1 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-white">
                          {agent.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">{agent.handle}</p>
                    </div>
                  </div>

                  {/* *** Display Heartbeat Score *** */}
                  <div className="text-right">
                    <div className="text-sm uppercase font-extrabold tracking-wider text-white mb-1">
                      Beat {/* Changed Label */}
                    </div>
                    <div className="text-xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                      {" "}
                      {/* Changed Color */}
                      {agent.heartbeat ?? "--"}
                    </div>
                  </div>
                </div>

                {/* Progress Bar (Based on Heartbeat Score) */}
                <div className="h-2 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full progress-bar-fill" // Changed Color
                    style={{ width: `${agent.heartbeat || 0}%` }} // Use heartbeat score
                  ></div>
                </div>

                {/* Mindshare & Followers (Identical) */}
                {agent.mindshare >= 0 && (
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-blue-400 text-lg font-bold">
                        {agent.mindshare > 0
                          ? `${agent.mindshare.toFixed(2)}%`
                          : "--"}
                      </p>
                      <p className="text-xs text-gray-500">Mindshare</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-200 text-lg font-medium">
                        {agent.mindshare > 0
                          ? agent.followers?.toLocaleString()
                          : "--"}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                  </div>
                )}

                <div className="mb-3 text-center">
                  <Link
                    href={`https://x.com/${cleanHandle}`}
                    target="_blank"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="inline-flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition-colors"
                  >
                    View Profile <FaExternalLinkAlt className="text-[10px]" />
                  </Link>
                </div>

                {/* Expandable Section for Stats (Identical Structure - uses random/placeholder stats) */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${showStats[agent.handle]
                    ? "max-h-[500px] opacity-100 mb-4"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  {/* Display beat, signals, mindshare - Identical structure */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* ... beat div ... */}
                    <div className="flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-2.5 border border-blue-700/20">
                      <div className="relative mb-1">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <div
                          className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"
                          style={{ animationDuration: "3s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-blue-400 mb-0.5">Beat</span>{" "}
                      <span className="text-xs font-semibold text-white">
                        {beat}%
                      </span>
                    </div>
                    {/* ... signals div ... */}
                    <div className="flex flex-col items-center justify-center bg-cyan-900/20 rounded-lg p-2.5 border border-cyan-700/20">
                      <TrendingUp className="h-4 w-4 text-cyan-400 mb-1" />{" "}
                      <span className="text-xs text-cyan-400 mb-0.5">
                        Signals
                      </span>{" "}
                      <span className="text-xs font-semibold text-white">
                        {signals}%
                      </span>
                    </div>
                    {/* ... mindshare div ... */}
                    <div className="flex flex-col items-center justify-center bg-blue-800/20 rounded-lg p-2.5 border border-blue-700/20">
                      <BarChart2 className="h-4 w-4 text-blue-300 mb-1" />{" "}
                      <span className="text-xs text-blue-300 mb-0.5">
                        Mindshare
                      </span>{" "}
                      <span className="text-xs font-semibold text-white">
                        {mindshare}%
                      </span>
                    </div>
                  </div>
                  {/* Radar Chart (Identical structure - uses placeholder stats & heartbeat score) */}
                  <div className="relative h-24 mb-4 hidden md:block">
                    {" "}
                    {/* ... identical radar chart JSX ... */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full max-w-[120px] max-h-[120px] relative">
                        {/* ... bg lines ... */}
                        <div className="absolute inset-0 border-2 border-blue-800/30 rounded-full"></div>
                        <div className="absolute inset-[20%] border-2 border-blue-800/20 rounded-full"></div>
                        <div className="absolute inset-[40%] border-2 border-blue-800/10 rounded-full"></div>
                        <div className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-0 h-0.5 w-1/2 bg-blue-800/20"></div>
                        <div className="absolute bottom-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 right-0 h-0.5 w-1/2 bg-blue-800/20"></div>
                        {/* ... data points (uses heartbeat for 4th point) ... */}
                        <div
                          className="absolute rounded-full w-2 h-2 bg-blue-400"
                          style={{
                            top: `${(100 - beat) / 2}%`,
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            boxShadow: "0 0 5px rgba(96, 165, 250, 0.7)",
                          }}
                        ></div>
                        <div
                          className="absolute rounded-full w-2 h-2 bg-cyan-400"
                          style={{
                            top: "50%",
                            left: `${signals / 2}%`,
                            transform: "translate(-50%, -50%)",
                            boxShadow: "0 0 5px rgba(34, 211, 238, 0.7)",
                          }}
                        ></div>
                        <div
                          className="absolute rounded-full w-2 h-2 bg-blue-300"
                          style={{
                            bottom: `${(100 - mindshare) / 2}%`,
                            left: "50%",
                            transform: "translate(-50%, 50%)",
                            boxShadow: "0 0 5px rgba(147, 197, 253, 0.7)",
                          }}
                        ></div>
                        <div
                          className="absolute rounded-full w-2 h-2 bg-blue-500"
                          style={{
                            top: "50%",
                            right: `${100 - (agent.heartbeat || 0)}%`,
                            transform: "translate(50%, -50%)",
                            boxShadow: "0 0 5px rgba(239, 68, 68, 0.7)",
                          }}
                        ></div>{" "}
                        {/* Use heartbeat score */}
                        {/* ... connecting lines svg (uses heartbeat) ... */}
                        <svg className="absolute inset-0 w-full h-full">
                          {" "}
                          <polygon
                            points={`50,${(100 - beat) / 2} ${signals / 2
                              },50 50,${100 - (100 - mindshare) / 2} ${100 - (100 - (agent.heartbeat || 0))
                              },50`}
                            fill="rgba(239, 68, 68, 0.2)"
                            stroke="rgba(239, 68, 68, 0.6)"
                            strokeWidth="1"
                          />
                        </svg>{" "}
                        {/* Use heartbeat score */}
                      </div>
                    </div>
                  </div>
                  {/* UMD Metrics Section (Identical) */}
                  <div className="p-3 space-y-4 bg-gray-900/30 rounded-lg border border-gray-800/20 mb-3">
                    {/* Herded vs Hidden (Identical) */}
                    {/* Conviction vs Hype (Identical) */}
                    {/* Meme vs Institutional (Identical) */}
                    <div>
                      {/* ... Herded/Hidden JSX ... */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-400">Herded</span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-cyan-400">Hidden</span>
                        </div>
                        <div className="relative">
                          <FaRobot
                            className="text-gray-500 hover:text-blue-400 text-xs cursor-help"
                            // --- MODIFIED ---
                            onMouseEnter={(e) =>
                              handleTooltipEnter(e, "herdedVsHidden")
                            }
                            onMouseLeave={handleTooltipLeave}
                          />
                        </div>
                      </div>
                      {renderMetricIndicator(
                        agent.herdedVsHidden || 0,
                        "bg-red-400",
                        "bg-cyan-400"
                      )}
                    </div>
                    <div>
                      {/* ... Conviction/Hype JSX ... */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-400">
                            Conviction
                          </span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-rose-400">Hype</span>
                        </div>
                        <div className="relative">
                          <FaRobot
                            className="text-gray-500 hover:text-blue-400 text-xs cursor-help"
                            // --- MODIFIED ---
                            onMouseEnter={(e) =>
                              handleTooltipEnter(e, "convictionVsHype")
                            }
                            onMouseLeave={handleTooltipLeave}
                          />
                        </div>
                      </div>
                      {renderMetricIndicator(
                        agent.convictionVsHype || 0,
                        "bg-green-500",
                        "bg-rose-500"
                      )}
                    </div>
                    <div>
                      {/* ... Meme/Institutional JSX ... */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-300">Meme</span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-gray-100">
                            Institutional
                          </span>
                        </div>
                        <div className="relative">
                          <FaRobot
                            className="text-gray-500 hover:text-blue-400 text-xs cursor-help"
                            // --- MODIFIED ---
                            onMouseEnter={(e) =>
                              handleTooltipEnter(e, "memeVsInstitutional")
                            }
                            onMouseLeave={handleTooltipLeave}
                          />
                        </div>
                      </div>
                      {renderMetricIndicator(
                        agent.memeVsInstitutional || 0,
                        "bg-yellow-300",
                        "bg-gray-100"
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Button (Identical) */}
                <button
                  onClick={() =>
                    toggleStats(agent.handle)
                  } /* ... identical button classes/logic ... */
                  className="w-full flex items-center justify-center gap-1 py-1 mb-3 rounded-lg text-sm font-medium text-blue-300 hover:text-blue-200 bg-blue-900/30 hover:bg-blue-800/40 transition-all duration-200"
                >
                  {showStats[agent.handle] ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span>Hide Details</span>
                    </>
                  ) : (
                    <>
                      <RiPulseLine className="w-3 h-3" />
                      <span>View Performance Metrics</span>
                    </>
                  )}
                </button>
                {/* Subscribe Button (Identical) */}
                <button
                  onClick={() =>
                    !isSubscribed &&
                    !isCurrentlySubscribing &&
                    onSubscribe(agent.handle)
                  }
                  disabled={
                    isSubscribed || isCurrentlySubscribing
                  } /* ... identical button classes/logic ... */
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${isSubscribed || isCurrentlySubscribing
                    ? "bg-green-600/30 text-green-300"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    } transition-all duration-200 ${isCurrentlySubscribing ? "animate-pulse" : ""
                    }`}
                >
                  {isCurrentlySubscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : isSubscribed ? (
                    <>
                      <FaCrown className="w-4 h-4 text-green-300" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <FaCrown className="w-4 h-4 text-yellow-300" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Other Analysts" List (Identical structure, adapted for heartbeat) */}
      {remainingAgents.length > 0 && (
        <div className="mt-8">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <ArrowUpDown size={16} className="mr-2 text-blue-400/70" />
            Other Analysts
            {sortField !== "heartbeat" && (
              <span className="text-sm ml-2 font-extralight text-pink-300">
                (sorted by {sortField})
              </span>
            )}
          </h3>

          {/* Header Row (Identical structure from final EL) */}
          <div className="px-4 py-2 flex items-center gap-3 md:gap-4 text-xs text-gray-300 border-b border-gray-800/50 mb-2">
            {/* Left Header */}
            <div className="flex items-center flex-shrink-0 w-[30%] sm:w-[25%] md:w-[240px]">
              <span className="w-6 text-center mr-3 flex-shrink-0">#</span>
              <span className="flex-grow truncate pr-1">Analyst</span>
            </div>
            {/* Middle Header */}
            <div className="flex items-center justify-between gap-2 md:gap-4 flex-grow min-w-0 px-1">
              <span className="w-1/3 text-center truncate">Herded/Hidden</span>
              <span className="w-1/3 text-center truncate">
                Conviction/Hype
              </span>
              <span className="w-1/3 text-center truncate">Meme/Inst.</span>
            </div>
            {/* Right Header */}
            <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0 w-auto sm:w-[300px] md:w-[385px]">
              <span className="w-16 text-right hidden sm:inline-block">
                Mindshare
              </span>
              <span className="w-20 text-right hidden lg:inline-block">
                Followers
              </span>
              <span className="w-14 text-right">Heartbeat</span>
              <span className="w-8 text-center">View</span>
              <span className="w-24 text-center">Subscribe</span>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {remainingAgents.map((agent) => {
              const rank =
                sortedAgents.findIndex((a) => a.handle === agent.handle) + 1;
              const cleanHandle = agent.handle.replace("@", "");
              const isSubscribed = subscribedHandles.includes(cleanHandle);
              const isCurrentlySubscribing = subscribingHandle === cleanHandle;

              return (
                <div
                  key={agent.handle} /* ... identical list item classes ... */
                  onClick={() => { router.push(`/influencer/${cleanHandle}`) }}
                  className="impact-card cursor-pointer list-item relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg overflow-hidden transition-all hover:bg-blue-950 duration-200" // Adjusted hover color maybe
                >
                  <div className="px-4 py-2 flex items-center gap-3 md:gap-4">
                    {" "}
                    {/* Identical Row Structure */}
                    {/* Left Column (Identical) */}
                    <div className="flex items-center flex-shrink-0 w-[30%] sm:w-[25%] md:w-[240px]">
                      {" "}
                      {/* ... Rank, Pic, Name ... */}
                      <div className="w-6 flex items-center justify-center rounded-full bg-gray-800/70 text-gray-400 text-xs font-medium mr-3 flex-shrink-0">
                        {rank}
                      </div>
                      {agent.handle && (
                        <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                          {/* ... img + check ... */}
                          <img
                            src={
                              agent.profileUrl?.trim().length > 0
                                ? agent.profileUrl
                                : `https://picsum.photos/seed/${encodeURIComponent(
                                  agent.handle
                                )}/40/40`
                            }
                            alt={agent.name}
                            className="w-full h-full object-cover rounded-full border border-gray-700/50"
                          />
                          {agent.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                              <FaCheck className="w-1 h-1 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-grow overflow-hidden">
                        <h4 className="text-sm font-medium text-white truncate">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {agent.handle}
                        </p>
                      </div>
                    </div>
                    {/* Middle Column (Identical - AI Metrics) */}
                    <div className="flex items-center justify-between gap-2 md:gap-4 flex-grow min-w-0 px-1">
                      {" "}
                      {/* ... Herded/Hidden, Conviction/Hype, Meme/Inst Bars ... */}
                      <div className="w-1/3 text-center">
                        {renderMetricIndicator(
                          agent.herdedVsHidden || 0,
                          "bg-red-400",
                          "bg-cyan-400"
                        )}
                      </div>
                      <div className="w-1/3 text-center">
                        {renderMetricIndicator(
                          agent.convictionVsHype || 0,
                          "bg-green-500",
                          "bg-rose-500"
                        )}
                      </div>
                      <div className="w-1/3 text-center">
                        {renderMetricIndicator(
                          agent.memeVsInstitutional || 0,
                          "bg-yellow-300",
                          "bg-gray-100"
                        )}
                      </div>
                    </div>
                    {/* Right Column (Adapted for heartbeat) */}
                    <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0 w-auto sm:w-[300px] md:w-[385px]">
                      {" "}
                      {/* Identical Structure */}
                      {/* Mindshare (Identical) */}
                      <div className="w-16 text-right hidden sm:inline-block">
                        {agent.mindshare > 0 ? (
                          <p className="text-blue-400 text-sm font-medium">
                            {agent.mindshare?.toFixed(2)}%
                          </p>
                        ) : (
                          <span className="text-sm text-[#5DA1F3]">--</span>
                        )}
                      </div>
                      {/* Followers (Identical) */}
                      <div className="w-20 text-right hidden lg:inline-block">
                        {agent.followers > 0 ? (
                          <p className="text-gray-300 text-sm">
                            {agent.followers?.toLocaleString()}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-100">--</span>
                        )}
                      </div>
                      {/* *** Heartbeat Score *** */}
                      <div className="w-14 text-right">
                        <p className="text-blue-400 text-sm font-medium">
                          {agent.heartbeat ?? "--"}
                        </p>{" "}
                        {/* Changed color/metric */}
                      </div>
                      {/* View Link (Identical) */}
                      <div className="w-8 flex justify-center">
                        <Link
                          href={`https://x.com/${cleanHandle}`}
                          target="_blank"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the event from bubbling up to the parent div
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors"
                          title="View Profile"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </Link>
                      </div>
                      {/* Subscribe Button (Identical) */}
                      <div className="w-24 flex justify-center">
                        <button
                          onClick={() =>
                            !isSubscribed &&
                            !isCurrentlySubscribing &&
                            onSubscribe(agent.handle)
                          }
                          disabled={
                            isSubscribed || isCurrentlySubscribing
                          } /* ... classes/content identical ... */
                          className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs w-full ${isSubscribed || isCurrentlySubscribing
                            ? "bg-green-500/20 text-green-300"
                            : "bg-blue-600/80 hover:bg-blue-700 text-white"
                            } transition-all duration-200 whitespace-nowrap ${isCurrentlySubscribing ? "animate-pulse" : ""
                            }`}
                        >
                          {isCurrentlySubscribing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isSubscribed ? (
                            <>
                              <FaCrown
                                size={12}
                                className="mr-1.5 flex-shrink-0"
                              />
                              <span>Subscribed</span>
                            </>
                          ) : (
                            <>
                              <FaCrown
                                size={12}
                                className="mr-1.5 flex-shrink-0"
                              />
                              <span>Subscribe</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Empty State (Identical) */}
      {sortedAgents.length === 0 &&
        !searchText &&
        !loading /* ... identical JSX ... */ && (
          <div className="p-8 text-center bg-gray-900/20 rounded-lg border border-gray-800/30 mt-8">
            <InfoIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">
              No analyst heartbeat data available
            </p>{" "}
            {/* Adjusted text */}
          </div>
        )}
      {/* Refreshing Indicator (Identical) */}
      {isRefreshing /* ... identical JSX ... */ && (
        <div className="flex items-center justify-center p-3 mt-4">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
          <span className="text-sm text-slate-400">
            Updating heartbeat data...
          </span>{" "}
          {/* Adjusted text */}
        </div>
      )}
      {/* Tooltip */}
      {/* --- MODIFIED --- Check for tooltipCoords as well */}
      {/* {showTooltip && tooltipCoords && (
        <div
          className="fixed z-50 bg-gray-800 rounded-md shadow-lg p-2 text-xs text-white max-w-[200px] pointer-events-none" // Added pointer-events-none
          style={{
            // --- MODIFIED --- Use stored coordinates
            top: `${tooltipCoords.top}px`,
            left: `${tooltipCoords.left}px`,
            // Transform to position correctly relative to the calculated point
            // -50% X centers it horizontally
            // -100% Y moves it above the point
            // -4px Y adds a small gap
            transform: "translate(-50%, -100%) translateY(-4px)",
            // --- END MODIFIED ---
          }}
        >
          <p className="font-medium">AI-Powered Metric</p>
          <p className="text-gray-300 text-[10px] mt-1">
            {showTooltip === "herdedVsHidden" &&
              "Analyzes whether content follows crowd sentiment or provides contrarian views."}
            {showTooltip === "convictionVsHype" &&
              "Measures genuine belief versus promotional content based on language patterns."}
            {showTooltip === "memeVsInstitutional" &&
              "Evaluates content tone from casual/humorous to formal/institutional."}
          </p>
        </div>
      )} */}
    </div> // Closing main container div
  );
};

export default React.memo(HeartbeatDashboard); // Export the new component name
