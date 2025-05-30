"use client";

import { useState } from 'react';
import { ConnectButton } from '@/components/ui/ConnectButton';
import { useEnzymeVault } from '@/hooks/useEnzymeVault';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { VaultStats } from '@/components/ui/VaultStats';
import { DepositForm } from '@/components/ui/DepositForm';
import { WithdrawForm } from '@/components/ui/WithdrawForm';
import { SwapForm } from '@/components/ui/SwapForm';

export default function InvestEnzymePage() {
  const [, setRefreshKey] = useState(0);
  
  const {
    vaultAddress,
    vaultData,
    userPosition,
    tokenBalance,
    isCorrectNetwork,
    isLoading,
    isConnected,
    denominationAssetAddress,
    denominationAssetSymbol,
    tokenDecimals,
  } = useEnzymeVault();

  // Force refresh of data after successful transactions
  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1);
    // Delay to allow blockchain state to update
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!process.env.NEXT_PUBLIC_ENZYME_VAULT_ADDRESS) {
    return (
      <div className="min-h-screen bg-[#020617] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
            <p className="text-red-300">
              Please configure your Enzyme vault address in the environment variables.
              Check the ENZYME_ARBITRUM_SETUP.md file for setup instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <div className="bg-[#0D1321] border-b border-[rgba(206,212,218,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-[#AAC9FA]">Enzyme Vault</h1>
              <p className="mt-1 text-sm text-[#8ba1bc]">
                Manage your investments in the Enzyme Protocol vault
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Banner */}
        <NetworkBanner isCorrectNetwork={isCorrectNetwork} />

        {!isConnected ? (
          /* Connection Prompt */
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-[#8ba1bc]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[#AAC9FA]">Connect Your Wallet</h3>
            <p className="mt-1 text-sm text-[#8ba1bc]">
              Connect your wallet to view and manage your Enzyme vault position.
            </p>
            <div className="mt-6">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Vault Statistics */}
            <VaultStats
              vaultData={vaultData}
              userPosition={userPosition}
              denominationAssetSymbol={denominationAssetSymbol}
              isLoading={isLoading}
            />

            {/* Vault Address Info */}
            {vaultData && (
              <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
                <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Vault Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#8ba1bc]">Vault Address:</span>
                    <div className="font-mono text-xs mt-1 p-2 bg-[#1a2234] border border-[rgba(206,212,218,0.1)] rounded break-all text-[#AAC9FA]">
                      {vaultAddress}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8ba1bc]">Comptroller:</span>
                    <div className="font-mono text-xs mt-1 p-2 bg-[#1a2234] border border-[rgba(206,212,218,0.1)] rounded break-all text-[#AAC9FA]">
                      {vaultData.comptroller}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8ba1bc]">Denomination Asset:</span>
                    <div className="font-mono text-xs mt-1 p-2 bg-[#1a2234] border border-[rgba(206,212,218,0.1)] rounded break-all text-[#AAC9FA]">
                      {denominationAssetAddress} ({denominationAssetSymbol})
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8ba1bc]">Network:</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Arbitrum
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Forms */}
            {isCorrectNetwork && vaultData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deposit Form */}
                <DepositForm
                  vaultAddress={vaultAddress as `0x${string}`}
                  denominationAssetAddress={denominationAssetAddress as `0x${string}`}
                  tokenBalance={tokenBalance}
                  tokenDecimals={tokenDecimals}
                  denominationAssetSymbol={denominationAssetSymbol}
                  comptrollerAddress={vaultData.comptroller}
                  onSuccess={handleTransactionSuccess}
                />

                {/* Withdraw Form */}
                <WithdrawForm
                  vaultAddress={vaultAddress as `0x${string}`}
                  userPosition={userPosition}
                  denominationAssetSymbol={denominationAssetSymbol}
                  sharePrice={vaultData.sharePrice}
                  onSuccess={handleTransactionSuccess}
                />
              </div>
            )}

            {/* Manager Functions */}
            {isCorrectNetwork && vaultData && (
              <div className="space-y-8">
                <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Manager Functions</h3>
                  <p className="text-sm text-[#8ba1bc] mb-6">
                    These functions are available to vault managers for portfolio management and rebalancing.
                  </p>
                  
                  {/* Swap Form */}
                  <SwapForm
                    comptrollerAddress={vaultData.comptroller}
                    onSuccess={handleTransactionSuccess}
                  />
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-cyan-300 mb-4">About Enzyme Protocol</h3>
              <div className="prose prose-cyan text-sm">
                <p className="text-cyan-200">
                  Enzyme Protocol is a decentralized asset management infrastructure built on Ethereum and Arbitrum.
                  Your vault represents a managed portfolio that can hold and trade various DeFi assets.
                </p>
                <ul className="mt-4 text-cyan-200 list-disc list-inside space-y-1">
                  <li>Deposits mint vault shares proportional to your contribution</li>
                  <li>Withdrawals redeem shares for underlying assets</li>
                  <li>Share price reflects the vault&apos;s performance over time</li>
                  <li>All transactions are executed on-chain for full transparency</li>
                </ul>
                <p className="mt-4 text-cyan-200">
                  For more information, visit{' '}
                  <a
                    href="https://docs.enzyme.finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                  >
                    docs.enzyme.finance
                  </a>
                </p>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">
                    Investment Risk Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-200">
                    <p>
                      DeFi investments carry significant risks including smart contract vulnerabilities,
                      market volatility, and potential loss of funds. Only invest what you can afford to lose
                      and ensure you understand the risks involved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
