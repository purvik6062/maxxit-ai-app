// components/ImpactLeaderboard.tsx
"use client";
import React, { useRef, useState } from "react";
import { FaTrophy, FaCrown } from "react-icons/fa";
import { TrendingUp, Award, BarChart2, Star } from "lucide-react";
import { LuWandSparkles } from "react-icons/lu";
import gsap from "gsap";
import {
  Loader2,
  AlertCircle,
  SearchX,
} from "lucide-react";
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
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        tl.fromTo(
          ".impact-card",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.03 }
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
          <h3 className="text-xl font-medium text-red-200 mb-2">Failed to load rankings</h3>
          <p className="text-red-300/80 text-sm max-w-md">{error}</p>
        </div>
      );
    }

    if (filteredAgents.length === 0 && searchText) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No analysts found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAgents.slice(0, 3).map((agent, index) => {
            const rank = index + 1;
            const cleanHandle = agent.handle.replace("@", "");
            const isSubscribed = subscribedHandles.includes(cleanHandle);
            const isCurrentlySubscribing = subscribingHandle === cleanHandle;

            const medalColors = [
              "from-yellow-300 to-amber-500", // gold
              "from-gray-300 to-gray-400",    // silver
              "from-amber-700 to-amber-900"   // bronze
            ];

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
                <div className="absolute -right-6 -top-6 w-24 h-24">
                  <div className={`absolute inset-0 bg-gradient-to-br ${medalColors[rank-1]} opacity-10 rotate-45`}></div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${medalColors[rank-1]} p-0.5`}>
                        <div className="absolute inset-0.5 rounded-full bg-gray-900/80"></div>
                        <FaTrophy className={`relative w-5 h-5 ${
                          rank === 1 ? "text-yellow-300" : 
                          rank === 2 ? "text-gray-300" : 
                          "text-amber-700"
                        }`} />
                      </div>
                      <div>
                        <span className="block text-xs text-blue-400 mb-0.5 font-medium">Rank #{rank}</span>
                        <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400">{agent.handle}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Impact</div>
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
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
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-900/20 rounded-lg p-2 text-center">
                      <Award className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Precision</span>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-2 text-center">
                      <TrendingUp className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Performance</span>
                    </div>
                    <div className="bg-cyan-900/20 rounded-lg p-2 text-center">
                      <BarChart2 className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Reliability</span>
                    </div>
                  </div>
                  
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
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Other Analysts</h3>
            <div className="space-y-2">
              {sortedAgents.slice(3).map((agent, index) => {
                const rank = index + 4; // Start from rank 4
                const cleanHandle = agent.handle.replace("@", "");
                const isSubscribed = subscribedHandles.includes(cleanHandle);
                const isCurrentlySubscribing = subscribingHandle === cleanHandle;

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
                        <p className="text-xs text-slate-400">{agent.handle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Impact</div>
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs ${
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
                          className={isCurrentlySubscribing ? "animate-pulse" : ""}
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
            <span className="text-sm text-slate-400">
              Updating rankings...
            </span>
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
          <h2 className="text-lg font-bold text-white">Impact Factor Rankings</h2>
        </div>
        <p className="text-xs text-slate-400">
          Discover crypto analysts ranked by their market influence and prediction accuracy
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default React.memo(ImpactLeaderboard);
