"use client";

import { useState, useEffect, useCallback } from 'react';
import { useEnzymeUniswapV3Swap } from '@/hooks/useEnzymeVault';
import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import {
  ENZYME_ARBITRUM_ADDRESSES,
  TOKEN_DECIMALS
} from '@/contracts/enzymeContracts';
import {
  getUniswapV3Quote,
  formatTokenAmount,
  type QuoteResult,
  UNISWAP_V3_FEE_TIERS,
  UNISWAP_V3_COMMON_PAIRS
} from '@/utils/uniswapV3Utils';

interface SwapFormProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
}

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

const AVAILABLE_TOKENS: TokenInfo[] = [
  { symbol: 'USDC', address: ENZYME_ARBITRUM_ADDRESSES.USDC, decimals: TOKEN_DECIMALS.USDC },
  { symbol: 'ARB', address: ENZYME_ARBITRUM_ADDRESSES.ARB, decimals: TOKEN_DECIMALS.ARB },
  { symbol: 'WETH', address: ENZYME_ARBITRUM_ADDRESSES.WETH, decimals: TOKEN_DECIMALS.WETH },
];

export function SwapForm({ comptrollerAddress, onSuccess }: SwapFormProps) {
  const [fromToken, setFromToken] = useState<TokenInfo>(AVAILABLE_TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(AVAILABLE_TOKENS[1]);
  const [swapAmount, setSwapAmount] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState('1.0'); // 1%
  const [customFeeTier, setCustomFeeTier] = useState<number>(UNISWAP_V3_FEE_TIERS.MEDIUM);
  const [useCustomPath, setUseCustomPath] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const { address: account } = useAccount();
  const chainId = useChainId();

  // Create ethers provider for contract interactions
  const provider = new ethers.JsonRpcProvider(
    chainId === 42161
      ? 'https://arb1.arbitrum.io/rpc'
      : 'https://sepolia-rollup.arbitrum.io/rpc'
  );

  const {
    executeSwap,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  } = useEnzymeUniswapV3Swap();

  // Handle successful transactions
  useEffect(() => {
    if (isSuccess) {
      setSwapAmount('');
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  const getRecommendedFeeTier = (from: TokenInfo, to: TokenInfo): number => {
    const pairKey = `${from.symbol}_${to.symbol}` as keyof typeof UNISWAP_V3_COMMON_PAIRS;
    const reversePairKey = `${to.symbol}_${from.symbol}` as keyof typeof UNISWAP_V3_COMMON_PAIRS;

    if (UNISWAP_V3_COMMON_PAIRS[pairKey]) {
      return UNISWAP_V3_COMMON_PAIRS[pairKey].fee;
    } else if (UNISWAP_V3_COMMON_PAIRS[reversePairKey]) {
      return UNISWAP_V3_COMMON_PAIRS[reversePairKey].fee;
    }

    // Default to medium fee tier
    return UNISWAP_V3_FEE_TIERS.MEDIUM;
  };

  const calculateMinimumReceived = (): string => {
    if (!swapAmount) return '0';

    // If we have a quote, use it with slippage
    if (quote) {
      const slippage = parseFloat(slippageTolerance);
      const minReceived = parseFloat(quote.amountOutFormatted) * (1 - slippage / 100);
      return minReceived.toFixed(6);
    }

    // Fallback to simple 1:1 estimation for demo purposes
    const amount = parseFloat(swapAmount);
    const slippage = parseFloat(slippageTolerance) / 100;
    const minReceived = amount * (1 - slippage);

    return minReceived.toFixed(6);
  };

  // Get quote from Uniswap when parameters change
  const fetchQuote = useCallback(async () => {
    if (!swapAmount || !provider || parseFloat(swapAmount) <= 0) {
      setQuote(null);
      return;
    }

    try {
      setQuoteLoading(true);
      setQuoteError(null);

      const feeTier = useCustomPath ? customFeeTier : getRecommendedFeeTier(fromToken, toToken);

      console.log('Fetching quote with params:', {
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: feeTier,
        amountIn: swapAmount,
        decimalsIn: fromToken.decimals,
        decimalsOut: toToken.decimals,
      });

      const quoteResult = await getUniswapV3Quote(provider, {
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: feeTier,
        amountIn: swapAmount,
        decimalsIn: fromToken.decimals,
        decimalsOut: toToken.decimals,
      });

      console.log('Quote result:', quoteResult);
      setQuote(quoteResult);
    } catch (error) {
      console.error('Failed to fetch quote:', error);

      // Provide more specific error messages based on the error
      let errorMessage = 'Failed to fetch quote';

      if (error instanceof Error) {
        if (error.message.includes('no pool found') || error.message.includes('insufficient liquidity')) {
          errorMessage = 'No liquidity pool found for this token pair with the selected fee tier';
        } else if (error.message.includes('CALL_EXCEPTION')) {
          errorMessage = 'Quote calculation failed. The pool might have limited liquidity or unusual pricing';
        } else {
          errorMessage = error.message;
        }
      }

      setQuoteError(errorMessage);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [swapAmount, provider, fromToken, toToken, useCustomPath, customFeeTier]);

  // Fetch quote when relevant parameters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuote();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [fetchQuote]);

  const handleSwap = async () => {
    if (!swapAmount || !comptrollerAddress) return;

    try {
      // Clear any previous errors
      setQuoteError(null);

      const feeTier = useCustomPath ? customFeeTier : getRecommendedFeeTier(fromToken, toToken);

      // Create swap path (direct path for now)
      const pathAddresses = [fromToken.address, toToken.address];
      const pathFees = [feeTier];

      const minIncomingAmount = calculateMinimumReceived();

      console.log('Executing swap with parameters:', {
        comptrollerAddress,
        pathAddresses,
        pathFees,
        swapAmount,
        minIncomingAmount,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol
      });

      // Set a loading state to provide user feedback
      setQuoteLoading(true);

      await executeSwap(
        comptrollerAddress,
        pathAddresses,
        pathFees,
        swapAmount,
        minIncomingAmount,
        fromToken.decimals,
        toToken.decimals
      );

      // If the swap is successful, we clear the swap amount to prevent double submission
      setSwapAmount('');
    } catch (error) {
      console.error('Swap initiation failed:', error);

      // Show a specific error message based on the error
      let errorMessage = 'Swap failed. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected in your wallet.';
        } else if (error.message.includes('insufficient liquidity')) {
          errorMessage = 'Insufficient liquidity in the pool for this swap.';
        } else if (error.message.includes('slippage')) {
          errorMessage = 'Price impact too high. Try increasing slippage tolerance.';
        } else if (error.message.includes('Invalid "to" address')) {
          errorMessage = 'Configuration error with the Enzyme integration addresses.';
        } else if (error.message.includes('Invalid response from Enzyme SDK')) {
          errorMessage = 'The Enzyme SDK returned an invalid response. This might be due to an SDK version mismatch.';
        } else if (error.message.includes('Failed to execute swap')) {
          errorMessage = 'Transaction failed. Your vault may not have permission to execute this swap.';
        } else if (error.message.includes('missing "to" address')) {
          errorMessage = 'Transaction creation failed. Please check that your vault is properly configured.';
        } else if (error.message.includes('gas estimation failed') || error.message.includes('gas required exceeds allowance')) {
          errorMessage = 'The transaction would fail. This might be due to insufficient gas or vault restrictions.';
        } else if (error.message.includes('Path must contain')) {
          errorMessage = 'Invalid swap path. Please try a different token pair.';
        } else if (error.message.includes('CALL_EXCEPTION')) {
          errorMessage = 'Transaction would fail on-chain. The pool might have insufficient liquidity or your vault has restrictions.';
        } else {
          // Include the actual error message for debugging
          errorMessage = `Swap failed: ${error.message}`;
        }
      }

      setQuoteError(errorMessage);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleTokenSwitch = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const isValidAmount = () => {
    if (!swapAmount) return false;
    const amount = parseFloat(swapAmount);
    return amount > 0;
  };

  return (
    <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
      <h3 className="text-lg font-medium text-[#AAC9FA] mb-6">Swap Tokens (Manager Only)</h3>

      <div className="space-y-6">
        {/* From Token */}
        <div>
          <label className="block text-sm font-medium text-[#8ba1bc] mb-2">
            From
          </label>
          <div className="relative">
            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const selected = AVAILABLE_TOKENS.find(t => t.symbol === e.target.value);
                if (selected && selected.symbol !== toToken.symbol) {
                  setFromToken(selected);
                }
              }}
              className="w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
            >
              {AVAILABLE_TOKENS.filter(token => token.symbol !== toToken.symbol).map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleTokenSwitch}
            className="p-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-full text-[#AAC9FA] hover:bg-[#2a3244] hover:border-cyan-500/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div>
          <label className="block text-sm font-medium text-[#8ba1bc] mb-2">
            To
          </label>
          <div className="relative">
            <select
              value={toToken.symbol}
              onChange={(e) => {
                const selected = AVAILABLE_TOKENS.find(t => t.symbol === e.target.value);
                if (selected && selected.symbol !== fromToken.symbol) {
                  setToToken(selected);
                }
              }}
              className="w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
            >
              {AVAILABLE_TOKENS.filter(token => token.symbol !== fromToken.symbol).map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="swap-amount" className="block text-sm font-medium text-[#8ba1bc] mb-2">
            Amount to Swap
          </label>
          <input
            id="swap-amount"
            type="number"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="any"
            className="block w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] placeholder-[#818791] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Slippage Tolerance */}
        <div>
          <label htmlFor="slippage" className="block text-sm font-medium text-[#8ba1bc] mb-2">
            Slippage Tolerance (%)
          </label>
          <input
            id="slippage"
            type="number"
            value={slippageTolerance}
            onChange={(e) => setSlippageTolerance(e.target.value)}
            placeholder="1.0"
            min="0.1"
            max="50"
            step="0.1"
            className="block w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] placeholder-[#818791] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-[rgba(206,212,218,0.15)] pt-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="custom-path"
              checked={useCustomPath}
              onChange={(e) => setUseCustomPath(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="custom-path" className="text-sm text-[#8ba1bc]">
              Use custom fee tier
            </label>
          </div>

          {useCustomPath && (
            <div>
              <label className="block text-sm font-medium text-[#8ba1bc] mb-2">
                Fee Tier (basis points)
              </label>
              <select
                value={customFeeTier}
                onChange={(e) => setCustomFeeTier(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
              >
                <option value={UNISWAP_V3_FEE_TIERS.LOWEST}>100 (0.01%)</option>
                <option value={UNISWAP_V3_FEE_TIERS.LOW}>500 (0.05%)</option>
                <option value={UNISWAP_V3_FEE_TIERS.MEDIUM}>3000 (0.30%)</option>
                <option value={UNISWAP_V3_FEE_TIERS.HIGH}>10000 (1.00%)</option>
              </select>
            </div>
          )}
        </div>

        {/* Swap Preview */}
        {isValidAmount() && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-md p-4">
            <div className="text-sm text-cyan-300 space-y-2">
              <div className="flex justify-between">
                <span>You're swapping:</span>
                <span className="font-medium">{swapAmount} {fromToken.symbol}</span>
              </div>

              {quoteLoading ? (
                <div className="flex justify-between items-center">
                  <span>Expected to receive:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-cyan-400">Loading...</span>
                  </div>
                </div>
              ) : quote ? (
                <>
                  <div className="flex justify-between">
                    <span>Expected to receive:</span>
                    <span className="font-medium">{formatTokenAmount(quote.amountOut, toToken.decimals)} {toToken.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum received:</span>
                    <span className="font-medium">{calculateMinimumReceived()} {toToken.symbol}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Minimum received:</span>
                  <span className="font-medium">{calculateMinimumReceived()} {toToken.symbol}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Fee tier:</span>
                <span className="font-medium">
                  {(useCustomPath ? customFeeTier : getRecommendedFeeTier(fromToken, toToken)) / 100}%
                </span>
              </div>

              {quote && (
                <div className="flex justify-between">
                  <span>Estimated gas:</span>
                  <span className="font-medium text-xs">{parseInt(quote.gasEstimate).toLocaleString()}</span>
                </div>
              )}
            </div>

            {quoteError && (
              <div className="mt-2 text-xs text-yellow-300">
                ⚠️ Could not fetch quote: {quoteError}
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <div className="text-sm text-red-400">
              {error.message}
            </div>
          </div>
        )}

        {/* Success Messages */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
            <div className="text-sm text-green-400">
              Swap successful! Transaction hash: {hash}
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={
            !isValidAmount() ||
            isPending ||
            isConfirming ||
            !account
          }
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
        >
          {isPending
            ? 'Initiating Swap...'
            : isConfirming
              ? 'Confirming...'
              : 'Execute Swap'
          }
        </button>

        {/* Transaction Hash */}
        {hash && (
          <div className="mt-4 text-xs">
            <span className="text-[#8ba1bc]">Transaction Hash: </span>
            <a
              href={`https://arbiscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline break-all"
            >
              {hash}
            </a>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
          <div className="text-sm text-yellow-300">
            <p className="font-medium mb-1">⚠️ Manager Function</p>
            <p>
              This swap function is only available to vault managers.
              Swaps will be executed using the vault's assets through the Enzyme Protocol integration with Uniswap V3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 