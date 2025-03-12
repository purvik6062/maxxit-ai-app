import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { useCredits } from '@/context/CreditsContext';

type SubscriptionContextType = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  subscribedHandles: string[];
  subscribingHandle: string | null;
  handleSubscribe: (handle: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscribedHandles, setSubscribedHandles] = useState<string[]>([]);
  const [subscribingHandle, setSubscribingHandle] = useState<string | null>(null);
  const { address } = useAccount();
  const { updateCredits } = useCredits();

  // Control body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Fetch subscribed handles when wallet connects
  useEffect(() => {
    if (address) {
      refreshSubscriptions();
    }
  }, [address]);

  const refreshSubscriptions = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/get-user?walletAddress=${address}`);
      const data = await response.json();

      if (data.success && data.data.subscribedAccounts) {
        setSubscribedHandles(data.data.subscribedAccounts);
      }
    } catch (error) {
      console.error('Failed to fetch subscribed handles:', error);
    }
  };

  const handleSubscribe = async (handle: string) => {
    if (!address) {
      toast.error('Please connect your wallet first', {
        position: 'top-center',
      });
      return;
    }

    const cleanHandle = handle.replace('@', '');
    setSubscribingHandle(cleanHandle);

    try {
      const response = await fetch('/api/subscribe-influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          influencerHandle: cleanHandle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to subscribe');
      }

      setSubscribedHandles((prev) => [...prev, cleanHandle]);

      toast.success('Successfully subscribed to influencer!', {
        position: 'top-center',
      });

      await updateCredits();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe', {
        position: 'top-center',
      });
    } finally {
      setSubscribingHandle(null);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        subscribedHandles,
        subscribingHandle,
        handleSubscribe,
        refreshSubscriptions,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};