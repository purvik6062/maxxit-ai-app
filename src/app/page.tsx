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
import CustomizeAgentModal from "@/components/Global/CustomizeAgentModal";
import type { CustomizationOptions } from "@/components/Global/CustomizeAgentModal"
import SocialGraph from "@/components/Body/SocialGraph";
import AnalystLeaderboard from "@/components/Body/AnalystLeaderboard";
import TabNavigation from "@/components/Body/TabNavigation";
import AddInfluencerModal from "../components/Body/AddInfluencerModal";
import TopTweetsCarousel from "@/components/Body/TopTweetsCarousel";
import { useSession } from "next-auth/react";
import { FaCheck } from "react-icons/fa";
import { useLoginModal } from "@/context/LoginModalContext";
import Link from "next/link";
import AllAgentsMarketplace from "@/components/Body/AllAgentsMarketplace";

const HomePage: React.FC = () => {
  const { updateCredits, credits, isAgentCustomized } = useCredits();
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
  const defaultCustomization: CustomizationOptions = {
    r_last6h_pct: 50,
    d_pct_mktvol_6h: 50,
    d_pct_socvol_6h: 50,
    d_pct_sent_6h: 50,
    d_pct_users_6h: 50,
    d_pct_infl_6h: 50,
    d_galaxy_6h: 5,
    neg_d_altrank_6h: 50,
  };
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>(defaultCustomization);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const { showLoginModal } = useLoginModal();

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
        showLoginModal("Please login to subscribe", window.location.pathname);
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

      if (isAgentCustomized === false) {
        setIsCustomizeOpen(true);
        return;
      }

      setCurrentAgent(agent);
      setShowSubscribeModal(true);
    },
    [session, credits, isAgentCustomized, showLoginModal]
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

      <AllAgentsMarketplace />
      
      <CustomizeAgentModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onSkip={() => {
          // Skip customization and close modal
          setIsCustomizeOpen(false);
        }}
        onContinue={() => {
          // Complete customization and close modal
          setIsCustomizeOpen(false);
          // The agent is now considered customized through the context
        }}
        customizationOptions={customizationOptions}
        setCustomizationOptions={setCustomizationOptions}
        hasCustomizedAgent={isAgentCustomized}
        setHasCustomizedAgent={(hasCustomized) => {
          // This will be handled through the credits context
          // when customization options are updated
        }}
        isOnboardingFlow={false}
      />
    </div>
  );
};

export default React.memo(HomePage);
