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
} from "lucide-react";
import { FaXTwitter, FaUserCheck } from "react-icons/fa6";
import AddInfluencerModal from "@/components/Body/AddInfluencerModal";
import { toast } from "react-toastify";
import "../css/input.css";

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
  const [creditAmount, setCreditAmount] = useState(0);

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
        setUserExists(data.exists);
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
      if (data.success) {
        setSubmitSuccess(true);
        setSubscriberCount(data.subscriberCount || 0);
        setCreditAmount(data.creditAmount || 0);
        setCreditExpiry(data.creditExpiry || null);
        setTweetsCount(data.tweetsCount || 0);
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

  return (
    <>
      <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        {session ? (
          <div className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-8 border border-white/20">
            <div className="flex flex-col items-center relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0">
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>

              {/* Profile Image Container */}
              <div className="relative">
                <img
                  src={session.user?.image || "/default-avatar.png"}
                  alt={`${session.user?.name}'s profile`}
                  className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg mb-6 object-cover transform transition-all duration-500 hover:scale-110"
                />
              </div>

              {/* User Info */}
              <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Welcome, {session.user?.name}!
              </h1>

              {/* User Existence Status */}
              {loading === true ? (
                <div className="flex items-center gap-1 mt-4 text-white/80">
                  <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mx-auto" />
                  <p className="text-gray-300">Checking your status...</p>
                </div>
              ) : userExists ? (
                <div className="mt-6 w-full">
                  {submitSuccess ? (
                    <div className="text-center">
                      {tweetsCount === 0 ? (
                        <>
                          <p className="text-green-400 text-lg font-semibold">
                            Wallet address saved successfully!
                          </p>
                          <p className="text-white/80 mt-2">
                            Payments will be sent to:{" "}
                            <span className="font-mono text-cyan-300">
                              {walletAddress}
                            </span>
                          </p>
                          <p className="text-yellow-400 mt-2">
                            Note: You haven’t mentioned "Maxxit" or our
                            platform-related keywords in your tweets yet. Please
                            do so to earn a portion of the amount from your
                            subscribers at regular intervals.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-green-400 text-lg font-semibold">
                            Wallet address saved successfully!
                          </p>
                          <p className="text-white/80 mt-2">
                            Payments will be sent to:{" "}
                            <span className="font-mono text-cyan-300">
                              {walletAddress}
                            </span>
                          </p>
                          <p className="text-white/80 mt-2">
                            You have {subscriberCount} subscriber(s). Your
                            credit amount: ${creditAmount}
                          </p>
                          {creditExpiry && (
                            <p className="text-white/80 mt-2">
                              Credit amount valid until:{" "}
                              {new Date(creditExpiry).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-6 rounded-xl border border-teal-400/50 shadow-lg">
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Wallet2 className="w-6 h-6 text-teal-300" />
                        Add Your Wallet Address
                      </h2>
                      <p className="text-white/80 mb-4">
                        Enter a wallet address to receive your earnings from
                        Maxxit. Ensure it’s correct, as this is where your
                        payments will be sent!
                      </p>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="e.g., 0x1234...abcd"
                        color="green"
                        className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all border-2 border-white profileCss"
                      />
                      <button
                        onClick={handleWalletSubmit}
                        disabled={isSubmitting}
                        className="mt-4 w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-teal-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Saving..." : "Save Wallet Address"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <div className="flex items-start gap-1 p-3 bg-blue-500/30 border-2 border-blue-500/80 rounded-lg text-blue-200 text-base">
                    <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      You are not yet registered with "Maxxit". This is a
                      necessary step, as once you have registered on our
                      platform, you will be eligible to receive a portion of
                      payments from your subscribed users
                    </span>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 mt-4"
                  >
                    Register Now
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              )}

              {/* Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="mt-8 group relative px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-red-500/50 hover:scale-105"
              >
                Sign Out
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center relative">
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
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-cyan-300 mt-1" />
                    <p>
                      Earn amounts by mentioning{" "}
                      <span className="text-emerald-400 font-semibold">
                        "Maxxit"
                      </span>{" "}
                      or our platform link in your tweets
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaUserCheck className="w-5 h-5 text-cyan-300 mt-1" />
                    <p>Connect your X account to verify you are a valid user</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <UserPlus className="w-5 h-5 text-cyan-300 mt-1" />
                    <p>
                      You will need to add yourself as an influencer through our
                      platform to be eligible for earnings
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wallet2 className="w-5 h-5 text-cyan-300 mt-1" />
                    <p>
                      Enter your wallet address to receive the credited amount
                      directly
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-300 mt-1" />
                    <p>
                      Mention{" "}
                      <span className="text-emerald-400 font-semibold">
                        "Maxxit"
                      </span>{" "}
                      more in your tweets to earn more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
