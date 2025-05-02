import React, { useState } from "react";
import { Calendar, TrendingUp, BarChart2, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import type { Subscription } from "./types";
import { useRouter } from "next/navigation";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // Track open dropdown
  const pageSize = 8; // Number of subscriptions per page
  const totalLeads = subscriptions.reduce((acc, sub) => acc + (sub.leadsCount || 0), 0);
  const totalPages = Math.ceil(subscriptions.length / pageSize);

  // Calculate subscriptions for the current page
  const paginatedSubscriptions = subscriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setOpenDropdown(null); // Close all dropdowns on page change
    }
  };

  // Generate page numbers for display (e.g., 1, 2, 3, ..., 10)
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and first/last page if needed
    if (startPage > 1) {
      pages.unshift("...");
      pages.unshift(1);
    }
    if (endPage < totalPages) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Toggle dropdown
  const toggleDropdown = (twitterHandle: string) => {
    setOpenDropdown(openDropdown === twitterHandle ? null : twitterHandle);
  };

  const handleCardClick = (twitterHandle: string) => {
    router.push(`/influencer/${twitterHandle}`);
  };

  return (
    <div className="font-leagueSpartan">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 bg-[#1C2333] border border-[rgba(206,212,218,0.15)] rounded-md mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-[#AAC9FA]">
            Subscribe Accounts
          </h3>
          <p className="text-[#8ba1bc] mt-1">Manage your active subscriptions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-[#1a1f29] border border-[rgba(206,212,218,0.15)] rounded-md p-2">
              <Users className="w-5 h-5 text-[#8ba1bc]" />
            </div>
            <div>
              <p className="text-sm text-[#818791]">Active subscriptions</p>
              <p className="text-xl font-semibold text-[#AAC9FA]">{subscriptions.length || 7}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-[#1a1f29] border border-[rgba(206,212,218,0.15)] rounded-md p-2">
              <BarChart2 className="w-5 h-5 text-[#8ba1bc]" />
            </div>
            <div>
              <p className="text-sm text-[#818791]">Total Leads</p>
              <p className="text-xl font-semibold text-[#AAC9FA]">{totalLeads || 274}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-[#0E1725] rounded-xl border border-[#818791]">
        <div className="p-4 md:p-6">
          {/* Mobile: Dropdown List */}
          <div className="sm:hidden space-y-3">
            {(paginatedSubscriptions.length ? paginatedSubscriptions.map(
              (sub, index) => {
                const key = sub?.twitterHandle || `placeholder-${index}`;
                const isOpen = openDropdown === key;
                return (
                  <div
                    key={key}
                    className="bg-[#E4EFFF] border border-[rgba(206,212,218,0.5)] rounded-md shadow-sm"
                  >
                    {/* Dropdown Header */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#d4e3ff] transition-colors"
                      onClick={() => toggleDropdown(key)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#1a1f29] border border-[rgba(206,212,218,0.15)] rounded-md p-1.5">
                          <TrendingUp className="w-4 h-4 text-[#8ba1bc]" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-[#111827]">
                            {sub?.twitterHandle || "Placeholder"}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center bg-[#1BDC14] text-[#393B49] rounded-full px-2 py-0.5 text-xs font-medium">
                          Active
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#4b5563]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#4b5563]" />
                        )}
                      </div>
                    </div>
                    {/* Dropdown Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 p-3" : "max-h-0"
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center text-[#4b5563]">
                          <FaXTwitter className="w-3.5 h-3.5 mr-1" />
                          <span
                            className="text-sm cursor-pointer hover:underline"
                            onClick={() => sub?.twitterHandle && handleCardClick(sub.twitterHandle)}
                          >
                            @{sub?.twitterHandle || "Lorem ipsum"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-[#4b5563]">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            <span className="text-sm">Expires</span>
                          </div>
                          <span className="text-sm font-medium text-[#111827]">
                            {sub?.expiryDate
                              ? new Date(sub.expiryDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                              : "Apr 23, 2025"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-[#4b5563]">
                            <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                            <span className="text-sm">Leads</span>
                          </div>
                          <span className="text-sm font-medium text-[#111827]">
                            {sub?.leadsCount || 48}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            ) : (
              <div className="text-center text-[#4b5563] text-base">
                You haven't subscribed to any user yet
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(paginatedSubscriptions.length ? paginatedSubscriptions.map(
              (sub, index) => (
                <div
                  key={sub?.twitterHandle || `placeholder-${index}`}
                  className="flex flex-col bg-[#E4EFFF] border border-[rgba(206,212,218,0.5)] rounded-md p-4 shadow-sm cursor-pointer hover:scale-[1.01] transition-transform duration-200 ease-in-out"
                  onClick={() => sub?.twitterHandle && handleCardClick(sub.twitterHandle)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#1a1f29] border border-[rgba(206,212,218,0.15)] rounded-md p-2">
                        <TrendingUp className="w-5 h-5 text-[#8ba1bc]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-[#111827]">
                          {sub?.twitterHandle || ""}
                        </h4>
                        <div className="flex items-center text-[#4b5563]">
                          <FaXTwitter className="w-3.5 h-3.5 mr-1" />
                          <span className="text-sm">@{sub?.twitterHandle || "Lorem ipsum"}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center self-start bg-[#1BDC14] text-[#393B49] rounded-full px-3 py-0.5 text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-[#4b5563]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Expires</span>
                    </div>
                    <span className="text-sm font-medium text-[#111827]">
                      {sub?.expiryDate
                        ? new Date(sub.expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "Apr 23, 2025"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-[#4b5563]">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      <span className="text-sm">Leads</span>
                    </div>
                    <span className="text-sm font-medium text-[#111827]">
                      {sub?.leadsCount || 48}
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-[#4b5563] text-base">
                You haven't subscribed to any user yet
              </div>
            )
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              className={`bg-[#1C2333] border border-[rgba(206,212,218,0.15)] rounded-md p-2 text-[#AAC9FA] text-sm font-medium transition-colors ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#AAC9FA] hover:text-[#1C2333]"
                }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={page}
                  className={`px-3 py-1 h-full text-sm font-medium rounded-md border border-[rgba(206,212,218,0.15)] transition-colors ${currentPage === page
                    ? "bg-[#AAC9FA] text-[#1C2333]"
                    : "bg-[#1C2333] text-[#AAC9FA] hover:bg-[#AAC9FA] hover:text-[#1C2333]"
                    }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1 text-[#8ba1bc] text-sm"
                >
                  ...
                </span>
              )
            )}

            {/* Next Button */}
            <button
              className={`bg-[#1C2333] border border-[rgba(206,212,218,0.15)] rounded-md p-2 text-[#AAC9FA] text-sm font-medium transition-colors ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#AAC9FA] hover:text-[#1C2333]"
                }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}