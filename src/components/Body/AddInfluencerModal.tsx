"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, User, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { FaTelegram, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useCredits } from "@/context/CreditsContext";
import { useUserData } from "@/context/UserDataContext";
import "../../app/css/add_influencer.css";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

interface AddInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionUserhandle?: string | undefined | null;
}

const AddInfluencerModal: React.FC<AddInfluencerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sessionUserhandle,
}) => {
  const [handle, setHandle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const { credits, updateCredits, isLoadingCredits } = useCredits();
  // Get the refresh function from context
  const { refreshData } = useUserData();
  const isSessionUserhandlePresent =
    sessionUserhandle !== undefined && sessionUserhandle !== null;
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  useEffect(() => {
    if (isSessionUserhandlePresent) {
      const cleanHandle = sessionUserhandle.replace(/^@/, "");
      setHandle(`@${cleanHandle}`);
    }
  }, [sessionUserhandle]);

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";

      // Check if user is registered when modal opens
      if (session && !isLoadingCredits) {
        setShowRegistrationPrompt(credits === null);
      }
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = "unset";
      document.body.style.width = "auto";
    }

    // Cleanup function to ensure we reset the styles when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.width = "auto";
    };
  }, [isOpen, credits, session, isLoadingCredits]);

  // Update registration prompt when credits status changes
  useEffect(() => {
    if (session && !isLoadingCredits && isOpen) {
      setShowRegistrationPrompt(credits === null);
    }
  }, [credits, session, isLoadingCredits, isOpen]);

  const validateTwitterHandle = async (twitterHandle: string) => {
    setIsValidating(true);
    setHandleError(null);
    try {
      const response = await fetch("/api/validate-twitter-handle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle: twitterHandle,
          twitterId: session?.user?.id,
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Failed to validate Twitter handle", {
          position: "top-center",
        });
        return false;
      }

      if (!data.exists) {
        toast.error("Twitter handle does not exist or is invalid", {
          position: "top-center",
        });
        return false;
      }

      return true;
    } catch (error) {
      toast.error("An unexpected error occurred while validating the handle", {
        position: "top-center",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handle.trim()) {
      toast.error("Please fill in all fields", {
        position: "top-center",
      });
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please login first", {
        position: "top-center",
      });
      return;
    }

    // Check if user is registered (has credits)
    if (credits === null) {
      setShowRegistrationPrompt(true);
      return;
    }

    // Format handle to ensure it starts with @
    const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;

    if (!isSessionUserhandlePresent) {
      const isHandleValid = await validateTwitterHandle(formattedHandle);
      if (!isHandleValid) {
        return; // Stop submission if handle is invalid
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/add-influencer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle: formattedHandle,
          impactFactor: null,
          heartbeat: null,
          subscriptionPrice: 100,
          createdAt: new Date().toISOString(),
          twitterId: session.user.id,
          sessionUserhandle: isSessionUserhandlePresent
            ? sessionUserhandle
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to validate Twitter handle", {
          position: "top-center",
        });
      }

      toast.success("Influencer added successfully!", {
        position: "top-center",
      });

      await updateCredits();
      await refreshData();
      setHandle("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add influencer",
        {
          position: "top-center",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerRegistration = () => {
    // Dispatch custom event to show onboarding modal in Header component
    const event = new Event("showOnboarding");
    window.dispatchEvent(event);
    onClose();
  };

  const closeWithAnimation = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-leagueSpartan">
      <div
        className={`absolute inset-0 bg-[#0E1725] backdrop-blur-sm transition-opacity duration-300 ${
          isModalClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={closeWithAnimation}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isModalClosing ? 0 : 1,
          scale: isModalClosing ? 0.8 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-gray-800/80 to-gray-900/90 border border-gray-500/30 shadow-xl animate-fadeIn"
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={closeWithAnimation}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 hover:bg-white transition-all duration-300"
          >
            <X className="w-3 h-3 text-black font-bold" />
          </button>
        </div>

        {showRegistrationPrompt ? (
          // Registration required UI
          <>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 backdrop-blur-sm mb-4">
                <div className="bg-[#162037] rounded border border-blue-400/40">
                  <FaTelegram className="text-blue-400 m-1" size={12} />
                </div>
                <div className="flex items-center text-blue-300">
                  Registration Required
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-leagueSpartan">
                Complete Registration First
              </h2>
              <p className="text-gray-300 mt-2">
                To add influencers, you need to complete the registration
                process
              </p>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-4 mb-6 border border-blue-500/30">
              <div className="flex items-start">
                <AlertCircle className="text-blue-400 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">
                    Connect your Telegram account to get 500 free credits and
                    unlock all features.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={triggerRegistration}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaTelegram className="w-4 h-4" />
                <span>Complete Registration</span>
              </button>

              <button
                onClick={closeWithAnimation}
                className="w-full px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm"
              >
                I'll Do This Later
              </button>
            </div>
          </>
        ) : (
          // Standard influencer add UI
          <>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-500/20 backdrop-blur-sm mb-4">
                <div
                  className="bg-[#162037] rounded"
                  style={{ border: "1px solid #CCD3DF99" }}
                >
                  <FaXTwitter className=" text-white m-1" size={12} />
                </div>
                <div className="flex items-center text-gray-300">
                  New Influencer
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-leagueSpartan">
                Add Twitter Influencer
              </h2>
              <p className="text-gray-300 mt-2">
                Add a new influencer to track their trading tweets
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">
                  Twitter Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@username"
                    disabled={isSessionUserhandlePresent}
                    className={`w-full plClass py-3 rounded-lg bg-gray-700/20 border borderCss focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-white placeholder-slate-500 outline-none transition-all duration-300 ${
                      isSessionUserhandlePresent
                        ? "cursor-not-allowed opacity-80"
                        : ""
                    }`}
                  />
                  {isValidating && !isSessionUserhandlePresent && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                    </div>
                  )}
                  <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                </div>
                {handleError && !isSessionUserhandlePresent && (
                  <p className="text-red-400 text-sm">{handleError}</p>
                )}
              </div>

              <div className="w-full pt-2 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || isValidating}
                  className="py-3 px-4 rounded-full bg-gradient-to-b from-[#E1EAF9] to-[#99BEF7] hover:scale-101 text-[#393B49] font-medium transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding Influencer...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Add Influencer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AddInfluencerModal;
