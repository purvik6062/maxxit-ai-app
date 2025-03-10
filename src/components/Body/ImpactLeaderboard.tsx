import React, { useRef } from "react";
import { useState, useEffect } from "react";
import {
  FaRegCopy,
  FaTrophy,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaCrown,
} from "react-icons/fa";
import { X, Zap, TrendingUp, Award, BarChart2 } from "lucide-react";
import { LuWandSparkles } from "react-icons/lu";
import ImpactGrid from "./ImpactGrid";
import { Footer } from "../index";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useImpactLeaderboard } from "@/hooks/useImpactLeaderboard";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { useCredits } from "@/context/CreditsContext";

const ImpactLeaderboard = () => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const { agents, loading, error } = useImpactLeaderboard();
  const [subscribingHandle, setSubscribingHandle] = useState<string | null>(
    null
  );
  const { credits, updateCredits } = useCredits();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);

  useGSAP(
    () => {
      if (!loading && agents.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

        tl.fromTo(
          ".rankings-card",
          {
            y: 40,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
          }
        );
      }
    },
    { scope: container, dependencies: [loading, agents] }
  );

  useEffect(() => {
    const fetchSubscribedHandles = async () => {
      if (!address) return;

      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);
        const data = await response.json();

        if (data.success && data.data.subscribedAccounts) {
          setSubscribedHandles(data.data.subscribedAccounts);
        }
      } catch (error) {
        console.error("Failed to fetch subscribed handles:", error);
      }
    };

    fetchSubscribedHandles();
  }, [address]);

  const handleSubscribe = async (handle: string) => {
    if (!address) {
      toast.error("Please connect your wallet first", {
        position: "top-center",
      });
      return;
    }

    const cleanHandle = handle.replace("@", "");

    setSubscribingHandle(cleanHandle);

    try {
      const response = await fetch("/api/subscribe-influencer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          influencerHandle: cleanHandle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to subscribe");
      }

      setSubscribedHandles((prev) => [...prev, cleanHandle]);

      toast.success("Successfully subscribed to influencer!", {
        position: "top-center",
      });

      await updateCredits();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to subscribe",
        {
          position: "top-center",
        }
      );
    } finally {
      setSubscribingHandle(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-pulse"></div>
            <div className="absolute inset-[42%] rounded-full bg-blue-400"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
              Loading Rankings
            </h3>
            <p className="text-slate-400">Fetching latest impact data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 rounded-xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-transparent backdrop-blur-sm">
          <div className="text-red-400 text-2xl font-bold mb-4">
            Error Loading Leaderboard
          </div>
          <div className="text-red-300/80 max-w-md mx-auto">{error}</div>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {agents.map((agent, index) => {
          const cleanHandle = agent.handle.replace("@", "");
          const isSubscribed = subscribedHandles.includes(cleanHandle);
          const isCurrentlySubscribing = subscribingHandle === cleanHandle;

          return (
            <div
              key={index}
              className="rankings-card group relative bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-[50px]">
                    {agent.id === 1 && (
                      <FaTrophy className="w-5 h-5 text-yellow-300" />
                    )}
                    {agent.id === 2 && (
                      <FaTrophy className="w-5 h-5 text-gray-400" />
                    )}
                    {agent.id === 3 && (
                      <FaTrophy className="w-5 h-5 text-amber-700" />
                    )}
                    {agent.id > 3 && (
                      <span className="text-xl font-bold text-slate-400">
                        #{agent.id}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {agent.name}
                    </h3>
                    <p className="text-slate-400">{agent.handle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Impact Factor</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                      {agent.impactFactor}
                    </div>
                  </div>
                  <div className="w-[5rem] h-2 bg-white/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-gray-500 rounded-full"
                      style={{ width: `${agent.impactFactor}%` }}
                    />
                  </div>
                  <div className="flex items-center space-x-8">
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg
        ${
          isSubscribed || isCurrentlySubscribing
            ? "bg-green-500/20 border-green-500/30 cursor-default"
            : "bg-gradient-to-r from-blue-500/20 hover:from-blue-500/60 border border-blue-500/30 hover:border-blue-500/100"
        }x
        transition-all duration-300 group
        ${isCurrentlySubscribing ? "animate-pulse" : ""}`}
                        onClick={() =>
                          !isSubscribed &&
                          !isCurrentlySubscribing &&
                          handleSubscribe(agent.handle)
                        }
                        disabled={isSubscribed || isCurrentlySubscribing}
                      >
                        <FaCrown
                          color={
                            isSubscribed || isCurrentlySubscribing
                              ? "green"
                              : "yellow"
                          }
                          className={
                            isCurrentlySubscribing ? "animate-pulse" : ""
                          }
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
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="techwave_fn_content">
      <div className="relative min-h-screen" ref={container}>
        {/* <ImpactGrid /> */}
        <div className="relative h-[50vh]">
          <div className="relative h-full flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 pt-[11px] pb-[11px] rounded-xl bg-blue-500/15 backdrop-blur-sm">
                <span className="animate-pulse text-2xl">
                  <LuWandSparkles size={24} color="white" />
                </span>
                <span className="text-base font-medium text-blue-400">
                  Impact Leaderboard
                </span>
              </div>

              <h1 className="relative text-2xl md:text-3xl font-bold">
                <span className="">🌟</span>
                <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  Impact Factor Rankings
                </span>
                <span className="">📊</span>
              </h1>

              <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-slate-300/90 max-w-2xl">
                  Discover the Pulse of Crypto Markets through our Elite
                  Analysts
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
        <div className="relative bg-gray-900/80 min-h-[50vh] pb-12">
          <div className="max-w-7xl mx-auto px-[1rem] pb-12">
            {renderContent()}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-white text-xl font-bold hover:text-gray-300 p-2 bg-gray-700 rounded-full"
            >
              <X size={20} className="hover:text-cyan-400 hover:scale-110" />
            </button>
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex items-center mt-6 gap-1">
                <h3 className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-center text-2xl font-semibold text-transparent">
                  Coming Soon!
                </h3>
                <div>🚀✨</div>
              </div>
              <p className="mt-2 text-center text-gray-300">
                Exciting developments are underway! Our team is working hard to
                bring you cutting-edge AI-powered trading features. Stay tuned
                for updates! 🛠️💡
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactLeaderboard;
