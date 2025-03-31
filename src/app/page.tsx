// pages/HomePage.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useCredits } from "@/context/CreditsContext";
import { IoPersonAdd } from "react-icons/io5";
import {
  Header,
  ImpactLeaderboard,
  HeartbeatDashboard,
  Footer,
  Mindshare,
  MainHeader,
} from "../components/index";
import SocialGraph from "@/components/Body/SocialGraph";
import AddInfluencerModal from "../components/Body/AddInfluencerModal";

const HomePage: React.FC = () => {
  const { address } = useAccount();
  const { updateCredits } = useCredits();

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

  useEffect(() => {
    const fetchSubscribedHandles = async () => {
      if (!address) return;

      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);
        const data = await response.json();

        // if (data.success && data.data.subscribedAccounts) {
        //   setSubscribedHandles(data.data.subscribedAccounts);
        // }

        if (data.success && data.data.subscribedAccounts) {
          // Extract only twitterHandle values
          const handles = data.data.subscribedAccounts.map((account: { twitterHandle: string; }) => account.twitterHandle);
          
          // Set the extracted handles
          setSubscribedHandles(handles);
        }
      } catch (error) {
        console.error("Failed to fetch subscribed handles:", error);
      }
    };

    fetchSubscribedHandles();
  }, [address]);

  const handleSubscribe = useCallback(
    async (handle: string) => {
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
    },
    [address, updateCredits]
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
      <Header searchText={searchText} setSearchText={setSearchText} />
      <main className="flex-grow px-6 py-8 max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[50%] bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-lg h-fit">
              <ImpactLeaderboard
                subscribedHandles={subscribedHandles}
                subscribingHandle={subscribingHandle}
                onSubscribe={handleSubscribe}
                setRefreshData={setImpactRefreshData}
                searchText={searchText} 
              />
            </div>
            <div className="lg:w-[50%] bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-lg h-fit">
              <HeartbeatDashboard
                subscribedHandles={subscribedHandles}
                subscribingHandle={subscribingHandle}
                onSubscribe={handleSubscribe}
                setRefreshData={setHeartbeatRefreshData}
                searchText={searchText} 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              ref={addInfluencerButtonRef}
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-gradient-to-r from-blue-600/50 to-blue-600/30 backdrop-blur-sm border border-blue-400/30 rounded-xl overflow-hidden transition-all duration-300 px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <IoPersonAdd color="rgb(73, 175, 243)" />
                <span className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                  Add New Influencer
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <div className="px-6 py-8">
        <SocialGraph />
      </div>
      
      <div className="px-6 py-8">
        <Mindshare />
      </div>

      <Footer />
      <AddInfluencerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInfluencerAdded}
      />
    </div>
  );
};

export default React.memo(HomePage);
