"use client";

import React from 'react';
import { PublicVault } from '@/hooks/usePublicVaults';
import { formatCurrency, formatPercentage } from '@/utils/vaultPerformance';
import { useRouter } from 'next/navigation';

interface VaultCardProps {
  vault: PublicVault;
  onInvest?: (vaultAddress: string) => void;
}

export function VaultCard({ vault, onInvest }: VaultCardProps) {
  const router = useRouter();

  const handleInvestClick = () => {
    if (onInvest) {
      onInvest(vault.vaultAddress);
    } else {
      // Navigate to invest page with vault address
      router.push(`/invest-enzyme?vault=${vault.vaultAddress}`);
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'Low':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'High':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getReturnColor = (returnValue: string) => {
    const value = parseFloat(returnValue);
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  // Use performance data if available, otherwise fall back to vault data
  const tvl = vault.performanceData?.totalValueLocked || vault.totalValueLocked || '0';
  const monthlyReturn = vault.performanceData?.monthlyReturn || vault.monthlyReturn || '0';
  const sharePrice = vault.performanceData?.sharePrice || vault.sharePrice || '1.0';
  const assetSymbol = vault.performanceData?.denomAssetSymbol || 'USD';
  const isLoadingPerformance = vault.isLoadingPerformance || false;
  
  // Use real vault name and symbol from blockchain if available
  const displayVaultName = vault.performanceData?.vaultName || vault.vaultName;
  const displayVaultSymbol = vault.performanceData?.vaultSymbol || vault.vaultSymbol;

  return (
    <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-xl p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#E4EFFF] group-hover:text-cyan-300 transition-colors flex items-center gap-2">
            {displayVaultName}
            {vault.performanceData?.vaultName && vault.performanceData.vaultName !== 'Unknown Vault' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                Verified
              </span>
            )}
          </h3>
          <p className="text-sm text-[#8ba1bc] font-mono">
            {displayVaultSymbol}
          </p>
        </div>
        {vault.riskLevel && vault.riskLevel.trim() !== '' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(vault.riskLevel)}`}>
            {vault.riskLevel} Risk
          </span>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#8ba1bc]">Monthly Return</span>
          <div className="text-right">
            {isLoadingPerformance ? (
              <div className="w-16 h-4 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <span className={`text-sm font-medium ${getReturnColor(monthlyReturn)}`}>
                {formatPercentage(monthlyReturn)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#8ba1bc]">Total Value Locked</span>
          <div className="text-right">
            {isLoadingPerformance ? (
              <div className="w-20 h-4 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <span className="text-sm font-medium text-[#AAC9FA]">
                {formatCurrency(tvl, assetSymbol)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#8ba1bc]">Share Price</span>
          <div className="text-right">
            {isLoadingPerformance ? (
              <div className="w-16 h-4 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <span className="text-sm font-medium text-[#AAC9FA]">
                {parseFloat(sharePrice).toFixed(4)} {assetSymbol}
              </span>
            )}
          </div>
        </div>

        {vault.performanceData && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8ba1bc]">Total Supply</span>
            <span className="text-sm font-medium text-[#AAC9FA]">
              {parseFloat(vault.performanceData.totalSupply).toFixed(2)} shares
            </span>
          </div>
        )}
      </div>

      {/* Vault Details */}
      <div className="border-t border-[rgba(206,212,218,0.1)] pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[#6b7280]">Creator</span>
          <span className="text-xs text-[#8ba1bc] font-medium">
            {vault.creatorUsername}
          </span>
        </div>

        {vault.agentName && vault.agentName.trim() !== '' && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[#6b7280]">AI Agent</span>
            <span className="text-xs text-cyan-400 font-medium">
              {vault.agentName}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6b7280]">Created</span>
          <span className="text-xs text-[#8ba1bc]">
            {new Date(vault.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-[rgba(206,212,218,0.05)]">
          <div className="text-xs text-[#6b7280] mb-1">Vault Address</div>
          <div className="font-mono text-xs text-[#8ba1bc] break-all">
            {vault.vaultAddress.slice(0, 10)}...{vault.vaultAddress.slice(-8)}
          </div>
          {isLoadingPerformance && (
            <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              Loading vault data...
            </div>
          )}
          {/* {vault.performanceData && !isLoadingPerformance && (
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              {vault.performanceData.vaultName !== 'Unknown Vault' 
                ? 'Blockchain data loaded' 
                : 'Stats loaded (name generated)'
              }
            </div>
          )} */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleInvestClick}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          Invest in Vault
        </button>
      </div>

      {/* Loading Indicator for Performance Data */}
      {isLoadingPerformance && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Performance Data Status */}
      {vault.performanceData && !isLoadingPerformance && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" title="Real-time data loaded"></div>
        </div>
      )}
    </div>
  );
} 