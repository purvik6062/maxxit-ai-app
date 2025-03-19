"use client";
import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import { OctagonAlert } from "lucide-react";
import { IoShieldCheckmark } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { FaLongArrowAltLeft } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Search, X } from "lucide-react"; // or whatever icon library you're using
import "@rainbow-me/rainbowkit/styles.css";
import "../../app/css/input.css";
import { useAccount } from "wagmi";
import { useCredits } from "@/context/CreditsContext";
import Link from "next/link";
import ComingSoonModal from "../Header/ComingSoonModal";
import TelegramConnectionModal from "../Header/TelegramConnectionModal";

interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchText, setSearchText }) => {
  const [view, setView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [showTokens, setShowTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramStep, setTelegramStep] = useState(1);
  const { address, isConnected } = useAccount();
  const { credits, updateCredits } = useCredits();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ERROR_MAPPING: { [key: string]: string } = {
    "Wallet address already registered":
      "This wallet is already connected to another account",
    "Telegram username already registered":
      "This Telegram username is already in use",
    "Telegram account already linked to another user":
      "This Telegram account is connected to another wallet",
    "Please start a chat with our bot first and send a message. Check step 1 & 2 in the instructions.":
      "Complete Step 1 & 2: Start the bot and send /start",
  };

  useEffect(() => {
    if (isModalOpen || isTelegramModalOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
      // Also prevent touchmove on mobile devices
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    // Cleanup function to ensure we reset the styles when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isModalOpen, isTelegramModalOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;
      setShowTokens(true);

      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);
        if (response.status === 404) {
          setTimeout(() => {
            setIsTelegramModalOpen(true);
            setTelegramStep(1);
          }, 0);
          return;
        }

        const data = await response.json();
        if (data.success) {
          setShowTokens(true);
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

  const handleTelemodal = () => {
    if (address) {
      setIsTelegramModalOpen(true);
      setTelegramStep(1);
    } else {
      toast.error("Please connect to your wallet first", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  };

  const handleLater = () => {
    setIsTelegramModalOpen(false);
    setTelegramUsername("");
    setTelegramStep(1);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          telegramId: telegramUsername,
          credits: 100,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Registration failed");
      }

      // Success handling
      setIsTelegramModalOpen(false);
      toast.success("Success! 100 Credits added to your account", {
        position: "top-center",
        autoClose: 4000,
      });
      await updateCredits(); // Update credits after successful registration
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      const mappedErrorKey = Object.keys(ERROR_MAPPING).find((key) =>
        message.includes(key)
      );
      setErrorMessage(
        mappedErrorKey
          ? ERROR_MAPPING[mappedErrorKey]
          : "Registration failed. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="techwave_fn_header">
      <ToastContainer />
      <div className="flex w-full justify-between items-center border border-gray-700">
        <nav className="flex-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-2">
                <a className="fn_logo flex-shrink-0">
                  <span className="full_logo">
                    <img
                      src="img/new_name_logo.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img
                      src="img/new_name_logo.svg"
                      className="retina_logo"
                      alt=""
                    />
                  </span>
                  <span className="short_logo">
                    <img
                      src="img/new_logo.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img
                      src="img/new_logo.svg"
                      className="retina_logo w-[45px] h-[40px]"
                      alt=""
                    />
                  </span>
                </a>
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
                <div className="relative mx-4 w-full max-w-md flex items-center overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full px-4 py-2 rounded-l-full bg-gray-900 text-white border border-blue-500/50 focus:outline-none focus:border-blue-600 transition-all duration-300 overflow-x-auto whitespace-nowrap"
                    style={{ minWidth: "0" }}
                  />
                  <div className="flex items-center bg-gray-900 border border-l-0 border-blue-500/50 rounded-r-full px-3 py-2 transition-all duration-300">
                    {searchText ? (
                      <button
                        onClick={() => setSearchText("")}
                        className="flex items-center justify-center w-8 h-8 bg-blue-900/50 rounded-full p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-900/50 rounded-full p-1">
                        <Search className="text-gray-400 hover:text-blue-400 transition-colors duration-200 w-5 h-5" />
                      </div>
                    )}
                  </div>
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

export default Header;
