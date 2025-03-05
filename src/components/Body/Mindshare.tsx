import React, { useState, useEffect } from "react";
import { FaTrophy, FaSort, FaSortUp, FaSortDown, FaCheck } from "react-icons/fa";
import "../../../public/css/mindshare.css";
import { motion } from "framer-motion";

// Define TypeScript interface for user data
interface PublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  like_count: number;
  media_count: number;
}

interface UserData {
  userId: string;
  username: string;
  verified: boolean;
  publicMetrics: PublicMetrics;
  userProfileUrl: string;
  mindshare: number;
}

interface UserResponse {
  _id: string;
  lastUpdated: string;
  userData: UserData;
}

type SortField = 'mindshare' | 'followers' | 'username';
type SortDirection = 'asc' | 'desc';

export default function UserMetricsDashboard() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('mindshare');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/get-user-profile-data");
        const data: UserResponse[] = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const sortUsers = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'mindshare':
          valueA = a.userData.mindshare;
          valueB = b.userData.mindshare;
          break;
        case 'followers':
          valueA = a.userData.publicMetrics.followers_count;
          valueB = b.userData.publicMetrics.followers_count;
          break;
        case 'username':
          valueA = a.userData.username.toLowerCase();
          valueB = b.userData.username.toLowerCase();
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        default:
          valueA = a.userData.mindshare;
          valueB = b.userData.mindshare;
      }
      
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-2 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="ml-2 text-blue-400" /> 
      : <FaSortDown className="ml-2 text-blue-400" />;
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-pulse"></div>
          <div className="absolute inset-[42%] rounded-full bg-blue-400"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
            Loading Mindshares
          </h3>
        </div>
      </div>
      
    );
  }

  const sortedUsers = getSortedUsers();

  return (
    <div className="w-full h-fit bg-gradient-to-br from-slate-900 via-[#0a192f] to-black p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400">
            User Metrics Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-center">Track mindshare and engagement metrics across influencers</p>
        </div>

        {/* Header with sorting options */}
        <div className="borderContainer">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-t-xl p-4 borderUsers">
          <div className="flex items-center text-sm font-medium text-gray-200">
            <div className="w-16 text-center">#</div>
            <div 
              className="w-96 flex-1 flex items-center cursor-pointer hover:text-white transition-colors ml-[1.5rem]"
              onClick={() => sortUsers('username')}
            >
              Profile {getSortIcon('username')}
            </div>
            <div 
              className="w-40 flex items-center cursor-pointer hover:text-white transition-colors"
              onClick={() => sortUsers('mindshare')}
            >
              Mindshare {getSortIcon('mindshare')}
            </div>
            <div 
              className="w-40 flex items-center cursor-pointer hover:text-white transition-colors"
              onClick={() => sortUsers('followers')}
            >
              Followers {getSortIcon('followers')}
            </div>
            <div className="w-48">Engagement</div>
          </div>
        </div>

        {/* User list */}
        <div className="bg-slate-700/20 backdrop-blur-sm rounded-b-xl overflow-hidden borderMainDiv">
          {sortedUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative group border-b-2 border-blue-300/50 last:border-0`}
              onMouseEnter={() => setHoveredUser(user._id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              
              <div className="relative flex items-center p-4 hover:bg-slate-800/30 duration-300 borderUsers">
                {/* Ranking */}
                <div className="w-16 flex justify-center">
                  {index === 0 && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <FaTrophy className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {index === 1 && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/20">
                      <FaTrophy className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {index === 2 && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-700/20">
                      <FaTrophy className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {index >= 3 && (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-200">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile - Image and Name */}
                <div className="w-96 flex-1 flex items-center space-x-4 ml-[1rem]">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300 -z-10`}></div>
                    <img
                      src={user.userData.userProfileUrl || "/placeholder.svg"}
                      alt={`${user.userData.username}'s profile`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-transparent transition-all duration-300 z-10"
                    />
                    {user.userData.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-slate-900 z-20">
                        <FaCheck className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                      {user.userData.username}
                    </span>
                    <span className="text-xs text-gray-400">@{user.userData.userId}</span>
                  </div>
                </div>

                {/* Mindshare */}
                <div className="w-40">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 font-semibold">
                    {user.userData.mindshare.toFixed(2)}%
                  </span>
                </div>

                {/* Followers */}
                <div className="w-40 text-gray-200">
                  {user.userData.publicMetrics.followers_count.toLocaleString()}
                </div>

                {/* Engagement Bar */}
                <div className="w-48">
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{
                        width: `${Math.min(
                          user.userData.mindshare * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}