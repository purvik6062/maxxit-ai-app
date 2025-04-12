"use client";
import { useState, useEffect } from "react";
import { FaTrophy, FaCheck, FaRobot, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Loader2, InfoIcon, TrendingUp, ArrowUpDown } from "lucide-react";
import "../../../public/css/mindshare.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
  // Added comparison metrics
  herdedVsHidden: number; // 0-100 (0 = fully herded, 100 = fully hidden)
  convictionVsHype: number; // 0-100 (0 = pure conviction, 100 = pure hype)
  memeVsInstitutional: number; // 0-100 (0 = meme, 100 = institutional)
}

interface UserResponse {
  _id: string;
  lastUpdated: string;
  userData: UserData;
}

type SortField =
  | "mindshare"
  | "followers"
  | "username"
  | "herdedVsHidden"
  | "convictionVsHype"
  | "memeVsInstitutional";
type SortDirection = "asc" | "desc";

export default function UserMetricsDashboard() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("mindshare");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "mindshare":
          valueA = a.userData?.mindshare;
          valueB = b.userData?.mindshare;
          break;
        case "followers":
          valueA = a.userData.publicMetrics?.followers_count;
          valueB = b.userData.publicMetrics?.followers_count;
          break;
        case "username":
          valueA = a.userData?.username.toLowerCase();
          valueB = b.userData?.username.toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "herdedVsHidden":
          valueA = a.userData?.herdedVsHidden;
          valueB = b.userData?.herdedVsHidden;
          break;
        case "convictionVsHype":
          valueA = a.userData?.convictionVsHype;
          valueB = b.userData?.convictionVsHype;
          break;
        case "memeVsInstitutional":
          valueA = a.userData?.memeVsInstitutional;
          valueB = b.userData?.memeVsInstitutional;
          break;
        default:
          valueA = a.userData?.mindshare;
          valueB = b.userData?.mindshare;
      }

      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  // Function to render the metric indicator on a scale from -50 to 50
  const renderMetricIndicator = (value: number, leftColor: string, rightColor: string) => {
    // Normalize value between -50 and +50
    const normalizedValue = Math.max(-50, Math.min(50, value));
    
    // Adjust the logic: positive value increases left, negative increases right
    const leftPercentage = ((normalizedValue + 50) / 100) * 100;
    const rightPercentage = 100 - leftPercentage;
    
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          {/* Two-color bar with dynamic widths */}
          <div className="flex h-full w-full">
            {/* Left side */}
            <div
              className={`${leftColor} h-full transition-all duration-300`}
              style={{ width: `${leftPercentage}%` }}
            ></div>
            
            {/* Right side */}
            <div
              className={`${rightColor} h-full transition-all duration-300`}
              style={{ width: `${rightPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800/30 shadow-lg p-8 min-h-[30vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mb-4 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
            <Loader2 className="w-14 h-14 text-blue-500/70 animate-spin absolute inset-0" />
          </div>
          <h3 className="text-xl font-medium text-gray-200 mb-1">Loading Mindshare Data</h3>
          <p className="text-gray-400 text-sm">Analyzing crypto market influence...</p>
        </div>
      </div>
    );
  }

  const sortedUsers = getSortedUsers();
  const topUsers = sortedUsers.slice(0, 3);
  const remainingUsers = sortedUsers.slice(3);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800/30 shadow-lg overflow-hidden w-[75rem]">
      {/* Header */}
      <div className="p-5 border-b border-gray-800/50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Mindful Mindshare</h2>
            <p className="text-gray-400 text-sm mt-1">Top analyst influence metrics in crypto markets</p>
          </div>
          <div className="flex gap-2">
            <div 
              onClick={() => sortUsers("mindshare")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                sortField === "mindshare" ? "bg-blue-900/50 text-blue-300" : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <TrendingUp size={14} />
              <span>Mindshare</span>
              {sortField === "mindshare" && (
                sortDirection === "asc" ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
              )}
            </div>
            <div 
              onClick={() => sortUsers("followers")}
              className={`px-3 py-1.5 text-xs rounded-md cursor-pointer flex items-center gap-1 ${
                sortField === "followers" ? "bg-blue-900/50 text-blue-300" : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span>Followers</span>
              {sortField === "followers" && (
                sortDirection === "asc" ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top 3 users in cards */}
      <div className="p-5 bg-gradient-to-b from-gray-900 to-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topUsers.map((user, index) => (
            <div 
              key={user._id}
              className="relative bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30 overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10"
            >
              {/* Position indicator */}
              <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center ${
                index === 0 ? "bg-yellow-500" : 
                index === 1 ? "bg-gray-400" : 
                "bg-amber-700"
              }`}>
                <FaTrophy className="w-3.5 h-3.5 text-gray-900" />
              </div>
              
              {/* User info */}
              <div className="pt-12 pb-5 px-4 text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <img 
                    src={user.userData.userProfileUrl || "/placeholder.svg"} 
                    alt={user.userData.username}
                    className="w-full h-full object-cover rounded-full border-2 border-gray-700"
                  />
                  {user.userData.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border border-gray-900">
                      <FaCheck className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-white">{user.userData.username}</h3>
                <p className="text-xs text-gray-400 mb-3">@{user.userData.username}</p>
                
                <div className="flex justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-blue-400 text-lg font-bold">{user.userData.mindshare.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Mindshare</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-200 text-lg font-medium">{user.userData.publicMetrics.followers_count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                </div>
                
                <Link 
                  href={`https://x.com/${user.userData.username}`} 
                  target="_blank" 
                  className="inline-flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition-colors"
                >
                  View Profile <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              </div>
              
              {/* Expand button */}
              <div 
                className="p-2 border-t border-gray-700/30 text-center cursor-pointer hover:bg-gray-700/20 transition-colors"
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
              >
                <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  {expandedUser === user._id ? "Hide Details" : "View Details"}
                  {expandedUser === user._id ? 
                    <FaChevronUp className="text-[10px]" /> : 
                    <FaChevronDown className="text-[10px]" />
                  }
                </span>
              </div>
              
              {/* Expanded metrics */}
              <AnimatePresence>
                {expandedUser === user._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-900/50 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Herded vs Hidden */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-teal-400">Herded</span>
                            <span className="text-xs text-gray-500">vs</span>
                            <span className="text-xs text-blue-400">Hidden</span>
                          </div>
                          <div className="relative">
                            <FaRobot 
                              className="text-gray-500 hover:text-blue-400 text-xs cursor-help" 
                              onMouseEnter={(e) => {
                                setTooltipPosition({ 
                                  x: e.clientX, 
                                  y: e.clientY 
                                });
                                setShowTooltip("herdedVsHidden");
                              }}
                              onMouseLeave={() => setShowTooltip(null)}
                            />
                          </div>
                        </div>
                        {renderMetricIndicator(
                          user.userData.herdedVsHidden, 
                          "bg-teal-400", 
                          "bg-blue-500"
                        )}
                      </div>
                      
                      {/* Conviction vs Hype */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-amber-400">Conviction</span>
                            <span className="text-xs text-gray-500">vs</span>
                            <span className="text-xs text-purple-400">Hype</span>
                          </div>
                          <div className="relative">
                            <FaRobot 
                              className="text-gray-500 hover:text-blue-400 text-xs cursor-help" 
                              onMouseEnter={(e) => {
                                setTooltipPosition({ 
                                  x: e.clientX, 
                                  y: e.clientY 
                                });
                                setShowTooltip("convictionVsHype");
                              }}
                              onMouseLeave={() => setShowTooltip(null)}
                            />
                          </div>
                        </div>
                        {renderMetricIndicator(
                          user.userData.convictionVsHype, 
                          "bg-amber-500", 
                          "bg-purple-500"
                        )}
                      </div>
                      
                      {/* Meme vs Institutional */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-cyan-400">Meme</span>
                            <span className="text-xs text-gray-500">vs</span>
                            <span className="text-xs text-pink-400">Institutional</span>
                          </div>
                          <div className="relative">
                            <FaRobot 
                              className="text-gray-500 hover:text-blue-400 text-xs cursor-help" 
                              onMouseEnter={(e) => {
                                setTooltipPosition({ 
                                  x: e.clientX, 
                                  y: e.clientY 
                                });
                                setShowTooltip("memeVsInstitutional");
                              }}
                              onMouseLeave={() => setShowTooltip(null)}
                            />
                          </div>
                        </div>
                        {renderMetricIndicator(
                          user.userData.memeVsInstitutional, 
                          "bg-cyan-400", 
                          "bg-pink-500"
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      
      {/* Remaining users in a compact list */}
      <div className="p-5 bg-black/30">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <ArrowUpDown size={12} className="mr-1" /> 
          All Rankings {sortField !== "mindshare" && <span className="text-xs ml-1 text-gray-500">(sorted by {sortField})</span>}
        </h3>
        
        <div className="space-y-1">
          {remainingUsers.map((user, index) => (
            <div 
              key={user._id}
              className="relative bg-gray-800/20 backdrop-blur-sm rounded-lg border border-gray-800/30 transition-all hover:border-blue-500/30"
            >
              <div className="px-3 py-2 flex items-center">
                {/* Left side with rank and profile */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800/70 text-gray-400 text-xs font-medium mr-2">
                    {index + 4}
                  </div>
                  
                  <div className="relative w-8 h-8">
                    <img 
                      src={user.userData.userProfileUrl || "/placeholder.svg"} 
                      alt={user.userData.username}
                      className="w-full h-full object-cover rounded-full border border-gray-700/50"
                    />
                    {user.userData.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-gray-900">
                        <FaCheck className="w-1 h-1 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-white">{user.userData.username}</h4>
                    <p className="text-xs text-gray-500">@{user.userData.username}</p>
                  </div>
                </div>
                
                {/* Spacer */}
                <div className="flex-grow"></div>
                
                {/* Right side with metrics - closer together */}
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className="text-blue-400 text-sm font-medium">{user.userData.mindshare.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Mindshare</p>
                  </div>
                  
                  <div className="text-right mr-4">
                    <p className="text-gray-300 text-sm">{user.userData.publicMetrics.followers_count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  
                  <button 
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      expandedUser === user._id 
                        ? "bg-blue-900/40 text-blue-300" 
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                  >
                    {expandedUser === user._id ? "Hide" : "Details"}
                  </button>
                </div>
              </div>
              
              {/* Expandable details */}
              <AnimatePresence>
                {expandedUser === user._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-800/30 space-y-3 bg-gray-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Herded vs Hidden */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                              <span className="text-xs text-gray-400">Herded - Hidden</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            </div>
                          </div>
                          {renderMetricIndicator(
                            user.userData.herdedVsHidden, 
                            "bg-teal-400", 
                            "bg-blue-500"
                          )}
                        </div>
                        
                        {/* Conviction vs Hype */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-400">Conviction - Hype</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            </div>
                          </div>
                          {renderMetricIndicator(
                            user.userData.convictionVsHype, 
                            "bg-amber-500", 
                            "bg-purple-500"
                          )}
                        </div>
                        
                        {/* Meme vs Institutional */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                              <span className="text-xs text-gray-400">Meme - Institutional</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                            </div>
                          </div>
                          {renderMetricIndicator(
                            user.userData.memeVsInstitutional, 
                            "bg-cyan-400", 
                            "bg-pink-500"
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Link 
                          href={`https://x.com/${user.userData.username}`} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition-colors"
                        >
                          View Profile <FaExternalLinkAlt className="text-[10px]" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {users.length === 0 && (
          <div className="p-8 text-center bg-gray-900/20 rounded-lg border border-gray-800/30">
            <InfoIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No influencer data available</p>
          </div>
        )}
      </div>
      
      {/* Tooltip for AI metrics */}
      {showTooltip && (
        <div 
          className="fixed z-50 bg-gray-800 rounded-md shadow-lg p-2 text-xs text-white max-w-[200px]"
          style={{ 
            left: `${tooltipPosition.x + 10}px`, 
            top: `${tooltipPosition.y - 10}px` 
          }}
        >
          <p className="font-medium">AI-Powered Metric</p>
          <p className="text-gray-300 text-[10px] mt-1">
            {showTooltip === "herdedVsHidden" && "Analyzes whether content follows crowd sentiment or provides contrarian views."}
            {showTooltip === "convictionVsHype" && "Measures genuine belief versus promotional content based on language patterns."}
            {showTooltip === "memeVsInstitutional" && "Evaluates content tone from casual/humorous to formal/institutional."}
          </p>
        </div>
      )}
    </div>
  );
}

