import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  subscribers: string[];
  signals: number;
  tokens: number;
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

// Cache expiration time (3 days in milliseconds)
const CACHE_EXPIRATION = 3 * 24 * 60 * 60 * 1000;
const CACHE_KEY = 'analyst_influencers_data_cache';

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
  const fetchSignalsAndTokensData = async (
    agentsData: UserResponse[]
  ): Promise<Record<string, { signals: number; tokens: number }>> => {
    const result: Record<string, { signals: number; tokens: number }> = {};
    try {
      const response = await fetch("/api/get-signals-tokens-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handles: agentsData.map((agent) => agent.twitterHandle),
        }),
      });
      if (!response.ok)
        throw new Error("Failed to fetch signals and tokens data");
      const data = await response.json();
      Object.keys(data).forEach((handle) => {
        result[handle] = {
          signals: data[handle].signals || 0,
          tokens: data[handle].tokens || 0,
        };
      });
    } catch (err) {
      console.error("Error fetching signals and tokens data:", err);
      agentsData.forEach((agent) => {
        result[agent.twitterHandle] = { signals: 0, tokens: 0 };
      });
    }
    return result;
  };

  // Function to fetch Impact Factor data from impact_factors collection
  const fetchImpactFactorData = async (
    handles: string[]
  ): Promise<Record<string, number>> => {
    const result: Record<string, number> = {};
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
      Object.keys(data).forEach((handle) => {
        result[handle] = data[handle] || 0;
      });
    } catch (err) {
      console.error("Error fetching impact factor data:", err);
      handles.forEach((handle) => {
        result[handle] = 0;
      });
    }
    return result;
  };

  const fetchHeartbeatData = async (
    handles: string[]
  ): Promise<Record<string, number>> => {
    try {
      const response = await fetch("/api/get-heartbeat-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handles }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message || "Failed to fetch heartbeat data"
        );
      }

      return data.data;
    } catch (err) {
      console.error("Error fetching heartbeat data:", err);
      return {};
    }
  };

  // Function to map raw API data to EnhancedAgent format
  const mapToEnhancedAgents = useCallback(
    async (
      users: UserResponse[],
      signalsTokensData: Record<string, { signals: number; tokens: number }>,
      impactFactorData: Record<string, number>,
      heartbeatData: Record<string, number>
    ): Promise<EnhancedAgent[]> => {
      return users.map((user) => ({
        name: user.name,
        twitterHandle: user.twitterHandle,
        impactFactor:
          impactFactorData[user.twitterHandle] ?? user.impactFactor ?? 0,
        heartbeat: heartbeatData[user.twitterHandle] ?? 0,
        mindshare: user.userData.mindshare ?? 0,
        followers: user.userData.publicMetrics.followers_count ?? 0,
        profileUrl: user.userData.userProfileUrl || "",
        verified: user.userData.verified || false,
        herdedVsHidden: user.userData.herdedVsHidden ?? 1,
        convictionVsHype: user.userData.convictionVsHype ?? 1,
        memeVsInstitutional: user.userData.memeVsInstitutional ?? 1,
        subscribers: user.subscribers || [],
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
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, []);

  // Function to check if cache is valid
  const getValidCache = useCallback((): CachedData | null => {
    try {
      const cachedDataString = localStorage.getItem(CACHE_KEY);
      if (!cachedDataString) return null;

      const cachedData: CachedData = JSON.parse(cachedDataString);
      const now = Date.now();
      
      // Check if cache is expired (older than 3 days)
      if (now - cachedData.timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return cachedData;
    } catch (error) {
      console.error('Failed to retrieve or parse cached data:', error);
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

      setLoadingUmd(true);
      setError(null);

      try {
        const response = await fetch("/api/get-user-profile-data");
        if (!response.ok) throw new Error("Failed to fetch user profile data");

        const data: UserResponse[] = await response.json();
        const signalsTokensData = await fetchSignalsAndTokensData(data);
        const impactFactorData = await fetchImpactFactorData(
          data.map((user) => user.twitterHandle)
        );
        const heartbeatData = await fetchHeartbeatData(
          data.map((user) => user.twitterHandle)
        );

        // Get enhanced agents
        const enhancedAgents = await mapToEnhancedAgents(
          data,
          signalsTokensData,
          impactFactorData,
          heartbeatData
        );

        // Save to state
        setRawData(data);
        setAgents(enhancedAgents);

        // Save to localStorage cache
        saveToCache(enhancedAgents);
      } catch (err) {
        console.error("Failed to fetch user profile data:", err);
        setError(err);
      } finally {
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

  return (
    <UserDataContext.Provider
      value={{
        agents,
        rawData,
        loadingUmd,
        error,
        refreshData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the context
export const useUserData = () => useContext(UserDataContext);
