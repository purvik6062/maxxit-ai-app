"use client";

import React, { useState } from 'react';
import { usePublicVaults } from '@/hooks/usePublicVaults';
import { VaultCard } from '@/components/ui/VaultCard';
import { VaultFilters } from '@/components/ui/VaultFilters';
import { useRouter } from 'next/navigation';

export default function PublicVaultsPage() {
  const {
    vaults,
    isLoading,
    error,
    hasMore,
    totalCount,
    filters,
    setFilters,
    loadMore,
    refresh
  } = usePublicVaults();

  const router = useRouter();

  const handleInvestInVault = (vaultAddress: string) => {
    router.push(`/invest-enzyme?vault=${vaultAddress}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1A] via-[#0D1321] to-[#1a2234] pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Vaults</h3>
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1A] via-[#0D1321] to-[#1a2234] pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#E4EFFF] mb-4">
            Public Investment Vaults
          </h1>
          <p className="text-lg text-[#8ba1bc] max-w-2xl mx-auto">
            Discover and invest in vaults created by other users. Each vault is managed by AI agents 
            with different risk levels and investment strategies.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-2">
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-700 animate-pulse rounded mx-auto"></div>
              ) : (
                totalCount
              )}
            </div>
            <div className="text-sm text-[#8ba1bc]">Total Active Vaults</div>
          </div>
          
          <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-700 animate-pulse rounded mx-auto"></div>
              ) : (
                vaults.filter(v => {
                  const monthlyReturn = v.performanceData?.monthlyReturn || v.monthlyReturn || '0';
                  return parseFloat(monthlyReturn) > 0;
                }).length
              )}
            </div>
            <div className="text-sm text-[#8ba1bc]">Profitable Vaults</div>
          </div>
          
          <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-700 animate-pulse rounded mx-auto"></div>
              ) : (
                (() => {
                  const totalTVL = vaults.reduce((sum, vault) => {
                    const tvl = vault.performanceData?.totalValueLocked || vault.totalValueLocked || '0';
                    return sum + parseFloat(tvl);
                  }, 0);
                  
                  if (totalTVL < 1000) {
                    return `$${totalTVL.toFixed(0)}`;
                  } else if (totalTVL < 1000000) {
                    return `$${(totalTVL / 1000).toFixed(1)}K`;
                  } else {
                    return `$${(totalTVL / 1000000).toFixed(1)}M`;
                  }
                })()
              )}
            </div>
            <div className="text-sm text-[#8ba1bc]">Total Value Locked</div>
          </div>
          
          <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-700 animate-pulse rounded mx-auto"></div>
              ) : (
                (() => {
                  const vaultsWithReturns = vaults.filter(v => {
                    const monthlyReturn = v.performanceData?.monthlyReturn || v.monthlyReturn || '0';
                    return parseFloat(monthlyReturn) !== 0;
                  });
                  
                  if (vaultsWithReturns.length === 0) return '0%';
                  
                  const avgReturn = vaultsWithReturns.reduce((sum, vault) => {
                    const monthlyReturn = vault.performanceData?.monthlyReturn || vault.monthlyReturn || '0';
                    return sum + parseFloat(monthlyReturn);
                  }, 0) / vaultsWithReturns.length;
                  
                  return `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`;
                })()
              )}
            </div>
            <div className="text-sm text-[#8ba1bc]">Avg Monthly Return</div>
          </div>
        </div>

        {/* Filters */}
        <VaultFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={totalCount}
          isLoading={isLoading}
        />

        {/* Vaults Grid */}
        {isLoading && vaults.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700 rounded w-28"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="border-t border-[rgba(206,212,218,0.1)] pt-4 mb-4">
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-[#8ba1bc] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 8l4-4 4 4" />
            </svg>
            <h3 className="text-lg font-medium text-[#AAC9FA] mb-2">No Vaults Found</h3>
            <p className="text-[#8ba1bc] mb-4">
              No public vaults match your current filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={() => setFilters({})}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Vaults Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault._id}
                  vault={vault}
                  onInvest={handleInvestInVault}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Load More Vaults'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="flex-shrink-0 h-6 w-6 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Investment Information</h4>
              <div className="text-sm text-[#8ba1bc] space-y-1">
                <p>
                  • <strong>Monthly Return</strong>: Calculated based on vault share price growth
                </p>
                <p>
                  • <strong>Total Value Locked</strong>: Current total assets under management in the vault
                </p>
                <p>
                  • <strong>AI Agents</strong>: Automated trading strategies with different risk profiles
                </p>
                <p>
                  • <strong>Risk Levels</strong>: Low (conservative), Medium (balanced), High (aggressive)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 