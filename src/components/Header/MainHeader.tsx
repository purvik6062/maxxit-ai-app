"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../../app/css/input.css";
import { useAccount } from "wagmi";
import { useCredits } from "@/context/CreditsContext";
import ComingSoonModal from "./ComingSoonModal";
import TelegramConnectionModal from "./TelegramConnectionModal";
import Link from "next/link"; // Added for navigation

const MainHeader = () => {
  const [view, setView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const { address, isConnected } = useAccount();
  const { credits } = useCredits();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;
      setShowTokens(true);

      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);
        if (response.status === 404) {
          setTimeout(() => {
            setIsTelegramModalOpen(true);
          }, 0);
          return;
        }

        const data = await response.json();
        if (data.success) {
          setShowTokens(true);
          if (data.data.telegramId) {
            localStorage.setItem("hasSeenTelegramPrompt", "true");
            localStorage.setItem("telegramUsername", data.data.telegramId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [address]);

  useEffect(() => {
    if (credits === 100) {
      toast.info(
        "🎉 Welcome! Explore our prediction markets with your 100 free credits",
        {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
        }
      );
    }
  }, [credits]);

  useEffect(() => {
    if (isModalOpen || isTelegramModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isModalOpen, isTelegramModalOpen]);

  const handleTelemodal = () => {
    if (address) {
      setIsTelegramModalOpen(true);
    } else {
      toast.error("Please connect to your wallet first");
    }
  };

  return (
    <div className="techwave_fn_header relative">
      <ToastContainer />
      <div className="flex w-full justify-between items-center border border-gray-700">
        <nav className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center min-w-0 space-x-2">
                <Link href="/" className="fn_logo flex-shrink-0">
                  <span className="full_logo">
                    <img
                      src="/img/new_name_logo.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img
                      src="/img/new_name_logo.svg"
                      className="retina_logo"
                      alt=""
                    />
                  </span>
                  <span className="short_logo">
                    <img
                      src="/img/new_logo.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img
                      src="/img/new_logo.svg"
                      className="retina_logo w-[45px] h-[40px]"
                      alt=""
                    />
                  </span>
                </Link>
                <div className="flex flex-shrink-0 overflow-hidden">
                  {["AI Predictions", "AI Insights"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setIsModalOpen(true)}
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === item.toLowerCase()
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  {/* Added Profile Navigation */}
                  <Link href="/profile">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === "profile"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                      //   onClick={() => setView("profile")} // Optional: Update view state
                    >
                      Profile
                    </button>
                  </Link>
                  {showTokens && (
                    <div className="ml-4 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50 flex-shrink-0">
                      {credits !== null ? (
                        <span className="text-blue-400 font-bold mr-1 text-md whitespace-nowrap">
                          {credits}{" "}
                          <span className="text-white font-normal">
                            Credits
                          </span>
                        </span>
                      ) : (
                        <button
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition whitespace-nowrap"
                          onClick={handleTelemodal}
                        >
                          Get Credits
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                <div className="relative mx-4">
                  <input
                    type="text"
                    placeholder="Search predictions..."
                    className="w-12 min-w-[12rem] px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center flex-shrink-0">
          <ConnectButton />
        </div>
      </div>

      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <TelegramConnectionModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        address={address}
      />
    </div>
  );
};

export default MainHeader;
