import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  WalletConnection,
  CryptoCurrency,
  PaymentResult,
  getActiveNetworkConfig,
  getSupportedCryptosForNetwork,
  PAYMENT_WALLET_ADDRESS,
  connectWallet,
  isMetaMaskInstalled,
  calculateCryptoAmount,
  processCryptoPayment,
  verifyTransaction,
  getTokenBalance,
  formatCryptoAmount,
  NetworkConfig,
} from "@/lib/crypto";

export interface CryptoPaymentState {
  // Wallet state
  isWalletConnected: boolean;
  walletConnection: WalletConnection | null;
  isConnecting: boolean;
  currentNetwork: NetworkConfig | null;

  // Payment state
  supportedCryptos: CryptoCurrency[];
  selectedCrypto: CryptoCurrency | null;
  cryptoAmount: string;
  cryptoPrice: number;
  isCalculating: boolean;

  // Transaction state
  isProcessing: boolean;
  paymentResult: PaymentResult | null;
  isVerifying: boolean;
  verificationResult: { confirmed: boolean; confirmations: number } | null;

  // Error state
  error: string | null;

  // Balances
  balances: { [symbol: string]: string };
  isLoadingBalances: boolean;
}

export interface CryptoPaymentActions {
  connectWalletAction: () => Promise<void>;
  disconnectWallet: () => void;
  selectCrypto: (crypto: CryptoCurrency) => void;
  calculateAmount: (usdAmount: number) => Promise<void>;
  processPayment: (usdAmount: number) => Promise<void>;
  verifyPayment: (transactionHash: string) => Promise<void>;
  clearError: () => void;
  resetPayment: () => void;
  refreshBalances: () => Promise<void>;
}

const initialNetworkConfig = getActiveNetworkConfig();
const initialSupportedCryptos =
  getSupportedCryptosForNetwork(initialNetworkConfig);

const initialState: CryptoPaymentState = {
  isWalletConnected: false,
  walletConnection: null,
  isConnecting: false,
  currentNetwork: initialNetworkConfig,
  supportedCryptos: initialSupportedCryptos,
  selectedCrypto: null,
  cryptoAmount: "",
  cryptoPrice: 0,
  isCalculating: false,
  isProcessing: false,
  paymentResult: null,
  isVerifying: false,
  verificationResult: null,
  error: null,
  balances: {},
  isLoadingBalances: false,
};

