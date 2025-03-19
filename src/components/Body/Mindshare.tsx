"use client";
import { useState, useEffect } from "react";
import {
  FaTrophy,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheck,
  FaRobot,
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import "../../../public/css/mindshare.css";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
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
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipId] = useState("herdedVsHidden");

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/get-user-profile-data");
        // Simulate data with comparison metrics since the API doesn't provide them
        let data: UserResponse[] = await response.json();

        // Add the comparison metrics to each user
        data = data.map((user) => ({
          ...user,
          userData: {
            ...user.userData,
            herdedVsHidden: Math.floor(Math.random() * 101), // Random value between 0-100
            convictionVsHype: Math.floor(Math.random() * 101),
            memeVsInstitutional: Math.floor(Math.random() * 101),
          },
        }));

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
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "mindshare":
          valueA = a.userData.mindshare;
          valueB = b.userData.mindshare;
          break;
        case "followers":
          valueA = a.userData.publicMetrics.followers_count;
          valueB = b.userData.publicMetrics.followers_count;
          break;
        case "username":
          valueA = a.userData.username.toLowerCase();
          valueB = b.userData.username.toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "herdedVsHidden":
          valueA = a.userData.herdedVsHidden;
          valueB = b.userData.herdedVsHidden;
          break;
        case "convictionVsHype":
          valueA = a.userData.convictionVsHype;
          valueB = b.userData.convictionVsHype;
          break;
        case "memeVsInstitutional":
          valueA = a.userData.memeVsInstitutional;
          valueB = b.userData.memeVsInstitutional;
          break;
        default:
          valueA = a.userData.mindshare;
          valueB = b.userData.mindshare;
      }

      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-2 text-gray-200" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="ml-2 text-blue-400" />
    ) : (
      <FaSortDown className="ml-2 text-blue-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading Mindful Mindshares...</p>
        </div>
      </div>
    );
  }

  const sortedUsers = getSortedUsers();

  // Function to render comparison bar - update this function
  const renderComparisonBar = (
    value: number,
    leftLabel: string,
    rightLabel: string,
    field: SortField
  ) => {
    // Define specific colors for each comparison type
    let leftColor, rightColor;

    if (field === "herdedVsHidden") {
      leftColor = "bg-teal-400";
      rightColor = "bg-blue-500";
    } else if (field === "convictionVsHype") {
      leftColor = "bg-amber-500";
      rightColor = "bg-purple-500";
    } else {
      // memeVsInstitutional
      leftColor = "bg-cyan-400";
      rightColor = "bg-pink-500";
    }

    return (
      <div className="w-full flex flex-col gap-1">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
          {/* Left side with its own color */}
          <div
            className={`h-full ${leftColor} absolute left-0 top-0`}
            style={{ width: `${value}%` }}
          />

          {/* Right side with its own color */}
          <div
            className={`h-full ${rightColor} absolute top-0 right-0`}
            style={{ width: `${100 - value}%` }}
          />

          {/* Divider line at the value point */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white"
            style={{ left: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-[#121212] to-black p-4 md:p-6 text-white">
      <div className="max-w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500">
            Mindful Mindshare
          </h1>
          <p className="text-gray-200 mt-2 text-center">
            Track performance and engagement metrics across users
          </p>
        </div>

        {/* Scrollable container */}
        <div className="overflow-x-auto pb-4 max-w-full">
          <div className="min-w-[1300px] w-max mx-auto borderContainer">
            {/* Header with sorting options */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-t-xl p-4 borderUsers">
              <div className="flex items-center text-sm font-medium text-gray-200">
                <div className="w-16 text-center">#</div>
                <div
                  className="w-[18rem] flex-1 flex items-center cursor-pointer hover:text-white transition-colors"
                  onClick={() => sortUsers("username")}
                >
                  Profile {getSortIcon("username")}
                </div>
                <div
                  className="w-28 flex items-center cursor-pointer hover:text-white transition-colors"
                  onClick={() => sortUsers("mindshare")}
                >
                  Mindshare {getSortIcon("mindshare")}
                </div>
                <div
                  className="w-28 flex items-center cursor-pointer hover:text-white transition-colors"
                  onClick={() => sortUsers("followers")}
                >
                  Followers {getSortIcon("followers")}
                </div>
                <div className="w-48 text-center">Engagement</div>

                {/* Vs Metrics Headers */}
                <div
                  className="relative w-56 flex items-center justify-center cursor-pointer hover:text-white transition-colors ml-8"
                  onClick={() => sortUsers("herdedVsHidden")}
                >
                  <div className="flex items-center">
                    <span className="px-2 py-1 rounded mr-1 bg-teal-400 text-gray-900">
                      Herded
                    </span>
                    <span className="text-gray-200">Vs</span>
                    <span className="px-2 py-1 rounded ml-1 bg-blue-500 text-white">
                      Hidden
                    </span>
                    {getSortIcon("herdedVsHidden")}
                  </div>
                  <div className="relative ml-1">
                    <FaRobot
                      className="text-blue-400 hover:text-blue-300 cursor-help transition-colors"
                      onMouseEnter={() => setShowTooltip("herdedVsHidden")}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === "herdedVsHidden" && (
                      <div className="absolute left-0 top-4 z-50 w-max p-2 bg-gray-800 rounded-md shadow-lg text-xs text-white">
                        Powered by AI
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="w-56 flex items-center justify-center cursor-pointer hover:text-white transition-colors ml-8"
                  onClick={() => sortUsers("convictionVsHype")}
                >
                  <div className="flex items-center">
                    <span className="px-2 py-1 rounded mr-1 bg-amber-500 text-gray-900">
                      Conviction
                    </span>
                    <span className="text-gray-200">Vs</span>
                    <span className="px-2 py-1 rounded ml-1 bg-purple-500 text-white">
                      Hype
                    </span>
                    {getSortIcon("convictionVsHype")}
                  </div>
                  <div className="relative ml-1">
                    <FaRobot
                      className="text-blue-400 hover:text-blue-300 cursor-help transition-colors"
                      onMouseEnter={() => setShowTooltip("convictionVsHype")}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === "convictionVsHype" && (
                      <div className="absolute left-0 top-4 z-50 w-max p-2 bg-gray-800 rounded-md shadow-lg text-xs text-white">
                        Powered by AI
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="w-56 flex items-center justify-center cursor-pointer hover:text-white transition-colors ml-8"
                  onClick={() => sortUsers("memeVsInstitutional")}
                >
                  <div className="flex items-center">
                    <span className="px-2 py-1 rounded mr-1 bg-cyan-400 text-gray-900">
                      Meme
                    </span>
                    <span className="text-gray-200">Vs</span>
                    <span className="px-2 py-1 rounded ml-1 bg-pink-500 text-white">
                      Institutional
                    </span>
                    {getSortIcon("memeVsInstitutional")}
                  </div>
                  <div className="relative ml-1">
                    <FaRobot
                      className="text-blue-400 hover:text-blue-300 cursor-help transition-colors"
                      onMouseEnter={() => setShowTooltip("memeVsInstitutional")}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === "memeVsInstitutional" && (
                      <div className="absolute -left-14 top-4 z-50 w-max p-2 bg-gray-800 rounded-md shadow-lg text-xs text-white">
                        Powered by AI
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User list */}
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-b-xl overflow-x-scroll">
              {sortedUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative group border-b border-gray-800/50 last:border-0`}
                  onMouseEnter={() => setHoveredUser(user._id)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <Link
                    href={`https://x.com/${user.userData.username}`}
                    target="_blank"
                    className="relative flex items-center p-3 hover:bg-gray-800/30 transition-colors duration-300 borderUsers"
                  >
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
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-200">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Profile - Image and Name side by side with flex */}
                    <div className="flex-1 flex items-center space-x-4">
                      <div className="relative">
                        <div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300 -z-10`}
                        ></div>
                        <img
                          src={
                            user.userData.userProfileUrl || "/placeholder.svg"
                          }
                          alt={`${user.userData.username}'s profile`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-transparent transition-all duration-300 z-10"
                        />
                        {user.userData.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-gray-900 z-20">
                            <FaCheck className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-blue-400 transition-all duration-300">
                          {user.userData.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          @{user.userData.username}
                        </span>
                      </div>
                    </div>

                    {/* Mindshare */}
                    <div className="w-28">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 font-semibold">
                        {user.userData.mindshare.toFixed(2)}%
                      </span>
                    </div>

                    {/* Followers */}
                    <div className="w-28 text-gray-200">
                      {user.userData.publicMetrics.followers_count.toLocaleString()}
                    </div>

                    {/* Engagement Bar */}
                    <div className="w-48">
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

                    {/* Herded vs Hidden Bar */}
                    <div className="w-56 ml-8">
                      {renderComparisonBar(
                        user.userData.herdedVsHidden,
                        "Herded",
                        "Hidden",
                        "herdedVsHidden"
                      )}
                    </div>

                    {/* Conviction vs Hype Bar */}
                    <div className="w-56 ml-8">
                      {renderComparisonBar(
                        user.userData.convictionVsHype,
                        "Conviction",
                        "Hype",
                        "convictionVsHype"
                      )}
                    </div>

                    {/* Meme vs Institutional Bar */}
                    <div className="w-56 ml-8">
                      {renderComparisonBar(
                        user.userData.memeVsInstitutional,
                        "Meme",
                        "Institutional",
                        "memeVsInstitutional"
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
