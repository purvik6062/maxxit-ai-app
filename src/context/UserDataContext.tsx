import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// Import the types from your existing code
interface PublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
}

interface UserData {
  userId: string;
  username: string;
  verified: boolean;
  publicMetrics: PublicMetrics;
  userProfileUrl: string;
  mindshare: number;
  herdedVsHidden: number;
  convictionVsHype: number;
  memeVsInstitutional: number;
}

interface TweetScoutData {
  id?: string;
  name?: string;
  screen_name?: string;
  description?: string;
  followers_count?: number;
  friends_count?: number;
  register_date?: string;
  tweets_count?: number;
  banner?: string;
  verified?: boolean;
  avatar?: string;
  can_dm?: boolean;
}

interface UserResponse {
  _id: string;
  name: string;
  twitterHandle: string;
  impactFactor: number | null;
  heartbeat: number | null;
  subscribers: string[];
  tweets: any[];
  processedTweetIds: string[];
  updatedAt: string;
  isProcessing: boolean;
  lastProcessed: string;
  userData: UserData;
  tweetScoutScore?: number;
  tweetScoutData?: TweetScoutData;
  createdAt?: string;
  subscriptionPrice?: number;
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
  signals: number;
  tokens: number;
  subscriptionPrice?: number;
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

  // Function to fetch Signals and Tokens data from trading-signals collection
  const fetchSignalsAndTokensData = useCallback(
    async (handles: string[]): Promise<Record<string, { signals: number; tokens: number }>> => {
      console.time("fetchSignalsAndTokensData");
      try {
        const response = await fetch("/api/get-signals-tokens-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handles }),
        });
        if (!response.ok)
          throw new Error("Failed to fetch signals and tokens data");
        const data = await response.json();
        console.timeEnd("fetchSignalsAndTokensData");
        return data;
      } catch (err) {
        console.error("Error fetching signals and tokens data:", err);
        console.timeEnd("fetchSignalsAndTokensData");
        return handles.reduce((acc, handle) => {
          acc[handle] = { signals: 0, tokens: 0 };
          return acc;
        }, {} as Record<string, { signals: number; tokens: number }>);
      }
    },
    []
  );

  // Function to fetch Impact Factor data from impact_factors collection
  const fetchImpactFactorData = useCallback(
    async (handles: string[]): Promise<Record<string, number>> => {
      console.time("fetchImpactFactorData");
      try {
        const response = await fetch("/api/get-impact-factors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handles }),
        });
        if (!response.ok) throw new Error("Failed to fetch impact factor data");
        const data = await response.json();
        console.time("fetchImpactFactorData");
        return data;
      } catch (err) {
        console.error("Error fetching impact factor data:", err);
        console.time("fetchImpactFactorData");
        return handles.reduce((acc, handle) => {
          acc[handle] = 0;
          return acc;
        }, {} as Record<string, number>);
      }
    },
    []
  );

  const fetchHeartbeatData = useCallback(
    async (handles: string[]): Promise<Record<string, number>> => {
      console.time("fetchHeartbeatData");
      try {
        const response = await fetch("/api/get-heartbeat-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handles }),
        });

        const data = await response.json();
        console.time("fetchHeartbeatData");

        if (!response.ok || !data.success) {
          throw new Error(
            data.error?.message || "Failed to fetch heartbeat data"
          );
        }

        return data.data;
      } catch (err) {
        console.error("Error fetching heartbeat data:", err);
        console.time("fetchHeartbeatData");
        return {};
      }
    },
    []
  );

  // Function to map raw API data to EnhancedAgent format
  const mapToEnhancedAgents = useCallback(
    (
      users: UserResponse[],
      signalsTokensData: Record<string, { signals: number; tokens: number }>,
      impactFactorData: Record<string, number>,
      heartbeatData: Record<string, number>
    ): EnhancedAgent[] => {
      return users.map((user) => ({
        name: user.name,
        twitterHandle: user.twitterHandle,
        impactFactor:
          impactFactorData[user.twitterHandle] ?? user.impactFactor ?? 0,
        heartbeat: heartbeatData[user.twitterHandle] ?? 0,
        mindshare: user.userData.mindshare ?? 0,
        followers: user.userData.publicMetrics.followers_count ?? 0,
        subscriptionPrice: user.subscriptionPrice ?? 0,
        profileUrl: user.userData.userProfileUrl || "",
        verified: user.userData.verified || false,
        herdedVsHidden: user.userData.herdedVsHidden ?? 1,
        convictionVsHype: user.userData.convictionVsHype ?? 1,
        memeVsInstitutional: user.userData.memeVsInstitutional ?? 1,
        subscribers: user.subscribers.length || 0,
        signals: signalsTokensData[user.twitterHandle]?.signals || 0,
        tokens: signalsTokensData[user.twitterHandle]?.tokens || 0,
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
        // Fetch the user profile data first
        console.time("fetchUserProfileData_api");
        const response = await fetch("/api/get-user-profile-data");
        if (!response.ok) throw new Error("Failed to fetch user profile data");
        const userData: UserResponse[] = await response.json();
        console.timeEnd("fetchUserProfileData_api");
        
        // Extract handles for parallel API requests
        const handles = userData.map(user => user.twitterHandle);
        
        // Fetch all additional data in parallel
        console.time("fetchUserProfileData_parallel");
        const [signalsTokensData, impactFactorData, heartbeatData] = await Promise.all([
          fetchSignalsAndTokensData(handles),
          fetchImpactFactorData(handles),
          fetchHeartbeatData(handles)
        ]);
        console.timeEnd("fetchUserProfileData_parallel");

        // Get enhanced agents
        const enhancedAgents = mapToEnhancedAgents(
          userData,
          signalsTokensData,
          impactFactorData,
          heartbeatData
        );

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
    [fetchSignalsAndTokensData, fetchImpactFactorData, fetchHeartbeatData, mapToEnhancedAgents, getValidCache, saveToCache]
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
