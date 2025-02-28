import React, {
    createContext,
    useState,
    useEffect,
    useContext,
  } from 'react';
  import { useAccount } from 'wagmi';
  
  interface CreditsContextType {
    credits: number | null; // Can be number or null if not yet loaded
    updateCredits: () => Promise<void>; // Function to refresh credits
  }
  
  const CreditsContext = createContext<CreditsContextType>({
    credits: null,
    updateCredits: async () => {}, // Default empty function
  });
  
  interface CreditsProviderProps {
    children: React.ReactNode;
  }
  
  export const CreditsProvider: React.FC<CreditsProviderProps> = ({ children }) => {
    const [credits, setCredits] = useState<number | null>(null);
    const { address } = useAccount();
  
    const updateCredits = async () => {
      if (!address) {
        setCredits(null); // Reset credits if no wallet connected
        return;
      }
  
      try {
        const response = await fetch(`/api/get-user?walletAddress=${address}`);
        const data = await response.json();
  
        if (response.ok && data.data && typeof data.data.credits === 'number') {
          setCredits(data.data.credits);
        } else {
          console.error("Failed to fetch credits or invalid format:", data);
          setCredits(null);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        setCredits(null);
      }
    };
  
    useEffect(() => {
      updateCredits(); // Fetch credits on initial mount and address change
    }, [address]);
  
    const value: CreditsContextType = {
      credits,
      updateCredits,
    };
  
    return (
      <CreditsContext.Provider value={value}>
        {children}
      </CreditsContext.Provider>
    );
  };
  
  
  export const useCredits = () => {
    return useContext(CreditsContext);
  };