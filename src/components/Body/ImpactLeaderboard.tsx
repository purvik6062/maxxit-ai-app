// components/ImpactLeaderboard.tsx
"use client";
import React, { useRef, useState } from "react";
import { FaTrophy, FaCrown } from "react-icons/fa";
import { TrendingUp, Award, BarChart2 } from "lucide-react";
import { LuWandSparkles } from "react-icons/lu";
import gsap from "gsap";
import {
  Loader2,
  AlertCircle,
  SearchX,
  ChevronUp,
  Shield,
  Users,
} from "lucide-react";
import { RiPulseLine } from "react-icons/ri";
import { useGSAP } from "@gsap/react";
import { useImpactLeaderboard } from "@/hooks/useImpactLeaderboard";

interface ImpactLeaderboardProps {
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (handle: string) => void;
  setRefreshData: (refresh: () => void) => void;
  searchText: string;
}

const ImpactLeaderboard: React.FC<ImpactLeaderboardProps> = ({
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
  setRefreshData,
  searchText,
}) => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const { agents, loading, error, refreshData } = useImpactLeaderboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});

  // Toggle detailed stats for a specific card
  const toggleStats = (handle: string) => {
    setShowStats((prev) => ({
      ...prev,
      [handle]: !prev[handle],
    }));
  };

  // Calculate random stats for visualization
  const getRandomStat = (handle: string, type: string): number => {
    const seed = handle
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseValue = (seed % 30) + 50; // Between 50-80
    switch (type) {
      case "precision":
        return (baseValue + 5) % 100;
      case "performance":
        return (baseValue + 10) % 100;
      case "reliability":
        return (baseValue + 15) % 100;
      default:
        return baseValue;
    }
  };

  React.useEffect(() => {
    const wrappedRefreshData = async () => {
      console.log("ImpactLeaderboard: Starting refresh");
      setIsRefreshing(true);
      try {
        await refreshData();
        console.log("ImpactLeaderboard: Refresh completed");
      } finally {
        setIsRefreshing(false);
      }
    };
    setRefreshData(() => wrappedRefreshData);
  }, [refreshData, setRefreshData]);

  useGSAP(
    () => {
      if (!loading && agents.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        // Staggered entrance animation
        tl.fromTo(
          ".top-card",
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15 }
        );

        // Animate the progress bars after cards appear
        tl.fromTo(
          ".progress-bar-fill",
          { width: 0 },
          { width: "100%", duration: 0.8, stagger: 0.05 },
          "-=0.5"
        );

        // Animate the list items
        tl.fromTo(
          ".list-item",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.03 },
          "-=0.7"
        );
      }
    },
    { scope: container, dependencies: [loading, agents] }
  );

  // Filter agents based on searchText
  const filteredAgents = searchText
    ? agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
          agent.handle.toLowerCase().includes(searchText.toLowerCase())
      )
    : agents;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-blue-400 animate-spin"></div>
            <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-blue-300 animate-spin" />
          </div>
          <p className="text-blue-300">Loading impact rankings...</p>
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

    if (filteredAgents.length === 0 && searchText) {
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

    // Sort filteredAgents by impactFactor in descending order
    const sortedAgents = [...filteredAgents].sort((a, b) => {
      const aValue = a.impactFactor || 0;
      const bValue = b.impactFactor || 0;
      return bValue - aValue;
    });

    return (
      <div>
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="relative flex items-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-500/70 absolute animate-ping"></div>
          </div>
          <span className="text-sm text-cyan-400/80">
            Data updated on • {new Date().toLocaleDateString()}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400/70" />
            <span className="text-sm text-gray-300">
              {sortedAgents.length} analysts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAgents.slice(0, 3).map((agent, index) => {
            const rank = index + 1;
            const cleanHandle = agent.handle.replace("@", "");
            const isSubscribed = subscribedHandles.includes(cleanHandle);
            const isCurrentlySubscribing = subscribingHandle === cleanHandle;

            const medalColors = [
              "from-yellow-300 to-amber-500", // gold
              "from-gray-300 to-gray-400", // silver
              "from-amber-700 to-amber-900", // bronze
            ];

            // Generate pseudo-random metrics for visualization
            const precision = getRandomStat(agent.handle, "precision");
            const performance = getRandomStat(agent.handle, "performance");
            const reliability = getRandomStat(agent.handle, "reliability");

            return (
              <div
                key={agent.handle}
                className={`impact-card relative overflow-hidden rounded-xl border ${
                  rank === 1
                    ? "border-yellow-500/30"
                    : rank === 2
                    ? "border-gray-400/30"
                    : "border-amber-700/30"
                } bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-blue-900/20 backdrop-blur-sm`}
              >
                {/* Top Medal Badge */}
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
                        <h3 className="text-xl font-bold text-white">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-400">{agent.handle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm uppercase font-extrabold tracking-wider text-white mb-1">
                        Impact
                      </div>
                      <div className="text-xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                        {agent.impactFactor ?? "--"}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${agent.impactFactor || 0}%` }}
                    ></div>
                  </div>

                  {/* Detailed stats with hover interaction */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      showStats[agent.handle]
                        ? "max-h-40 opacity-100 mb-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-2.5 border border-blue-700/20">
                        <div className="relative mb-1">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <div
                            className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"
                            style={{ animationDuration: "3s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-blue-400 mb-0.5">
                          Precision
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {precision}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-cyan-900/20 rounded-lg p-2.5 border border-cyan-700/20">
                        <TrendingUp className="h-4 w-4 text-cyan-400 mb-1" />
                        <span className="text-xs text-cyan-400 mb-0.5">
                          Performance
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {performance}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-blue-800/20 rounded-lg p-2.5 border border-blue-700/20">
                        <BarChart2 className="h-4 w-4 text-blue-300 mb-1" />
                        <span className="text-xs text-blue-300 mb-0.5">
                          Reliability
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {reliability}%
                        </span>
                      </div>
                    </div>

                    {/* Radar chart visualization (simple CSS-based) */}
                    <div className="relative h-24 mb-4 hidden md:block">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full max-w-[120px] max-h-[120px] relative">
                          {/* Background hexagon */}
                          <div className="absolute inset-0 border-2 border-blue-800/30 rounded-full"></div>
                          <div className="absolute inset-[20%] border-2 border-blue-800/20 rounded-full"></div>
                          <div className="absolute inset-[40%] border-2 border-blue-800/10 rounded-full"></div>

                          {/* Stat lines */}
                          <div className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                          <div className="absolute top-1/2 left-0 h-0.5 w-1/2 bg-blue-800/20"></div>
                          <div className="absolute bottom-0 left-1/2 h-1/2 w-0.5 bg-blue-800/20 -translate-x-1/2"></div>
                          <div className="absolute top-1/2 right-0 h-0.5 w-1/2 bg-blue-800/20"></div>

                          {/* Data points */}
                          <div
                            className="absolute rounded-full w-2 h-2 bg-blue-400"
                            style={{
                              top: `${(100 - precision) / 2}%`,
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              boxShadow: "0 0 5px rgba(96, 165, 250, 0.7)",
                            }}
                          ></div>
                          <div
                            className="absolute rounded-full w-2 h-2 bg-cyan-400"
                            style={{
                              top: "50%",
                              left: `${performance / 2}%`,
                              transform: "translate(-50%, -50%)",
                              boxShadow: "0 0 5px rgba(34, 211, 238, 0.7)",
                            }}
                          ></div>
                          <div
                            className="absolute rounded-full w-2 h-2 bg-blue-300"
                            style={{
                              bottom: `${(100 - reliability) / 2}%`,
                              left: "50%",
                              transform: "translate(-50%, 50%)",
                              boxShadow: "0 0 5px rgba(147, 197, 253, 0.7)",
                            }}
                          ></div>
                          <div
                            className="absolute rounded-full w-2 h-2 bg-blue-500"
                            style={{
                              top: "50%",
                              right: `${100 - (agent.impactFactor || 0)}%`,
                              transform: "translate(50%, -50%)",
                              boxShadow: "0 0 5px rgba(59, 130, 246, 0.7)",
                            }}
                          ></div>

                          {/* Connecting lines */}
                          <svg className="absolute inset-0 w-full h-full">
                            <polygon
                              points={`50,${(100 - precision) / 2} 
                                                  ${performance / 2},50 
                                                  50,${
                                                    100 -
                                                    (100 - reliability) / 2
                                                  } 
                                                  ${
                                                    100 -
                                                    (100 -
                                                      (agent.impactFactor || 0))
                                                  },50
                                                `}
                              fill="rgba(59, 130, 246, 0.2)"
                              stroke="rgba(59, 130, 246, 0.6)"
                              strokeWidth="1"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle stats button */}
                  <button
                    className="w-full flex items-center justify-center gap-1 py-1 mb-3 rounded-lg text-sm font-medium 
                    text-blue-300 hover:text-blue-200 bg-blue-900/30 hover:bg-blue-800/40 transition-all duration-200"
                    onClick={() => toggleStats(agent.handle)}
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

                  {/* Subscribe button */}
                  <button
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${
                      isSubscribed || isCurrentlySubscribing
                        ? "bg-green-600/30 text-green-300"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    } transition-all duration-200 ${
                      isCurrentlySubscribing ? "animate-pulse" : ""
                    }`}
                    onClick={() =>
                      !isSubscribed &&
                      !isCurrentlySubscribing &&
                      onSubscribe(agent.handle)
                    }
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

        {/* List view for remaining analysts (excluding top 3) */}
        {sortedAgents.length > 3 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Other Analysts
            </h3>
            <div className="space-y-2">
              {sortedAgents.slice(3).map((agent, index) => {
                const rank = index + 4; // Start from rank 4
                const cleanHandle = agent.handle.replace("@", "");
                const isSubscribed = subscribedHandles.includes(cleanHandle);
                const isCurrentlySubscribing =
                  subscribingHandle === cleanHandle;

                return (
                  <div
                    key={agent.handle}
                    className="impact-card group relative p-3 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg overflow-hidden transition-all hover:bg-gray-800/50 duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 text-right">
                        <span className="text-sm font-medium text-slate-400">
                          #{rank}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-400">{agent.handle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Impact</div>
                        <div className="text-base font-semibold text-blue-400">
                          {agent.impactFactor ?? "--"}
                        </div>
                      </div>

                      <div className="w-[5rem] h-1.5 bg-gray-800 rounded-full hidden md:block">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: agent.impactFactor
                              ? `${agent.impactFactor}%`
                              : "0%",
                          }}
                        />
                      </div>

                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${
                          isSubscribed || isCurrentlySubscribing
                            ? "bg-green-500/20 text-green-300"
                            : "bg-blue-600/80 hover:bg-blue-700 text-white"
                        } transition-all duration-200 ${
                          isCurrentlySubscribing ? "animate-pulse" : ""
                        }`}
                        onClick={() =>
                          !isSubscribed &&
                          !isCurrentlySubscribing &&
                          onSubscribe(agent.handle)
                        }
                        disabled={isSubscribed || isCurrentlySubscribing}
                      >
                        <FaCrown
                          size={12}
                          color={
                            isSubscribed || isCurrentlySubscribing
                              ? "#86efac" // green-300
                              : "#ffffff" // white
                          }
                          className={
                            isCurrentlySubscribing ? "animate-pulse" : ""
                          }
                        />
                        <span>
                          {isCurrentlySubscribing
                            ? "Subscribing..."
                            : isSubscribed
                            ? "Subscribed"
                            : "Subscribe"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isRefreshing && (
          <div className="flex items-center justify-center p-3 mt-4">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
            <span className="text-sm text-slate-400">Updating rankings...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={container}>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <LuWandSparkles size={18} className="text-blue-400" />
          <h2 className="text-lg font-bold text-white">
            Impact Factor Rankings
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Discover crypto analysts ranked by their market influence and
          prediction accuracy
        </p>
      </div>

      {renderContent()}
    </div>
  );
};

export default React.memo(ImpactLeaderboard);
