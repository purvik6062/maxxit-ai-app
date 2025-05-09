import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const ReferAndEarn = () => {
  const { data: session } = useSession();
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [usageStats, setUsageStats] = useState<{
    totalUses: number;
    lastUsed: Date | null;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPromoCode();
    }
  }, [session?.user?.id]);

  const fetchPromoCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/promo-code?twitterId=${session?.user?.id}`
      );
      const result = await response.json();
      if (result.success && result.data) {
        setPromoCode(result.data.promoCode);
        fetchUsageStats(result.data.promoCode);
      }
    } catch (error) {
      toast.error("Failed to load promo code data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async (code: string) => {
    try {
      const response = await fetch(`/api/promo-code-usage?promoCode=${code}`);
      const result = await response.json();
      if (result.success) {
        setUsageStats({
          totalUses: result.data.length,
          lastUsed:
            result.data.length > 0 ? new Date(result.data[0].appliedAt) : null,
        });
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    }
  };

  const handleGeneratePromoCode = async () => {
    if (!session?.user?.username) {
      toast.error(
        "Twitter username not found. Please reconnect your Twitter account."
      );
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-promo-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterId: session.user.id,
          twitterUsername: session.user.username,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPromoCode(result.data.promoCode);
        toast.success("Promo code generated successfully!");
        fetchUsageStats(result.data.promoCode);
      } else {
        toast.error(result.error?.message || "Failed to generate promo code");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopyStatus("copied");
      toast.success("Promo code copied to clipboard");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-6 bg-[#111528] rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">Refer & Earn</h3>
      <p className="text-gray-300 mb-6">
        Share your unique promo code with others and earn rewards when they use
        it.
      </p>

      {promoCode ? (
        <div className="bg-gray-900 p-4 rounded-md border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Your Promo Code</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {copyStatus === "copied" ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <div className="bg-black/30 inline-block px-3 py-1 rounded font-mono text-white text-lg tracking-wider">
            {promoCode}
          </div>
          {usageStats && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Usage Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Total Uses</p>
                  <p className="font-medium text-white">
                    {usageStats.totalUses}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last Used</p>
                  <p className="font-medium text-white">
                    {usageStats.lastUsed
                      ? usageStats.lastUsed.toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-400 mb-4">
            You haven\'t generated a promo code yet. Click the button below to
            create your unique code.
          </p>
          <button
            onClick={handleGeneratePromoCode}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>Generate Promo Code</>
            )}
          </button>
        </div>
      )}

      <div className="border-t border-gray-800 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">How it works</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start">
            <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
              1
            </span>
            <span>Generate your unique promo code</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
              2
            </span>
            <span>Share it with friends and followers</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
              3
            </span>
            <span>
              Earn a percentage of the purchase value each time your code is
              used
            </span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
              4
            </span>
            <span>Your referrals get a discount on their purchase</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReferAndEarn;
