"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Sparkles,
  DollarSign,
  UserPlus,
  InfoIcon,
  TrendingUp,
  Wallet2,
  Loader2,
  ChevronDown,
  BarChart3,
  LineChart,
} from "lucide-react";
import { FaXTwitter, FaUserCheck } from "react-icons/fa6";
import AddInfluencerModal from "@/components/Body/AddInfluencerModal";
import { toast } from "react-toastify";
import "../../css/input.css";
import InfluencerMetrics from "@/components/InfluencerProfile/InfluencerMetrics";
import InfluencerTable from "@/components/InfluencerProfile/InfluencerTable";
import { motion } from "framer-motion";

export default function Influencer() {
  const { data: session } = useSession();
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [creditExpiry, setCreditExpiry] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [tweetsCount, setTweetsCount] = useState(0);
  const [latestPayoutAmount, setLatestPayoutAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [activeSections, setActiveSections] = useState({
    metrics: true,
    signals: true,
  });

  const toggleSection = (section) => {
    setActiveSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if user exists in MongoDB when session is available
  useEffect(() => {
    // Only proceed if session and username exist
    if (!session?.user?.name) return;

    const checkUserInDB = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/check-influencer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: session.user?.username }),
        });
        const data = await response.json();
        console.log("check-influencer API response:", data);
        setUserExists(data.exists);
        if (data.exists) {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.username);
          }

          // Check if user has a wallet address already
          if (data.walletAddress) {
            setWalletAddress(data.walletAddress);
            setSubmitSuccess(true);
            setHasWallet(true);

            // Set additional data if available
            if (data.subscriberCount) setSubscriberCount(data.subscriberCount);
            if (data.creditAmount) setCreditAmount(data.creditAmount);
            if (data.creditExpiry) setCreditExpiry(data.creditExpiry);
            if (data.tweetsCount) setTweetsCount(data.tweetsCount);
            if (data.latestPayout) setLatestPayoutAmount(data.latestPayout);
          }
        }
      } catch (error) {
        console.error("Error checking user in DB:", error);
        setUserExists(false); // Default to false on error
      } finally {
        setLoading(false);
      }
    };

    // Call the function only once when username is available
    checkUserInDB();
  }, [session?.user?.name]); // Dependency is only the username

  // Top-level function to handle wallet address submission
  const handleWalletSubmit = async () => {
    if (!walletAddress) {
      toast.error("Please enter a wallet address.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const walletAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;

    // Validate wallet address format
    if (!walletAddressRegex.test(walletAddress)) {
      toast.error("Please enter a valid wallet address.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/save-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: session?.user?.username,
          walletAddress,
        }),
      });
      const data = await response.json();
      console.log("save-wallet API response:", data);

      if (data.success) {
        setSubmitSuccess(true);
        setHasWallet(true);
        setSubscriberCount(data.subscriberCount || 0);
        setCreditAmount(data.creditAmount || 0);
        setCreditExpiry(data.creditExpiry || null);
        setTweetsCount(data.tweetsCount || 0);
        setLatestPayoutAmount(data.latestPayout || 0);

        // Set the userId if it's returned and not already set
        if (data.userId) {
          console.log("Setting userId from save-wallet response:", data.userId);
          setUserId(data.userId);
        }
      } else {
        toast.error("Failed to save wallet address. Please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error saving wallet address:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemPayout = () => {
    toast.info("Redemption feature coming soon!", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          {session ? (
            <div className="w-full backdrop-blur-xl bg-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 border border-white/10">
              <div className="flex flex-col items-center relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0">
                  <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
                </div>

                {/* Profile Image Container */}
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={
                      session.user?.image?.replace(
                        /_normal(?=\.(jpg|jpeg|png|gif|webp))/i,
                        ""
                      ) || "/default-avatar.png"
                    }
                    alt={`${session.user?.name}'s profile`}
                    className="relative w-28 h-28 rounded-full border-4 border-gradient-to-r from-blue-500 to-cyan-500 shadow-lg mb-6 object-cover transform transition-all duration-500 hover:scale-110"
                  />
                </motion.div>

                {/* User Info */}
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                >
                  Welcome, {session.user?.name}!
                </motion.h1>

                {/* User Existence Status */}
                {loading === true ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 mt-4 text-white/80"
                  >
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mx-auto" />
                    <p className="text-gray-300">Checking your status...</p>
                  </motion.div>
                ) : userExists ? (
                  <motion.div
                    className="mt-6 w-full"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    {submitSuccess ? (
                      <div className="text-center mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-lg">
                        {tweetsCount === 0 ? (
                          <>
                            <div className="flex items-center justify-center mb-4">
                              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                                <Wallet2 className="h-5 w-5 text-green-400" />
                              </div>
                              <h2 className="text-xl font-semibold text-green-400">
                                Wallet Connected
                              </h2>
                            </div>
                            <p className="text-white/80 mt-2">
                              Payments will be sent to:{" "}
                              <span className="font-mono text-cyan-300 bg-gray-800 px-3 py-1 rounded-lg">
                                {walletAddress}
                              </span>
                            </p>
                            <div className="mt-4 py-3 px-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                              <p className="text-amber-400 flex items-start">
                                <InfoIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                  You haven&apos;t mentioned &quot;Maxxit&quot;
                                  or our platform-related keywords in your
                                  tweets yet. Please do so to earn a portion of
                                  the amount from your subscribers.
                                </span>
                              </p>
                            </div>

                            {/* Monthly Payout Section (Zero Payout) */}
                            <div className="mt-6 py-4 px-5 bg-gray-900/50 border border-gray-800/40 rounded-lg">
                              <div className="flex flex-col items-center">
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                  Monthly Payout
                                </h3>
                                <p className="text-3xl font-bold text-white mb-3">
                                  ${latestPayoutAmount.toFixed(2)}
                                </p>
                                <button
                                  onClick={handleRedeemPayout}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={latestPayoutAmount <= 0}
                                >
                                  Redeem Payout
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                  Start tweeting about Maxxit to earn payouts
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-center mb-4">
                              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                                <Wallet2 className="h-5 w-5 text-green-400" />
                              </div>
                              <h2 className="text-xl font-semibold text-green-400">
                                Wallet Connected
                              </h2>
                            </div>
                            <p className="text-white/80 mt-2">
                              Payments will be sent to:{" "}
                              <span className="font-mono text-cyan-300 bg-gray-800 px-3 py-1 rounded-lg">
                                {walletAddress}
                              </span>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                <p className="text-gray-400 text-xs uppercase">
                                  Subscribers
                                </p>
                                <p className="text-xl font-semibold text-white flex items-center">
                                  <FaUserCheck className="text-blue-400 mr-2" />
                                  {subscriberCount}
                                </p>
                              </div>
                              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                <p className="text-gray-400 text-xs uppercase">
                                  Credit Amount
                                </p>
                                <p className="text-xl font-semibold text-white flex items-center">
                                  <DollarSign className="text-green-400 mr-2" />
                                  ${creditAmount}
                                </p>
                              </div>
                              {creditExpiry && (
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                  <p className="text-gray-400 text-xs uppercase">
                                    Valid Until
                                  </p>
                                  <p className="text-xl font-semibold text-white">
                                    {new Date(
                                      creditExpiry
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Monthly Payout Section */}
                            <div className="mt-6 p-5 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-indigo-800/40 rounded-lg shadow-lg">
                              <div className="flex flex-col items-center">
                                <h3 className="text-lg font-medium text-indigo-300 mb-2">
                                  Monthly Payout Available
                                </h3>
                                <p className="text-4xl font-bold text-white mb-4 flex items-center">
                                  <DollarSign className="h-8 w-8 text-green-400 mr-1" />
                                  {latestPayoutAmount.toFixed(2)}
                                </p>
                                <button
                                  onClick={handleRedeemPayout}
                                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-600/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  disabled={latestPayoutAmount <= 0}
                                >
                                  <Wallet2 className="w-5 h-5" />
                                  Redeem Your Payout
                                </button>
                                <p className="text-xs text-indigo-200 mt-3">
                                  Payments are processed within 24 hours
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-6 rounded-xl border border-teal-400/30 shadow-lg mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <Wallet2 className="w-6 h-6 text-teal-300" />
                          Add Your Wallet Address
                        </h2>
                        <p className="text-white/80 mb-4">
                          Enter a wallet address to receive your earnings from
                          Maxxit. Ensure it&apos;s correct, as this is where
                          your payments will be sent!
                        </p>
                        <input
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="e.g., 0x1234...abcd"
                          color="green"
                          className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all border border-teal-400/30 profileCss"
                        />
                        <button
                          onClick={handleWalletSubmit}
                          disabled={isSubmitting}
                          className="mt-4 w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-teal-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Saving..." : "Save Wallet Address"}
                        </button>
                      </motion.div>
                    )}

                    {/* Integration of Influencer Metrics and Table when user exists */}
                    {userId && submitSuccess && (
                      <div className="mt-8 space-y-6">
                        {/* Metrics Section */}
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                            onClick={() => toggleSection("metrics")}
                          >
                            <div className="flex items-center">
                              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                              <h2 className="text-lg font-semibold text-white">
                                Influencer Metrics
                              </h2>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSections.metrics
                                  ? "transform rotate-180"
                                  : ""
                                }`}
                            />
                          </div>

                          {activeSections.metrics && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <InfluencerMetrics influencerId={userId} />
                            </motion.div>
                          )}
                        </div>

                        {/* Signals Section */}
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                            onClick={() => toggleSection("signals")}
                          >
                            <div className="flex items-center">
                              <LineChart className="w-5 h-5 text-green-400 mr-2" />
                              <h2 className="text-lg font-semibold text-white">
                                Trading Signals
                              </h2>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSections.signals
                                  ? "transform rotate-180"
                                  : ""
                                }`}
                            />
                          </div>

                          {activeSections.signals && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <InfluencerTable
                                influencerId={userId}
                                userName={userName}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="mt-4 text-center"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex items-start gap-1 p-5 bg-blue-500/20 border-2 border-blue-500/30 rounded-lg text-blue-200 text-base">
                      <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>
                        You are not yet registered with &quot;Maxxit&quot;. This
                        is a necessary step, as once you have registered on our
                        platform, you will be eligible to receive a portion of
                        payments from your subscribed users
                      </span>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 mt-6"
                    >
                      Register Now
                      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </motion.div>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut()}
                  className="mt-8 group relative px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-red-500/40 hover:scale-105"
                >
                  Sign Out
                  <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-2xl opacity-30"></div>
              <div className="relative backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Welcome
                </h2>
                <button
                  onClick={() => signIn("twitter")}
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaXTwitter size={30} />
                  Login with X
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Disclaimer Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    How to Earn with Maxxit
                  </h3>
                  <div className="space-y-4 text-white/80">
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                      <DollarSign className="w-5 h-5 text-cyan-300 mt-1" />
                      <p>
                        Earn amounts by mentioning{" "}
                        <span className="text-emerald-400 font-semibold">
                          &quot;Maxxit&quot;
                        </span>{" "}
                        or our platform link in your tweets
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                      <FaUserCheck className="w-5 h-5 text-cyan-300 mt-1" />
                      <p>
                        Connect your X account to verify you are a valid user
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                      <UserPlus className="w-5 h-5 text-cyan-300 mt-1" />
                      <p>
                        You will need to add yourself as an influencer through
                        our platform to be eligible for earnings
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                      <Wallet2 className="w-5 h-5 text-cyan-300 mt-1" />
                      <p>
                        Enter your wallet address to receive the credited amount
                        directly
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                      <TrendingUp className="w-5 h-5 text-cyan-300 mt-1" />
                      <p>
                        Mention{" "}
                        <span className="text-emerald-400 font-semibold">
                          &quot;Maxxit&quot;
                        </span>{" "}
                        more in your tweets to earn more
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <AddInfluencerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setUserExists(true); // Update status after successful registration
        }}
        // sessionUsername={session?.user?.name} // Pass authenticated username
        sessionUserhandle={session?.user?.username} // Pass authenticated username
      />
    </>
  );
}
