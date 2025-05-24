"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  Wallet,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useCryptoPayment } from "@/hooks/useCryptoPayment";
import {
  formatCryptoAmount,
  isMetaMaskInstalled,
  NetworkConfig,
  CryptoCurrency,
} from "@/lib/crypto";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionHash: string) => void;
  planName: string;
  planPrice: number;
  planCredits: string;
}

export default function CryptoPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  planName,
  planPrice,
  planCredits,
}: CryptoPaymentModalProps) {
  const {
    isWalletConnected,
    walletConnection,
    isConnecting,
    currentNetwork,
    supportedCryptos,
    selectedCrypto,
    cryptoAmount,
    cryptoPrice,
    isCalculating,
    isProcessing,
    paymentResult,
    isVerifying,
    verificationResult,
    error,
    balances,
    isLoadingBalances,
    connectWalletAction,
    disconnectWallet,
    selectCrypto,
    calculateAmount,
    processPayment,
    clearError,
    resetPayment,
    refreshBalances,
  } = useCryptoPayment();

  const [currentStep, setCurrentStep] = useState<
    "connect" | "select" | "confirm" | "processing" | "success" | "error"
  >("connect");
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Update step based on state
  useEffect(() => {
    if (!isWalletConnected) {
      setCurrentStep("connect");
    } else if (!selectedCrypto) {
      setCurrentStep("select");
    } else if (cryptoAmount && !isProcessing && !paymentResult) {
      setCurrentStep("confirm");
    } else if (isProcessing || isVerifying) {
      setCurrentStep("processing");
    } else if (paymentResult?.success) {
      setCurrentStep("success");
    } else if (error || paymentResult?.error) {
      setCurrentStep("error");
    }
  }, [
    isWalletConnected,
    selectedCrypto,
    cryptoAmount,
    isProcessing,
    isVerifying,
    paymentResult,
    error,
  ]);

  // Calculate crypto amount when crypto is selected or planPrice changes
  useEffect(() => {
    if (selectedCrypto && planPrice > 0) {
      calculateAmount(planPrice);
    }
  }, [selectedCrypto, planPrice, calculateAmount]);

  // Reset payment state when modal opens (not the entire hook state like currentNetwork)
  useEffect(() => {
    if (isOpen) {
      resetPayment(); // Resets selectedCrypto, cryptoAmount, paymentResult etc.
      clearError();
      if (isWalletConnected) {
        refreshBalances(); // Refresh balances for the currently connected network when modal opens
      }
    }
  }, [isOpen, resetPayment, clearError, isWalletConnected, refreshBalances]);

  const handleCryptoSelect = (crypto: CryptoCurrency) => {
    selectCrypto(crypto);
  };

  const handlePayment = async () => {
    await processPayment(planPrice);
  };

  const handleSuccess = () => {
    if (paymentResult?.transactionHash) {
      onSuccess(paymentResult.transactionHash);
    }
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;
  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
      style={{
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-gray-800/30 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Pay with Crypto
            </h2>
            <div className="text-md text-gray-300">
              {planName} Plan - ${planPrice.toFixed(2)} ({planCredits})
            </div>
            {currentNetwork && (
              <div
                className={`mt-1 text-xs px-2 py-0.5 inline-block rounded-full ${
                  currentNetwork.isTestnet
                    ? "bg-orange-500/20 text-orange-300"
                    : "bg-green-500/20 text-green-300"
                }`}
              >
                Network: {currentNetwork.chainName}
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {["connect", "select", "confirm", "processing"].map(
                (step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step
                          ? "bg-blue-500 text-white"
                          : index <
                            [
                              "connect",
                              "select",
                              "confirm",
                              "processing",
                            ].indexOf(currentStep)
                          ? "bg-green-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {index <
                      ["connect", "select", "confirm", "processing"].indexOf(
                        currentStep
                      ) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-8 h-0.5 ${
                          index <
                          [
                            "connect",
                            "select",
                            "confirm",
                            "processing",
                          ].indexOf(currentStep)
                            ? "bg-green-500"
                            : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Content based on current step */}
          <AnimatePresence mode="wait">
            {/* Step 1: Connect Wallet */}
            {currentStep === "connect" && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {!isMetaMaskInstalled() ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        MetaMask Required
                      </h3>
                      <p className="text-gray-300 mb-6">
                        You need MetaMask installed to pay with cryptocurrency.
                      </p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                      >
                        Install MetaMask
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Wallet className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Connect Your Wallet
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Please connect your wallet. The application is
                        configured for the{" "}
                        <strong className="text-sky-400">
                          {currentNetwork?.chainName || "default network"}
                        </strong>
                        . MetaMask will prompt you to switch or add the network
                        if necessary.
                      </p>
                      <button
                        onClick={connectWalletAction}
                        disabled={isConnecting}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wallet className="w-4 h-4 mr-2" />
                        )}
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Select Cryptocurrency */}
            {currentStep === "select" && walletConnection && currentNetwork && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Wallet Info */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium flex items-center">
                        Wallet Connected
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                            currentNetwork.isTestnet
                              ? "bg-orange-500/30 text-orange-300"
                              : "bg-green-500/30 text-green-300"
                          }`}
                        >
                          {currentNetwork.chainName}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm flex items-center">
                        {formatAddress(walletConnection.address)}
                        <button
                          onClick={() =>
                            copyToClipboard(walletConnection.address)
                          }
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          {copiedAddress ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={refreshBalances}
                      disabled={isLoadingBalances}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isLoadingBalances ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Cryptocurrency Selection */}
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
                    Select Cryptocurrency
                  </h3>
                  {supportedCryptos.length === 0 && !isLoadingBalances && (
                    <p className="text-center text-gray-400 py-4">
                      No supported cryptocurrencies found for the current
                      network ({currentNetwork.chainName}).
                    </p>
                  )}
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {supportedCryptos.map((crypto) => {
                      const balance = crypto.contractAddress
                        ? walletConnection.tokenBalances[crypto.symbol] || "0"
                        : walletConnection.balance;
                      const formattedBalance = formatCryptoAmount(
                        balance,
                        crypto.symbol
                      );

                      return (
                        <button
                          key={`${currentNetwork.chainId}-${crypto.symbol}`}
                          onClick={() => handleCryptoSelect(crypto)}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                            selectedCrypto?.symbol === crypto.symbol
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xl md:text-2xl mr-2 md:mr-3">
                              {crypto.icon}
                            </span>
                            <div className="text-left">
                              <div className="text-white font-medium text-sm md:text-base">
                                {crypto.name}
                                {crypto.contractAddress && (
                                  <span className="text-xs text-gray-500">
                                    ({currentNetwork.chainName.split(" ")[0]})
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-xs md:text-sm">
                                {crypto.symbol}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-xs md:text-sm">
                              {isLoadingBalances ? (
                                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                              ) : (
                                formattedBalance
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button
                    onClick={disconnectWallet}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm Payment - ensure planPrice is used */}
            {currentStep === "confirm" && selectedCrypto && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
                    Confirm Payment on {currentNetwork?.chainName}
                  </h3>
                </div>

                {/* Payment Details - ensure it uses planPrice passed to modal */}
                <div className="bg-gray-800/50 rounded-lg p-4 md:p-6 border border-gray-700 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="text-white">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price (USD):</span>
                    <span className="text-white font-semibold">
                      ${planPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency:</span>
                    <span className="text-white flex items-center">
                      <span className="mr-2 text-lg">
                        {selectedCrypto?.icon}
                      </span>
                      {selectedCrypto?.name} ({selectedCrypto?.symbol})
                    </span>
                  </div>
                  {isCalculating || !cryptoPrice ? (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Amount:</span>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exchange Rate:</span>
                        <span className="text-white">
                          1 {selectedCrypto?.symbol} ≈ ${cryptoPrice.toFixed(2)}{" "}
                          USD
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-3 mt-3">
                        <span className="text-gray-400 font-medium">
                          You Pay:
                        </span>
                        <span className="text-white font-bold text-lg">
                          {formatCryptoAmount(
                            cryptoAmount,
                            selectedCrypto?.symbol || ""
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Balance Check */}
                {selectedCrypto && walletConnection && (
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">
                      Your balance:{" "}
                      {isLoadingBalances ? (
                        <Loader2 className="w-3 h-3 inline animate-spin" />
                      ) : (
                        formatCryptoAmount(
                          selectedCrypto.contractAddress
                            ? walletConnection.tokenBalances[
                                selectedCrypto.symbol
                              ] || "0"
                            : walletConnection.balance,
                          selectedCrypto.symbol
                        )
                      )}
                    </div>
                    {!isLoadingBalances &&
                      parseFloat(
                        selectedCrypto.contractAddress
                          ? walletConnection.tokenBalances[
                              selectedCrypto.symbol
                            ] || "0"
                          : walletConnection.balance
                      ) < parseFloat(cryptoAmount) && (
                        <div className="text-red-400 text-sm mt-1 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Insufficient balance
                        </div>
                      )}
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      selectCrypto(null as any);
                      clearError();
                      setCurrentStep("select");
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={
                      isProcessing ||
                      isCalculating ||
                      !selectedCrypto ||
                      !walletConnection ||
                      !cryptoAmount ||
                      (!isLoadingBalances &&
                        parseFloat(
                          selectedCrypto.contractAddress
                            ? walletConnection.tokenBalances[
                                selectedCrypto.symbol
                              ] || "0"
                            : walletConnection.balance
                        ) < parseFloat(cryptoAmount))
                    }
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      `Pay with ${selectedCrypto?.symbol}`
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Processing - display network */}
            {currentStep === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isVerifying
                      ? "Verifying Transaction"
                      : "Processing Payment"}
                    {currentNetwork && (
                      <span className="text-sm text-gray-400">
                        {" "}
                        on {currentNetwork.chainName}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-300">
                    {isProcessing && !isVerifying
                      ? "Please confirm the transaction in your wallet..."
                      : "Waiting for blockchain confirmation..."}
                  </p>
                  {paymentResult?.transactionHash && (
                    <div className="mt-4">
                      <a
                        href={paymentResult.explorerUrl} // This should come from paymentResult
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300"
                      >
                        View on Explorer
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Success - display network and explorer link from paymentResult */}
            {currentStep === "success" && paymentResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Your payment on {walletConnection?.networkConfig.chainName}{" "}
                    has been processed.
                  </p>
                  {paymentResult.transactionHash && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">
                        Transaction Hash:
                      </div>
                      <div className="text-xs md:text-sm text-white font-mono bg-gray-800 p-2 rounded break-all">
                        {paymentResult.transactionHash}
                      </div>
                      {paymentResult.explorerUrl && (
                        <a
                          href={paymentResult.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View on Explorer{" "}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSuccess}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Error */}
            {currentStep === "error" && (error || paymentResult?.error) && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-gray-300 mb-4 break-words">
                    {error ||
                      paymentResult?.error ||
                      "An unknown error occurred. Please try again."}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      clearError();
                      resetPayment(); // Resets crypto selection, amounts, results
                      setCurrentStep(isWalletConnected ? "select" : "connect"); // Go back to select if wallet connected, else connect
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all text-sm md:text-base"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all text-sm md:text-base"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
  return createPortal(modalContent, document.body);
}
