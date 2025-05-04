"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { TableSkeleton } from "../ui/table-skeleton";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

interface InfluencerTableProps {
  influencerId: string;
  userName: string;
}

interface SignalData {
  _id: string;
  "Twitter Account": string;
  Tweet: string;
  "Tweet Date": string;
  "Signal Generation Date": string;
  "Signal Message": string;
  "Token Mentioned": string;
  "Token ID": string;
  "Price at Tweet": number;
  "Current Price": number;
  TP1: number;
  TP2: number;
  SL: number;
  "Max Exit Time": string;
  backtesting_done: boolean;
  "Best Strategy"?: string;
  "Final Exit Price"?: number;
  "Final P&L"?: string;
  Reasoning?: string;
  "IPFS Link"?: string;
}

function InfluencerTable({ influencerId, userName }: InfluencerTableProps) {
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
      if (!userName) {
        console.log("No username");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/get-influencer-signals?twitterAccount=314Davinci86890&page=${pagination.currentPage}&limit=${pagination.limit}&filterType=${filterType}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trading signals");
        }

        const data = await response.json();
        if (data.success) {
          console.log("data:::::", data);
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
  }, [userName, pagination.currentPage, pagination.limit, filterType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yy HH:mm");
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

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

  const EmptyState = () => (
    <TableRow>
      <TableCell colSpan={9} className="h-32 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className="h-12 w-12 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p>No trading signals found for this influencer.</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="max-w-6xl mx-auto text-gray-100 bg-gray-900 my-6 rounded-xl">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 border-b border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-0">
          Trading Signals
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
              onClick={() => handleFilterChange("completed")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                filterType === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a2535] text-gray-300 hover:bg-[#243044]"
              }`}
            >
              Completed
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
        <div className="rounded-xl overflow-x-auto">
          <Table aria-label="Influencer trading signals">
            <TableHeader className="sticky top-0 bg-gray-900 z-10">
              <TableRow className="border-b border-gray-700">
                <TableHead className="py-4 px-6 text-sm font-semibold text-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
                  Date
                </TableHead>
                <TableHead className="py-4 px-6 text-sm font-semibold text-gray-200">
                  Token
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Type
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Entry Price
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Targets
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Exit Price
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  P&L
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Stop Loss
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Status
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-200 bg-gradient-to-l from-gray-900 to-gray-800">
                  View
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={pagination.limit} columns={10} />
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-red-400 py-4"
                  >
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : signals.length === 0 ? (
                <EmptyState />
              ) : (
                filteredSignals.map((signal, index) => {
                  const isCompleted =
                    signal.backtesting_done &&
                    signal["Final Exit Price"] !== undefined;

                  return (
                    <TableRow
                      key={signal._id}
                      className={`transition-colors duration-200 border-b border-gray-700 ${
                        index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800"
                      } hover:bg-gray-700/80`}
                    >
                      <TableCell className="py-3 px-3 text-sm text-gray-300">
                        {formatDate(signal["Signal Generation Date"])}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-sm font-medium text-white">
                        <div className="max-w-[120px] overflow-hidden text-ellipsis group relative">
                          <span
                            className="block overflow-hidden text-ellipsis whitespace-nowrap"
                            title={signal["Token ID"]}
                          >
                            {signal["Token ID"]}
                          </span>
                          {signal["Token ID"].length > 12 && (
                            <span className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 shadow-lg whitespace-normal max-w-xs">
                              {signal["Token ID"]}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            signal["Signal Message"].toLowerCase() === "buy"
                              ? "bg-green-900 text-green-200"
                              : signal["Signal Message"].toLowerCase() ===
                                "sell"
                              ? "bg-red-900 text-red-200"
                              : signal["Signal Message"].toLowerCase() ===
                                "hold"
                              ? "bg-blue-900 text-blue-200"
                              : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {signal["Signal Message"]}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center text-sm text-blue-400 font-medium">
                        ${formatPrice(signal["Price at Tweet"])}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <div className="space-y-1">
                          {signal["TP1"] && (
                            <div className="text-xs text-green-400">
                              TP1: ${formatPrice(signal["TP1"])}
                            </div>
                          )}
                          {signal["TP2"] && (
                            <div className="text-xs text-green-400">
                              TP2: ${formatPrice(signal["TP2"])}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center text-sm font-medium">
                        {isCompleted ? (
                          <span className="text-yellow-400">
                            ${formatPrice(signal["Final Exit Price"]!)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center text-sm font-medium">
                        {isCompleted && signal["Final P&L"] ? (
                          <span
                            className={
                              signal["Final P&L"].includes("-")
                                ? "text-red-400"
                                : "text-green-400"
                            }
                          >
                            {signal["Final P&L"]}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center text-sm text-red-400 font-medium">
                        ${formatPrice(signal["SL"])}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            isCompleted
                              ? "bg-purple-900 text-purple-200"
                              : "bg-yellow-900 text-yellow-200"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <Link
                          href={`/signal-details/${signal._id}`}
                          className="inline-flex p-1.5 rounded text-gray-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors"
                          title="View Signal Details"
                          aria-label="View Signal Details"
                        >
                          <FaExternalLinkAlt className="w-3.5 h-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && !loading && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-700">
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
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#1a2535] rounded-md disabled:opacity-50 hover:bg-[#243044] flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#1a2535] rounded-md disabled:opacity-50 hover:bg-[#243044] flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfluencerTable;
