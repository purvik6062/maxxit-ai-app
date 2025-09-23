"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import { createPublicClient, http } from 'viem';
import { arbitrum } from 'wagmi/chains';
import { VAULT_PROXY_ABI, COMPTROLLER_ABI, ERC20_ABI, TOKEN_DECIMALS, getTokenAddress, ENZYME_ARBITRUM_ADDRESSES } from '@/contracts/enzymeContracts';
import { Portfolio } from '@enzymefinance/sdk';

// Utility function to convert viem client to ethers provider
function createEthersProvider(chainId: number) {
  const rpcUrl = chainId === 42161 
    ? 'https://arb1.arbitrum.io/rpc' 
    : 'https://sepolia-rollup.arbitrum.io/rpc';
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

interface VaultData {
  name: string;
  symbol: string;
  totalSupply: string;
  sharePrice: string;
  denominationAsset: string;
  comptroller: string;
}

interface UserPosition {
  shares: string;
  sharesBalance: string;
  assetValue: string;
  percentage: string;
}

interface TokenBalance {
  balance: string;
  allowance: string;
  decimals: number;
  symbol: string;
}

export function useEnzymeVault(vaultAddress: string) {
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Check if we're on the correct network (Arbitrum)
  const isCorrectNetwork = chainId === 42161; // Arbitrum mainnet
  
  // Create ethers provider for contract interactions
  const provider = createEthersProvider(chainId);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Environment variables
  const denominationAssetSymbol = process.env.NEXT_PUBLIC_ENZYME_DENOMINATION_ASSET || 'USDC';

  const denominationAssetAddress = getTokenAddress(denominationAssetSymbol);
  const tokenDecimals = TOKEN_DECIMALS[denominationAssetSymbol as keyof typeof TOKEN_DECIMALS] || 18;

  const fetchVaultData = useCallback(async () => {
    if (!provider || !vaultAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create contract instances
      const vaultContract = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, provider);
      
      // Fetch basic vault info
      const [name, symbol, totalSupply, comptrollerAddress] = await Promise.all([
        vaultContract.name(),
        vaultContract.symbol(),
        vaultContract.totalSupply(),
        vaultContract.getAccessor(),
      ]);

      // Create comptroller contract and get share price and denomination asset
      const comptrollerContract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
      const [grossShareValue, actualDenominationAsset] = await Promise.all([
        comptrollerContract.calcGrossShareValue(),
        comptrollerContract.getDenominationAsset()
      ]);

      const vaultInfo: VaultData = {
        name,
        symbol,
        totalSupply: ethers.formatUnits(totalSupply, 18),
        sharePrice: ethers.formatUnits(grossShareValue, tokenDecimals),
        denominationAsset: actualDenominationAsset,
        comptroller: comptrollerAddress,
      };

      setVaultData(vaultInfo);

      // Fetch user position if connected
      if (account) {
        const userShares = await vaultContract.balanceOf(account);
        const assetValue = calculateAssetValue(userShares, grossShareValue, tokenDecimals);
        const percentage = calculateOwnershipPercentage(userShares, totalSupply);

        setUserPosition({
          shares: ethers.formatUnits(userShares, 18),
          sharesBalance: userShares.toString(),
          assetValue,
          percentage,
        });

        // Fetch token balance and allowance using the actual denomination asset
        // IMPORTANT: Check allowance against ComptrollerProxy, not vault
        const tokenContract = new ethers.Contract(actualDenominationAsset, ERC20_ABI, provider);
        const [balance, allowance, tokenSymbol] = await Promise.all([
          tokenContract.balanceOf(account),
          tokenContract.allowance(account, comptrollerAddress), // Changed from vaultAddress to comptrollerAddress
          tokenContract.symbol(),
        ]);

        setTokenBalance({
          balance: ethers.formatUnits(balance, tokenDecimals),
          allowance: ethers.formatUnits(allowance, tokenDecimals),
          decimals: tokenDecimals,
          symbol: tokenSymbol,
        });
      }
    } catch (err) {
      console.error('Error fetching vault data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data');
    } finally {
      setIsLoading(false);
    }
  }, [provider, vaultAddress, account, denominationAssetAddress, tokenDecimals]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  return {
    // Basic data
    vaultAddress,
    vaultData,
    userPosition,
    tokenBalance,
    isCorrectNetwork,
    userAddress: account,
    
    // Status
    isLoading,
    isConnected,
    error,
    
    // Computed values
    denominationAssetAddress,
    denominationAssetSymbol,
    tokenDecimals,
    
    // Actions
    refetch: fetchVaultData,
  };
}

export function useEnzymeDeposit() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const deposit = async (vaultAddress: string, amount: string, tokenDecimals: number) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsPending(true);
      setIsSuccess(false);
      setError(null);
      setHash(null);

      // Create ethers provider for read operations
      const provider = createEthersProvider(walletClient.chain.id);
      
      // Get user address for validation
      const userAddress = walletClient.account.address;
      const amountWei = ethers.parseUnits(amount, tokenDecimals);
      
      // Get comptroller address - this is where we deposit according to Enzyme SDK
      const vaultContract = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, provider);
      const comptrollerAddress = await vaultContract.getAccessor();
      const comptrollerContract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
      const denominationAssetAddress = await comptrollerContract.getDenominationAsset();
      
      // Check token contract and allowance against COMPTROLLER (not vault)
      const tokenContract = new ethers.Contract(denominationAssetAddress, ERC20_ABI, provider);
      const [balance, allowance] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.allowance(userAddress, comptrollerAddress) // Check allowance for comptroller
      ]);

      // Validate sufficient balance
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance, tokenDecimals)} but trying to deposit ${amount}`);
      }

      // Validate sufficient allowance for COMPTROLLER
      if (allowance < amountWei) {
        throw new Error(`Insufficient allowance for ComptrollerProxy. Please approve ${amount} tokens first. Current allowance: ${ethers.formatUnits(allowance, tokenDecimals)}`);
      }

      // Calculate minimum shares (1% slippage tolerance)
      const sharePrice = await comptrollerContract.calcGrossShareValue();
      const expectedShares = (amountWei * ethers.parseUnits('1', 18)) / sharePrice;
      const minShares = (expectedShares * BigInt(99)) / BigInt(100); // 1% slippage

      // Estimate gas first to catch any revert issues early
      let gasEstimate;
      
      try {
        gasEstimate = await comptrollerContract.buyShares.estimateGas(amountWei, minShares);
        console.log('Gas estimate for comptroller buyShares:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed for comptroller buyShares:', gasError);
        throw new Error('Transaction would fail. This could be due to vault policies, insufficient allowance to ComptrollerProxy, or contract restrictions.');
      }

      // Execute the transaction using viem walletClient
      const tx = await walletClient.writeContract({
        address: comptrollerAddress as `0x${string}`,
        abi: COMPTROLLER_ABI,
        functionName: 'buyShares',
        args: [amountWei, minShares],
      });
      
      setHash(tx);
      setIsPending(false);
      setIsConfirming(true);

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      setIsConfirming(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Deposit failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Deposit failed';
      if (err instanceof Error) {
        if (err.message.includes('insufficient allowance')) {
          errorMessage = 'Please approve the ComptrollerProxy to spend your tokens first';
        } else if (err.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient token balance';
        } else if (err.message.includes('CALL_EXCEPTION')) {
          errorMessage = 'Transaction would fail. Please check vault policies and your token allowance for the ComptrollerProxy.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(new Error(errorMessage));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    deposit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useEnzymeWithdraw() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const withdraw = async (vaultAddress: string, shareAmount: string) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsPending(true);
      setIsSuccess(false);
      setError(null);
      setHash(null);

      // Create ethers provider for read operations
      const provider = createEthersProvider(walletClient.chain.id);
      
      const vaultContract = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, provider);
      const userAddress = walletClient.account.address;

      // Convert share amount to proper units
      const sharesWei = ethers.parseUnits(shareAmount, 18); // Shares are always 18 decimals

      // Validate user has enough shares
      const userShares = await vaultContract.balanceOf(userAddress);
      if (userShares < sharesWei) {
        throw new Error(`Insufficient shares. You have ${ethers.formatUnits(userShares, 18)} but trying to withdraw ${shareAmount}`);
      }

      // Validate shares amount is greater than 0
      if (sharesWei <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      // Get comptroller to check for any restrictions
      const comptrollerAddress = await vaultContract.getAccessor();
      const comptrollerContract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);

      // Try different withdrawal methods based on Enzyme documentation
      let gasEstimate;
      let withdrawalMethod = 'redeemSharesInKind';

      try {
        // First, try the standard redeemSharesInKind method on COMPTROLLER (not vault!)
        // According to Enzyme docs, redemptions should go through comptroller proxy
        const comptrollerWithdrawContract = new ethers.Contract(comptrollerAddress, [
          {
            name: 'redeemSharesInKind',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: '_recipient', type: 'address' },
              { name: '_sharesQuantity', type: 'uint256' },
              { name: '_additionalAssets', type: 'address[]' },
              { name: '_assetsToSkip', type: 'address[]' }
            ],
            outputs: []
          }
        ], provider);

        gasEstimate = await comptrollerWithdrawContract.redeemSharesInKind.estimateGas(
          userAddress, // recipient - this was missing!
          sharesWei,
          [], // additionalAssets - empty array for standard redemption
          []  // assetsToSkip - empty array for standard redemption
        );
        withdrawalMethod = 'comptrollerRedeemSharesInKind';
        
        // Log the function call data for debugging
        const functionData = comptrollerWithdrawContract.interface.encodeFunctionData('redeemSharesInKind', [userAddress, sharesWei, [], []]);
        
        // Decode the function data to verify parameters
        try {
          const decoded = comptrollerWithdrawContract.interface.decodeFunctionData('redeemSharesInKind', functionData);
        } catch (decodeError) {
          console.error('Failed to decode function data:', decodeError);
        }
      } catch (gasError) {
        console.error('Gas estimation failed for comptroller redeemSharesInKind:', gasError);
        
        // Fallback: try the old method on vault contract
        try {
          gasEstimate = await vaultContract.redeemSharesInKind.estimateGas(
            sharesWei,
            [], // additionalAssets - empty array for standard redemption
            []  // assetsToSkip - empty array for standard redemption
          );
          withdrawalMethod = 'redeemSharesInKind';
          
          // Log the function call data for debugging
          const functionData = vaultContract.interface.encodeFunctionData('redeemSharesInKind', [sharesWei, [], []]);
          
          // Decode the function data to verify parameters
          try {
            const decoded = vaultContract.interface.decodeFunctionData('redeemSharesInKind', functionData);
            console.log('Decoded function parameters:', {
              sharesQuantity: decoded[0].toString(),
              additionalAssets: decoded[1],
              assetsToSkip: decoded[2]
            });
          } catch (decodeError) {
            console.error('Failed to decode function data:', decodeError);
          }
        } catch (vaultGasError) {
          console.error('Gas estimation failed for vault redeemSharesInKind:', vaultGasError);
          
          // Try alternative withdrawal method through comptroller if available
          try {
            // Check if comptroller has redeemShares method
            const comptrollerWithSigner = new ethers.Contract(comptrollerAddress, [
              {
                name: 'redeemShares',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [{ name: '_sharesQuantity', type: 'uint256' }],
                outputs: []
              }
            ], provider);
            
            gasEstimate = await comptrollerWithSigner.redeemShares.estimateGas(sharesWei);
            withdrawalMethod = 'redeemShares';
            console.log('Gas estimate for comptroller redeemShares:', gasEstimate.toString());
          } catch (comptrollerError) {
            console.error('Gas estimation failed for comptroller redeemShares:', comptrollerError);
            
            // Log the exact error details for better debugging
            console.log('Detailed gasError:', JSON.stringify(gasError, Object.getOwnPropertyNames(gasError), 2));
            console.log('Detailed vaultGasError:', JSON.stringify(vaultGasError, Object.getOwnPropertyNames(vaultGasError), 2));
            console.log('Detailed comptrollerError:', JSON.stringify(comptrollerError, Object.getOwnPropertyNames(comptrollerError), 2));
            
            // Provide specific error messages based on the error type
            if (gasError instanceof Error) {
              if (gasError.message.includes('insufficient shares')) {
                throw new Error('Insufficient shares for withdrawal');
              } else if (gasError.message.includes('CALL_EXCEPTION') || gasError.message.includes('missing revert data')) {
                throw new Error('Withdrawal blocked by vault policies. The vault may have transfer restrictions, withdrawal cooldowns, or other policies preventing redemption. Please check with the vault manager or try again later.');
              } else if (gasError.message.includes('execution reverted')) {
                throw new Error('Withdrawal transaction would fail. This could be due to vault policies, insufficient liquidity, or locked shares.');
              }
            }
            
            throw new Error('Withdrawal transaction would fail. The vault may have withdrawal restrictions, policies, or insufficient liquidity. Please check vault settings or contact the vault manager.');
          }
        }
      }

      // Execute the withdrawal transaction using viem walletClient
      let tx;
      if (withdrawalMethod === 'comptrollerRedeemSharesInKind') {
        tx = await walletClient.writeContract({
          address: comptrollerAddress as `0x${string}`,
          abi: [
            {
              name: 'redeemSharesInKind',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: '_recipient', type: 'address' },
                { name: '_sharesQuantity', type: 'uint256' },
                { name: '_additionalAssets', type: 'address[]' },
                { name: '_assetsToSkip', type: 'address[]' }
              ],
              outputs: []
            }
          ],
          functionName: 'redeemSharesInKind',
          args: [userAddress, sharesWei, [], []],
        });
        console.log('Using comptroller redeemSharesInKind method');
      } else if (withdrawalMethod === 'redeemShares') {
        tx = await walletClient.writeContract({
          address: comptrollerAddress as `0x${string}`,
          abi: [
            {
              name: 'redeemShares',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [{ name: '_sharesQuantity', type: 'uint256' }],
              outputs: []
            }
          ],
          functionName: 'redeemShares',
          args: [sharesWei],
        });
        console.log('Using comptroller redeemShares method');
      } else {
        tx = await walletClient.writeContract({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_PROXY_ABI,
          functionName: 'redeemSharesInKind',
          args: [sharesWei, [], []],
        });
        console.log('Using vault redeemSharesInKind method');
      }
      
      console.log('Withdrawal transaction sent:', tx);
      setHash(tx);
      setIsPending(false);
      setIsConfirming(true);

      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      console.log('Withdrawal successful:', receipt);
      setIsConfirming(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Withdraw failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Withdrawal failed';
      if (err instanceof Error) {
        if (err.message.includes('insufficient shares')) {
          errorMessage = 'Insufficient shares for withdrawal';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Withdrawal was rejected by user';
        } else if (err.message.includes('CALL_EXCEPTION') || err.message.includes('missing revert data')) {
          errorMessage = 'Withdrawal blocked by vault policies. The vault may have transfer restrictions, withdrawal cooldowns, or other policies preventing redemption. Please check with the vault manager or try again later.';
        } else if (err.message.includes('execution reverted')) {
          errorMessage = 'Withdrawal transaction failed. This could be due to vault policies, insufficient liquidity, or locked shares.';
        } else if (err.message.includes('withdrawal restrictions') || err.message.includes('vault policies')) {
          errorMessage = err.message; // Use the specific message we created
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(new Error(errorMessage));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useTokenApproval() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const approve = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    tokenDecimals: number
  ) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsPending(true);
      setIsSuccess(false);
      setError(null);
      setHash(null);

      // Create ethers provider for read operations
      const provider = createEthersProvider(walletClient.chain.id);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const userAddress = walletClient.account.address;
      
      // Validate token balance
      const balance = await tokenContract.balanceOf(userAddress);
      const amountWei = ethers.parseUnits(amount, tokenDecimals);
      
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance, tokenDecimals)} but trying to approve ${amount}`);
      }

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(userAddress, spenderAddress);
      console.log('Current allowance:', ethers.formatUnits(currentAllowance, tokenDecimals));
      console.log('Approving amount:', amount);

      // If there's already sufficient allowance, no need to approve again
      if (currentAllowance >= amountWei) {
        console.log('Sufficient allowance already exists');
        setIsPending(false);
        setIsSuccess(true);
        return;
      }

      // Some tokens require setting allowance to 0 first if there's an existing allowance
      if (currentAllowance > 0) {
        console.log('Resetting allowance to 0 first...');
        const resetTx = await walletClient.writeContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spenderAddress as `0x${string}`, BigInt(0)],
        });
        await waitForTransactionReceipt(publicClient, { hash: resetTx });
        console.log('Allowance reset to 0');
      }

      // Estimate gas for the approval
      try {
        const gasEstimate = await tokenContract.approve.estimateGas(spenderAddress, amountWei);
        console.log('Approval gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed for approval:', gasError);
        throw new Error('Approval transaction would fail. Please check token contract and network.');
      }

      // Execute the approval using viem
      const tx = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, amountWei],
      });
      setHash(tx);
      setIsPending(false);
      setIsConfirming(true);

      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      console.log('Approval successful:', receipt);
      
      // Verify the approval was successful
      const newAllowance = await tokenContract.allowance(userAddress, spenderAddress);
      if (newAllowance < amountWei) {
        throw new Error('Approval failed - allowance not set correctly');
      }
      
      setIsConfirming(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Approval failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Approval failed';
      if (err instanceof Error) {
        if (err.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient token balance for approval';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Approval was rejected by user';
        } else if (err.message.includes('CALL_EXCEPTION')) {
          errorMessage = 'Approval transaction would fail. Please check token contract.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(new Error(errorMessage));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useEnzymeUniswapV3Swap() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const executeSwap = async (
    comptrollerAddress: string,
    pathAddresses: string[],
    pathFees: number[],
    outgoingAssetAmount: string,
    minIncomingAssetAmount: string,
    outgoingAssetDecimals: number,
    incomingAssetDecimals: number = 18
  ) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsPending(true);
      setIsSuccess(false);
      setError(null);
      setHash(null);

      // Get addresses from contracts
      const integrationManagerAddress = ENZYME_ARBITRUM_ADDRESSES.IntegrationManager;
      const uniswapV3AdapterAddress = ENZYME_ARBITRUM_ADDRESSES.UniswapV3Adapter;
      
      // Convert amount to wei
      const outgoingAmountWei = ethers.parseUnits(outgoingAssetAmount, outgoingAssetDecimals);
      const minIncomingAmountWei = ethers.parseUnits(minIncomingAssetAmount, incomingAssetDecimals);
      
      console.log('Swap parameters:', {
        comptrollerAddress,
        integrationManagerAddress,
        uniswapV3AdapterAddress,
        pathAddresses,
        pathFees,
        outgoingAssetAmount,
        outgoingAmountWei: outgoingAmountWei.toString(),
        minIncomingAssetAmount,
        minIncomingAmountWei: minIncomingAmountWei.toString(),
      });

      // Validate path
      if (pathAddresses.length < 2) {
        throw new Error('Path must contain at least 2 addresses');
      }
      
      if (pathFees.length !== pathAddresses.length - 1) {
        throw new Error('Path fees length must be one less than path addresses length');
      }

      // Format addresses with 0x prefix
      const formattedPathAddresses = pathAddresses.map(addr => addr as `0x${string}`);
      
      try {
        // Create UniswapV3 takeOrder transaction according to the SDK format
        const takeOrderParams = {
          comptrollerProxy: comptrollerAddress as `0x${string}`,
          integrationManager: integrationManagerAddress as `0x${string}`,
          integrationAdapter: uniswapV3AdapterAddress as `0x${string}`,
          callArgs: {
            pathAddresses: formattedPathAddresses,
            pathFees,
            outgoingAssetAmount: outgoingAmountWei,
            minIncomingAssetAmount: minIncomingAmountWei,
          },
        };
        
        console.log('Creating takeOrder with params:', takeOrderParams);
        
        // Create the transaction object using the SDK
        const swapTransaction = Portfolio.Integrations.UniswapV3.takeOrder(takeOrderParams);
        
        console.log('Generated transaction:', swapTransaction);
        
        if (!swapTransaction || typeof swapTransaction !== 'object') {
          throw new Error('Invalid response from Enzyme SDK');
        }
        
        // Create transaction request
        let txRequest: ethers.TransactionRequest = {
          to: '', // Will be set below
          data: '', // Will be set below
          value: 0,
          gasLimit: ethers.parseUnits('1000000', 'wei')
        };
        
        // Handle different SDK response formats
        if ('params' in swapTransaction) {
          const params = swapTransaction.params as any;
          console.log('Transaction params:', params);
          
          if (params.address) {
            txRequest.to = params.address;
            
            // Handle callOnExtension directly if available
            if (params.functionName === 'callOnExtension' && params.args && params.abi) {
              try {
                const contract = new ethers.Contract(params.address, params.abi);
                txRequest.data = contract.interface.encodeFunctionData(
                  'callOnExtension', 
                  params.args
                );
                console.log('Encoded callOnExtension data');
              } catch (encodeError) {
                console.error('Failed to encode function call:', encodeError);
              }
            }
            // Use data directly if available
            else if (params.data) {
              txRequest.data = params.data;
              console.log('Using data from params');
            }
          } else if (params.to) {
            // Direct transaction params
            txRequest = params as ethers.TransactionRequest;
            console.log('Using direct transaction params');
          }
        } else if ('to' in swapTransaction && 'data' in swapTransaction) {
          // Direct transaction object
          txRequest = swapTransaction as unknown as ethers.TransactionRequest;
          console.log('Using direct transaction object');
        }
        
        // If we still don't have a valid "to" address, use the integration manager
        if (!txRequest.to) {
          console.log('Missing "to" address, using integration manager as fallback');
          txRequest.to = integrationManagerAddress;
        }
        
        // If we still don't have valid data, encode the callOnExtension manually
        if (!txRequest.data) {
          console.log('Missing transaction data, encoding callOnExtension manually');
          
          try {
            // Encode Uniswap integration data
            const uniswapIntegrationData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["address[]", "uint24[]", "uint256", "uint256"],
              [
                formattedPathAddresses,
                pathFees,
                outgoingAmountWei,
                minIncomingAmountWei
              ]
            );
            
            // Encode the call arguments
            const callArgs = ethers.AbiCoder.defaultAbiCoder().encode(
              ["address", "bytes"],
              [uniswapV3AdapterAddress, uniswapIntegrationData]
            );
            
            // Create contract interface to encode the call
            const iface = new ethers.Interface([{
              "inputs": [
                { "name": "_extension", "type": "address" },
                { "name": "_actionId", "type": "uint256" },
                { "name": "_callArgs", "type": "bytes" }
              ],
              "name": "callOnExtension",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }]);
            
            // Encode the callOnExtension call
            // Action ID 0 is for swaps in Enzyme
            txRequest.data = iface.encodeFunctionData(
              "callOnExtension",
              [integrationManagerAddress, 0, callArgs]
            );
            
            console.log('Manually encoded transaction data');
          } catch (encodeError) {
            console.error('Failed to encode transaction data:', encodeError);
            throw new Error('Could not create transaction data');
          }
        }
        
        // Final validation
        if (!txRequest.to) {
          throw new Error('Transaction is missing "to" address');
        }
        
        if (!txRequest.data) {
          throw new Error('Transaction is missing "data" field');
        }
        
        console.log('Final transaction request:', {
          to: txRequest.to,
          dataStart: txRequest.data.substring(0, 50) + '...',
          dataLength: txRequest.data.length,
          value: txRequest.value || '0'
        });
        
        // Send the transaction using viem walletClient
        const tx = await walletClient.sendTransaction({
          to: txRequest.to as `0x${string}`,
          data: txRequest.data as `0x${string}`,
          value: txRequest.value ? BigInt(txRequest.value.toString()) : BigInt(0),
          gas: txRequest.gasLimit ? BigInt(txRequest.gasLimit.toString()) : undefined,
        });
        
        console.log('Transaction sent:', tx);
        setHash(tx);
        setIsPending(false);
        setIsConfirming(true);
        
        // Wait for transaction receipt
        const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
        console.log('Transaction confirmed:', receipt);
        setIsConfirming(false);
        setIsSuccess(true);
        
      } catch (txError) {
        console.error('Transaction creation or execution failed:', txError);
        throw new Error(`Failed to execute swap: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error('Swap failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Swap failed';
      if (err instanceof Error) {
        if (err.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient token balance for swap';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (err.message.includes('CALL_EXCEPTION')) {
          errorMessage = 'Swap transaction would fail. This could be due to insufficient liquidity or invalid path.';
        } else if (err.message.includes('slippage')) {
          errorMessage = 'Slippage tolerance exceeded. Try increasing your slippage tolerance.';
        } else if (err.message.includes('missing revert data')) {
          errorMessage = 'Transaction would fail. The pool might not exist or have insufficient liquidity.';
        } else if (err.message.includes('Invalid "to" address')) {
          errorMessage = 'Invalid transaction configuration. Please check the integration addresses.';
        } else if (err.message.includes('missing "to" address')) {
          errorMessage = 'Transaction is missing the destination address. The Enzyme SDK integration may need updating.';
        } else if (err.message.includes('Could not create transaction data')) {
          errorMessage = 'Failed to encode the transaction data. Please try again with different parameters.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(new Error(errorMessage));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    executeSwap,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Helper functions
function calculateAssetValue(shares: bigint, sharePrice: bigint, decimals: number): string {
  const sharesFormatted = parseFloat(ethers.formatUnits(shares, 18));
  const priceFormatted = parseFloat(ethers.formatUnits(sharePrice, decimals));
  
  return (sharesFormatted * priceFormatted).toFixed(4);
}

function calculateOwnershipPercentage(userShares: bigint, totalSupply: bigint): string {
  if (totalSupply === BigInt(0)) return '0';
  
  const percentage = (Number(userShares) / Number(totalSupply)) * 100;
  return percentage.toFixed(2);
}