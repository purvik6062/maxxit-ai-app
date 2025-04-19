import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

interface EnhancedAgent {
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
}

interface UserDataContextType {
  agents: EnhancedAgent[];
  rawData: UserResponse[];
  loadingUmd: boolean;
  error: any;
  refreshData: () => Promise<void>;
}

// Create context with default values
const UserDataContext = createContext<UserDataContextType>({
  agents: [],
  rawData: [],
  loadingUmd: false,
  error: null,
  refreshData: async () => {},
});

// Cache keys
const CACHE_KEY = 'user_profile_data';
const CACHE_TIMESTAMP_KEY = 'user_profile_data_timestamp';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawData, setRawData] = useState<UserResponse[]>([]);
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [loadingUmd, setLoadingUmd] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Function to map raw API data to EnhancedAgent format
  const mapToEnhancedAgents = (data: UserResponse[]): EnhancedAgent[] => {
    return data.map((item) => ({
      name: item.name,
      twitterHandle: item.twitterHandle,
      impactFactor: item.impactFactor,
      heartbeat: item.heartbeat,
      mindshare: item.userData.mindshare ?? 0,
      followers: item.userData.publicMetrics.followers_count ?? 0,
      profileUrl: item.userData.userProfileUrl || "",
      verified: item.userData.verified || false,
      herdedVsHidden: item.userData.herdedVsHidden ?? 1,
      convictionVsHype: item.userData.convictionVsHype ?? 1,
      memeVsInstitutional: item.userData.memeVsInstitutional ?? 1,
    }));
  };

  // Function to check if cache is valid
  // const isCacheValid = (): boolean => {
  //   const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  //   if (!timestamp) return false;
    
  //   const cachedTime = parseInt(timestamp, 10);
  //   const currentTime = new Date().getTime();
    
  //   return currentTime - cachedTime < CACHE_EXPIRY;
  // };

  // Function to fetch data from API
  const fetchUserProfileData = useCallback(async (forceRefresh = false): Promise<void> => {
    // Check cache first if not forcing refresh
    // if (!forceRefresh) {
    //   // const cachedData = localStorage.getItem(CACHE_KEY);
    //   if (cachedData && isCacheValid()) {
    //     try {
    //       const parsedData = JSON.parse(cachedData) as UserResponse[];
    //       setRawData(parsedData);
    //       setAgents(mapToEnhancedAgents(parsedData));
    //       return;
    //     } catch (e) {
    //       console.error("Error parsing cached data:", e);
    //       // Continue to fetch if cache parsing fails
    //     }
    //   }
    // }

    setLoadingUmd(true);
    setError(null);
    
    try {
      const response = await fetch("/api/get-user-profile-data");
      if (!response.ok) throw new Error("Failed to fetch user profile data");
      
      const data: UserResponse[] = await response.json();
      
      // Save to state
      setRawData(data);
      setAgents(mapToEnhancedAgents(data));
      
      // Save to cache
      // localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      // localStorage.setItem(CACHE_TIMESTAMP_KEY, String(new Date().getTime()));
    } catch (err) {
      console.error("Failed to fetch user profile data:", err);
      setError(err);
    } finally {
      setLoadingUmd(false);
    }
  }, []);

  // Function to refresh data (can be called from components)
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchUserProfileData(true);
  }, [fetchUserProfileData]);

  // Initial data load on component mount
  useEffect(() => {
    // Clear localStorage on hard or soft refresh
    // localStorage.removeItem(CACHE_KEY);
    // localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  
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