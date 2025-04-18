"use client";
import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import { OctagonAlert } from "lucide-react";
import { IoShieldCheckmark } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { FaXTwitter } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { Search, X, CopyCheckIcon, LogOut } from "lucide-react";
import "@rainbow-me/rainbowkit/styles.css";
import "../../app/css/input.css";
import Link from "next/link";
import { useCredits } from "@/context/CreditsContext";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const [tweetLink, setTweetLink] = useState(
    "https://x.com/triggerxnetwork/status/1908126605110636929"
  );
  const { credits, updateCredits } = useCredits();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const [hasRegistered, setHasRegistered] = useState(false);

  const ERROR_MAPPING: { [key: string]: string } = {
    "Twitter username already registered":
      "This Twitter username is already connected to another account",
    "Telegram username already registered":
      "This Telegram username is already in use",
    "Telegram account already linked to another user":
      "This Telegram account is connected to another user",
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
    // Check if the user has already registered from localStorage
    const hasRegisteredPreviously = localStorage.getItem("hasRegistered");
    if (hasRegisteredPreviously === "true") {
      setShowTokens(true);
      setHasRegistered(true);
    }

    const fetchUserData = async () => {
      if (!session || !session.user?.id) return;

      try {
        const response = await fetch(
          `/api/get-user?twitterId=${session.user.id}`
        );

        if (response.status === 404) {
          // User not found, they need to register
          setShowTokens(false);
          setHasRegistered(false);
          localStorage.removeItem("hasRegistered");
          return;
        }

        const data = await response.json();
        console.log("data::", data);
        if (data.success) {
          setShowTokens(true);
          setHasRegistered(true);
          localStorage.setItem("hasRegistered", "true");
        } else {
          setShowTokens(false);
          setHasRegistered(false);
          localStorage.removeItem("hasRegistered");
        }
        setIsTelegramModalOpen(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setShowTokens(false);
        setHasRegistered(false);
        localStorage.removeItem("hasRegistered");
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    // Check if we've already shown this toast by using localStorage
    const hasShownWelcomeToast = localStorage.getItem("hasShownWelcomeToast");

    if (credits === 500 && !hasShownWelcomeToast) {
      toast.info(
        "🎉 Welcome! Explore our prediction markets with your 500 free credits",
        {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
        }
      );

      // Mark that we've shown the toast so it doesn't appear again
      localStorage.setItem("hasShownWelcomeToast", "true");
    }
  }, [credits]);

  const handleTelemodal = () => {
    if (!session) {
      toast.error("Please login with Twitter/X first", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } else {
      setIsTelegramModalOpen(true);
      setTelegramStep(1);
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
          twitterUsername: session?.user?.username,
          twitterId: session?.user?.id,
          telegramId: telegramUsername,
          credits: 500,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Registration failed");
      }

      setHasRegistered(true);
      setShowTokens(true); // Set showTokens to true after successful submission
      localStorage.setItem("hasRegistered", "true"); // Persist the registration status

      toast.success("Success! 500 Credits added to your account", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        onClose: () => {
          setIsTelegramModalOpen(false);
          setTelegramStep(1);
          setTelegramUsername("");
          updateCredits();
        },
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
        <nav className="flex-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-6">
                <a href="/" className="fn_logo flex-shrink-0">
                  <span className="full_logo">
                    <img
                      src="/img/maxxit.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img src="/img/maxxit.svg" className="retina_logo" alt="" />
                  </span>
                  <span className="short_logo">
                    <img
                      src="/img/maxxit_icon.svg"
                      className="desktop_logo"
                      alt=""
                    />
                    <img
                      src="/img/maxxit_icon.svg"
                      className="retina_logo w-[45px] h-[40px]"
                      alt=""
                    />
                  </span>
                </a>
                <div className="flex flex-shrink-0 overflow-hidden mt-[3px]">
                  <Link href="/influencer">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === "profile"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Influencer
                    </button>
                  </Link>

                  <Link href="/profile">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === "profile"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Profile
                    </button>
                  </Link>
                  <Link href="/pricing">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === "pricing"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                      //   onClick={() => setView("pricing")} // Optional: Update view state
                    >
                      Pricing
                    </button>
                  </Link>
                  <Link href="/playground">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                        view === "playground"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                      //   onClick={() => setView("playground")} // Optional: Update view state
                    >
                      Playground
                    </button>
                  </Link>

                  <div className="ml-4 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50 flex-shrink-0">
                    {showTokens ? (
                      <span className="text-blue-400 font-bold mr-1 text-md whitespace-nowrap">
                        {credits}{" "}
                        <span className="text-white font-normal">Credits</span>
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

        <div className="flex items-center flex-shrink-0 gap-3 pr-2">
          {!session ? (
            <button
              onClick={() => signIn("twitter")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <FaXTwitter className="mr-2" size={16} />
              Login with X
            </button>
          ) : (
            <div className="group relative flex items-center bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700">
              <img
                src={session.user?.image || "/default-avatar.png"}
                alt="Profile"
                className="w-7 h-7 rounded-full mr-2 border border-blue-400"
              />
              <span className="text-gray-200 text-sm font-medium">
                @{session.user?.username || session.user?.name}
              </span>

              {/* Sign out button tooltip */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
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
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-3">
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
                    Welcome to Maxxit - The Signal Generator Platform
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
                  <p className="text-gray-300 mb-6">
                    To claim your{" "}
                    <span className="text-blue-400 font-semibold">
                      500 FREE Credits
                    </span>
                    , please Complete these below mentioned steps
                  </p>
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
                  </ol>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleLater}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Cancel</span>{" "}
                    <MdCancel color="rgb(250, 109, 109)" size={15} />
                  </button>
                  <button
                    onClick={() => setTelegramStep(2)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 flex items-center justify-center gap-1"
                  >
                    <span>I've Done This</span>{" "}
                    <GiConfirmed color="rgb(135, 255, 135)" size={15} />
                  </button>
                </div>

                <div className="mt-2 border-t border-gray-800">
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
            ) : telegramStep === 2 ? (
              // Step 2: Telegram Username Input (now the final step)
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
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
                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <OctagonAlert size={15} color="red" />{" "}
                    <span>Must match exactly with your Telegram username</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramStep(1)}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !telegramUsername}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span>Complete & Get Credits</span>
                        <IoShieldCheckmark
                          size={15}
                          color="rgb(135, 255, 135)"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Comment out Step 3: Retweet Verification as it's not needed for now
              /*
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    One Last Step!
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 3 of 3</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                    <FaXTwitter className="mr-2" size={14} />
                    Retweet Verification
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Please retweet our latest announcement to receive your 500 FREE credits!
                  </p>

                  <a
                    href={tweetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#1DA1F2]/20 border border-[#1DA1F2]/50 rounded-lg text-white hover:bg-[#1DA1F2]/30 transition-all mb-4"
                  >
                    <FaXTwitter size={18} />
                    <span>Open Tweet & Retweet</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramStep(2)}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Back</span>
                  </button>
                  {retweetVerified ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed relative"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span>Complete & Get Credits</span>
                          <IoShieldCheckmark size={15} color="rgb(135, 255, 135)" />
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={verifyRetweet}
                      disabled={isCheckingRetweet}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isCheckingRetweet ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Verifying Retweet...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span>Verify Retweet</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-200"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
              */
              // Redirect to submit directly from step 2
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
                </div>
                {/* Placeholder for consistency, though it won't be rendered */}
                <p className="text-sm text-gray-300">
                  You've completed all steps. Click "Complete & Get Credits" to
                  finish.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
