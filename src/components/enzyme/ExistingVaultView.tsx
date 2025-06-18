import React, { useState } from 'react';
import { useEnzymeVault } from '@/hooks/useEnzymeVault';
import { VaultStats } from '@/components/ui/VaultStats';
import { DepositForm } from '@/components/ui/DepositForm';
import { WithdrawForm } from '@/components/ui/WithdrawForm';

interface ExistingVaultViewProps {
  vaultAddress: string;
  onCreateNewVault: () => void;
}

const ExistingVaultView: React.FC<ExistingVaultViewProps> = ({
  vaultAddress,
  onCreateNewVault,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use the existing useEnzymeVault hook with the vault address
  const {
    vaultData,
    userPosition,
    tokenBalance,
    isCorrectNetwork,
    isLoading,
    denominationAssetAddress,
    denominationAssetSymbol,
    tokenDecimals,
  } = useEnzymeVault(vaultAddress);

  // Force refresh of data after successful transactions
  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1);
    // Delay to allow blockchain state to update
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-[#0D1321] border border-[#253040] rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-6 border-b border-[#253040]">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E4EFFF]">Your AI-Powered Vault</h2>
              <p className="text-[#8ba1bc] text-sm sm:text-base">Manage your existing vault and investment strategy</p>
            </div>
          </div>
          <button
            onClick={onCreateNewVault}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                     text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 
                     flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Vault
          </button>
        </div>

        {/* Vault Address Info */}
        <div className="bg-gradient-to-r from-[#0A0F1A] to-[#111827] border border-[#253040] rounded-lg p-5 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-grow">
              <div className="text-sm font-medium text-blue-400 mb-2">Vault Address</div>
              <div className="font-mono text-sm text-[#E4EFFF] break-all bg-[#0d131f] p-3 rounded border border-[#1a2234]">
                {vaultAddress}
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 flex items-center">
              <a
                href={`https://arbiscan.io/address/${vaultAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg px-4 py-2 transition-colors duration-200 flex items-center gap-2"
              >
                <span>View on Arbiscan</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[#8ba1bc] text-lg">Loading your vault data...</p>
            <p className="text-[#6b7280] text-sm mt-2">This may take a few moments</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vault Statistics */}
            {vaultData && (
              <VaultStats
                vaultData={vaultData}
                userPosition={userPosition}
                denominationAssetSymbol={denominationAssetSymbol}
                isLoading={isLoading}
              />
            )}

            {/* Vault Details */}
            {vaultData && (
              <div className="bg-gradient-to-r from-[#0A0F1A] to-[#111827] border border-[#253040] rounded-lg p-6 shadow-lg mb-8">
                <h3 className="text-lg font-medium text-[#E4EFFF] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vault Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                  <div className="bg-[#0d131f] p-4 rounded-lg border border-[#1a2234]">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-[#AAC9FA] font-medium">Comptroller</span>
                    </div>
                    <div className="font-mono text-xs p-3 bg-[#0A0F1A] border border-[#253040] rounded break-all text-[#AAC9FA]">
                      {vaultData.comptroller}
                    </div>
                  </div>
                  <div className="bg-[#0d131f] p-4 rounded-lg border border-[#1a2234]">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#AAC9FA] font-medium">Denomination Asset</span>
                    </div>
                    <div className="font-mono text-xs p-3 bg-[#0A0F1A] border border-[#253040] rounded break-all text-[#AAC9FA]">
                      {denominationAssetAddress} 
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        {denominationAssetSymbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Forms */}
            {isCorrectNetwork && vaultData && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Deposit Form */}
                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-5 shadow-lg">
                  <DepositForm
                  vaultAddress={vaultAddress as `0x${string}`}
                  denominationAssetAddress={denominationAssetAddress as `0x${string}`}
                  tokenBalance={tokenBalance}
                  tokenDecimals={tokenDecimals}
                  denominationAssetSymbol={denominationAssetSymbol}
                  comptrollerAddress={vaultData.comptroller}
                  onSuccess={handleTransactionSuccess}
                />
                </div>

                {/* Withdraw Form */}
                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-5 shadow-lg">
                <WithdrawForm
                  vaultAddress={vaultAddress as `0x${string}`}
                  userPosition={userPosition}
                  denominationAssetSymbol={denominationAssetSymbol}
                  sharePrice={vaultData.sharePrice}
                  onSuccess={handleTransactionSuccess}
                />
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="border-t border-[#253040] pt-6 mt-8">
              <div className="text-center">
                <p className="text-[#8ba1bc] text-sm">
                  Powered by Enzyme Protocol and AI Trading Agents
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExistingVaultView; 