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
          `/api/get-influencer-signals?twitterAccount=${userName}&page=${pagination.currentPage}&limit=${pagination.limit}&filterType=${filterType}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trading signals");
        }

        const data = await response.json();
        if (data.success) {
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
      <TableCell colSpan={10} className="h-48 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className="h-16 w-16 text-gray-500"
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
          <p className="text-sm font-medium">
            No trading signals found for this influencer.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="max-w-7xl mx-auto my-8 rounded-2xl bg-gray-900/50 backdrop-blur-sm shadow-2xl">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">
          Trading Signals
        </h2>
        {signals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {["all", "buy", "sell", "hold", "completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === filter
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="relative rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            aria-label="Influencer trading signals"
            className="w-full min-w-[1000px]"
          >
            <TableHeader className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 border-b border-gray-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 px-4 text-sm font-semibold text-gray-200 w-[140px]">
                  Date
                </TableHead>
                <TableHead className="py-4 px-4 text-sm font-semibold text-gray-200 w-[120px]">
                  Token
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[100px]">
                  Type
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[120px]">
                  Entry Price
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[140px]">
                  Targets
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[120px]">
                  Exit Price
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[100px]">
                  P&L
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[120px]">
                  Stop Loss
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[100px]">
                  Status
                </TableHead>
                <TableHead className="py-4 px-4 text-center text-sm font-semibold text-gray-200 w-[80px]">
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
                    className="text-center text-red-400 py-8 text-sm font-medium"
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
                      className={`border-b border-gray-800 transition-colors duration-300 ${index % 2 === 0 ? "bg-gray-900/20" : "bg-gray-900/40"
                        } hover:bg-gray-800/60`}
                    >
                      <TableCell className="py-3 px-4 text-sm text-gray-300">
                        {formatDate(signal["Signal Generation Date"])}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm font-medium text-white">
                        <div className="max-w-[120px] overflow-hidden text-ellipsis group relative">
                          <span
                            className="block overflow-hidden text-ellipsis whitespace-nowrap"
                            title={signal["Token ID"]}
                          >
                            {signal["Token ID"]}
                          </span>
                          {signal["Token ID"].length > 12 && (
                            <span className="absolute left-0 top-full mt-2 z-20 hidden group-hover:block bg-gray-900 text-gray-100 text-xs rounded-lg px-3 py-1.5 shadow-xl whitespace-normal max-w-xs">
                              {signal["Token ID"]}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${signal["Signal Message"].toLowerCase() === "buy"
                              ? "bg-green-900/50 text-green-300"
                              : signal["Signal Message"].toLowerCase() ===
                                "sell"
                                ? "bg-red-900/50 text-red-300"
                                : signal["Signal Message"].toLowerCase() ===
                                  "hold"
                                  ? "bg-blue-900/50 text-blue-300"
                                  : "bg-gray-700/50 text-gray-300"
                            }`}
                        >
                          {signal["Signal Message"]}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center text-sm text-blue-400 font-medium">
                        ${formatPrice(signal["Price at Tweet"])}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
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
                      <TableCell className="py-3 px-4 text-center text-sm font-medium">
                        {isCompleted ? (
                          <span className="text-yellow-400">
                            ${formatPrice(signal["Final Exit Price"]!)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center text-sm font-medium">
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
                      <TableCell className="py-3 px-4 text-center text-sm text-red-400 font-medium">
                        ${formatPrice(signal["SL"])}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${isCompleted
                              ? "bg-purple-900/50 text-purple-300"
                              : "bg-yellow-900/50 text-yellow-300"
                            }`}
                        >
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Link
                          href={`/signal-details/${signal._id}`}
                          className="inline-flex p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 transition-all duration-200"
                          title="View Signal Details"
                          aria-label="View Signal Details"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900/30">
          <div className="text-sm text-gray-400 mb-4 sm:mb-0">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalSignals
            )}{" "}
            of {pagination.totalSignals} signals
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 flex items-center"
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