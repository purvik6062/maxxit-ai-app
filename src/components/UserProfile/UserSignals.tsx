import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

interface SignalData {
  _id: string;
  tweet_id: string;
  twitterHandle: string;
  coin: string;
  signal_message: string;
  signal_data: {
    token: string;
    signal: string;
    currentPrice: number;
    targets: number[];
    stopLoss: number;
    timeline: string;
    maxExitTime: string;
    tradeTip: string;
    tweet_id: string;
    tweet_link: string;
    tweet_timestamp: string;
    priceAtTweet: number;
    exitValue: number | null;
    exitPnL?: string;
    bestStrategy?: string;
    twitterHandle: string;
    tokenMentioned: string;
    tokenId: string;
    ipfsLink?: string;
  };
  generatedAt: string;
  subscribers: {
    username: string;
    sent: boolean;
  }[];
  tweet_link: string;
  messageSent: boolean;
  backtestingDone?: boolean;
  hasExited: boolean;
}

function UserSignals({
  twitterId,
  profile,
}: {
  twitterId: string | any;
  profile: any;
}) {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [pagination, setPagination] = useState<{
    currentPage: number;
    limit: number;
    totalSignals: number;
    totalPages: number;
  }>({
    currentPage: 1,
    limit: 10,
    totalSignals: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchSignals = async () => {
      if (!profile?.telegramId) return;

      try {
        const response = await fetch(
          `/api/get-user-signals?telegramId=${profile.telegramId}&page=${pagination.currentPage}&limit=${pagination.limit}&filterType=${filterType}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trading signals");
        }

        const data = await response.json();
        if (data.success) {
          console.log("dataaaa", data.data)
          setSignals(data.data);
          setFilteredSignals(data.data);
          setPagination((prev) => ({
            ...prev,
            totalSignals: data.pagination.totalSignals,
            totalPages: data.pagination.totalPages,
          }));
        } else {
          setError(data.error?.message || "Failed to fetch signals");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [profile?.telegramId, pagination.currentPage, pagination.limit, filterType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const EmptyState = () => (
    <div className="text-center py-8 sm:py-10">
      <svg
        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-300 font-leagueSpartan">
        No signals found
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-400">
        You don't have any signals yet. Subscribe to trading accounts to receive
        signals.
      </p>
      <div className="mt-4 sm:mt-6">
        <a
          href="/marketplace"
          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Marketplace
        </a>
      </div>
    </div>
  );

  const SkeletonLoader = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed divide-y divide-gray-700">
        <thead className="bg-[#1a2535] sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[180px]">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
              Token
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
              Entry Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[150px]">
              Targets
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
              Exit Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
              P&L
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
              Stop Loss
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
              View
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {[...Array(pagination.limit)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full mx-auto"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      setLoading(true);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    if (newFilter !== filterType) {
      setFilterType(newFilter);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      setLoading(true);
    }
  };

  return (
    <div className="bg-[#0c1420] rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white font-leagueSpartan mb-4 sm:mb-0">
          Your Trading Signals
        </h2>
        {signals.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("buy")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "buy"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleFilterChange("sell")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "sell"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => handleFilterChange("hold")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "hold"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              Hold
            </button>
            <button
              onClick={() => handleFilterChange("exited")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "exited"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              Exited
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-w-full">
          <SkeletonLoader />
        </div>
      ) : error ? (
        <p className="text-red-400 p-4 sm:p-6 text-sm sm:text-base">
          Error: {error}
        </p>
      ) : signals.length === 0 ? (
        <EmptyState />
      ) : filteredSignals.length === 0 ? (
        <p className="text-gray-400 text-center py-6 text-sm sm:text-base">
          No {filterType} signals found. Try a different filter.
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-w-full">
          <table className="min-w-full table-fixed divide-y divide-gray-700">
            <thead className="bg-[#1a2535] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[180px]">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[150px]">
                  Targets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                  Exit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                  Stop Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSignals.map((signal) => {
                const isExited = signal.hasExited || 
                  (signal.signal_data.exitValue !== null && 
                   signal.signal_data.exitValue !== undefined);
                
                return (
                  <tr
                    key={signal._id}
                    className="hover:bg-[#162639] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {formatDate(signal.generatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                      <div className="max-w-[120px] overflow-hidden text-ellipsis group relative">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={signal.signal_data.token}>
                          {signal.signal_data.token}
                        </span>
                        {signal.signal_data.token.length > 12 && (
                          <span className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 shadow-lg whitespace-normal max-w-xs">
                            {signal.signal_data.token}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          signal.signal_data.signal.toLowerCase() === "buy"
                            ? "bg-green-900 text-green-200"
                            : signal.signal_data.signal.toLowerCase() === "sell"
                            ? "bg-red-900 text-red-200"
                            : signal.signal_data.signal.toLowerCase() === "hold"
                            ? "bg-blue-900 text-blue-200"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {signal.signal_data.signal}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-400 whitespace-nowrap font-medium">
                      ${formatPrice(signal.signal_data.currentPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {signal.signal_data.targets.map((target, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-green-400 whitespace-nowrap"
                          >
                            TP{idx + 1}: ${formatPrice(target)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                      {isExited ? (
                        <span className="text-yellow-400">
                          ${formatPrice(signal.signal_data.exitValue!)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                      {isExited && signal.signal_data.exitPnL ? (
                        <span className={signal.signal_data.exitPnL.includes('-') ? 'text-red-400' : 'text-green-400'}>
                          {signal.signal_data.exitPnL}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-400 whitespace-nowrap font-medium">
                      ${formatPrice(signal.signal_data.stopLoss)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          isExited
                            ? "bg-purple-900 text-purple-200"
                            : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {isExited ? "Exited" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/signal-details/${signal._id}`}
                        className="inline-flex p-1.5 rounded text-gray-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors"
                        title="View Signal Details"
                        aria-label="View Signal Details"
                      >
                        <FaExternalLinkAlt className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pagination.totalPages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 space-y-4 sm:space-y-0">
          <div className="text-xs sm:text-sm text-gray-400">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalSignals
            )}{" "}
            of {pagination.totalSignals} signals
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#1a2535] rounded-md disabled:opacity-50 hover:bg-[#243044]"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#1a2535] rounded-md disabled:opacity-50 hover:bg-[#243044]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSignals;