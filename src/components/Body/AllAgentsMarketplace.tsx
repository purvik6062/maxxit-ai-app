"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search, TrendingUp, BarChart3, Users, Shield, Info, ExternalLink, Rocket } from "lucide-react";
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
  category: 'technical' | 'social' | 'fundamental';
  range: string;
  impact: 'high' | 'medium' | 'low';
}

interface SafeConfig {
  safeAddress: string;
  type: 'perpetuals' | 'spot';
  networkKey: string;
  createdAt: string;
  isFunded: boolean;
  agentId: string;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  explanation?: MetricExplanation;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color, explanation }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600/50 transition-colors relative group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {explanation && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
              title="Click for more info"
            >
              <Info className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
            </button>
          )}
          <div className={color}>
            {icon}
          </div>
        </div>
      </div>
      <div className="text-white text-lg font-semibold">
        {value}%
      </div>

      {explanation && showInfo && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="text-sm text-white font-medium mb-1">{explanation.label}</div>
          <div className="text-xs text-gray-300 mb-2">{explanation.description}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className={`px-2 py-1 rounded ${
              explanation.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
              explanation.category === 'social' ? 'bg-purple-500/20 text-purple-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {explanation.category}
            </span>
            <span className="text-gray-400">Range: {explanation.range}</span>
            <span className={`px-2 py-1 rounded ${
              explanation.impact === 'high' ? 'bg-red-500/20 text-red-400' :
              explanation.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {explanation.impact} impact
            </span>
          </div>
        </div>
      )}
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
  const [expandedAccounts, setExpandedAccounts] = useState<{[key: string]: boolean}>({});
  const [deploymentModal, setDeploymentModal] = useState<{isOpen: boolean; agentUsername: string; agentId: string}>({isOpen: false, agentUsername: '', agentId: ''});
  const [userSafeConfigs, setUserSafeConfigs] = useState<SafeConfig[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/all-agents");
        const data = await response.json();

        if (!data.success) {
          if (data.error?.retryable) {
            throw new Error("Database temporarily unavailable. Please refresh the page in a few moments.");
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
      filtered = filtered.filter(agent =>
        agent.twitterUsername.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (this is a placeholder - you can implement actual categorization logic)
    if (categoryFilter !== "all") {
      // Implement category-based filtering logic here
      // For now, we'll just use all agents
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, categoryFilter]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
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

  const getAgentDeployedTypes = (agentId: string): ('perpetuals' | 'spot')[] => {
    // Filter safe configs by the specific agentId
    const agentSafeConfigs = userSafeConfigs.filter(config => config.agentId === agentId);
    return agentSafeConfigs.map(config => config.type);
  };

  
  
  const getAvailableAgentTypes = (agentId: string): ('perpetuals' | 'spot')[] => {
    const deployedTypes = getAgentDeployedTypes(agentId);
    const allTypes = ['perpetuals', 'spot'] as const;
    return allTypes.filter(type => !deployedTypes.includes(type));
  };

  // Component to display deployed safe wallets
  const DeployedSafeWallets: React.FC<{ agentId: string }> = ({ agentId }) => {
    // Filter safe configs by the specific agentId
    const agentSafeConfigs = userSafeConfigs.filter(config => config.agentId === agentId);

    if (agentSafeConfigs.length === 0) return null;

    return (
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-1">
          <Shield className="w-4 h-4" />
          Deployed Safe Wallets
        </h4>
        <div className="space-y-2">
          {agentSafeConfigs.map((config) => (
            <div key={`${config.type}-${config.safeAddress}`} className="flex items-center justify-between">
              <span className="text-green-300 text-sm capitalize">{config.type}</span>
              <button
                onClick={() => window.open(`https://app.safe.global/home?safe=${config.networkKey}:${config.safeAddress}`, '_blank')}
                className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                {config.safeAddress.slice(0, 6)}...{config.safeAddress.slice(-4)}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user session to determine own agent
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user-agents");
        const data = await response.json();

        if (data.success) {
          setCurrentUsername(data.data.twitterUsername);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const isOwnAgent = (agentUsername: string): boolean => {
    return currentUsername === agentUsername;
  };

  const renderInfluencerAvatar = (account: SubscribedAccount) => {
    const imageUrl = account.influencerInfo?.userProfileUrl ||
                   `https://picsum.photos/seed/${account.twitterHandle}/64/64`;

    return (
      <div
        key={account.twitterHandle}
        className="group relative -ml-3 first:ml-0 transition-all duration-200 hover:z-10 cursor-pointer"
        onClick={() => window.open(`/influencer/${account.twitterHandle}`, '_blank')}
        title={`${account.influencerInfo?.name || account.twitterHandle} (${formatNumber(account.influencerInfo?.followersCount || 0)} followers)`}
      >
        <div className="w-12 h-12 rounded-full border-2 border-gray-700 overflow-hidden bg-gray-800 transition-all duration-200 group-hover:border-blue-400 group-hover:scale-110">
          <img
            src={imageUrl}
            alt={account.influencerInfo?.name || account.twitterHandle}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${account.twitterHandle}/64/64`;
            }}
          />
        </div>
        {account.influencerInfo?.verified && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Shield className="w-2 h-2 text-white" />
          </div>
        )}

        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg border border-gray-700">
          <div className="font-medium">{account.influencerInfo?.name || account.twitterHandle}</div>
          <div className="text-xs text-gray-400">@{account.twitterHandle}</div>
          <div className="text-xs text-blue-400">{formatNumber(account.influencerInfo?.followersCount || 0)} followers</div>
          <div className="text-xs text-green-400">Click to view profile</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubscriptionAvatars = (accounts: SubscribedAccount[], agentId: string) => {
    const visibleAccounts = accounts.slice(0, 3);
    const remainingCount = accounts.length - 3;
    const isExpanded = expandedAccounts[agentId];

    const toggleExpanded = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedAccounts(prev => ({
        ...prev,
        [agentId]: !prev[agentId]
      }));
    };

    return (
      <div className="relative">
        <div className="flex items-center">
          {visibleAccounts.map(renderInfluencerAvatar)}
          {remainingCount > 0 && (
            <div
              className="group relative -ml-3 first:ml-0 transition-all duration-200 hover:z-10 cursor-pointer"
              onClick={toggleExpanded}
              title={`+${remainingCount} more subscriptions`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-700 bg-gray-800 flex items-center justify-center transition-all duration-200 group-hover:border-blue-400 group-hover:scale-110">
                <span className="text-white text-sm font-medium">+{remainingCount}</span>
              </div>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg border border-gray-700">
                <div className="font-medium">+{remainingCount} more</div>
                <div className="text-xs text-gray-400">Click to view all</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown for additional accounts */}
        {isExpanded && remainingCount > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30 max-h-64 overflow-y-auto">
            <div className="p-3">
              <div className="text-sm text-white font-medium mb-2">
                All Subscribed Accounts ({accounts.length})
              </div>
              <div className="space-y-2">
                {accounts.slice(3).map((account) => (
                  <div
                    key={account.twitterHandle}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => window.open(`/influencer/${account.twitterHandle}`, '_blank')}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-gray-600 overflow-hidden bg-gray-700">
                      <img
                        src={account.influencerInfo?.userProfileUrl || `https://picsum.photos/seed/${account.twitterHandle}/64/64`}
                        alt={account.influencerInfo?.name || account.twitterHandle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/${account.twitterHandle}/64/64`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {account.influencerInfo?.name || account.twitterHandle}
                      </div>
                      <div className="text-xs text-gray-400">
                        @{account.twitterHandle} • {formatNumber(account.influencerInfo?.followersCount || 0)} followers
                      </div>
                    </div>
                    {account.influencerInfo?.verified && (
                      <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading agents marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isConnectionError = error.includes("Database temporarily unavailable") ||
                              error.includes("connection") ||
                              error.includes("database");

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            {isConnectionError ? (
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          <h3 className={`text-lg font-semibold mb-2 ${isConnectionError ? 'text-yellow-400' : 'text-red-400'}`}>
            {isConnectionError ? "Connection Issue" : "Error"}
          </h3>

          <p className="text-gray-300 mb-6">
            {error}
          </p>

          {isConnectionError && (
            <p className="text-gray-400 text-sm mb-6">
              This is usually temporary. Please try again in a few moments.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>

            {isConnectionError && (
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Trigger a refetch
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
                          setError(data.error?.message || "Failed to fetch agents");
                        }
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to fetch agents");
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchAgents();
                  }, 1000);
                }}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Agents Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and explore trading agents configured by users across the platform
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{agents.length}</div>
                <div className="text-sm text-gray-400">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {agents.reduce((sum, agent) => sum + agent.subscribedAccounts.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Subscriptions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`flex-1 lg:flex-none px-4 py-3 rounded-lg font-medium transition-colors ${
                  categoryFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter("momentum")}
                className={`flex-1 lg:flex-none px-4 py-3 rounded-lg font-medium transition-colors ${
                  categoryFilter === "momentum"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Momentum
              </button>
              <button
                onClick={() => setCategoryFilter("social")}
                className={`flex-1 lg:flex-none px-4 py-3 rounded-lg font-medium transition-colors ${
                  categoryFilter === "social"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Social
              </button>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all hover:scale-[1.02]"
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">@{agent.twitterUsername}</h3>
                    <p className="text-gray-400 text-sm">{getAgentStrategyType(agent)} Strategy</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-xs mb-2">{agent.subscribedAccounts.length} subs</div>
                  {!isOwnAgent(agent.twitterUsername) && (
                    <>
                      {getAvailableAgentTypes(agent._id).length === 0 ? (
                        <div className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm">
                          All Agents Deployed
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeploymentModal({
                            isOpen: true,
                            agentUsername: agent.twitterUsername,
                            agentId: agent._id
                          })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                            getAvailableAgentTypes(agent._id).length === 2
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                          }`}
                        >
                          <Rocket className="w-3 h-3" />
                          {getAvailableAgentTypes(agent._id).length === 2
                            ? 'Deploy Agent'
                            : `Deploy ${getAvailableAgentTypes(agent._id)[0] === 'perpetuals' ? 'Perpetuals' : 'Spot'}`
                          }
                        </button>
                      )}
                    </>
                  )}
                  {isOwnAgent(agent.twitterUsername) && (
                    <div className="px-3 py-1.5 bg-gray-600 text-gray-400 rounded-lg text-sm">
                      Your Agent
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricCard
                  label="Price Momentum"
                  value={agent.customizationOptions.r_last6h_pct}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="text-blue-400"
                />
                <MetricCard
                  label="Market Volume"
                  value={agent.customizationOptions.d_pct_mktvol_6h}
                  icon={<BarChart3 className="w-4 h-4" />}
                  color="text-green-400"
                />
                <MetricCard
                  label="Social Volume"
                  value={agent.customizationOptions.d_pct_socvol_6h}
                  icon={<Users className="w-4 h-4" />}
                  color="text-purple-400"
                />
                <MetricCard
                  label="Sentiment"
                  value={agent.customizationOptions.d_pct_sent_6h}
                  icon={<Shield className="w-4 h-4" />}
                  color="text-yellow-400"
                />
                <MetricCard
                  label="User Growth"
                  value={agent.customizationOptions.d_pct_users_6h}
                  icon={<Users className="w-4 h-4" />}
                  color="text-cyan-400"
                />
                <MetricCard
                  label="Influencers"
                  value={agent.customizationOptions.d_pct_infl_6h}
                  icon={<Shield className="w-4 h-4" />}
                  color="text-pink-400"
                />
                <MetricCard
                  label="Galaxy Score"
                  value={agent.customizationOptions.d_galaxy_6h}
                  icon={<Shield className="w-4 h-4" />}
                  color="text-indigo-400"
                />
                <MetricCard
                  label="Alt Rank"
                  value={agent.customizationOptions.neg_d_altrank_6h}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="text-orange-400"
                />
              </div>

              {/* Subscriptions */}
              {agent.subscribedAccounts.length > 0 && (
                <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Subscribed Influencers</span>
                    <span className="text-xs text-gray-400">{agent.subscribedAccounts.length} accounts</span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    {renderSubscriptionAvatars(agent.subscribedAccounts, agent._id)}
                  </div>
                </div>
              )}

              {/* Deployed Safe Wallets */}
              <DeployedSafeWallets agentId={agent._id} />

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Updated {formatDate(agent.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No agents found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Agent Deployment Modal */}
      <AgentDeploymentModal
        isOpen={deploymentModal.isOpen}
        onClose={() => setDeploymentModal({isOpen: false, agentUsername: '', agentId: ''})}
        agentUsername={deploymentModal.agentUsername}
        agentId={deploymentModal.agentId}
        existingSafeConfigs={userSafeConfigs}
      />
    </div>
  );
};

export default AllAgentsMarketplace;