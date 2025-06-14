"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToArbitrum: () => Promise<void>;
  isCorrectNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Arbitrum One chain ID
  const ARBITRUM_CHAIN_ID = 42161;
  const isCorrectNetwork = chainId === ARBITRUM_CHAIN_ID;

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(walletSigner);
      setChainId(Number(network.chainId));

      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    toast.success("Wallet disconnected");
  };

  const switchToArbitrum = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa4b1" }], // Arbitrum One mainnet (42161 in hex)
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa4b1",
              chainName: "Arbitrum One",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://arb1.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://arbiscan.io"],
            },
          ],
        });
      }
      throw error;
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const walletSigner = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            setAccount(accounts[0]);
            setProvider(browserProvider);
            setSigner(walletSigner);
            setChainId(Number(network.chainId));
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  const value: WalletContextType = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToArbitrum,
    isCorrectNetwork,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

interface WalletConnectorProps {
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  className = "",
}) => {
  const { account, isConnecting, connectWallet, disconnectWallet, chainId, switchToArbitrum, isCorrectNetwork } =
    useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 137:
        return "Polygon";
      case 42161:
        return "Arbitrum One";
      case 8453:
        return "Base";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {/* Network Status */}
          <div className={`px-4 py-2 rounded-lg border ${
            isCorrectNetwork 
              ? "bg-green-100 border-green-300 text-green-800"
              : "bg-red-100 border-red-300 text-red-800"
          }`}>
            <div className="text-sm font-medium">
              Connected: {formatAddress(account)}
            </div>
            {chainId && (
              <div className={`text-xs ${isCorrectNetwork ? "text-green-600" : "text-red-600"}`}>
                Network: {getNetworkName(chainId)}
                {!isCorrectNetwork && " (❌ Unsupported)"}
              </div>
            )}
          </div>

          {/* Network Switch Warning */}
          {!isCorrectNetwork && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
              <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Wrong Network
              </div>
              <p className="text-yellow-700 text-xs mb-3">
                This application only works on Arbitrum One. Please switch to continue.
              </p>
              <button
                onClick={switchToArbitrum}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
              >
                Switch to Arbitrum One
              </button>
            </div>
          )}

          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
