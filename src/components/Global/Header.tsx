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

const Header = () => {
  const [view, setView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [chatId, setChatId] = useState(0);
  const [showTokens, setShowTokens] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  // const [userCredits, setUserCredits] = useState<number | null>(null);
  const { address, isConnected } = useAccount();
  const { credits } = useCredits();

  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef<HTMLInputElement>());

  useEffect(() => {
    console.log("Modal state changed:", { isModalOpen, isTelegramModalOpen });
    if (isModalOpen || isTelegramModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen, isTelegramModalOpen]);

  // Add new useEffect to fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;
      setShowTokens(true);

      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);

        // Check if response is 404 (user not found)
        if (response.status === 404) {
          // This is a new user, show telegram modal
          setTimeout(() => {
            setIsTelegramModalOpen(true);
          }, 0);
          return;
        }

        const data = await response.json();

        if (data.success) {
          // setUserCredits(data.data.credits);
          setShowTokens(true);

          // Check if user has a telegramId already
          if (data.data.telegramId) {
            // Store telegramId in localStorage for future reference
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

  const generateRandomOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    return randomOtp;
  };

  const handleProceed = async () => {
    if (!telegramUsername) {
      toast.error("Please enter your Telegram username", {
        position: "top-center",
      });
      return;
    }

    // Remove @ if user included it
    const cleanUsername = telegramUsername.replace("@", "");

    setIsVerifying(true);
    const newOtp = generateRandomOtp();

    try {
      const response = await fetch("/api/send-telegram-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          otp: newOtp,
        }),
      });

      const data = await response.json();
      if (data) {
        setChatId(data.telegramId)
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setIsVerifying(false);
      setShowOtpInput(true);
      toast.success(`OTP sent to @${cleanUsername}`, {
        position: "top-center",
      });
    } catch (error) {
      setIsVerifying(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  };

  const handleTelemodal = () => {
    if (address) {
      setIsTelegramModalOpen(true);
    } else {
      toast.error("please connect to your wallet first");
    }
  };

  const handleLater = () => {
    setIsTelegramModalOpen(false);
    // Reset all form data
    setTelegramUsername("");
    setOtp(["", "", "", "", "", ""]);
    setShowOtpInput(false);
    setGeneratedOtp("");
    setIsVerifying(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if a digit was entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP", {
        position: "top-center",
      });
      return;
    }

    setIsVerifying(true);

    if (enteredOtp === generatedOtp) {
      try {
        const response = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
            telegramId: telegramUsername,
            chatId: chatId,
            credits: 100,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create user");
        }

        localStorage.setItem("hasSeenTelegramPrompt", "true");
        localStorage.setItem("telegramUsername", telegramUsername);
        setIsTelegramModalOpen(false);
        setShowTokens(true);
        setTelegramUsername("");
        setOtp(["", "", "", "", "", ""]);
        setShowOtpInput(false);
        setGeneratedOtp("");
        setIsVerifying(false);
        toast.success(
          "Successfully registered! 100 Credits credited to your account!",
          {
            position: "top-center",
            autoClose: 5000,
          }
        );
      } catch (error) {
        toast.error("Failed to create user account. Please try again.", {
          position: "top-center",
        });
      }
    } else {
      toast.error("Invalid OTP. Please try again.", {
        position: "top-center",
      });
    }

    setIsVerifying(false);
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
                    <img src="img/new_name_logo.svg" className="desktop_logo" alt="" />
                    <img src="img/new_name_logo.svg" className="retina_logo" alt="" />
                  </span>
                  <span className="short_logo">
                    <img src="img/new_logo.svg" className="desktop_logo" alt="" />
                    <img src="img/new_logo.svg" className="retina_logo w-[45px] h-[40px]" alt="" />
                  </span>
                </a>
                <h1 className="text-xl font-bold flex-shrink-0">AI</h1>
                <div className="flex flex-shrink-0 overflow-hidden">
                  {["Predictions", "AI Insights"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setIsModalOpen(true)}
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === item.toLowerCase() ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}

                  {showTokens && (
                    <div className="ml-4 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50 flex-shrink-0">
                      {credits !== null ? (
                        <span className="text-blue-400 font-bold mr-1 text-md whitespace-nowrap">
                          {credits} <span className="text-white font-normal">Credits</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl">
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

      {/* Telegram URL Modal */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl border border-blue-500/30">
            <div className="mx-auto flex max-w-sm flex-col">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M18 8l-1-4-1 1-2 1-3-1h-2L7 6 6 5 5 8l-1 3v2l1 3 3 3 2 1h2l3-1 2-2 1-2 1-5z"></path>
                    <path d="M11 8h.01"></path>
                    <path d="M13 12h.01"></path>
                    <path d="M9 12h.01"></path>
                    <path d="M7 16h.01"></path>
                    <path d="M13 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Welcome to the CTxbt - Signal Generator Platform
                </h3>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
                <p className="text-gray-300 mb-6">
                  To claim your{" "}
                  <span className="text-blue-400 font-semibold">
                    100 FREE Credits
                  </span>
                  , please enter your Telegram username below.
                </p>
              </div>

              {!showOtpInput ? (
                <div className="space-y-5">
                  <div className="relative">
                    <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                      <span className="pl-4 text-gray-400">@</span>
                      <input
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="username"
                        className="w-full px-2 py-3 rounded-lg bg-gray-800 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M12 8v4"></path>
                        <path d="M12 16h.01"></path>
                      </svg>
                      Important Steps
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                          1
                        </span>
                        <span>
                          Start a chat with{" "}
                          <a
                            href="https://t.me/Tst01ccxt_testing_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline inline-flex items-center"
                          >
                            @Tst01ccxt_testing_bot
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                          2
                        </span>
                        <span>
                          Send the message{" "}
                          <code className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200">
                            "start"
                          </code>{" "}
                          to the bot
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                          3
                        </span>
                        <span>
                          Enter your Telegram username above (same as in your
                          Telegram profile)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                          4
                        </span>
                        <span>
                          Click "Send OTP" to receive verification code
                        </span>
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleLater}
                      className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProceed}
                      disabled={isVerifying}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-70 disabled:cursor-not-allowedd"
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Sending OTP...
                        </span>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="h-px bg-gray-800 flex-1"></div>
                      <p className="px-3 text-sm text-gray-400">
                        Enter Verification Code
                      </p>
                      <div className="h-px bg-gray-800 flex-1"></div>
                    </div>

                    <p className="text-sm text-gray-400 text-center mb-4">
                      We have sent a 6-digit OTP to your Telegram account
                    </p>

                    {/* OTP input */}
                    <div className="flex justify-center gap-2 max-w-xs mx-auto">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={inputRefs[index]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-10 h-12 text-center text-lg font-bold rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 otpInput"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowOtpInput(false)}
                      className="flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyOtp}
                      disabled={isVerifying}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Verifying...
                        </span>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      Didn't receive the OTP?{" "}
                      <button
                        onClick={handleProceed}
                        className="text-blue-400 hover:underline"
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <span className="inline-flex h-5 w-5 text-red-500 animate-pulse drop-shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </span>
                  <p className="text-sm font-bold text-red-500 drop-shadow-md ml-2 uppercase tracking-wide animate-pulse">
                    Important
                  </p>
                </div>
                <p className="text-sm text-center text-gray-300 before:content-['➜'] before:text-red-500 before:mr-2">
                  <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent font-semibold drop-shadow-md">
                    You must complete this step
                  </span>
                  &nbsp;to access our platform&apos;s features, including
                  subscribing to an influencer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
