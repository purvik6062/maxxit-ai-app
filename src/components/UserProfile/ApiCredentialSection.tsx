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
    'Authorization': 'Bearer ${
      showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
    }'
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
    cURL: `curl -X GET \`\${endpoint}/api/get-my-signals\` \\
  -H "Authorization: Bearer ${
    showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
  }"`,
    Python: `import requests

url = f"{endpoint}/api/get-my-signals"
headers = {"Authorization": "Bearer ${
      showApiKey ? apiKey : apiKey?.replace(/.(?=.{4})/g, "•")
    }"}
response = requests.get(url, headers=headers)
print(response.json())`,
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-100">API Access</h2>
        <span className="text-sm text-blue-400">Trading Signals API</span>
        {!apiKey && (
          <button
            onClick={handleGenerateKey}
            disabled={loading} // Disable button while loading
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
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

      <p className="text-gray-300 mb-6">
        Use these credentials to access your trading signals through our API.
        Keep them secure!
      </p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900/30 p-4 rounded-lg">
          <div className="flex-1 mb-2 sm:mb-0">
            <label className="text-sm font-medium text-gray-400">
              API Endpoint
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-gray-100 break-all">
                {endpoint + "/api/get-my-signals"}
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              copyToClipboard(
                endpoint + "/api/get-my-signals",
                "Endpoint copied!"
              )
            }
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copy</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900/30 p-4 rounded-lg">
          <div className="flex-1 mb-2 sm:mb-0">
            <label className="text-sm font-medium text-gray-400">API Key</label>
            {apiKey ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-gray-100">
                  {showApiKey ? apiKey : apiKey.replace(/.(?=.{4})/g, "•")}
                </span>
                <button
                  onClick={toggleKeyVisibility}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {!showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <p className="text-gray-400">No API key generated yet</p>
            )}
          </div>
          {apiKey && (
            <button
              onClick={() => copyToClipboard(apiKey, "API key copied!")}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">
          Usage Example
        </h3>
        <div className="flex space-x-2 mb-3">
          {(["JavaScript", "cURL", "Python"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <code className="block text-sm text-gray-300 font-mono p-3 bg-gray-800 rounded whitespace-pre">
          {snippets[activeTab]
            .replace(/\${endpoint}/g, endpoint)
            .replace(
              /\${apiKey ? apiKey : "YOUR_API_KEY"}/g,
              apiKey
                ? showApiKey
                  ? apiKey
                  : apiKey.replace(/.(?=.{4})/g, "•")
                : "YOUR_API_KEY"
            )}
        </code>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">
          Example Response
        </h3>
        <p className="text-gray-300 mb-2">
          The API will return a JSON object with <code>success</code>,{" "}
          <code>count</code>, and <code>data</code> fields. The{" "}
          <code>data</code> field is an array of signals, each with the
          following structure:
        </p>
        <pre className="block text-sm text-gray-300 font-mono p-3 bg-gray-800 rounded whitespace-pre overflow-x-auto">
          {JSON.stringify(exampleResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ApiCredentialsSection;
