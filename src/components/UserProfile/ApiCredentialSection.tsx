"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Copy, Key, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { UserProfile } from "./types";
import { useCredits } from "@/context/CreditsContext";

const ApiCredentialsSection = ({
  apiKey,
  endpoint,
  twitterId,
  onGenerateNewKey,
  onApiKeyUpdate,
  profile,
}: {
  apiKey: string | null;
  endpoint: string;
  twitterId: string;
  onGenerateNewKey: (newKey: string) => void;
  onApiKeyUpdate: (newKey: string) => void;
  profile: UserProfile;
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"JavaScript" | "cURL" | "Python">(
    "JavaScript"
  );
  const [loading, setLoading] = useState(false);
  const { updateCredits } = useCredits();

  const exampleResponse = {
    success: true,
    count: 1,
    data: [
      {
        coin: "bitcoin",
        signal_message:
          "⏳ **Hold Steady** ⏳\n\n🏛️ **Token**: BTC (bitcoin)\n📈 **Signal**: Hold\n🎯 **Targets**:\nTP1: $89000\nTP2: $120000\n🛑 **Stop Loss**: $70000\n⏳ **Timeline:** Short-term\n\n💡 **Trade Tip**:\nMonitor 90k resistance level for breakout confirmation. Maintain stop-loss below 70k if bearish reversal pattern emerges. Consider partial profit-taking at 89k if resistance holds. Upside potential remains conditional on sustained momentum above 90k.",
        signal_data: {
          token: "BTC (bitcoin)",
          signal: "Hold",
          targets: [89000, 120000],
          stopLoss: 70000,
          timeline: "Short-term",
          tradeTip:
            "Monitor 90k resistance level for breakout confirmation. Maintain stop-loss below 70k if bearish reversal pattern emerges. Consider partial profit-taking at 89k if resistance holds. Upside potential remains conditional on sustained momentum above 90k.",
          currentPrice: 82780.03048688271,
          tweet_id: "1901724355354...",
          tweet_link: "https://x.com/userName/status/1901724355354...",
          tweet_timestamp: "2025-03-17T19:56:33.000Z",
          priceAtTweet: 84075.36559694471,
          exitValue: null,
          twitterHandle: "userName",
          tokenMentioned: "BTC",
          tokenId: "bitcoin",
        },
      },
    ],
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const toggleKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const handleGenerateKey = async () => {
    if (!profile || profile.credits < 50) {
      toast.error(
        "Insufficient credits. You need at least 50 credits to generate an API key."
      );
      return;
    }
    try {
      setLoading(true); // Start loading
      const response = await fetch("/api/generate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ twitterId }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to generate API key");

      // Call the callback to update the parent (UserProfile) state
      onGenerateNewKey(data.data.apiKey);

      // Refetch the API key to ensure we have the latest value
      const apiKeyResponse = await fetch(
        `/api/get-api-key?twitterId=${twitterId}`
      );
      const apiKeyResult = await apiKeyResponse.json();

      if (apiKeyResponse.ok && apiKeyResult.success) {
        // Update the apiKey in the parent component via a new callback or state
        onApiKeyUpdate(apiKeyResult.apiKey); // We'll add this prop to ApiCredentialsSection
      }
      await updateCredits();
      toast.success("API key generated successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate API key"
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const snippets = {
    JavaScript: `fetch(\`\${endpoint}/api/get-my-signals\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
      }'
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
    cURL: `curl -X GET \`\${endpoint}/api/get-my-signals\` \\
  -H "Authorization: Bearer ${showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
      }"`,
    Python: `import requests

url = f"{endpoint}/api/get-my-signals"
headers = {"Authorization": "Bearer ${showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
      }"}
response = requests.get(url, headers=headers)
print(response.json())`,
  };

  return (
    <div className="bg-[#0E1725B3] rounded-2xl p-4 md:p-6" style={{ border: "1px solid #818791" }}>
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-medium text-[#E4EFFF]">API Access</h2>
          <p className="text-[#8ba1bc]">Manage your active subscriptions</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-[#AAC9FA] font-medium mr-2">Trading Signals API</span>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>

          {!apiKey && (
            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className={`bg-gradient-to-b from-[#E1EAF9] to-[#99BEF7] text-[#131d2c] px-4 py-2 rounded-full transition-colors flex items-center gap-2 font-medium ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate API Key (50 credits)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-[#1C2333] p-3 md:p-4 rounded-lg" style={{ border: "1px solid #81879166" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="w-full sm:w-auto overflow-hidden">
              <p className="text-sm text-[#8ba1bc] mb-1">API Endpoint</p>
              <p className="font-mono text-white text-sm md:text-base break-all">{endpoint + "/api/get-my-signals"}</p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  endpoint + "/api/get-my-signals",
                  "Endpoint copied!"
                )
              }
              className="flex items-center gap-1 text-[#AAC9FA] hover:text-blue-200 mt-2 sm:mt-0 whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy</span>
            </button>
          </div>
        </div>

        <div className="bg-[#1C2333] p-3 md:p-4 rounded-lg" style={{ border: "1px solid #81879166" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="w-full sm:w-auto overflow-hidden">
              <p className="text-sm text-[#8ba1bc] mb-1">API Key</p>
              {apiKey ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white text-sm md:text-base break-all">
                    {showApiKey ? apiKey : apiKey.replace(/.(?=.{4})/g, "•")}
                  </span>
                  <button
                    onClick={toggleKeyVisibility}
                    className="text-[#8ba1bc] hover:text-white transition-colors"
                  >
                    {!showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-[#8ba1bc]">No API key generated yet</p>
              )}
            </div>
            {apiKey && (
              <button
                onClick={() => copyToClipboard(apiKey, "API key copied!")}
                className="flex items-center gap-1 text-[#AAC9FA] hover:text-blue-200 mt-2 sm:mt-0 whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Usage Example
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(["JavaScript", "cURL", "Python"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-5 py-2 text-sm font-medium rounded-full ${activeTab === tab
                ? "bg-gradient-to-b from-[#E1EAF9] to-[#99BEF7] text-[#131d2c]"
                : "bg-[#0c1623] text-[#99BEF7] border border-[#99BEF7]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="rounded-lg p-4 overflow-x-auto">
          <pre className="block bg-[#070915] text-sm text-[#8ba1bc] font-mono whitespace-pre-wrap sm:whitespace-pre rounded-lg p-4 overflow-x-auto">
            {snippets[activeTab]
              .replace(/\${endpoint}/g, endpoint)}
          </pre>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Example Response
        </h3>
        <p className="text-[#8ba1bc] mb-4">
          The API will return a JSON object with the following structure:
        </p>
        <div className="rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm bg-[#070915] text-[#8ba1bc] font-mono whitespace-pre rounded-lg">
            {JSON.stringify(exampleResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiCredentialsSection;
