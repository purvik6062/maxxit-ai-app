"use client";
import React, { useRef, useState } from "react";
import { FaTrophy, FaCrown } from "react-icons/fa";
import { TrendingUp, Award, BarChart2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Loader2, Clock, AlertCircle, AlertTriangle, SearchX, Info } from "lucide-react";
import { useHeartbeatLeaderboard } from "@/hooks/useHeartbeatLeaderboard";

interface HeartbeatDashboardProps {
  subscribedHandles: string[];
  subscribingHandle: string | null;
  onSubscribe: (handle: string) => void;
  setRefreshData: (refresh: () => void) => void;
  searchText: string; // Add searchText to props
}

const HeartbeatDashboard: React.FC<HeartbeatDashboardProps> = ({
  subscribedHandles,
  subscribingHandle,
  onSubscribe,
  setRefreshData,
  searchText,
}) => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const { agents, loading, error, refreshData } = useHeartbeatLeaderboard();
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for refresh loader

  React.useEffect(() => {
    const wrappedRefreshData = async () => {
      console.log("HeartbeatDashboard: Starting refresh");
      setIsRefreshing(true);
      try {
        await refreshData();
        console.log("HeartbeatDashboard: Refresh completed");
      } finally {
        setIsRefreshing(false);
      }
    };
    setRefreshData(() => wrappedRefreshData); // Ensure stable function reference
  }, [refreshData, setRefreshData]);

  useGSAP(
    () => {
      if (!loading && agents.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        tl.fromTo(
          ".rankings-card",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
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

  const renderAgentsList = () => {
    // Consistent dimensions and styling
  const cardStyles = "flex flex-col items-center justify-center min-h-[300px] w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-xl border border-gray-800/50 backdrop-blur-lg";

  if (loading) {
    return (
      <div className={`${cardStyles} bg-gradient-to-br from-gray-900 to-blue-900/30`}>
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin [animation-delay:-0.2s]"></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
            Loading Heartbeats
          </h3>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Fetching market pulse data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardStyles} bg-gradient-to-br from-gray-900 to-red-900/20`}>
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-400 animate-pulse" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight text-red-300">
            Error Loading Heartbeat Data
          </h3>
          <p className="text-red-400/80 text-sm max-w-md flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (filteredAgents.length === 0 && searchText) {
    return (
      <div className={`${cardStyles} bg-gradient-to-br from-gray-900 to-gray-800/50`}>
        <div className="mb-6">
          <SearchX className="w-12 h-12 text-gray-400 animate-bounce [animation-duration:1.5s]" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight text-gray-300">
            No Matching Agents Found
          </h3>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            Try adjusting your search term
          </p>
        </div>
      </div>
    );
  }

    return (
      <div className="grid gap-4">
        {filteredAgents.map((agent, index) => {
          const cleanHandle = agent.handle.replace("@", "");
          const isSubscribed = subscribedHandles.includes(cleanHandle);
          const isCurrentlySubscribing = subscribingHandle === cleanHandle;

          return (
            <div
              key={index}
              className="rankings-card group relative bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="relative p-6 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-[50px]">
                    {agent.id === 1 && <FaTrophy className="w-5 h-5 text-yellow-300" />}
                    {agent.id === 2 && <FaTrophy className="w-5 h-5 text-gray-400" />}
                    {agent.id === 3 && <FaTrophy className="w-5 h-5 text-amber-700" />}
                    {agent.id > 3 && (
                      <span className="text-xl font-bold text-slate-400">#{agent.id}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                    <p className="text-slate-400">{agent.handle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Heartbeat</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                      {agent.heartbeat ?? "--"}
                    </div>
                  </div>
                  <div className="w-[5rem] h-2 bg-white/70 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      style={{ width: agent.heartbeat ? `${agent.heartbeat}%` : '0%' }}
                    />
                  </div>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      isSubscribed || isCurrentlySubscribing
                        ? "bg-green-500/20 border-green-500/30 cursor-default"
                        : "bg-gradient-to-r from-blue-500/20 hover:from-blue-500/60 border border-blue-500/30 hover:border-blue-500/100"
                    } transition-all duration-300 group ${
                      isCurrentlySubscribing ? "animate-pulse" : ""
                    }`}
                    onClick={() =>
                      !isSubscribed && !isCurrentlySubscribing && onSubscribe(agent.handle)
                    }
                    disabled={isSubscribed || isCurrentlySubscribing}
                  >
                    <FaCrown
                      color={isSubscribed || isCurrentlySubscribing ? "green" : "yellow"}
                      className={isCurrentlySubscribing ? "animate-pulse" : ""}
                    />
                    <span className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">
                      {isCurrentlySubscribing
                        ? "Subscribing..."
                        : isSubscribed
                        ? "Subscribed"
                        : "Subscribe"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {isRefreshing && (
          <div className="flex items-center justify-center p-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-blue-500/10 animate-pulse"></div>
            </div>
            <span className="ml-2 text-slate-400">Loading new influencer...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="techwave_fn_content">
      <div ref={container}>
        <div className="relative h-[50vh]">
          <div className="relative h-full flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 backdrop-blur-sm">
                <span className="animate-pulse text-2xl">💓</span>
                <span className="text-base font-medium text-blue-400">Real-time Analytics</span>
              </div>
              <h1 className="relative text-2xl md:text-3xl font-bold">
                <span>🌟</span>
                <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  Heartbeat Rankings
                </span>
                <span>📊</span>
              </h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-slate-400 max-w-2xl">
                  Discover the Pulse of Crypto Markets through our Elite Analysts
                </p>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20">
                    <Award className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">Precision</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <span className="text-sm">Performance</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
                    <BarChart2 className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm">Reliability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative bg-gray-900/80 pb-12">
          <div className="max-w-7xl mx-auto px-[1rem]">{renderAgentsList()}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeartbeatDashboard);