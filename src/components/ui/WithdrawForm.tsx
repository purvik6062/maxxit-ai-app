"use client";

import { useState, useEffect, useRef } from 'react';
import { useEnzymeWithdraw } from '@/hooks/useEnzymeVault';

interface UserPosition {
  shares: string;
  sharesBalance: string;
  assetValue: string;
  percentage: string;
}

interface WithdrawFormProps {
  vaultAddress: `0x${string}`;
  userPosition: UserPosition | null;
  denominationAssetSymbol: string;
  sharePrice: string;
  onSuccess?: () => void;
}

export function WithdrawForm({
  vaultAddress,
  userPosition,
  denominationAssetSymbol,
  sharePrice,
  onSuccess
}: WithdrawFormProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'shares' | 'value'>('value');
  
  // Ref to track if we've already handled success state
  const withdrawSuccessHandled = useRef(false);

  const {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error
  } = useEnzymeWithdraw();

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && !withdrawSuccessHandled.current) {
      withdrawSuccessHandled.current = true;
      setWithdrawAmount('');
      onSuccess?.();
    }
    
    // Reset flag when success state goes back to false
    if (!isSuccess && withdrawSuccessHandled.current) {
      withdrawSuccessHandled.current = false;
    }
  }, [isSuccess]); // Removed onSuccess from dependencies to prevent infinite loops

  const handleWithdraw = async () => {
    if (!withdrawAmount || !userPosition) return;
    
    try {
      let sharesToWithdraw: string;
      
      if (withdrawType === 'shares') {
        sharesToWithdraw = withdrawAmount;
      } else {
        // Convert value to shares
        const pricePerShare = parseFloat(sharePrice);
        const valueToWithdraw = parseFloat(withdrawAmount);
        sharesToWithdraw = (valueToWithdraw / pricePerShare).toString();
      }
      
      await withdraw(vaultAddress, sharesToWithdraw);
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  const setMaxAmount = () => {
    if (userPosition) {
      if (withdrawType === 'shares') {
        setWithdrawAmount(userPosition.shares);
      } else {
        setWithdrawAmount(userPosition.assetValue);
      }
    }
  };

  const isValidAmount = () => {
    if (!withdrawAmount || !userPosition) return false;
    const amount = parseFloat(withdrawAmount);
    
    if (withdrawType === 'shares') {
      const maxShares = parseFloat(userPosition.shares);
      return amount > 0 && amount <= maxShares;
    } else {
      const maxValue = parseFloat(userPosition.assetValue);
      return amount > 0 && amount <= maxValue;
    }
  };

  const getEstimatedOutput = () => {
    if (!withdrawAmount || !userPosition) return '';
    
    const amount = parseFloat(withdrawAmount);
    const pricePerShare = parseFloat(sharePrice);
    
    if (withdrawType === 'shares') {
      return (amount * pricePerShare).toFixed(4);
    } else {
      return (amount / pricePerShare).toFixed(4);
    }
  };

  // Debug function for withdrawal issues
  const handleDebugWithdrawal = async () => {
    if (!withdrawAmount || !userPosition) {
      console.log('Missing required data for withdrawal debug');
      return;
    }
    
    try {
      let sharesToWithdraw: string;
      
      if (withdrawType === 'shares') {
        sharesToWithdraw = withdrawAmount;
      } else {
        // Convert value to shares
        const pricePerShare = parseFloat(sharePrice);
        const valueToWithdraw = parseFloat(withdrawAmount);
        sharesToWithdraw = (valueToWithdraw / pricePerShare).toString();
      }

      console.log('=== WITHDRAWAL DEBUG INFO ===');
      console.log('Vault Address:', vaultAddress);
      console.log('User Position:', userPosition);
      console.log('Withdraw Type:', withdrawType);
      console.log('Withdraw Amount Input:', withdrawAmount);
      console.log('Shares to Withdraw:', sharesToWithdraw);
      console.log('Share Price:', sharePrice);
      console.log('Denomination Asset:', denominationAssetSymbol);
      
      // Additional debug info that could help identify issues
      console.log('User Shares Balance:', userPosition.shares);
      console.log('User Asset Value:', userPosition.assetValue);
      console.log('Vault Ownership %:', userPosition.percentage);
      
      if (parseFloat(sharesToWithdraw) > parseFloat(userPosition.shares)) {
        console.warn('⚠️ WARNING: Trying to withdraw more shares than owned!');
        console.log(`Requested: ${sharesToWithdraw}, Available: ${userPosition.shares}`);
      }
      
      // Enhanced debugging - check vault state
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          // Create contract instances for detailed checking
          const vaultContract = new ethers.Contract(vaultAddress, [
            // Basic vault functions
            { name: 'getAccessor', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
            { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
            { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
            { name: 'getOwner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
            // Withdrawal function
            { name: 'redeemSharesInKind', type: 'function', stateMutability: 'nonpayable', inputs: [
              { name: '_sharesQuantity', type: 'uint256' },
              { name: '_additionalAssets', type: 'address[]' },
              { name: '_assetsToSkip', type: 'address[]' }
            ], outputs: [] }
          ], provider);
          
          const userAddress = await signer.getAddress();
          const comptrollerAddress = await vaultContract.getAccessor();
          const vaultOwner = await vaultContract.getOwner();
          const totalSupply = await vaultContract.totalSupply();
          const userShares = await vaultContract.balanceOf(userAddress);
          
          console.log('=== ADVANCED VAULT DEBUG ===');
          console.log('User Address:', userAddress);
          console.log('Comptroller Address:', comptrollerAddress);
          console.log('Vault Owner:', vaultOwner);
          console.log('Total Supply (wei):', totalSupply.toString());
          console.log('User Shares (wei):', userShares.toString());
          console.log('Is User the Owner?:', vaultOwner.toLowerCase() === userAddress.toLowerCase());
          
          // Check comptroller
          const comptrollerContract = new ethers.Contract(comptrollerAddress, [
            { name: 'getDenominationAsset', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
            { name: 'calcGrossShareValue', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] }
          ], provider);
          
          const denominationAsset = await comptrollerContract.getDenominationAsset();
          const grossShareValue = await comptrollerContract.calcGrossShareValue();
          
          console.log('Denomination Asset Address:', denominationAsset);
          console.log('Gross Share Value (wei):', grossShareValue.toString());
          
          // Check denomination asset balance
          const assetContract = new ethers.Contract(denominationAsset, [
            { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
            { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
            { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] }
          ], provider);
          
          const vaultAssetBalance = await assetContract.balanceOf(vaultAddress);
          const assetSymbol = await assetContract.symbol();
          const assetDecimals = await assetContract.decimals();
          
          console.log('Vault Asset Balance (wei):', vaultAssetBalance.toString());
          console.log('Asset Symbol:', assetSymbol);
          console.log('Asset Decimals:', assetDecimals);
          console.log('Vault Asset Balance (formatted):', ethers.formatUnits(vaultAssetBalance, assetDecimals));
          
          // Try to predict what the withdrawal should return
          const sharesWei = ethers.parseUnits(sharesToWithdraw, 18);
          console.log('Shares to withdraw (wei):', sharesWei.toString());
          
          // Check if vault has enough assets
          const expectedAssetAmount = (sharesWei * grossShareValue) / ethers.parseUnits('1', 18);
          console.log('Expected asset return (wei):', expectedAssetAmount.toString());
          console.log('Expected asset return (formatted):', ethers.formatUnits(expectedAssetAmount, assetDecimals));
          
          if (vaultAssetBalance < expectedAssetAmount) {
            console.error('🚨 ISSUE FOUND: Vault has insufficient assets for withdrawal!');
            console.log(`Vault has: ${ethers.formatUnits(vaultAssetBalance, assetDecimals)} ${assetSymbol}`);
            console.log(`Withdrawal needs: ${ethers.formatUnits(expectedAssetAmount, assetDecimals)} ${assetSymbol}`);
          } else {
            console.log('✅ Vault has sufficient assets for withdrawal');
          }
          
          console.log('=== END ADVANCED DEBUG ===');
          
        } catch (debugError) {
          console.error('Advanced debugging failed:', debugError);
        }
      }
      
      console.log('=== END DEBUG INFO ===');
    } catch (error) {
      console.error('Debug function failed:', error);
    }
  };

  if (!userPosition || parseFloat(userPosition.shares) === 0) {
    return (
      <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6">
        <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Withdraw Funds</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-[#8ba1bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#AAC9FA]">No position to withdraw</h3>
          <p className="mt-1 text-sm text-[#8ba1bc]">
            You need to have vault shares before you can withdraw funds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10">
      <h3 className="text-lg font-medium text-[#AAC9FA] mb-4">Withdraw Funds</h3>
      
      <div className="space-y-4">
        {/* Position Info */}
        <div className="bg-[#1a2234] border border-[rgba(206,212,218,0.1)] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8ba1bc]">Your Shares:</span>
            <span className="font-medium text-[#AAC9FA]">
              {parseFloat(userPosition.shares).toFixed(4)} shares
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-[#8ba1bc]">Asset Value:</span>
            <span className="font-medium text-[#AAC9FA]">
              {parseFloat(userPosition.assetValue).toFixed(4)} {denominationAssetSymbol}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-[#8ba1bc]">Ownership:</span>
            <span className="font-medium text-cyan-400">
              {userPosition.percentage}% of vault
            </span>
          </div>
        </div>

        {/* Withdraw Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-[#8ba1bc] mb-2">
            Withdrawal Type
          </label>
          <div className="flex rounded-md border border-[rgba(206,212,218,0.15)] bg-[#1a2234]">
            <button
              type="button"
              onClick={() => setWithdrawType('value')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-all duration-300 ${
                withdrawType === 'value'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-transparent text-[#8ba1bc] hover:text-[#AAC9FA] hover:bg-[#1a2234]/50'
              }`}
            >
              By Value ({denominationAssetSymbol})
            </button>
            <button
              type="button"
              onClick={() => setWithdrawType('shares')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-all duration-300 border-l border-[rgba(206,212,218,0.15)] ${
                withdrawType === 'shares'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-transparent text-[#8ba1bc] hover:text-[#AAC9FA] hover:bg-[#1a2234]/50'
              }`}
            >
              By Shares
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-[#8ba1bc] mb-2">
            {withdrawType === 'shares' ? 'Shares to Withdraw' : `${denominationAssetSymbol} Value`}
          </label>
          <div className="relative">
            <input
              id="withdraw-amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="block w-full px-3 py-2 bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded-md text-[#AAC9FA] placeholder-[#818791] focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="absolute inset-y-0 right-0 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Estimated Output */}
        {withdrawAmount && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-300">
                You will receive approximately:
              </span>
              <span className="font-medium text-red-200">
                {withdrawType === 'shares' 
                  ? `${getEstimatedOutput()} ${denominationAssetSymbol}`
                  : `${getEstimatedOutput()} shares`
                }
              </span>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <div className="text-sm text-red-400">
              {error.message || 'Withdrawal failed'}
            </div>
          </div>
        )}

        {/* Success Messages */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
            <div className="text-sm text-green-400">
              Withdrawal successful! Your assets have been redeemed.
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!isValidAmount() || isPending || isConfirming}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
        >
          {isPending
            ? 'Processing...'
            : isConfirming
            ? 'Confirming...'
            : 'Withdraw'
          }
        </button>

        {/* Debug Button - Only show in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={handleDebugWithdrawal}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            🐛 Debug Withdrawal (Dev Only)
          </button>
        )} */}

        {/* Transaction Status */}
        {isConfirming && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
            <div className="text-sm text-blue-400">
              Withdrawal transaction is being confirmed...
            </div>
          </div>
        )}

        {/* Transaction Link */}
        {isSuccess && (
          <div className="mt-4 text-xs">
            <span className="text-[#8ba1bc]">Withdrawal transaction completed - </span>
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

        {/* Important Note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
          <div className="flex">
            <svg className="flex-shrink-0 h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-300">
                <strong>Note:</strong> Withdrawals redeem shares for the underlying assets in the vault. 
                If the vault holds multiple assets, you will receive a proportional amount of each asset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 