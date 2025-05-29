"use client";

import { useEthers } from '@/providers/EthersProvider';

export function ConnectButton() {
  const { account, isConnected, connectWallet, disconnect } = useEthers();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-3 py-2 rounded-md border border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 transform hover:scale-[1.02]"
    >
      Connect Wallet
    </button>
  );
} 