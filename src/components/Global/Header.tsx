"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../../app/css/input.css";
import { useAccount } from "wagmi";
import { X } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";

const Header = () => {
  const [view, setView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [showTokens, setShowTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramStep, setTelegramStep] = useState(1);
  const { address, isConnected } = useAccount();
  const { credits } = useCredits();
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

  // useEffect(() => {
  //   if (isModalOpen || isTelegramModalOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "unset";
  //   }
  // }, [isModalOpen, isTelegramModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

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

  const handleTelemodal = () => {
    if (address) {
      setIsTelegramModalOpen(true);
      setTelegramStep(1);
    } else {
      toast.error("Please connect to your wallet first");
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
      localStorage.setItem("hasSeenTelegramPrompt", "true");
      setIsTelegramModalOpen(false);
      toast.success("Success! 100 Credits added to your account", {
        position: "top-center",
        autoClose: 5000,
      });
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
        <nav className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center min-w-0 space-x-2">
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
                <h1 className="text-xl font-bold flex-shrink-0">AI</h1>
                <div className="flex flex-shrink-0 overflow-hidden">
                  {["Predictions", "AI Insights"].map((item) => (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            // Removed onClick handler to prevent closing when clicking outside
          />
          <div className="z-50 w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl p-6 mx-4 transform -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2 fixed">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
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

      {/* Telegram Modals */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl border border-blue-500/30">
            {telegramStep === 1 ? (
              // Step 1: Instructions
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Connect Your Telegram
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-gray-300 mb-4">
                    Complete these steps to verify your Telegram account
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <ol className="space-y-4 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full mr-3 text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <div>
                        <p className="font-medium">Start the Bot</p>
                        <p className="text-gray-400 mt-1">
                          Open Telegram and search for{" "}
                          <a
                            href="https://t.me/Tst01ccxt_testing_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            @Tst01ccxt_testing_bot
                          </a>
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full mr-3 text-xs font-bold flex-shrink-0">
                        2
                      </span>
                      <div>
                        <p className="font-medium">Send Start Command</p>
                        <p className="text-gray-400 mt-1">
                          Type{" "}
                          <code className="px-2 py-1 bg-gray-700 rounded mx-1">
                            /start
                          </code>
                          in the chat
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleLater}
                    className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setTelegramStep(2)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800"
                  >
                    I've Done This
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Username Input
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                </div>

                <div className="relative">
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="pl-4 text-gray-400">@</span>
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => {
                        // Auto-remove @ and trim spaces
                        const value = e.target.value.replace("@", "").trim();
                        setTelegramUsername(value.toLowerCase());
                      }}
                      placeholder="your_username"
                      className="w-full px-2 py-3 rounded-lg bg-gray-800 text-white focus:outline-none"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Must match your exact Telegram username
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramStep(1)}
                    className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !telegramUsername}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed relative"
                  >
                    {isSubmitting && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                      </div>
                    )}
                    <span className={isSubmitting ? "invisible" : ""}>
                      Verify & Continue
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
