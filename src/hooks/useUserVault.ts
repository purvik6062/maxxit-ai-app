import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/components/enzyme/WalletConnector';

interface UserVault {
  vaultAddress: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _id: string;
}

interface UseUserVaultReturn {
  userVaults: UserVault[];
  isLoading: boolean;
  error: string | null;
  hasVaults: boolean;
  latestVault: UserVault | null;
  refetchVaults: () => Promise<void>;
}

export function useUserVault(): UseUserVaultReturn {
  const { data: session } = useSession();
  const { account } = useWallet();
  const [userVaults, setUserVaults] = useState<UserVault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserVaults = async () => {
    if (!session?.user?.username && !account) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use username from session, fallback to account address
      const username = session?.user?.username || account || '';
      
      const response = await fetch(`/api/get-user-vaults?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user vaults');
      }

      const data = await response.json();
      
      if (data.success) {
        setUserVaults(data.vaults || []);
      } else {
        throw new Error(data.error || 'Failed to fetch vaults');
      }
    } catch (err) {
      console.error('Error fetching user vaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vaults');
      setUserVaults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVaults();
  }, [session?.user?.username, account]);

  const refetchVaults = async () => {
    await fetchUserVaults();
  };

  return {
    userVaults,
    isLoading,
    error,
    hasVaults: userVaults.length > 0,
    latestVault: userVaults.length > 0 ? userVaults[0] : null, // First item is latest due to sorting
    refetchVaults,
  };
} 