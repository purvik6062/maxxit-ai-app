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
import { X } from "lucide-react";
import { LuWandSparkles } from "react-icons/lu";
import ImpactGrid from "./ImpactGrid";
import { Footer } from "../index";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useImpactLeaderboard } from "@/hooks/useImpactLeaderboard";
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

const ImpactLeaderboard = () => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const { agents, loading, error } = useImpactLeaderboard();

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

    const cleanHandle = handle.replace('@', '');

    try {
      const response = await fetch('/api/subscribe-influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          influencerHandle: cleanHandle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to subscribe');
      }

      setSubscribedHandles(prev => [...prev, cleanHandle]);
      
      toast.success("Successfully subscribed to influencer!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to subscribe",
        {
          position: "top-center",
        }
      );
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center ">
          <div className="relative w-24 h-24">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-pulse"></div>
            {/* Center dot */}
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
          const cleanHandle = agent.handle.replace('@', '');
          const isSubscribed = subscribedHandles.includes(cleanHandle);

          return (
            <div
              key={index}
              className="rankings-card group relative bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center justify-center w-[41px]">
                    {agent.id === 1 && (
                      <FaTrophy className="w-6 h-6 text-yellow-300" />
                    )}
                    {agent.id === 2 && (
                      <FaTrophy className="w-6 h-6 text-gray-400" />
                    )}
                    {agent.id === 3 && (
                      <FaTrophy className="w-6 h-6 text-amber-700" />
                    )}
                    {agent.id > 3 && (
                      <span className="text-2xl font-bold text-slate-400">
                        #{agent.id}
                      </span>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 flex items-center justify-center text-white font-bold text-lg">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <p className="text-slate-400">{agent.handle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="ml-6">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isSubscribed 
                          ? 'bg-green-500/20 border-green-500/30 cursor-default'
                          : 'bg-gradient-to-r from-blue-500/20 hover:from-blue-500/60 border border-blue-500/30 hover:border-blue-500/100'
                      } transition-all duration-300 group`}
                      onClick={() => !isSubscribed && handleSubscribe(agent.handle)}
                      disabled={isSubscribed}
                    >
                      <FaCrown color={isSubscribed ? "green" : "yellow"} />
                      <span className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
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
        <ImpactGrid />
        <div className="mx-auto py-16">
          <div className="relative p-[2rem]">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
              <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            <div className="relative space-y-6">
              <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 backdrop-blur-sm mb-6">
                  <span className="animate-pulse text-3xl">
                    <LuWandSparkles size={25} color="white" />
                  </span>
                  <span className="text-base font-medium text-blue-400">
                    Impact Leaderboard
                  </span>
                </div>

                <h1 className="relative text-3xl md:text-4xl font-bold mb-6">
                  <span className="">🌟</span>
                  <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                    Impact Factor Rankings
                  </span>
                  <span className="">📊</span>
                </h1>

                <div className="flex flex-col items-center gap-4">
                  <p className="text-xl text-slate-300/90 max-w-2xl">
                    Discover the Pulse of Crypto Markets through our Elite
                    Analysts
                  </p>
                  <div className="flex items-center gap-2 text-white">
                    <span>🎯 Precision</span>
                    <span className="text-slate-300">•</span>
                    <span>🚀 Performance</span>
                    <span className="text-slate-300">•</span>
                    <span>💎 Reliability</span>
                  </div>
                </div>
              </div>

              {renderContent()}
            </div>
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
                <X
                  size={20}
                  className="hover:text-cyan-400 hover:scale-110"
                />
              </button>
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex items-center mt-6 gap-1">
                <h3 className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-center text-2xl font-semibold text-transparent">
                  Coming Soon!
                </h3>
                <div>🚀✨</div>
              </div>
              <p className="mt-2 text-center text-gray-300">
                Exciting developments are underway! Our team is working hard to bring
                you cutting-edge AI-powered trading features. Stay tuned for
                updates! 🛠️💡
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
      <Footer />
    </div>
  );
};

export default ImpactLeaderboard;