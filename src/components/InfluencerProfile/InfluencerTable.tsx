"use client";
import React, { useState } from "react";
import { useSignals } from "../../hooks/useSignals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { TableSkeleton } from "../ui/table-skeleton";

interface InfluencerTableProps {
  influencerId: string;
}

function InfluencerTable({ influencerId }: InfluencerTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = useState("");

  const { signals, loading, error, total, page, setPage, limit } = useSignals({
    influencerId,
  });

  const totalPages = Math.ceil(total / limit);
  const filteredSignals = signals.filter((signal) =>
    signal.tokenId.toLowerCase().includes(filter.toLowerCase())
  );

  if (error) {
    return <div className="text-rose-400 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto text-gray-100 bg-gray-900 my-6 rounded-xl">
      {/* Table Container */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
        <div className="rounded-xl overflow-x-auto">
          <Table aria-label="Influencer trading signals py-4">
            <TableHeader className="sticky top-0 bg-gray-900 z-10">
              <TableRow className="border-b border-gray-700">
                <TableHead className="w-[100px] py-4 px-6 text-sm font-semibold text-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 rounded-tl-xl">
                  Token ID
                </TableHead>
                <TableHead className="w-[120px] py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Entry Price
                </TableHead>
                <TableHead className="w-[120px] py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  Exit Price
                </TableHead>
                <TableHead className="w-[100px] py-4 px-6 text-center text-sm font-semibold text-gray-200">
                  P&L
                </TableHead>
                <TableHead className="w-[120px] py-4 px-6 text-center text-sm font-semibold text-gray-200 hidden lg:table-cell">
                  Stop Loss
                </TableHead>
                <TableHead className="w-[120px] py-4 px-6 text-center text-sm font-semibold text-gray-200 hidden lg:table-cell">
                  TP1
                </TableHead>
                <TableHead className="w-[120px] py-4 px-6 text-center text-sm font-semibold text-gray-200 hidden lg:table-cell">
                  TP2
                </TableHead>
                <TableHead
                  className="w-[150px] py-4 px-6 text-center cursor-pointer text-sm font-semibold text-gray-200"
                >
                  <span>Signal Date</span>
                </TableHead>
                <TableHead className="w-[100px] py-4 px-6 text-center text-sm font-semibold text-gray-200 bg-gradient-to-l from-gray-900 to-gray-800 rounded-tr-xl">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={limit} columns={9} />
              ) : filteredSignals.length > 0 ? (
                filteredSignals.map((signal, index) => (
                  <TableRow
                    key={signal._id}
                    className={`transition-colors duration-200 border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800"
                      } hover:bg-gray-700/80 cursor-pointer`}               
                  >
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200">
                      {signal.tokenId}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200">
                      ${signal.entryPrice?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200">
                      ${signal.exitPrice?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${signal.pnl.startsWith("-")
                            ? "bg-rose-900/50 text-rose-400"
                            : "bg-emerald-900/50 text-emerald-400"
                          }`}
                      >
                        {signal.pnl}
                        {signal.pnl.startsWith("-") ? (
                          <svg
                            className="h-3 w-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-3 w-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200 hidden lg:table-cell">
                      ${signal.stopLoss?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200 hidden lg:table-cell">
                      ${signal.takeProfit1?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-200 hidden lg:table-cell">
                      ${signal.takeProfit2?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center text-sm text-gray-400">
                      {format(
                        new Date(signal.signalGenerationDate),
                        "MMM dd, yy HH:mm"
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(signal.ipfsLink, "_blank", "noopener,noreferrer");
                        }}
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm group focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1 group-hover:scale-110 transition-transform" />
                        Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-32 text-center text-gray-400"
                  >
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-100"
                      >
                        Explore Influencers
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Previous/Next Navigation */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-400">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-100"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-100"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InfluencerTable;