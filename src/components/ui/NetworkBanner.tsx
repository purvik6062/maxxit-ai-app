"use client";

import { useEthers } from '@/providers/EthersProvider';

interface NetworkBannerProps {
  isCorrectNetwork: boolean;
}

export function NetworkBanner({ isCorrectNetwork }: NetworkBannerProps) {
  const { isConnected, switchToArbitrum } = useEthers();

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToArbitrum();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-300">
              Wrong Network
            </h3>
            <p className="text-sm text-yellow-200">
              Please switch to Arbitrum network to use this vault.
            </p>
          </div>
        </div>
        <button
          onClick={handleSwitchNetwork}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]"
        >
          Switch to Arbitrum
        </button>
      </div>
    </div>
  );
} 