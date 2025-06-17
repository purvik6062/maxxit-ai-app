import { ethers } from 'ethers';
import { getNetworkConfig } from '@/lib/enzyme-contracts';

export interface VaultPerformanceData {
  totalValueLocked: string;
  totalSupply: string;
  sharePrice: string;
  monthlyReturn: string;
  denomAssetSymbol: string;
  vaultName: string;
  vaultSymbol: string;
}

// Basic ABI for Enzyme vault and comptroller interactions
const VAULT_ABI = [
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'getAccessor', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
];

const COMPTROLLER_ABI = [
  { name: 'calcGrossShareValue', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'getDenominationAsset', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
];

const ERC20_ABI = [
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
];

export async function getVaultPerformanceData(
  vaultAddress: string,
  chainId: number,
  provider: ethers.Provider
): Promise<VaultPerformanceData> {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Error('Unsupported network');
  }

  // Create vault contract instance
  const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
  
  // Initialize with default values
  let name = 'Unknown Vault';
  let symbol = 'UNKNOWN';
  let totalSupply = '0';
  let comptrollerAddress = '';
  let sharePrice = '1.0';
  let totalValueLocked = '0';
  let monthlyReturn = '0.00';
  let denomAssetSymbol = 'Unknown';

  try {
    // Try to get essential vault data (total supply and comptroller)
    const essentialData = await Promise.allSettled([
      vaultContract.totalSupply(),
      vaultContract.getAccessor()
    ]);

    if (essentialData[0].status === 'fulfilled' && essentialData[1].status === 'fulfilled') {
      totalSupply = essentialData[0].value.toString();
      comptrollerAddress = essentialData[1].value;

      try {
        // Try to get performance data from comptroller
        const comptrollerContract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        
        const performanceData = await Promise.allSettled([
          comptrollerContract.calcGrossShareValue(),
          comptrollerContract.getDenominationAsset()
        ]);

        if (performanceData[0].status === 'fulfilled' && performanceData[1].status === 'fulfilled') {
          const grossShareValue = performanceData[0].value;
          const denominationAssetAddress = performanceData[1].value;

          sharePrice = ethers.formatUnits(grossShareValue, 18);
          const totalSupplyFormatted = ethers.formatUnits(totalSupply, 18);
          totalValueLocked = (parseFloat(totalSupplyFormatted) * parseFloat(sharePrice)).toString();
          monthlyReturn = calculateMonthlyReturn(parseFloat(sharePrice)).toFixed(2);

          // Try to get denomination asset symbol
          try {
            const tokenContract = new ethers.Contract(denominationAssetAddress, ERC20_ABI, provider);
            const tokenSymbol = await tokenContract.symbol();
            denomAssetSymbol = tokenSymbol;
          } catch (tokenError) {
            console.warn(`Failed to fetch denomination asset symbol for ${denominationAssetAddress}:`, tokenError);
            // Keep default denomAssetSymbol
          }
        }
      } catch (comptrollerError) {
        console.warn(`Failed to fetch comptroller data for vault ${vaultAddress}:`, comptrollerError);
        // Keep default performance values
      }
    }
  } catch (essentialError) {
    console.warn(`Failed to fetch essential vault data for ${vaultAddress}:`, essentialError);
    // Keep default values
  }

  // Try to get vault name and symbol separately (independent of performance data)
  try {
    const nameSymbolData = await Promise.allSettled([
      vaultContract.name(),
      vaultContract.symbol()
    ]);

    if (nameSymbolData[0].status === 'fulfilled') {
      name = nameSymbolData[0].value;
    }
    if (nameSymbolData[1].status === 'fulfilled') {
      symbol = nameSymbolData[1].value;
    }
  } catch (nameError) {
    console.warn(`Failed to fetch vault name/symbol for ${vaultAddress}:`, nameError);
    // Keep default name and symbol
  }

  return {
    totalValueLocked,
    totalSupply: ethers.formatUnits(totalSupply, 18),
    sharePrice,
    monthlyReturn,
    denomAssetSymbol,
    vaultName: name,
    vaultSymbol: symbol
  };
}

function calculateMonthlyReturn(sharePrice: number): number {
  // Simple calculation: if share price > 1, assume it's grown
  // In a real implementation, you'd store historical share prices
  // and calculate actual monthly returns
  
  if (sharePrice <= 1) {
    return 0;
  }
  
  // Simplified calculation: assume linear growth over time
  // This is a placeholder - real calculation would require historical data
  const growth = (sharePrice - 1) * 100;
  
  // Cap at reasonable monthly return (e.g., 50% per month max)
  return Math.min(growth, 50);
}

export async function batchGetVaultPerformance(
  vaultAddresses: string[],
  chainId: number,
  provider: ethers.Provider
): Promise<Map<string, VaultPerformanceData>> {
  const results = new Map<string, VaultPerformanceData>();
  
  // Process vaults in batches to avoid overwhelming the RPC
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < vaultAddresses.length; i += BATCH_SIZE) {
    const batch = vaultAddresses.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (vaultAddress) => {
      const performance = await getVaultPerformanceData(vaultAddress, chainId, provider);
      return { vaultAddress, performance };
    });
    
    try {
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        const vaultAddress = batch[index];
        if (result.status === 'fulfilled') {
          results.set(vaultAddress, result.value.performance);
        } else {
          console.error(`Failed to get performance for vault ${vaultAddress}:`, result.reason);
          // Set default values for failed vaults
          results.set(vaultAddress, {
            totalValueLocked: '0',
            totalSupply: '0',
            sharePrice: '1.0',
            monthlyReturn: '0.00',
            denomAssetSymbol: 'Unknown',
            vaultName: 'Unknown Vault',
            vaultSymbol: 'UNKNOWN'
          });
        }
      });
    } catch (error) {
      console.error('Error in batch processing:', error);
    }
    
    // Small delay between batches to be respectful to RPC endpoints
    if (i + BATCH_SIZE < vaultAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

export function formatCurrency(amount: string, symbol: string): string {
  const num = parseFloat(amount);
  
  if (num === 0) return `0 ${symbol}`;
  
  if (num < 1000) {
    return `${num.toFixed(2)} ${symbol}`;
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K ${symbol}`;
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M ${symbol}`;
  } else {
    return `${(num / 1000000000).toFixed(1)}B ${symbol}`;
  }
}

export function formatPercentage(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
} 