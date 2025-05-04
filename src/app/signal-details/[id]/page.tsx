"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ExternalLink,
  Eye,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  PauseCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

interface SignalDetails {
  _id: string;
  twitterHandle: string;
  coin: string;
  signal_data: {
    token: string;
    signal: string;
    currentPrice: number;
    targets: number[];
    stopLoss: number;
    timeline?: string;
    maxExitTime?: string;
    tradeTip?: string;
    tweet_id?: string;
    tweet_link?: string;
    tweet_timestamp?: string;
    priceAtTweet?: number;
    exitValue?: number | null;
    exitPnL?: string | null;
    bestStrategy?: string;
    twitterHandle?: string;
    tokenMentioned?: string;
    tokenId?: string;
    ipfsLink?: string;
  };
  generatedAt: string;
  tweet_link: string;
  backtestingDone?: boolean;
  hasExited?: boolean;
  backtestingData?: {
    "Coin ID": string;
    "Entry Price": string;
    "Exit Price": number | null;
    "P&L": string | null;
    Reasoning: string;
    SL: string;
    "Signal Generation Date": string;
    "Signal Type": string;
    TP1: string;
    TP2: string;
  };
}

export default function SignalDetailsPage() {
  const { id } = useParams();
  const [signal, setSignal] = useState<SignalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchSignalDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-signal-details?id=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch signal details");
        }

        const data = await response.json();
        if (data.success) {
          setSignal(data.data);
        } else {
          setError(data.error?.message || "Failed to fetch signal details");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSignalDetails();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice < 0.01) return numPrice.toFixed(8);
    if (numPrice < 1) return numPrice.toFixed(4);
    return numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading signal details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900 text-red-100 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link
            href="/profile"
            className="mt-4 inline-block px-4 py-2 bg-red-800 rounded-md hover:bg-red-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-blue-900/50 text-yellow-100 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2 text-white">
            Signal Not Found
          </h2>
          <p>The requested signal could not be found.</p>
          <Link
            href="/profile"
            className="mt-4 inline-block px-4 py-2 bg-blue-800 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isExited =
    signal.hasExited ||
    (signal.signal_data.exitValue !== null &&
      signal.signal_data.exitValue !== undefined);

  const getSignalIcon = () => {
    const signalType = signal.signal_data.signal.toLowerCase();
    if (signalType === "buy")
      return <ArrowUpCircle className="h-5 w-5 text-green-400" />;
    if (signalType === "sell")
      return <ArrowDownCircle className="h-5 w-5 text-red-400" />;
    if (signalType === "hold")
      return <PauseCircle className="h-5 w-5 text-blue-400" />;
    return <Info className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/profile"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-[#0c1420] rounded-xl shadow-lg overflow-hidden font-leagueSpartan">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {signal.signal_data.token} Signal
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded ${
                    signal.signal_data.signal.toLowerCase() === "buy"
                      ? "bg-green-900 text-green-200"
                      : signal.signal_data.signal.toLowerCase() === "sell"
                      ? "bg-red-900 text-red-200"
                      : signal.signal_data.signal.toLowerCase() === "hold"
                      ? "bg-blue-900 text-blue-200"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {getSignalIcon()}
                  {signal.signal_data.signal}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded ${
                    isExited
                      ? "bg-purple-900 text-purple-200"
                      : "bg-yellow-900 text-yellow-200"
                  }`}
                >
                  {isExited ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Exited</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Active</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-sm hover:text-white hover:bg-gray-800/40 transition-colors focus:outline-none ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-gray-300"
              }`}
            >
              Overview
            </button>
            {signal.backtestingDone && signal.backtestingData && (
              <button
                onClick={() => setActiveTab("backtesting")}
                className={`px-4 py-3 text-sm hover:text-white hover:bg-gray-800/40 transition-colors focus:outline-none ${
                  activeTab === "backtesting"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-300"
                }`}
              >
                Backtesting
              </button>
            )}
            {signal.signal_data.tradeTip && (
              <button
                onClick={() => setActiveTab("tips")}
                className={`px-4 py-3 text-sm hover:text-white hover:bg-gray-800/40 transition-colors focus:outline-none ${
                  activeTab === "tips"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-300"
                }`}
              >
                Trade Tips
              </button>
            )}
          </div>

          {/* Overview tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Basic Info */}
                <div className="lg:col-span-1">
                  <div className="bg-[#111827]/50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      Signal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Token</p>
                        <p className="text-sm text-white font-medium">
                          {signal.signal_data.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Date Generated
                        </p>
                        <p className="text-sm text-white">
                          {formatDate(signal.generatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Twitter Handle
                        </p>
                        <p className="text-sm text-white">
                          @
                          {signal.twitterHandle ||
                            signal.signal_data.twitterHandle}
                        </p>
                      </div>
                      <hr className="border-gray-700 my-3" />
                      <div className="flex flex-col gap-2">
                        <a
                          href={signal.tweet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-2 bg-[#1a2535] rounded hover:bg-[#1e2c3d] transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Tweet
                        </a>
                        {signal.signal_data.ipfsLink && (
                          <a
                            href={signal.signal_data.ipfsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-2 bg-[#1a2535] rounded hover:bg-[#1e2c3d] transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View IPFS Data
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Trading Info */}
                <div className="lg:col-span-2">
                  <div className="bg-[#111827]/50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-blue-400" />
                      Trading Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Entry Price
                        </p>
                        <p className="text-sm text-blue-400 font-medium">
                          ${formatPrice(signal.signal_data.currentPrice)}
                        </p>
                      </div>

                      {isExited ? (
                        signal.signal_data.exitValue && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Exit Price
                            </p>
                            <p className="text-sm text-yellow-400 font-medium">
                              ${formatPrice(signal.signal_data.exitValue)}
                            </p>
                          </div>
                        )
                      ) : (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Stop Loss
                          </p>
                          <p className="text-sm text-red-400 font-medium">
                            ${formatPrice(signal.signal_data.stopLoss)}
                          </p>
                        </div>
                      )}

                      {isExited && signal.signal_data.exitPnL && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">P&L</p>
                          <p
                            className={`text-sm font-medium ${
                              signal.signal_data.exitPnL.includes("-")
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {signal.signal_data.exitPnL}
                          </p>
                        </div>
                      )}

                      {signal.signal_data.bestStrategy && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Best Strategy
                          </p>
                          <p className="text-sm text-blue-300">
                            {signal.signal_data.bestStrategy}
                          </p>
                        </div>
                      )}

                      {/* Only show if not exited */}
                      {!isExited && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-400 mb-2">Targets</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {signal.signal_data.targets.map((target, idx) => (
                              <div
                                key={idx}
                                className="bg-[#1a2535] rounded px-3 py-2 flex items-center gap-2"
                              >
                                <Target className="h-4 w-4 text-green-400" />
                                <div>
                                  <p className="text-xs text-gray-400">
                                    TP{idx + 1}
                                  </p>
                                  <p className="text-sm text-green-400">
                                    ${formatPrice(target)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div className="bg-[#1a2535] rounded px-3 py-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <div>
                                <p className="text-xs text-gray-400">SL</p>
                                <p className="text-sm text-red-400">
                                  ${formatPrice(signal.signal_data.stopLoss)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backtesting tab */}
          {activeTab === "backtesting" &&
            signal.backtestingDone &&
            signal.backtestingData && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-[#111827]/50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      Backtesting Data
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Signal Type
                        </p>
                        <p className="text-sm text-white">
                          {signal.backtestingData["Signal Type"]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Signal Date
                        </p>
                        <p className="text-sm text-white">
                          {signal.backtestingData["Signal Generation Date"]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Coin ID</p>
                        <p className="text-sm text-white">
                          {signal.backtestingData["Coin ID"]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Entry Price
                        </p>
                        <p className="text-sm text-blue-400">
                          ${signal.backtestingData["Entry Price"] || "N/A"}
                        </p>
                      </div>
                      {signal.backtestingData["Exit Price"] && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Exit Price
                          </p>
                          <p className="text-sm text-yellow-400">
                            ${formatPrice(signal.backtestingData["Exit Price"])}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Target 1</p>
                        <p className="text-sm text-green-400">
                          ${signal.backtestingData["TP1"] || "N/A"}
                        </p>
                      </div>
                      {signal.backtestingData["TP2"] && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Target 2</p>
                          <p className="text-sm text-green-400">
                            ${signal.backtestingData["TP2"]}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                        <p className="text-sm text-red-400">
                          ${signal.backtestingData["SL"] || "N/A"}
                        </p>
                      </div>
                      {signal.backtestingData["P&L"] && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">P&L</p>
                          <p
                            className={`text-sm ${
                              signal.backtestingData["P&L"].includes("-")
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {signal.backtestingData["P&L"]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {signal.backtestingData["Reasoning"] && (
                    <div className="bg-[#111827]/50 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-400" />
                        Trading Analysis
                      </h3>
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {signal.backtestingData["Reasoning"]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Trade Tips tab */}
          {activeTab === "tips" && signal.signal_data.tradeTip && (
            <div className="p-6">
              <div className="bg-[#111827]/50 rounded-lg p-4">
                <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  Trade Tip
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-line">
                  {signal.signal_data.tradeTip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
