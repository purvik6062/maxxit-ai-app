import { useState, useEffect } from 'react';
import { useEthers } from '@/providers/EthersProvider';
import { getVaultPerformanceData, VaultPerformanceData } from '@/utils/vaultPerformance';

export interface PublicVault {
  _id: string;
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
  creatorUsername: string;
  denominationAsset: string;
  agentName?: string;
  riskLevel?: string;
  isActive: boolean;
  createdAt: string;
  totalValueLocked?: string;
  monthlyReturn?: string;
  totalSupply?: string;
  sharePrice?: string;
  // Enhanced fields from performance data
  performanceData?: VaultPerformanceData;
  isLoadingPerformance?: boolean;
}

export interface VaultFilters {
  riskLevel?: 'Low' | 'Medium' | 'High';
  sortBy?: 'createdAt' | 'monthlyReturn' | 'totalValueLocked';
  order?: 'asc' | 'desc';
}

interface UsePublicVaultsReturn {
  vaults: PublicVault[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  filters: VaultFilters;
  setFilters: (filters: VaultFilters) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const VAULTS_PER_PAGE = 12;

export function usePublicVaults(): UsePublicVaultsReturn {
  const [vaults, setVaults] = useState<PublicVault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [filters, setFiltersState] = useState<VaultFilters>({
    sortBy: 'createdAt',
    order: 'desc'
  });

  const { provider, chainId } = useEthers();

  const buildApiUrl = (offset: number = 0) => {
    const params = new URLSearchParams({
      limit: VAULTS_PER_PAGE.toString(),
      offset: offset.toString(),
      sortBy: filters.sortBy || 'createdAt',
      order: filters.order || 'desc'
    });

    if (filters.riskLevel) {
      params.append('riskLevel', filters.riskLevel);
    }

    return `/api/public-vaults?${params.toString()}`;
  };

  // Function to fetch performance data for vaults
  const fetchVaultPerformanceData = async (vaultList: PublicVault[]) => {
    if (!provider || !chainId || vaultList.length === 0) {
      return vaultList;
    }

    // Process vaults in smaller batches to avoid overwhelming the RPC
    const BATCH_SIZE = 3;
    const updatedVaults = [...vaultList];
    
    for (let i = 0; i < updatedVaults.length; i += BATCH_SIZE) {
      const batch = updatedVaults.slice(i, i + BATCH_SIZE);
      
      // Set loading state for this batch
      setVaults(current => 
        current.map(vault => {
          if (batch.some(batchVault => batchVault.vaultAddress === vault.vaultAddress)) {
            return { ...vault, isLoadingPerformance: true };
          }
          return vault;
        })
      );

      const promises = batch.map(async (vault) => {
        try {
          const performanceData = await getVaultPerformanceData(
            vault.vaultAddress,
            chainId,
            provider
          );
          return {
            vaultAddress: vault.vaultAddress,
            performanceData,
            success: true
          };
        } catch (error) {
          console.error(`Failed to fetch performance for vault ${vault.vaultAddress}:`, error);
          return {
            vaultAddress: vault.vaultAddress,
            performanceData: null,
            success: false
          };
        }
      });

      try {
        const results = await Promise.allSettled(promises);
        
        // Update vaults with performance data
        setVaults(current => 
          current.map(vault => {
            const result = results.find((_, index) => 
              batch[index]?.vaultAddress === vault.vaultAddress
            );
            
                         if (result && result.status === 'fulfilled' && result.value.success) {
               const performanceData = result.value.performanceData;
               
               if (process.env.NODE_ENV === 'development') {
                 console.log(`[${vault.vaultAddress}] Performance data loaded:`, {
                   hasRealName: performanceData?.vaultName && performanceData.vaultName !== 'Unknown Vault',
                   hasRealStats: performanceData?.totalValueLocked && performanceData.totalValueLocked !== '0',
                   vaultName: performanceData?.vaultName,
                   totalValueLocked: performanceData?.totalValueLocked
                 });
               }
               
               return {
                 ...vault,
                 performanceData: performanceData || undefined,
                 isLoadingPerformance: false,
                 // Update legacy fields for backward compatibility
                 totalValueLocked: performanceData?.totalValueLocked || vault.totalValueLocked,
                 monthlyReturn: performanceData?.monthlyReturn || vault.monthlyReturn,
                 totalSupply: performanceData?.totalSupply || vault.totalSupply,
                 sharePrice: performanceData?.sharePrice || vault.sharePrice,
                 // Use real vault name and symbol from blockchain
                 vaultName: performanceData?.vaultName || vault.vaultName,
                 vaultSymbol: performanceData?.vaultSymbol || vault.vaultSymbol,
               };
             } else {
               if (process.env.NODE_ENV === 'development') {
                 console.log(`[${vault.vaultAddress}] Performance data failed to load`);
               }
               return {
                 ...vault,
                 isLoadingPerformance: false
               };
             }
          })
        );
      } catch (error) {
        console.error('Error in batch processing performance data:', error);
        // Remove loading state for failed batch
        setVaults(current => 
          current.map(vault => {
            if (batch.some(batchVault => batchVault.vaultAddress === vault.vaultAddress)) {
              return { ...vault, isLoadingPerformance: false };
            }
            return vault;
          })
        );
      }
      
      // Small delay between batches to be respectful to RPC endpoints
      if (i + BATCH_SIZE < updatedVaults.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return updatedVaults;
  };

  const fetchVaults = async (offset: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(buildApiUrl(offset));
      
      if (!response.ok) {
        throw new Error('Failed to fetch public vaults');
      }

      const data = await response.json();
      
      if (data.success) {
        const newVaults = data.vaults as PublicVault[];
        
        // Add vaults to state first
        if (append) {
          setVaults(prev => [...prev, ...newVaults]);
        } else {
          setVaults(newVaults);
        }
        
        setHasMore(data.pagination.hasMore);
        setTotalCount(data.pagination.total);
        setCurrentOffset(offset + newVaults.length);

        // Then fetch performance data in background
        if (newVaults.length > 0) {
          fetchVaultPerformanceData(newVaults);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch vaults');
      }
    } catch (err) {
      console.error('Error fetching public vaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vaults');
      if (!append) {
        setVaults([]);
      }
    } finally {
      if (!append) {
        setIsLoading(false);
      }
    }
  };

  const setFilters = (newFilters: VaultFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentOffset(0);
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    await fetchVaults(currentOffset, true);
  };

  const refresh = async () => {
    setCurrentOffset(0);
    await fetchVaults(0, false);
  };

  // Initial load and refetch when filters change
  useEffect(() => {
    fetchVaults(0, false);
  }, [filters]);

  // Refetch performance data when provider or chainId changes
  useEffect(() => {
    if (provider && chainId && vaults.length > 0) {
      fetchVaultPerformanceData(vaults);
    }
  }, [provider, chainId]);

  return {
    vaults,
    isLoading,
    error,
    hasMore,
    totalCount,
    filters,
    setFilters,
    loadMore,
    refresh,
  };
} 