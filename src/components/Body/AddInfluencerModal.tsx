import React, { useState, useEffect } from "react";
import { X, User, MessageSquare, Loader2 } from "lucide-react";
import { FaTelegram, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useCredits } from "@/context/CreditsContext";
import "../../app/css/add_influencer.css";

interface AddInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddInfluencerModal: React.FC<AddInfluencerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // New state for validation
  const [handleError, setHandleError] = useState<string | null>(null); // New state for validation error
  const { address } = useAccount();

  const { updateCredits } = useCredits();

   useEffect(() => {
      if (isOpen) {
        // Prevent scrolling when modal is open
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
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
    }, [isOpen]);

    const validateTwitterHandle = async (twitterHandle: string) => {
      setIsValidating(true);
      setHandleError(null);
      try {
        const response = await fetch("/api/validate-twitter-handle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handle: twitterHandle, walletAddress: address }),
          cache: "no-store",
        });
    
        const data = await response.json();
    
        if (!data.success) {
          // Display specific error message from the API
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

    if (!name.trim() || !handle.trim()) {
      toast.error("Please fill in all fields", {
        position: "top-center",
      });
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet first", {
        position: "top-center",
      });
      return;
    }

    // Format handle to ensure it starts with @
    const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;

    // Validate Twitter handle
    const isHandleValid = await validateTwitterHandle(formattedHandle);
    if (!isHandleValid) {
      return; // Stop submission if handle is invalid
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/add-influencer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          handle: formattedHandle,
          impactFactor: null,
          heartbeat: null,
          createdAt: new Date().toISOString(),
          walletAddress: address,
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
      setName("");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-blue-900/80 to-gray-900/90 border border-blue-500/30 shadow-xl animate-fadeIn">
        <div className="absolute -top-3 -right-3">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/50 border border-red-500/30 transition-all duration-300"
          >
            <X className="w-4 h-4 text-red-300" />
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 backdrop-blur-sm mb-4">
            <FaTelegram className="text-blue-400 text-xl" />
            <span className="text-base font-medium text-blue-300">
              New Influencer
            </span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            Add Telegram Influencer
          </h2>
          <p className="text-slate-400 mt-2">
            Add a new influencer to track their trading tweets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">
              Influencer Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full plClass pr-4 py-3 rounded-lg bg-blue-900/20 border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-white placeholder-slate-500 outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">
              Twitter Username
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className={`w-full plClass pr-4 py-3 rounded-lg bg-blue-900/20 border ${
                  handleError ? "border-red-500/30" : "border-blue-500/30"
                } focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-white placeholder-slate-500 outline-none transition-all duration-300`}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              )}
            </div>
            {handleError && (
              <p className="text-red-400 text-sm">{handleError}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isValidating}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
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
      </div>
    </div>
  );
};

export default AddInfluencerModal;
