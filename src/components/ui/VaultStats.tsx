"use client";

interface VaultData {
  name: string;
  symbol: string;
  totalSupply: string;
  sharePrice: string;
  denominationAsset: string;
  comptroller: string;
}

interface UserPosition {
  shares: string;
  sharesBalance: string;
  assetValue: string;
  percentage: string;
}

interface VaultStatsProps {
  vaultData: VaultData | null;
  userPosition: UserPosition | null;
  denominationAssetSymbol: string;
  isLoading: boolean;
}

export function VaultStats({ vaultData, userPosition, denominationAssetSymbol, isLoading }: VaultStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-[#1a2234] rounded w-24 mb-2"></div>
              <div className="h-8 bg-[#1a2234] rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!vaultData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
        <h3 className="text-red-400 font-medium">Unable to load vault data</h3>
        <p className="text-red-300 text-sm mt-2">
          Please check your vault address configuration and try again.
        </p>
      </div>
    );
  }

  const totalValue = parseFloat(vaultData.totalSupply) * parseFloat(vaultData.sharePrice);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Vault Name */}
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
            <svg className="w-6 h-6 text-[#AAC9FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-[#8ba1bc]">Vault</p>
            <p className="text-2xl font-bold text-[#AAC9FA]">{vaultData.name}</p>
            <p className="text-sm text-[#818791]">{vaultData.symbol}</p>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-[#8ba1bc]">Total Value</p>
            <p className="text-2xl font-bold text-[#AAC9FA]">
              {totalValue.toFixed(2)} {denominationAssetSymbol}
            </p>
          </div>
        </div>
      </div>

      {/* Share Price */}
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/30">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-[#8ba1bc]">Share Price</p>
            <p className="text-2xl font-bold text-[#AAC9FA]">
              {parseFloat(vaultData.sharePrice).toFixed(4)} {denominationAssetSymbol}
            </p>
          </div>
        </div>
      </div>

      {/* User Position */}
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-[#8ba1bc]">Your Position</p>
            <p className="text-2xl font-bold text-[#AAC9FA]">
              {userPosition ? `${parseFloat(userPosition.assetValue).toFixed(2)} ${denominationAssetSymbol}` : '0.00'}
            </p>
            <p className="text-sm text-[#818791]">
              {userPosition ? `${parseFloat(userPosition.shares).toFixed(4)} shares (${userPosition.percentage}%)` : 'No position'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 