"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  FaTrophy,
  FaCrown,
  FaCheck,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaRobot,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  TrendingUp,
  BarChart2,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  SearchX,
  ChevronUp,
  Shield,
  Users,
  InfoIcon,
  Info,
  X,
  Search,
} from "lucide-react";
import { LuWandSparkles } from "react-icons/lu";
import { RiPulseLine } from "react-icons/ri";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useUserData } from "@/context/UserDataContext";

type Mode = "impact" | "heartbeat";
type SortField =
  | "impactFactor"
  | "heartbeat"
  | "mindshare"
  | "followers"
  | "username"
  | "herdedVsHidden"
  | "convictionVsHype"
  | "memeVsInstitutional";
type SortDirection = "asc" | "desc";

interface AnalystLeaderboardProps {
  mode: Mode;
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (handle: string, impactFactor: number) => void;
  setRefreshData: (refresh: () => void) => void;
  searchText: string;
}

const AnalystLeaderboard: React.FC<AnalystLeaderboardProps> = ({
  mode,
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
  setRefreshData,
  searchText,
}) => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 7;
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [userSortField, setUserSortField] = useState<SortField | null>(null);
  const router = useRouter();
  
  // This function will be used in the search input
  const [localSearchText, setLocalSearchText] = useState(searchText);
  
  // In App Router, we need a different approach to update the URL
  const handleSearchChange = (value: string) => {
    setLocalSearchText(value);
    // We would typically update URL params here, but for now we'll just use local state
    // The parent component should be responsible for updating the URL if needed
  };

  // Keep localSearchText in sync with props.searchText
  useEffect(() => {
    setLocalSearchText(searchText);
  }, [searchText]);

  const { agents, loadingUmd, error, refreshData } = useUserData();
  
  const effectiveSortField =
    userSortField || (mode === "impact" ? "impactFactor" : "heartbeat");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, effectiveSortField, sortDirection]);

  const toggleStats = (handle: string) => {
    setShowStats((prev) => ({ ...prev, [handle]: !prev[handle] }));
  };

  const sortAgents = (field: SortField) => {
    if (userSortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setUserSortField(field);
      setSortDirection("desc");
    }
  };

  const renderMetricIndicator = (
    value: number,
    leftColor: string,
    rightColor: string
  ) => {
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

  useGSAP(
    () => {
      if (!loadingUmd && agents.length > 0) {
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
    { scope: container, dependencies: [loadingUmd, agents] }
  );

  const getSortedAndFilteredAgents = () => {
    const filtered = localSearchText
      ? agents.filter(
          (agent) =>
            agent.name.toLowerCase().includes(localSearchText.toLowerCase()) ||
            agent.twitterHandle.toLowerCase().includes(localSearchText.toLowerCase())
        )
      : agents;

    return [...filtered].sort((a, b) => {
      let valueA, valueB;
      switch (effectiveSortField) {
        case "impactFactor":
          valueA = a.impactFactor || 0;
          valueB = b.impactFactor || 0;
          break;
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
          valueA = a.twitterHandle.toLowerCase();
          valueB = b.twitterHandle.toLowerCase();
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
        default:
          valueA = a[mode === "impact" ? "impactFactor" : "heartbeat"] || 0;
          valueB = b[mode === "impact" ? "impactFactor" : "heartbeat"] || 0;
      }
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const loading = loadingUmd;

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800/30 shadow-lg p-8 min-h-[30vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mb-4 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
            <Loader2 className="w-14 h-14 text-blue-500/70 animate-spin absolute inset-0" />
          </div>
          <h3 className="text-xl font-medium text-gray-200 mb-1">
            Loading Data
          </h3>
          <p className="text-gray-400 text-sm">
            {mode === "impact"
              ? "Analyzing crypto market influence..."
              : "Analyzing market heartbeat..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h3 className="text-xl font-medium text-red-200 mb-2">
          Failed to load rankings
        </h3>
        <p className="text-red-300/80 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  const sortedAgents = getSortedAndFilteredAgents();

  if (sortedAgents.length === 0 && searchText) {
    return (
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
  const totalPages = Math.ceil(remainingAgents.length / PAGE_SIZE);
  const paginatedAgents = remainingAgents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const medalColors = [
    "from-yellow-300 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-700 to-amber-900",
  ];

  const primaryField = mode === "impact" ? "impactFactor" : "heartbeat";
  const title =
    mode === "impact" ? "Impact Factor Rankings" : "Market Heartbeat Dashboard";
  const description =
    mode === "impact"
      ? "Discover crypto analysts ranked by their market influence and prediction accuracy"
      : "Discover analysts ranked by their real-time market pulse";
  const primaryLabel = mode === "impact" ? "Impact" : "Beat";
  const primaryIcon = mode === "impact" ? LuWandSparkles : HeartPulse;
  const progressBarClass =
    mode === "impact"
      ? "from-blue-500 to-indigo-500"
      : "from-blue-500 to-cyan-500";

  function formatFollowersCount(num?: number): string {
    if (num === undefined || num === null) return "--";
    if (num < 1000) return num.toString();
    if (num < 1_000_000)
      return (num / 1000).toFixed(2).replace(/\.?0+$/, "") + "K";
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  }

  return (
    <div ref={container}>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {React.createElement(primaryIcon, {
              size: 18,
              className: "text-blue-400",
            })}
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        
        <div className="w-full sm:w-auto min-w-[280px]">
          <div className="relative font-leagueSpartan">
            <div className="flex items-center bg-gray-800 rounded-full border border-solid border-gray-200 focus-within:border-blue-500 overflow-hidden">
              <input
                type="text"
                placeholder="Search analysts..."
                value={localSearchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 text-white text-sm bg-transparent focus:outline-none border border-solid border-gray-100"
              />
              <div className="px-3 flex">
                {localSearchText ? (
                  <button onClick={() => handleSearchChange("")} className="text-gray-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="text-gray-400 w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 mb-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-500/70 absolute animate-ping"></div>
            </div>
            <span className="text-sm text-cyan-500">
              Data updated on • {new Date().toLocaleDateString()}
            </span>
            <div className="ml-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400/70" />
              <span className="text-sm text-gray-300">
                {sortedAgents.length} analysts
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 items-center">
            <div className="relative group">
              <Info className="w-4 h-4 text-cyan-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-gray-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Click on any option to sort the analysts
              </div>
            </div>
            <div
              onClick={() => sortAgents(primaryField)}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                effectiveSortField === primaryField
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {React.createElement(primaryIcon, { size: 14 })}
              <span>{mode === "impact" ? "Impact" : "Heartbeat"}</span>
              {effectiveSortField === primaryField &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            {/* Other sort buttons */}
            <div
              onClick={() => sortAgents("mindshare")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                userSortField === "mindshare"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <BarChart2 size={14} />
              <span>Mindshare</span>
              {userSortField === "mindshare" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("followers")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                userSortField === "followers"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <Users size={14} />
              <span>Followers</span>
              {userSortField === "followers" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("herdedVsHidden")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                userSortField === "herdedVsHidden"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span>Herded-Hidden</span>
              {userSortField === "herdedVsHidden" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("convictionVsHype")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                userSortField === "convictionVsHype"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span>Conviction-Hype</span>
              {userSortField === "convictionVsHype" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
            <div
              onClick={() => sortAgents("memeVsInstitutional")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                userSortField === "memeVsInstitutional"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span>Meme-Institutional</span>
              {userSortField === "memeVsInstitutional" &&
                (sortDirection === "asc" ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {topAgents.map((agent, index) => {
          const rank = index + 1;
          const cleanHandle = agent.twitterHandle.replace("@", "");
          const isSubscribed = subscribedHandles.includes(cleanHandle);
          const isCurrentlySubscribing = subscribingHandle === cleanHandle;
          const subscribers = agent.subscribers?.length || 0;
          const signals = agent.signals || 0;
          const tokens = agent.tokens || 0;

          return (
            <div
              key={agent.twitterHandle}
              className={`impact-card top-card relative overflow-hidden rounded-xl border ${
                rank === 1
                  ? "border-yellow-500/30"
                  : rank === 2
                  ? "border-gray-400/30"
                  : "border-amber-700/30"
              } bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-blue-900/20 backdrop-blur-sm`}
              onClick={() => router.push(`/influencer/${cleanHandle}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="absolute -right-6 -top-6 w-28 h-24">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    medalColors[rank - 1]
                  } opacity-50 rotate-45`}
                ></div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${
                        medalColors[rank - 1]
                      } p-0.5`}
                    >
                      <div className="absolute inset-0.5 rounded-full bg-gray-900/80"></div>
                      <FaTrophy
                        className={`relative w-5 h-5 ${
                          rank === 1
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
                        {agent.twitterHandle && (
                          <div className="relative w-6 h-6">
                            <img
                              src={
                                agent.profileUrl?.trim().length > 0
                                  ? agent.profileUrl
                                  : `https://picsum.photos/seed/${encodeURIComponent(
                                      agent.twitterHandle
                                    )}/40/40`
                              }
                              alt={agent.name}
                              className="w-full h-full object-cover rounded-full border border-gray-700/50"
                            />
                            {agent.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                                <FaCheck className="w-1.5 h-1.5 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-white">
                          {agent.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        {agent.twitterHandle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm uppercase font-extrabold tracking-wider text-white mb-1">
                      {primaryLabel}
                    </div>
                    <div className="text-xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                      {agent[primaryField] ?? "--"}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${progressBarClass} rounded-full progress-bar-fill`}
                    style={{ width: `${agent[primaryField] || 0}%` }}
                  ></div>
                </div>
                {agent.mindshare >= 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-5 mb-6 border border-gray-700/30 shadow-lg">
                    <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 mb-4 border border-white/10 shadow-inner relative z-10">
                      <div className="flex justify-between">
                        <div className="text-center relative">
                          <div className="relative p-3 flex flex-col items-center">
                            <p className="text-gray-200 text-xl font-bold tracking-tight transition-transform duration-300">
                              {agent.mindshare > 0
                                ? `${agent.mindshare.toFixed(2)}%`
                                : "--"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="relative flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 absolute animate-ping"></div>
                              </div>
                              <p className="text-xs text-cyan-400 uppercase tracking-wider font-medium mt-[3px]">
                                Mindshare
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-[2px] h-16 bg-gradient-to-b from-transparent via-gray-200/50 to-transparent"></div>
                        </div>
                        <div className="text-center relative">
                          <div className="relative p-3 flex flex-col items-center">
                            <p className="text-gray-200 text-xl font-bold tracking-tight transition-transform duration-300">
                              {agent.mindshare > 0
                                ? formatFollowersCount(agent.followers)
                                : "--"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="relative flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 absolute animate-ping"></div>
                              </div>
                              <p className="text-xs text-purple-400 uppercase tracking-wider font-medium mt-[3px]">
                                Followers
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`https://x.com/${cleanHandle}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="group relative overflow-hidden flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-lg z-10 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-700 text-white transition-all duration-300 shadow-md"
                    >
                      <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                        View Profile{" "}
                        <FaExternalLinkAlt className="text-xs opacity-80" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </Link>
                  </div>
                )}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    showStats[agent.twitterHandle]
                      ? "max-h-[500px] opacity-100 mb-4"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-2.5 border border-blue-700/20">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-blue-400 mb-0.5">
                        Subscribers
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {subscribers}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-cyan-900/20 rounded-lg p-2.5 border border-cyan-700/20">
                      <TrendingUp className="h-4 w-4 text-cyan-400 mb-1" />
                      <span className="text-xs text-cyan-400 mb-0.5">
                        Signals
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {signals}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-blue-800/20 rounded-lg p-2.5 border border-blue-700/20">
                      <BarChart2 className="h-4 w-4 text-blue-300 mb-1" />
                      <span className="text-xs text-blue-300 mb-0.5">
                        Tokens
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {tokens}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-24 mb-4 hidden md:block">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full max-w-[120px] max-h-[120px] relative">
                        <div className="absolute inset-0 border-2 border-blue-800/30 rounded-full"></div>
                        <div className="absolute inset-[20%] border-2 border-blue-800/20 rounded-full"></div>
                        <div className="absolute inset-[40%] border-2 border-blue-800/10 rounded-full"></div>
                        <div className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-0 h-0.5 w-1/2 bg-blue-800/20"></div>
                        <div className="absolute bottom-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 right-0 h-0.5 w-1/2 bg-blue-800/20"></div>
                        <div
                          className="absolute rounded-full w-2 h-2 bg-blue-400"
                          style={{
                            top: `${(100 - subscribers) / 2}%`,
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
                            bottom: `${(100 - tokens) / 2}%`,
                            left: "50%",
                            transform: "translate(-50%, 50%)",
                            boxShadow:
                              mode === "impact"
                                ? "0 0 5px rgba(147, 197, 253, 0.7)"
                                : "0 0 5px rgba(239, 68, 68, 0.7)",
                          }}
                        ></div>
                        <div
                          className="absolute rounded-full w-2 h-2 bg-blue-500"
                          style={{
                            top: "50%",
                            right: `${100 - (agent[primaryField] || 0)}%`,
                            transform: "translate(50%, -50%)",
                            boxShadow: "0 0 5px rgba(59, 130, 246, 0.7)",
                          }}
                        ></div>
                        <svg className="absolute inset-0 w-full h-full">
                          <polygon
                            points={`50,${(100 - subscribers) / 2} 
                                    ${signals / 2},50 
                                    50,${100 - (100 - tokens) / 2} 
                                    ${
                                      100 - (100 - (agent[primaryField] || 0))
                                    },50`}
                            fill={
                              mode === "impact"
                                ? "rgba(59, 130, 246, 0.2)"
                                : "rgba(239, 68, 68, 0.2)"
                            }
                            stroke={
                              mode === "impact"
                                ? "rgba(59, 130, 246, 0.6)"
                                : "rgba(239, 68, 68, 0.6)"
                            }
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-4 bg-gray-900/30 rounded-lg border border-gray-800/20 mb-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-400">Herded</span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-cyan-400">Hidden</span>
                        </div>
                      </div>
                      {renderMetricIndicator(
                        agent.herdedVsHidden || 0,
                        "bg-red-400",
                        "bg-cyan-400"
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-400">
                            Conviction
                          </span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-rose-400">Hype</span>
                        </div>
                      </div>
                      {renderMetricIndicator(
                        agent.convictionVsHype || 0,
                        "bg-green-500",
                        "bg-rose-500"
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-300">Meme</span>
                          <span className="text-xs text-gray-300">vs</span>
                          <span className="text-xs text-gray-100">
                            Institutional
                          </span>
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
                <button
                  className="w-full flex items-center justify-center gap-1 py-1 mb-3 rounded-lg text-sm font-medium text-blue-300 hover:text-blue-200 bg-blue-900/30 hover:bg-blue-800/40 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStats(agent.twitterHandle);
                  }}
                >
                  {showStats[agent.twitterHandle] ? (
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
                <button
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${
                    isSubscribed || isCurrentlySubscribing
                      ? "bg-green-600/30 text-green-300"
                      : "bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-cyan-700 hover:to-blue-800 text-white"
                  } transition-all duration-200 ${
                    isCurrentlySubscribing ? "animate-pulse" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSubscribed && !isCurrentlySubscribing) {
                      onSubscribe(agent.twitterHandle, agent.impactFactor);
                    }
                  }}
                  disabled={isSubscribed || isCurrentlySubscribing}
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

      {paginatedAgents.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <ArrowUpDown size={16} className="mr-2 text-blue-400/70" />
            Other Analysts
            {effectiveSortField !== primaryField && (
              <span className="text-sm ml-2 font-extralight text-cyan-300">
                (sorted by {userSortField})
              </span>
            )}
          </h3>
          <div className="px-4 py-2 flex items-center gap-3 md:gap-4 text-xs text-gray-300 border-b border-gray-800/50 mb-2">
            <div className="flex items-center flex-shrink-0 w-[30%] sm:w-[25%] md:w-[240px]">
              <span className="w-6 text-center mr-3 flex-shrink-0">#</span>
              <span className="flex-grow truncate pr-1">Analyst</span>
            </div>
            <div className="flex items-center justify-between gap-2 md:gap-4 flex-grow min-w-0 px-1">
              <span className="w-1/3 text-center truncate">Herded/Hidden</span>
              <span className="w-1/3 text-center truncate">
                Conviction/Hype
              </span>
              <span className="w-1/3 text-center truncate">Meme/Inst.</span>
            </div>
            <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0 w-auto sm:w-[300px] md:w-[385px]">
              <span className="w-16 text-right hidden sm:inline-block">
                Mindshare
              </span>
              <span className="w-20 text-right hidden lg:inline-block">
                Followers
              </span>
              <span className="w-14 text-right">
                {mode === "impact" ? "Impact" : "Heartbeat"}
              </span>
              <span className="w-8 text-center">View</span>
              <span className="w-24 text-center">Subscribe</span>
            </div>
          </div>
          <div className="space-y-2">
            {paginatedAgents.map((agent) => {
              const rank =
                sortedAgents.findIndex(
                  (a) => a.twitterHandle === agent.twitterHandle
                ) + 1;
              const cleanHandle = agent.twitterHandle.replace("@", "");
              const isSubscribed = subscribedHandles.includes(cleanHandle);
              const isCurrentlySubscribing = subscribingHandle === cleanHandle;

              return (
                <div
                  key={agent.twitterHandle}
                  className="impact-card list-item relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg overflow-hidden transition-all hover:bg-cyan-950 duration-200 hover:cursor-pointer"
                  onClick={() => router.push(`/influencer/${cleanHandle}`)}
                >
                  <div className="px-4 py-2 flex items-center gap-3 md:gap-4">
                    <div className="flex items-center flex-shrink-0 w-[30%] sm:w-[25%] md:w-[240px]">
                      <div className="w-6 flex items-center justify-center rounded-full bg-gray-800/70 text-gray-400 text-xs font-medium mr-3 flex-shrink-0">
                        {rank}
                      </div>
                      {agent.twitterHandle && (
                        <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                          <img
                            src={
                              agent.profileUrl?.trim().length > 0
                                ? agent.profileUrl
                                : `https://picsum.photos/seed/${encodeURIComponent(
                                    agent.twitterHandle
                                  )}/40/40`
                            }
                            alt={agent.name}
                            className="w-full h-full object-cover rounded-full border border-gray-700/50"
                          />
                          {agent.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                              <FaCheck className="w-1.5 h-1.5 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-grow overflow-hidden">
                        <h4 className="text-sm font-medium text-white truncate">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {agent.twitterHandle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 md:gap-4 flex-grow min-w-0 px-1">
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
                    <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0 w-auto sm:w-[300px] md:w-[385px]">
                      <div className="w-16 text-right hidden sm:inline-block">
                        {agent.mindshare > 0 ? (
                          <p className="text-blue-400 text-sm font-medium">
                            {agent.mindshare != null
                              ? `${agent.mindshare.toFixed(2)}%`
                              : "--"}
                          </p>
                        ) : (
                          <span className="text-sm text-[#5DA1F3]">--</span>
                        )}
                      </div>
                      <div className="w-20 text-right hidden lg:inline-block">
                        {agent.followers > 0 ? (
                          <p className="text-gray-300 text-sm">
                            {agent.followers != null
                              ? formatFollowersCount(agent.followers)
                              : "--"}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-100">--</span>
                        )}
                      </div>
                      <div className="w-14 text-right">
                        <p className="text-blue-400 text-sm font-medium">
                          {agent[primaryField] ?? "--"}
                        </p>
                      </div>
                      <div className="w-8 flex justify-center">
                        <Link
                          href={`https://x.com/${cleanHandle}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors"
                          title="View Profile"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="w-24 flex justify-center">
                        <button
                          className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs w-full ${
                            isSubscribed || isCurrentlySubscribing
                              ? "bg-green-500/20 text-green-300"
                              : "bg-blue-600/80 hover:bg-blue-700 text-white"
                          } transition-all duration-200 whitespace-nowrap ${
                            isCurrentlySubscribing ? "animate-pulse" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSubscribed && !isCurrentlySubscribing) {
                              onSubscribe(
                                agent.twitterHandle,
                                agent.impactFactor
                              );
                            }
                          }}
                          disabled={isSubscribed || isCurrentlySubscribing}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-blue-900 text-white shadow-lg transition-all duration-300 hover:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Previous page"
            >
              <FaChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            
            <div className="px-5 py-2 bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-full text-white font-medium shadow-lg">
              <span className="text-gray-400">Page </span> 
              <span className="text-blue-400 mx-1 font-bold">{currentPage}</span> 
              <span className="text-gray-400">of </span>
              <span className="text-blue-400 font-bold">{totalPages}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-blue-900 text-white shadow-lg transition-all duration-300 hover:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Next page"
            >
              <FaChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AnalystLeaderboard);