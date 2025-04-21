// pages/HomePage.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useCredits } from "@/context/CreditsContext";
import { UserDataProvider  } from "@/context/UserDataContext";
import { IoPersonAdd } from "react-icons/io5";
import { LuWandSparkles } from "react-icons/lu";
import { Heart, Sparkles } from "lucide-react";
import {
  Header,
  ImpactLeaderboard,
  HeartbeatDashboard,
  Footer,
  Mindshare,
  TopInfluencersGraph,
  ShareButton,
} from "../components/index";
import SocialGraph from "@/components/Body/SocialGraph";
import TabNavigation from "@/components/Body/TabNavigation";
import AddInfluencerModal from "../components/Body/AddInfluencerModal";
import { useSession } from "next-auth/react";

const HomePage: React.FC = () => {
  const { updateCredits } = useCredits();
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

  useEffect(() => {
    const fetchSubscribedHandles = async () => {
      if (!session || !session.user?.id) return;

      try {
        const response = await fetch(
          `/api/get-user?twitterId=${session.user.id}`
        );
        const data = await response.json();

        if (data.success && data.data.subscribedAccounts) {
          // Extract only twitterHandle values
          const handles = data.data.subscribedAccounts.map(
            (account: { twitterHandle: string }) => account.twitterHandle
          );

          // Set the extracted handles
          setSubscribedHandles(handles);
        }
      } catch (error) {
        console.error("Failed to fetch subscribed handles:", error);
      }
    };

    fetchSubscribedHandles();
  }, [session]);

  const handleSubscribe = useCallback(
    async (handle: string, impactFactor: number) => {
      if (!session || !session.user?.id) {
        toast.error("Please login with Twitter/X first", {
          position: "top-center",
        });
        return;
      }

      const cleanHandle = handle.replace("@", "");
      setSubscribingHandle(cleanHandle);

      // Calculate subscription fee based on impact factor
      const subscriptionFee = impactFactor * 10;

      try {
        const response = await fetch("/api/subscribe-influencer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            twitterId: session.user.id,
            influencerHandle: cleanHandle,
            subscriptionFee: subscriptionFee
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Failed to subscribe");
        }

        setSubscribedHandles((prev) => [...prev, cleanHandle]);
        toast.success("Successfully subscribed to influencer!", {
          position: "top-center",
          autoClose: 3000,
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
    },
    [session, updateCredits]
  );

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
      {/* <Header searchText={searchText} setSearchText={setSearchText} /> */}

      <div>
        <TopInfluencersGraph />
        {/* <ShareButton /> */}
      </div>

      <UserDataProvider >

      <main className="flex-grow px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="mb-6 text-center mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Analyst Rankings
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Discover and follow top crypto analysts based on their impact and
            market sentiment
          </p>
        </div>

        {/* Tabbed Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="p-[1px] bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl mt-[2rem]">
          {/* Add Influencer Button - Floating */}
          <div className="fixed bottom-[0.9rem] right-3 z-10">
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
              {activeTab === "impact" ? (
                <ImpactLeaderboard
                  subscribedHandles={subscribedHandles}
                  subscribingHandle={subscribingHandle}
                  onSubscribe={handleSubscribe}
                  setRefreshData={setImpactRefreshData}
                  searchText={searchText}
                />
              ) : (
                <HeartbeatDashboard
                  subscribedHandles={subscribedHandles}
                  subscribingHandle={subscribingHandle}
                  onSubscribe={handleSubscribe}
                  setRefreshData={setHeartbeatRefreshData}
                  searchText={searchText}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="px-6 py-8">
        <SocialGraph />
      </div>

      {/* <div className="px-6 py-8 flex justify-center">
        <Mindshare />
      </div> */}

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
