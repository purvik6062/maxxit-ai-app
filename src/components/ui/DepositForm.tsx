"use client";

import { useState, useEffect } from 'react';
import { useEnzymeDeposit, useTokenApproval } from '@/hooks/useEnzymeVault';
import { useEthers } from '@/providers/EthersProvider';
import { debugEnzymeVault, logEnzymeDebugInfo, logDepositRecommendations } from '@/utils/enzymeDebug';

interface TokenBalance {
  balance: string;
  allowance: string;
  decimals: number;
  symbol: string;
}

interface DepositFormProps {
  vaultAddress: `0x${string}`;
  denominationAssetAddress: `0x${string}`;
  tokenBalance: TokenBalance | null;
  tokenDecimals: number;
  denominationAssetSymbol: string;
  comptrollerAddress?: string;
  onSuccess?: () => void;
}

export function DepositForm({
  vaultAddress,
  denominationAssetAddress,
  tokenBalance,
  tokenDecimals,
  denominationAssetSymbol,
  comptrollerAddress,
  onSuccess
}: DepositFormProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const { provider, account } = useEthers();

  const {
    deposit,
    isPending: isDepositPending,
    isConfirming: isDepositConfirming,
    isSuccess: isDepositSuccess,
    error: depositError
  } = useEnzymeDeposit();

  const {
    approve,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
    error: approveError
  } = useTokenApproval();

  // Check if approval is needed when amount changes
  useEffect(() => {
    if (depositAmount && tokenBalance) {
      const amount = parseFloat(depositAmount);
      const allowance = parseFloat(tokenBalance.allowance);
      setNeedsApproval(amount > allowance);
    } else {
      setNeedsApproval(false);
    }
  }, [depositAmount, tokenBalance]);

  // Handle successful transactions
  useEffect(() => {
    if (isDepositSuccess || isApproveSuccess) {
      if (isDepositSuccess) {
        setDepositAmount('');
        onSuccess?.();
      }
    }
  }, [isDepositSuccess, isApproveSuccess, onSuccess]);

  // Debug function
  const handleDebug = async () => {
    if (!provider || !account || !depositAmount) {
      console.log('Missing required data for debug');
      return;
    }
    
    try {
      const debugInfo = await debugEnzymeVault(
        provider,
        vaultAddress,
        account,
        depositAmount,
        tokenDecimals
      );
      logEnzymeDebugInfo(debugInfo);
      logDepositRecommendations(debugInfo);
    } catch (error) {
      console.error('Debug failed:', error);
    }
  };

  const handleApprove = async () => {
    if (!depositAmount || !tokenBalance || !comptrollerAddress) {
      console.error('Missing required data for approval');
      return;
    }
    
    try {
      await approve(
        denominationAssetAddress,
        comptrollerAddress,
        depositAmount,
        tokenDecimals
      );
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    try {
      await deposit(vaultAddress, depositAmount, tokenDecimals);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const setMaxAmount = () => {
    if (tokenBalance) {
      setDepositAmount(tokenBalance.balance);
    }
  };

  const isValidAmount = () => {
    if (!depositAmount || !tokenBalance) return false;
    const amount = parseFloat(depositAmount);
    const balance = parseFloat(tokenBalance.balance);
    return amount > 0 && amount <= balance;
  };

  if (!tokenBalance) {
    return (
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6">
        <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Deposit Funds</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-[#8ba1bc]">Loading balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
      <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Deposit Funds</h3>
      
      <div className="space-y-4">
        {/* Balance Info */}
        <div className="bg-[#1a2234] border border-[rgba(206,212,218,0.1)] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8ba1bc]">Available Balance:</span>
            <span className="font-medium text-[#AAC9FA]">
              {parseFloat(tokenBalance.balance).toFixed(4)} {denominationAssetSymbol}
            </span>
          </div>
          {tokenBalance.allowance !== '0' && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-[#8ba1bc]">Current Allowance:</span>
              <span className="font-medium text-green-400">
                {parseFloat(tokenBalance.allowance).toFixed(4)} {denominationAssetSymbol}
              </span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-[#8ba1bc] mb-2">
            Deposit Amount
          </label>
          <div className="relative">
            <input
              id="deposit-amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="block w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] placeholder-[#818791] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="absolute inset-y-0 right-0 px-3 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(depositError || approveError) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <div className="text-sm text-red-400">
              {depositError?.message || approveError?.message || 'Transaction failed'}
            </div>
          </div>
        )}

        {/* Success Messages */}
        {(isDepositSuccess || isApproveSuccess) && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
            <div className="text-sm text-green-400">
              {isDepositSuccess && 'Deposit successful! Your shares will be updated shortly.'}
              {isApproveSuccess && !isDepositSuccess && `${denominationAssetSymbol} approval to ComptrollerProxy successful! You can now deposit.`}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && depositAmount && tokenBalance && (
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium text-gray-300">Debug Information</h4>
              <button
                onClick={handleDebug}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Debug Vault
              </button>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Vault Address: {vaultAddress}</div>
              <div>ComptrollerProxy: {comptrollerAddress || 'Loading...'}</div>
              <div>Denomination Asset: {denominationAssetAddress}</div>
              <div>Deposit Amount: {depositAmount} {denominationAssetSymbol}</div>
              <div>Token Decimals: {tokenDecimals}</div>
              <div>Available Balance: {tokenBalance.balance} {denominationAssetSymbol}</div>
              <div>Allowance (ComptrollerProxy): {tokenBalance.allowance} {denominationAssetSymbol}</div>
              <div>Needs Approval: {needsApproval ? 'Yes' : 'No'}</div>
              <div>Amount Valid: {isValidAmount() ? 'Yes' : 'No'}</div>
              <div className="text-yellow-400 mt-2">
                Note: Approvals must be made to ComptrollerProxy, not vault
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {needsApproval && (
            <button
              onClick={handleApprove}
              disabled={!isValidAmount() || isApprovePending || isApproveConfirming}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {isApprovePending
                ? 'Approving...'
                : isApproveConfirming
                ? 'Confirming...'
                : `Approve ${denominationAssetSymbol}`
              }
            </button>
          )}
          
          <button
            onClick={handleDeposit}
            disabled={
              !isValidAmount() || 
              needsApproval || 
              isDepositPending || 
              isDepositConfirming ||
              isApprovePending ||
              isApproveConfirming
            }
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
          >
            {isDepositPending
              ? 'Depositing...'
              : isDepositConfirming
              ? 'Confirming...'
              : 'Deposit'
            }
          </button>
        </div>

        {/* Transaction Hashes */}
        {(isApproveSuccess || isDepositSuccess) && (
          <div className="mt-4 text-xs">
            {isApproveSuccess && (
              <div className="mb-2">
                <span className="text-[#8ba1bc]">Approve transaction completed - </span>
                <a
                  href="https://arbiscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  View on Arbiscan
                </a>
              </div>
            )}
            {isDepositSuccess && (
              <div>
                <span className="text-[#8ba1bc]">Deposit transaction completed - </span>
                <a
                  href="https://arbiscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  View on Arbiscan
                </a>
              </div>
            )}
          </div>
        )}

        {/* Amount Preview */}
        {isValidAmount() && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-md p-3">
            <div className="text-sm text-cyan-300">
              <p>You will receive approximately:</p>
              <p className="font-medium text-cyan-200 mt-1">
                {/* Simplified calculation assuming 1:1 ratio for demonstration */}
                {parseFloat(depositAmount).toFixed(4)} vault shares
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 