export const useCryptoPayment = (): CryptoPaymentState &
  CryptoPaymentActions => {
  const [state, setState] = useState<CryptoPaymentState>(initialState);

  const connectWalletAction = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const connection = await connectWallet();
      const currentNetworkCryptos = getSupportedCryptosForNetwork(
        connection.networkConfig
      );
      setState((prev) => ({
        ...prev,
        isWalletConnected: true,
        walletConnection: connection,
        isConnecting: false,
        currentNetwork: connection.networkConfig,
        supportedCryptos: currentNetworkCryptos,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isWalletConnected: false,
        walletConnection: null,
        isConnecting: false,
        error: error.message,
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    const activeNetConfig = getActiveNetworkConfig();
    const activeCryptos = getSupportedCryptosForNetwork(activeNetConfig);
    setState((prev) => ({
      ...initialState,
      currentNetwork: activeNetConfig,
      supportedCryptos: activeCryptos,
      isWalletConnected: false,
      walletConnection: null,
    }));
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!state.walletConnection) {
      console.log("refreshBalances: No wallet connection, skipping.");
      return;
    }
    console.log(
      "refreshBalances: Starting for network:",
      state.walletConnection.networkConfig.chainName
    );
    setState((prev) => ({ ...prev, isLoadingBalances: true, error: null }));
    const { provider, address, networkConfig } = state.walletConnection;
    const currentSupportedCryptos =
      getSupportedCryptosForNetwork(networkConfig);

    try {
      const newBalances: { [symbol: string]: string } = {};
      const nativeBalanceRaw = await provider.getBalance(address);
      newBalances[networkConfig.nativeCurrency.symbol] = ethers.formatUnits(
        nativeBalanceRaw,
        networkConfig.nativeCurrency.decimals
      );

      for (const crypto of currentSupportedCryptos) {
        if (crypto.contractAddress && networkConfig.tokens[crypto.symbol]) {
          const balance = await getTokenBalance(
            crypto.contractAddress,
            address,
            provider
          );
          newBalances[crypto.symbol] = balance;
        }
      }
      console.log("refreshBalances: Balances fetched:", newBalances);
      setState((prev) => ({
        ...prev,
        balances: newBalances,
        isLoadingBalances: false,
      }));
    } catch (error: any) {
      console.error("Error refreshing balances:", error);
      setState((prev) => ({
        ...prev,
        isLoadingBalances: false,
        error: `Failed to refresh balances: ${error.message}`,
      }));
    }
  }, [state.walletConnection]);

  useEffect(() => {
    if (state.walletConnection) {
      console.log(
        "Network/WalletConnection changed, updating UI and balances for:",
        state.walletConnection.networkConfig.chainName
      );
      const networkConfig = state.walletConnection.networkConfig;
      const cryptos = getSupportedCryptosForNetwork(networkConfig);
      if (
        state.currentNetwork?.chainId !== networkConfig.chainId ||
        state.supportedCryptos.length !== cryptos.length
      ) {
        setState((prev) => ({
          ...prev,
          currentNetwork: networkConfig,
          supportedCryptos: cryptos,
          selectedCrypto: null,
          cryptoAmount: "",
          cryptoPrice: 0,
          balances: {},
        }));
      }
      refreshBalances();
    } else {
      console.log(
        "No wallet connection, ensuring UI reflects default network."
      );
      const activeNetConfig = getActiveNetworkConfig();
      const activeCryptos = getSupportedCryptosForNetwork(activeNetConfig);
      if (
        state.currentNetwork?.chainId !== activeNetConfig.chainId ||
        state.supportedCryptos.length === 0
      ) {
        setState((prev) => ({
          ...initialState,
          currentNetwork: activeNetConfig,
          supportedCryptos: activeCryptos,
        }));
      }
    }
  }, [state.walletConnection?.networkConfig.chainId, refreshBalances]);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (
            accounts &&
            accounts.length > 0 &&
            !state.isWalletConnected &&
            !state.isConnecting
          ) {
            console.log(
              "Previously connected account detected. User can click connect to re-initiate."
            );
          }
        } catch (error) {
          console.log(
            "Passive check for pre-existing wallet connection failed:",
            error
          );
        }
      }
    };
    checkWalletConnection();
  }, []);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (ethereum && typeof ethereum.on === "function") {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("MetaMask accounts changed:", accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWalletAction();
        }
      };

      const handleChainChanged = (_chainId: string) => {
        console.log("MetaMask chain changed to:", _chainId);
        connectWalletAction();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
        ethereum.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [connectWalletAction, disconnectWallet]);

  const selectCrypto = useCallback((crypto: CryptoCurrency) => {
    setState((prev) => ({
      ...prev,
      selectedCrypto: crypto,
      cryptoAmount: "",
      cryptoPrice: 0,
      error: null,
    }));
  }, []);

  const calculateAmount = useCallback(
    async (usdAmount: number) => {
      if (!state.selectedCrypto) {
        setState((prev) => ({
          ...prev,
          error: "Please select a cryptocurrency first",
        }));
        return;
      }

      setState((prev) => ({ ...prev, isCalculating: true, error: null }));

      try {
        const { cryptoAmount, price } = await calculateCryptoAmount(
          usdAmount,
          state.selectedCrypto
        );
        setState((prev) => ({
          ...prev,
          cryptoAmount,
          cryptoPrice: price,
          isCalculating: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isCalculating: false,
          error: error.message,
        }));
      }
    },
    [state.selectedCrypto]
  );

  const processPayment = useCallback(
    async (usdAmount: number) => {
      if (!state.walletConnection || !state.selectedCrypto) {
        setState((prev) => ({
          ...prev,
          error: "Wallet not connected or cryptocurrency not selected",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        error: null,
        paymentResult: null,
      }));

      try {
        const paymentRequest = {
          amount: usdAmount,
          currency: state.selectedCrypto,
          recipientAddress: PAYMENT_WALLET_ADDRESS,
        };

        const result = await processCryptoPayment(
          paymentRequest,
          state.walletConnection
        );

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          paymentResult: result,
          error: result.success ? null : result.error || "Payment failed",
        }));

        if (result.success && result.transactionHash) {
          await verifyPayment(result.transactionHash);
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: error.message,
        }));
      }
    },
    [state.walletConnection, state.selectedCrypto]
  );

  const verifyPayment = useCallback(
    async (transactionHash: string) => {
      if (!state.walletConnection) return;

      setState((prev) => ({ ...prev, isVerifying: true }));

      try {
        const result = await verifyTransaction(
          transactionHash,
          state.walletConnection.provider
        );
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          verificationResult: result,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: error.message,
        }));
      }
    },
    [state.walletConnection]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetPayment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCrypto: null,
      cryptoAmount: "",
      cryptoPrice: 0,
      paymentResult: null,
      verificationResult: null,
      error: null,
    }));
  }, []);

  return {
    ...state,
    connectWalletAction,
    disconnectWallet,
    selectCrypto,
    calculateAmount,
    processPayment,
    verifyPayment,
    clearError,
    resetPayment,
    refreshBalances,
  };
};
