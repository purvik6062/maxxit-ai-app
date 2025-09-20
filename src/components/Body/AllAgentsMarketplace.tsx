"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Shield,
  Info,
  ExternalLink,
  Rocket,
  Filter,
  X,
  Grid,
  List,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Zap,
  Target,
} from "lucide-react";
import { AgentDeploymentModal } from "./AgentDeploymentModal";

interface SubscribedAccount {
  twitterHandle: string;
  subscriptionDate: string;
  expiryDate: string;
  costPaid: number;
  influencerInfo?: {
    _id: string;
    twitterHandle: string;
    name: string;
    userProfileUrl: string;
    verified: boolean;
    followersCount: number;
  } | null;
}

interface AgentData {
  _id: string;
  twitterUsername: string;
  twitterId: string;
  telegramId: string;
  credits: number;
  subscribedAccounts: SubscribedAccount[];
  customizationOptions: {
    r_last6h_pct: number;
    d_pct_mktvol_6h: number;
    d_pct_socvol_6h: number;
    d_pct_sent_6h: number;
    d_pct_users_6h: number;
    d_pct_infl_6h: number;
    d_galaxy_6h: number;
    neg_d_altrank_6h: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MetricExplanation {
  label: string;
  description: string;
  category: "technical" | "social" | "fundamental";
  range: string;
  impact: "high" | "medium" | "low";
}

interface SafeConfig {
  safeAddress: string;
  type: "perpetuals" | "spot";
  networkKey: string;
  createdAt: string;
  isFunded: boolean;
  agentId: string;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  explanation?: MetricExplanation;
  isPercentage?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend = "neutral",
  explanation,
  isPercentage = true,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getValueColor = () => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getProgressColor = () => {
    if (value > 0) return "bg-gradient-to-r from-green-500 to-green-400";
    if (value < 0) return "bg-gradient-to-r from-red-500 to-red-400";
    return "bg-gradient-to-r from-gray-500 to-gray-400";
  };

  const getTrendIcon = () => {
    if (trend === "up")
      return <ArrowUpRight className="w-3 h-3 text-green-400 animate-pulse" />;
    if (trend === "down")
      return <ArrowDownRight className="w-3 h-3 text-red-400 animate-pulse" />;
    return null;
  };

  const normalizedValue = Math.min(Math.max(Math.abs(value), 0), 100);

  return (
    <div
      className="group bg-[#0D1321] rounded-xl p-4 border-2 transition-all duration-300 relative overflow-hidden hover:scale-[1.02] hover:shadow-xl"
      style={{
        borderColor: isHovered ? "#4A5568" : "#353940",
        boxShadow: isHovered ? "0 10px 25px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />

      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10`} style={{ padding: "2px" }}>
        <div className="w-full h-full bg-[#0D1321] rounded-xl" />
      </div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-600/50 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <span className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors duration-300">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {explanation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
            >
              <Info className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 relative z-10">
        <div className={`text-xl font-bold transition-all duration-300 group-hover:scale-105 ${getValueColor()}`}>
          {isPercentage && value !== 0 && (value > 0 ? "+" : "")}
          {value}
          {isPercentage ? "%" : ""}
        </div>

        {/* Enhanced progress bar */}
        <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} rounded-full transition-all duration-700 ease-out relative`}
            style={{ width: `${normalizedValue}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Enhanced tooltip */}
      {explanation && showInfo && (
        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-[#0D1321]/95 backdrop-blur-md border-2 rounded-xl shadow-2xl z-30 transition-all duration-300 animate-fade-in-up"
          style={{ borderColor: "#4A5568" }}>
          <div className="text-sm text-white font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            {explanation.label}
          </div>
          <div className="text-xs text-gray-300 mb-3 leading-relaxed">
            {explanation.description}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`px-3 py-1.5 rounded-lg font-medium ${explanation.category === "technical"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : explanation.category === "social"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
            >
              {explanation.category}
            </span>
            <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600/50">
              {explanation.range}
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg font-medium ${explanation.impact === "high"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : explanation.impact === "medium"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
            >
              {explanation.impact} impact
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// New Enhanced Subscribed Influencers Modal
interface SubscribedInfluencersModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SubscribedAccount[];
  agentUsername: string;
}

const SubscribedInfluencersModal: React.FC<SubscribedInfluencersModalProps> = ({
  isOpen,
  onClose,
  accounts,
  agentUsername,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"followers" | "name" | "date">(
    "followers",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAndSortedAccounts = accounts
    .filter(
      (account) =>
        account.twitterHandle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (account.influencerInfo?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "followers":
          aValue = a.influencerInfo?.followersCount || 0;
          bValue = b.influencerInfo?.followersCount || 0;
          break;
        case "name":
          aValue = (a.influencerInfo?.name || a.twitterHandle).toLowerCase();
          bValue = (b.influencerInfo?.name || b.twitterHandle).toLowerCase();
          break;
        case "date":
          aValue = new Date(a.subscriptionDate).getTime();
          bValue = new Date(b.subscriptionDate).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 max-h-[90vh] rounded-2xl border shadow-2xl" style={{ background: "linear-gradient(to bottom, #0D1321, #070915)", borderColor: "#353940" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#353940" }}>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Subscribed Influencers
            </h2>
            <p className="text-[#8ba1bc] mt-1">
              @{agentUsername} • {accounts.length} accounts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1a2234] transition-colors text-[#8ba1bc] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b" style={{ borderColor: "#353940", background: "#0D1321" }}>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8ba1bc] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search influencers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0D1321] border rounded-xl text-white placeholder-[#8ba1bc] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{ borderColor: "#353940" }}
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-3">
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "followers" | "name" | "date")
                  }
                  className="px-3 py-2 bg-[#0D1321] border rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  style={{ borderColor: "#353940" }}
                >
                  <option value="followers">Followers</option>
                  <option value="name">Name</option>
                  <option value="date">Date Added</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 bg-[#0D1321] border rounded-lg hover:bg-[#1a2234] transition-colors"
                  style={{ borderColor: "#353940" }}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4 text-[#8ba1bc]" />
                  ) : (
                    <SortDesc className="w-4 h-4 text-[#8ba1bc]" />
                  )}
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-[#0D1321] rounded-lg p-1 border" style={{ borderColor: "#353940" }}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid"
                    ? "bg-[#1a2234] text-white"
                    : "text-[#8ba1bc] hover:text-white"
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list"
                    ? "bg-[#1a2234] text-white"
                    : "text-[#8ba1bc] hover:text-white"
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAndSortedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchTerm
                  ? "No influencers match your search"
                  : "No subscribed influencers"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAccounts.map((account) => (
                <div
                  key={account.twitterHandle}
                  className="group rounded-xl p-5 border transition-all duration-300 cursor-pointer"
                  style={{ background: "#0D1321", borderColor: "#353940" }}
                  onClick={() =>
                    window.open(
                      `https://twitter.com/${account.twitterHandle}`,
                      "_blank",
                    )
                  }
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full border-3 overflow-hidden transition-all duration-300" style={{ borderColor: "#353940", background: "#111528" }}>
                        <img
                          src={
                            account.influencerInfo?.userProfileUrl ||
                            `https://picsum.photos/seed/${account.twitterHandle}/80/80`
                          }
                          alt={
                            account.influencerInfo?.name ||
                            account.twitterHandle
                          }
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://picsum.photos/seed/${account.twitterHandle}/80/80`;
                          }}
                        />
                      </div>
                      {account.influencerInfo?.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {account.influencerInfo?.name || account.twitterHandle}
                    </h3>
                    <p className="text-[#8ba1bc] text-sm mb-3">
                      @{account.twitterHandle}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-xs text-[#8ba1bc] mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(
                          account.influencerInfo?.followersCount || 0,
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(account.subscriptionDate)}
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-center">
                      <div className="flex items-center gap-1 text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View Profile
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedAccounts.map((account) => (
                <div
                  key={account.twitterHandle}
                  className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                  style={{ background: "#0D1321", borderColor: "#353940" }}
                  onClick={() =>
                    window.open(
                      `https://twitter.com/${account.twitterHandle}`,
                      "_blank",
                    )
                  }
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 overflow-hidden transition-all duration-300" style={{ borderColor: "#353940", background: "#111528" }}>
                      <img
                        src={
                          account.influencerInfo?.userProfileUrl ||
                          `https://picsum.photos/seed/${account.twitterHandle}/64/64`
                        }
                        alt={
                          account.influencerInfo?.name || account.twitterHandle
                        }
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/${account.twitterHandle}/64/64`;
                        }}
                      />
                    </div>
                    {account.influencerInfo?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                        <Shield className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {account.influencerInfo?.name || account.twitterHandle}
                    </h3>
                    <p className="text-[#8ba1bc] text-sm mb-2">
                      @{account.twitterHandle}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#8ba1bc]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(
                          account.influencerInfo?.followersCount || 0,
                        )}{" "}
                        followers
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Added {formatDate(account.subscriptionDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#8ba1bc] group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AllAgentsMarketplace: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "subscribers" | "recent" | "performance"
  >("subscribers");
  const [selectedInfluencersModal, setSelectedInfluencersModal] = useState<{
    isOpen: boolean;
    accounts: SubscribedAccount[];
    agentUsername: string;
  }>({ isOpen: false, accounts: [], agentUsername: "" });
  const [deploymentModal, setDeploymentModal] = useState<{
    isOpen: boolean;
    agentUsername: string;
    agentId: string;
  }>({ isOpen: false, agentUsername: "", agentId: "" });
  const [userSafeConfigs, setUserSafeConfigs] = useState<SafeConfig[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/all-agents");
        const data = await response.json();

        if (!data.success) {
          if (data.error?.retryable) {
            throw new Error(
              "Database temporarily unavailable. Please refresh the page in a few moments.",
            );
          }
          throw new Error(data.error?.message || "Failed to fetch agents");
        }

        setAgents(data.data.agents);
        setFilteredAgents(data.data.agents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchUserSafeConfigs = async () => {
      try {
        const response = await fetch("/api/user-agents");
        const data = await response.json();

        if (data.success) {
          setUserSafeConfigs(data.data.safeConfigs || []);
          setCurrentUsername(data.data.twitterUsername);
        }
      } catch (err) {
        console.error("Failed to fetch user safe configs:", err);
      }
    };

    fetchUserSafeConfigs();
  }, []);

  useEffect(() => {
    let filtered = agents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((agent) =>
        agent.twitterUsername.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((agent) => {
        const strategyType = getAgentStrategyType(agent);
        return strategyType
          .toLowerCase()
          .includes(categoryFilter.toLowerCase());
      });
    }

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "subscribers":
          return b.subscribedAccounts.length - a.subscribedAccounts.length;
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "performance":
          const aPerf =
            a.customizationOptions.r_last6h_pct +
            a.customizationOptions.d_pct_mktvol_6h;
          const bPerf =
            b.customizationOptions.r_last6h_pct +
            b.customizationOptions.d_pct_mktvol_6h;
          return bPerf - aPerf;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, categoryFilter, sortBy]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getAgentStrategyType = (agent: AgentData): string => {
    const options = agent.customizationOptions;

    if (options.d_pct_socvol_6h > 30 && options.d_pct_sent_6h > 20) {
      return "Social-Driven";
    } else if (options.r_last6h_pct > 20 && options.d_pct_mktvol_6h > 20) {
      return "Momentum";
    } else if (options.d_galaxy_6h > 5) {
      return "Fundamental";
    } else {
      return "Balanced";
    }
  };

  const getAgentDeployedTypes = (
    agentId: string,
  ): ("perpetuals" | "spot")[] => {
    const agentSafeConfigs = userSafeConfigs.filter(
      (config) => config.agentId === agentId,
    );
    return agentSafeConfigs.map((config) => config.type);
  };

  const getAvailableAgentTypes = (
    agentId: string,
  ): ("perpetuals" | "spot")[] => {
    const deployedTypes = getAgentDeployedTypes(agentId);
    const allTypes = ["perpetuals", "spot"] as const;
    return allTypes.filter((type) => !deployedTypes.includes(type));
  };

  const isOwnAgent = (agentUsername: string): boolean => {
    return currentUsername === agentUsername;
  };

  const getStrategyColor = (strategyType: string): string => {
    switch (strategyType) {
      case "Social-Driven":
        return "from-blue-500 to-cyan-500";
      case "Momentum":
        return "from-indigo-500 to-indigo-600";
      case "Fundamental":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const renderSubscriptionAvatars = (
    accounts: SubscribedAccount[],
    agentUsername: string,
  ) => {
    const visibleAccounts = accounts.slice(0, 4);
    const remainingCount = accounts.length - 4;

    const openModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedInfluencersModal({
        isOpen: true,
        accounts,
        agentUsername,
      });
    };

    if (accounts.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No subscriptions</p>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">
            Subscribed Influencers
          </span>
          <button
            onClick={openModal}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            View All ({accounts.length})
          </button>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex -space-x-3">
            {visibleAccounts.map((account, index) => {
              const imageUrl =
                account.influencerInfo?.userProfileUrl ||
                `https://picsum.photos/seed/${account.twitterHandle}/60/60`;

              return (
                <div
                  key={account.twitterHandle}
                  className="group relative transition-all duration-200 hover:z-10 cursor-pointer hover:scale-110"
                  style={{ zIndex: visibleAccounts.length - index }}
                  onClick={openModal}
                  title={`${account.influencerInfo?.name || account.twitterHandle} (${formatNumber(account.influencerInfo?.followersCount || 0)} followers)`}
                >
                  <div className="w-12 h-12 rounded-full border-3 border-gray-700 group-hover:border-blue-400 overflow-hidden bg-gray-800 transition-all duration-200 shadow-lg">
                    <img
                      src={imageUrl}
                      alt={
                        account.influencerInfo?.name || account.twitterHandle
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${account.twitterHandle}/60/60`;
                      }}
                    />
                  </div>
                  {account.influencerInfo?.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                      <Shield className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div
                className="group relative transition-all duration-200 hover:z-10 cursor-pointer hover:scale-110"
                onClick={openModal}
                title={`+${remainingCount} more subscriptions`}
              >
                <div className="w-12 h-12 rounded-full border-3 border-gray-700 group-hover:border-blue-400 bg-gray-800 flex items-center justify-center transition-all duration-200 shadow-lg">
                  <span className="text-white text-xs font-medium">
                    +{remainingCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component to display deployed safe wallets
  const DeployedSafeWallets: React.FC<{ agentId: string }> = ({ agentId }) => {
    const agentSafeConfigs = userSafeConfigs.filter(
      (config) => config.agentId === agentId,
    );

    if (agentSafeConfigs.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <h4 className="text-green-400 text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Deployed Safe Wallets
        </h4>
        <div className="space-y-3">
          {agentSafeConfigs.map((config) => (
            <div
              key={`${config.type}-${config.safeAddress}`}
              className="flex items-center justify-between bg-green-500/5 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${config.type === "perpetuals"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
                    }`}
                >
                  {config.type === "perpetuals" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-green-300 text-sm font-medium capitalize">
                    {config.type}
                  </span>
                  <div className="text-xs text-gray-400">
                    {config.safeAddress.slice(0, 8)}...
                    {config.safeAddress.slice(-6)}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open(
                    `https://app.safe.global/home?safe=${config.networkKey}:${config.safeAddress}`,
                    "_blank",
                  )
                }
                className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
              >
                <ExternalLink className="w-3 h-3" />
                View Safe
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <svg
              className="w-16 h-16 animate-spin mx-auto mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>

          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading Marketplace
          </h3>
          <p className="text-gray-400">Discovering trading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isConnectionError =
      error.includes("Database temporarily unavailable") ||
      error.includes("connection") ||
      error.includes("database");

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            {isConnectionError ? (
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertCircle className="w-10 h-10 text-yellow-400" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          <h3
            className={`text-2xl font-bold mb-3 ${isConnectionError ? "text-yellow-400" : "text-red-400"}`}
          >
            {isConnectionError ? "Connection Issue" : "Error"}
          </h3>

          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>

          {isConnectionError && (
            <p className="text-gray-400 text-sm mb-6">
              This is usually temporary. Please try again in a few moments.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 font-medium"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Refresh Page
            </button>

            {isConnectionError && (
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setTimeout(() => {
                    const fetchAgents = async () => {
                      try {
                        const response = await fetch("/api/all-agents");
                        const data = await response.json();

                        if (data.success) {
                          setAgents(data.data.agents);
                          setFilteredAgents(data.data.agents);
                          setError(null);
                        } else {
                          setError(
                            data.error?.message || "Failed to fetch agents",
                          );
                        }
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Failed to fetch agents",
                        );
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchAgents();
                  }, 1000);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[4rem]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative py-6 md:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent font-napzerRounded mb-4">
            Agents Marketplace
          </h1>
          <p className="text-[#8ba1bc] text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover, explore, and deploy sophisticated trading agents
            configured by the community
          </p>
        </div>

        {/* Enhanced Stats Bar */}
        <div className="bg-[#0d1321ca] rounded-2xl p-6 md:p-8 mb-10 border" style={{ borderColor: "#353940" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {agents.length}
              </div>
              <div className="text-sm text-[#8ba1bc] font-medium">
                Active Agents
              </div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-indigo-400 mb-1">
                {agents.reduce(
                  (sum, agent) => sum + agent.subscribedAccounts.length,
                  0,
                )}
              </div>
              <div className="text-sm text-[#8ba1bc] font-medium">
                Total Subscriptions
              </div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {userSafeConfigs.length}
              </div>
              <div className="text-sm text-[#8ba1bc] font-medium">
                Your Deployments
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="bg-[#0D1321] rounded-2xl p-6 md:p-8 mb-10 border" style={{ borderColor: "#353940" }}>
          <div className="flex flex-col xl:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8ba1bc] w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search agents by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-[#0D1321] border-2 rounded-xl text-white placeholder-[#8ba1bc] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg"
                  style={{ borderColor: "#353940" }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              {/* Category Filters */}
              <div className="flex bg-[#0D1321] rounded-full p-1.5 border" style={{ borderColor: "#353940" }}>
                {[
                  {
                    key: "all",
                    label: "All Agents",
                    icon: <Users className="w-4 h-4" />,
                  },
                  {
                    key: "social",
                    label: "Social-Driven",
                    icon: <Star className="w-4 h-4" />,
                  },
                  {
                    key: "momentum",
                    label: "Momentum",
                    icon: <TrendingUp className="w-4 h-4" />,
                  },
                  {
                    key: "fundamental",
                    label: "Fundamental",
                    icon: <Target className="w-4 h-4" />,
                  },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setCategoryFilter(filter.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 ${categoryFilter === filter.key
                      ? "bg-[#1a2234] text-white shadow-inner"
                      : "text-[#8ba1bc] hover:text-white"
                      }`}
                  >
                    {filter.icon}
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex bg-[#0D1321] rounded-full p-1.5 border" style={{ borderColor: "#353940" }}>
                {[
                  {
                    key: "subscribers",
                    label: "Most Subscribed",
                    icon: <Star className="w-4 h-4" />,
                  },
                  {
                    key: "recent",
                    label: "Recently Updated",
                    icon: <Clock className="w-4 h-4" />,
                  },
                  {
                    key: "performance",
                    label: "Top Performance",
                    icon: <TrendingUp className="w-4 h-4" />,
                  },
                ].map((sort) => (
                  <button
                    key={sort.key}
                    onClick={() =>
                      setSortBy(
                        sort.key as "subscribers" | "recent" | "performance",
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 ${sortBy === sort.key
                      ? "bg-[#1a2234] text-white shadow-inner"
                      : "text-[#8ba1bc] hover:text-white"
                      }`}
                  >
                    {sort.icon}
                    <span className="hidden lg:inline">{sort.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAgents.map((agent, index) => {
            const strategyType = getAgentStrategyType(agent);
            const deployedTypes = getAgentDeployedTypes(agent._id);
            const availableTypes = getAvailableAgentTypes(agent._id);
            const isOwn = isOwnAgent(agent.twitterUsername);

            return (
              <div
                key={agent._id}
                className="group bg-[#0D1321] rounded-2xl p-6 border-2 transition-all duration-500 hover:scale-[1.03] shadow-2xl relative overflow-hidden animate-fade-in-up"
                style={{
                  borderColor: "#353940",
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-100 transition-opacity duration-500 rounded-2xl" />

                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-100 transition-opacity duration-500 blur-sm -z-10" style={{ padding: "2px" }}>
                  <div className="w-full h-full bg-[#0D1321] rounded-2xl" />
                </div>
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${getStrategyColor(strategyType)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <Users className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Animated ring around icon */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getStrategyColor(strategyType)} opacity-0 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500 blur-sm -z-10`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#AAC9FA] transition-colors duration-300">
                        @{agent.twitterUsername}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getStrategyColor(strategyType)} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        >
                          {strategyType}
                        </span>
                        {isOwn && (
                          <span className="px-2 py-1 bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-gray-300 rounded-full text-xs border border-gray-600/50 group-hover:border-gray-500/50 transition-all duration-300">
                            Your Agent
                          </span>
                        )}
                      </div>
                      <p className="text-[#8ba1bc] text-sm flex items-center gap-2 group-hover:text-[#B8C5D1] transition-colors duration-300">
                        <Users className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                        {agent.subscribedAccounts.length} subscriptions
                      </p>
                    </div>
                  </div>

                  {!isOwn && (
                    <div className="text-right relative z-10">
                      {availableTypes.length === 0 ? (
                        <div className="px-4 py-2.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-xl text-sm font-medium border-2 border-green-500/30 group-hover:border-green-400/50 group-hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          All Deployed
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setDeploymentModal({
                              isOpen: true,
                              agentUsername: agent.twitterUsername,
                              agentId: agent._id,
                            })
                          }
                          className={`px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-110 shadow-lg group-hover:shadow-xl relative overflow-hidden ${availableTypes.length === 2
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                            }`}
                        >
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Rocket className="w-4 h-4 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                          <span className="relative z-10">
                            {availableTypes.length === 2
                              ? "Deploy Agent"
                              : `Deploy ${availableTypes[0] === "perpetuals" ? "Perpetuals" : "Spot"}`}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <MetricCard
                    label="Price Momentum"
                    value={agent.customizationOptions.r_last6h_pct}
                    icon={<TrendingUp className="w-4 h-4" />}
                    trend={
                      agent.customizationOptions.r_last6h_pct > 0
                        ? "up"
                        : agent.customizationOptions.r_last6h_pct < 0
                          ? "down"
                          : "neutral"
                    }
                  />
                  <MetricCard
                    label="Market Volume"
                    value={agent.customizationOptions.d_pct_mktvol_6h}
                    icon={<BarChart3 className="w-4 h-4" />}
                    trend={
                      agent.customizationOptions.d_pct_mktvol_6h > 0
                        ? "up"
                        : agent.customizationOptions.d_pct_mktvol_6h < 0
                          ? "down"
                          : "neutral"
                    }
                  />
                  <MetricCard
                    label="Social Volume"
                    value={agent.customizationOptions.d_pct_socvol_6h}
                    icon={<Users className="w-4 h-4" />}
                    trend={
                      agent.customizationOptions.d_pct_socvol_6h > 0
                        ? "up"
                        : agent.customizationOptions.d_pct_socvol_6h < 0
                          ? "down"
                          : "neutral"
                    }
                  />
                  <MetricCard
                    label="Sentiment"
                    value={agent.customizationOptions.d_pct_sent_6h}
                    icon={<Star className="w-4 h-4" />}
                    trend={
                      agent.customizationOptions.d_pct_sent_6h > 0
                        ? "up"
                        : agent.customizationOptions.d_pct_sent_6h < 0
                          ? "down"
                          : "neutral"
                    }
                  />
                </div>

                {/* Subscriptions Section */}
                {agent.subscribedAccounts.length > 0 && (
                  <div className="rounded-xl p-4 mb-4 border" style={{ background: "#111528", borderColor: "#353940" }}>
                    {renderSubscriptionAvatars(
                      agent.subscribedAccounts,
                      agent.twitterUsername,
                    )}
                  </div>
                )}

                {/* Deployed Safe Wallets */}
                <DeployedSafeWallets agentId={agent._id} />

                {/* Footer */}
                {/* <div className="flex items-center justify-between pt-4 border-t text-sm" style={{ borderColor: "#353940", color: "#8ba1bc" }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated {formatDate(agent.updatedAt)}
                  </span>
                  {deployedTypes.length > 0 && (
                    <div className="flex gap-1">
                      {deployedTypes.map((type) => (
                        <span
                          key={type}
                          className={`px-2 py-1 rounded text-xs font-medium ${type === "perpetuals"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                            }`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div> */}
              </div>
            );
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No agents found
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setSortBy("subscribers");
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Subscribed Influencers Modal */}
      <SubscribedInfluencersModal
        isOpen={selectedInfluencersModal.isOpen}
        onClose={() =>
          setSelectedInfluencersModal({
            isOpen: false,
            accounts: [],
            agentUsername: "",
          })
        }
        accounts={selectedInfluencersModal.accounts}
        agentUsername={selectedInfluencersModal.agentUsername}
      />

      {/* Agent Deployment Modal */}
      <AgentDeploymentModal
        isOpen={deploymentModal.isOpen}
        onClose={() =>
          setDeploymentModal({ isOpen: false, agentUsername: "", agentId: "" })
        }
        agentUsername={deploymentModal.agentUsername}
        agentId={deploymentModal.agentId}
        existingSafeConfigs={userSafeConfigs}
      />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AllAgentsMarketplace;
