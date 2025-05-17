import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// Simplified interfaces based on the data we actually need
interface PublicMetrics {
  followers_count: number;
}

interface UserData {
  verified: boolean;
  publicMetrics: PublicMetrics;
  userProfileUrl: string;
  mindshare: number;
  herdedVsHidden: number;
  convictionVsHype: number;
  memeVsInstitutional: number;
}

// Optimized UserResponse interface with only the fields we need
interface UserResponse {
  _id: string;
  name: string;
  twitterHandle: string;
  subscribers: number; // Now a number instead of array
  userData: UserData;
  subscriptionPrice?: number;
  impactFactor?: number; // Added from impact_factors collection
  heartbeatScore?: number; // Added from heartbeat collection
}

export interface EnhancedAgent {
  name: string;
  twitterHandle: string;
  impactFactor: number;
  heartbeat: number;
  mindshare: number;
  followers: number;
  profileUrl: string;
  verified: boolean;
  herdedVsHidden: number;
  convictionVsHype: number;
  memeVsInstitutional: number;
  subscribers: number;
  subscriptionPrice: number;
}

interface UserDataContextType {
  agents: EnhancedAgent[];
  rawData: UserResponse[];
  loadingUmd: boolean;
  error: any;
  refreshData: () => Promise<void>;
}

interface CachedData {
  agents: EnhancedAgent[];
  timestamp: number;
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 1 * 60 * 60 * 1000;
const CACHE_KEY = "analyst_influencers_data_cache";

// Create context with default values
const UserDataContext = createContext<UserDataContextType>({
  agents: [],
  rawData: [],
  loadingUmd: false,
  error: null,
  refreshData: async () => {},
});

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rawData, setRawData] = useState<UserResponse[]>([]);
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [loadingUmd, setLoadingUmd] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Function to map raw API data to EnhancedAgent format
  const mapToEnhancedAgents = useCallback(
    (users: UserResponse[]): EnhancedAgent[] => {
      return users.map((user) => ({
        name: user.name,
        twitterHandle: user.twitterHandle,
        impactFactor: user.impactFactor ?? 0,
        heartbeat: user.heartbeatScore ?? 0,
        mindshare: user.userData?.mindshare ?? 0,
        followers: user.userData?.publicMetrics?.followers_count ?? 0,
        subscriptionPrice: user.subscriptionPrice ?? 0,
        profileUrl: user.userData?.userProfileUrl || "",
        verified: user.userData?.verified || false,
        herdedVsHidden: user.userData?.herdedVsHidden ?? 1,
        convictionVsHype: user.userData?.convictionVsHype ?? 1,
        memeVsInstitutional: user.userData?.memeVsInstitutional ?? 1,
        subscribers: user.subscribers ?? 0,
      }));
    },
    []
  );

  // Function to save data to localStorage
  const saveToCache = useCallback((agentsData: EnhancedAgent[]) => {
    try {
      const cacheData: CachedData = {
        agents: agentsData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, []);

  // Function to check if cache is valid
  const getValidCache = useCallback((): CachedData | null => {
    try {
      const cachedDataString = localStorage.getItem(CACHE_KEY);
      if (!cachedDataString) return null;

      const cachedData: CachedData = JSON.parse(cachedDataString);
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedData.timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.error("Failed to retrieve or parse cached data:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Function to fetch data from API
  const fetchUserProfileData = useCallback(
    async (forceRefresh = false): Promise<void> => {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getValidCache();
        if (cachedData) {
          setAgents(cachedData.agents);
          return;
        }
      }

      console.time("fetchUserProfileData_total");
      setLoadingUmd(true);
      setError(null);

      try {
        // Fetch the user profile data
        console.time("fetchUserProfileData_api");
        const response = await fetch("/api/get-user-profile-data");
        if (!response.ok) throw new Error("Failed to fetch user profile data");
        const userData: UserResponse[] = await response.json();
        console.timeEnd("fetchUserProfileData_api");
        
        // Get enhanced agents
        const enhancedAgents = mapToEnhancedAgents(userData);

        // Save to state
        setRawData(userData);
        setAgents(enhancedAgents);

        // Save to localStorage cache
        saveToCache(enhancedAgents);
      } catch (err) {
        console.error("Failed to fetch user profile data:", err);
        setError(err);
      } finally {
        console.timeEnd("fetchUserProfileData_total");
        setLoadingUmd(false);
      }
    },
    [mapToEnhancedAgents, getValidCache, saveToCache]
  );

  // Function to refresh data (can be called from components)
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchUserProfileData(true);
  }, [fetchUserProfileData]);

  // Initial data load on component mount
  useEffect(() => {
    fetchUserProfileData();
  }, [fetchUserProfileData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    agents,
    rawData,
    loadingUmd,
    error,
    refreshData,
  }), [agents, rawData, loadingUmd, error, refreshData]);

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the context
export const useUserData = () => useContext(UserDataContext);
