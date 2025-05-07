// pages/HomePage.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useCredits } from "@/context/CreditsContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { IoPersonAdd } from "react-icons/io5";
import { LuWandSparkles } from "react-icons/lu";
import { Car, Heart, Sparkles } from "lucide-react";
import { Header, Footer, TopInfluencersGraph } from "../components/index";
import SocialGraph from "@/components/Body/SocialGraph";
import AnalystLeaderboard from "@/components/Body/AnalystLeaderboard";
import TabNavigation from "@/components/Body/TabNavigation";
import AddInfluencerModal from "../components/Body/AddInfluencerModal";
import TopTweetsCarousel from "@/components/Body/TopTweetsCarousel";
import { useSession } from "next-auth/react";
import { FaCheck } from "react-icons/fa";

const HomePage: React.FC = () => {
  const { updateCredits, credits } = useCredits();
  const { data: session } = useSession();
  console.log("session::::", session);
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const [subscribingHandle, setSubscribingHandle] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [impactRefreshData, setImpactRefreshData] = useState<
    (() => void) | null
  >(null);
  const [heartbeatRefreshData, setHeartbeatRefreshData] = useState<
    (() => void) | null
  >(null);
  const addInfluencerButtonRef = useRef<HTMLButtonElement>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"impact" | "heartbeat">("impact");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<any>(null);

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

  const handleSubscribeInitiate = useCallback(
    (agent: any) => {
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
    },
    [session, credits]
  );

  const handleSubscribe = useCallback(async () => {
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
  }, [session, updateCredits, currentAgent]);

  const handleInfluencerAdded = useCallback(async () => {
    console.log("handleInfluencerAdded called", {
      impactRefreshData,
      heartbeatRefreshData,
    });
    setIsModalOpen(false);

    if (addInfluencerButtonRef.current) {
      addInfluencerButtonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    try {
      const impactPromise =
        typeof impactRefreshData === "function"
          ? impactRefreshData()
          : Promise.resolve();
      const heartbeatPromise =
        typeof heartbeatRefreshData === "function"
          ? heartbeatRefreshData()
          : Promise.resolve();
      await Promise.all([impactPromise, heartbeatPromise]);
      console.log("Both leaderboards refreshed successfully");
    } catch (error) {
      console.error("Detailed refresh error:", error);
      toast.error("Failed to refresh leaderboard data, retrying...", {
        position: "top-center",
      });
      setTimeout(async () => {
        try {
          const impactRetry =
            typeof impactRefreshData === "function"
              ? impactRefreshData()
              : Promise.resolve();
          const heartbeatRetry =
            typeof heartbeatRefreshData === "function"
              ? heartbeatRefreshData()
              : Promise.resolve();
          await Promise.all([impactRetry, heartbeatRetry]);
          console.log("Retry successful");
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          toast.error(
            "Failed to refresh after retry, please refresh manually",
            {
              position: "top-center",
            }
          );
        }
      }, 1000);
    }
  }, [impactRefreshData, heartbeatRefreshData]);

  return (
    <div className="flex flex-col min-h-screen bg-[#020617]">
      <div>
        <TopInfluencersGraph />
      </div>

      <div className="py-8">
        <TopTweetsCarousel />
      </div>

      <UserDataProvider>
        <main className="flex-grow px-3 xs:px-5 py-6 max-w-7xl mx-auto w-full">
          <div className="mb-6 text-center mt-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Analyst Rankings
              </span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              Discover and follow top crypto analysts based on their impact and
              market sentiment
            </p>
          </div>

          {/* Tabbed Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-[1px] bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl mt-[2rem]">
            {/* Add Influencer Button - Floating */}
            <div className="fixed bottom-[0.9rem] right-3 z-20">
              <button
                ref={addInfluencerButtonRef}
                onClick={() => setIsModalOpen(true)}
                className="group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-full p-3 shadow-lg shadow-blue-900/30 transition-all duration-300"
              >
                <IoPersonAdd size={20} className="text-white" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Add New Influencer
                </span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/60 backdrop-blur-sm rounded-lg border border-gray-800/30 shadow-xl overflow-hidden">
              <div className="p-4">
                <AnalystLeaderboard
                  mode={activeTab}
                  subscribedHandles={subscribedHandles}
                  subscribingHandle={subscribingHandle}
                  onSubscribe={handleSubscribeInitiate}
                  setRefreshData={
                    activeTab === "impact"
                      ? setImpactRefreshData
                      : setHeartbeatRefreshData
                  }
                  searchText={searchText}
                />
              </div>
            </div>
          </div>
        </main>

        {/* <div className="py-8">
          <SocialGraph />
        </div> */}

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
                      You will receive trading signals from this analyst
                      directly to your Telegram for one month.
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

        <AddInfluencerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleInfluencerAdded}
        />
      </UserDataProvider>
    </div>
  );
};

export default React.memo(HomePage);
