"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Settings, Edit2, Save, X, Users, TrendingUp, Shield, BarChart3, Info, ExternalLink } from "lucide-react";
import Link from "next/link";

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

interface CustomizationOptions {
  r_last6h_pct: number;
  d_pct_mktvol_6h: number;
  d_pct_socvol_6h: number;
  d_pct_sent_6h: number;
  d_pct_users_6h: number;
  d_pct_infl_6h: number;
  d_galaxy_6h: number;
  neg_d_altrank_6h: number;
}

interface UserAgentData {
  _id: string;
  twitterUsername: string;
  twitterId: string;
  telegramId: string;
  credits: number;
  subscribedAccounts: SubscribedAccount[];
  customizationOptions: CustomizationOptions;
}

interface MetricExplanation {
  label: string;
  description: string;
  category: 'technical' | 'social' | 'fundamental';
  range: string;
  impact: 'high' | 'medium' | 'low';
}

interface EditableMetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  explanation?: MetricExplanation;
  isEditing: boolean;
  onChange: (value: number) => void;
}

const EditableMetricCard: React.FC<EditableMetricCardProps> = ({
  label,
  value,
  icon,
  color,
  explanation,
  isEditing,
  onChange
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  // Initialize input value when entering edit mode or value changes
  React.useEffect(() => {
    if (isEditing) {
      setInputValue(value.toString());
    }
  }, [isEditing, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const numValue = val === '' ? 0 : parseInt(val);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Select all text on focus for easy replacement
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === '') {
      setInputValue('0');
      onChange(0);
    }
  };

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

  const normalizedValue = Math.min(Math.max(Math.abs(value), 0), 100);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors relative group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">{label}</span>
          {explanation && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
              title="Click for more info"
            >
              <Info className="w-4 h-4 text-gray-500 hover:text-blue-400 transition-colors group-hover/info:scale-110" />
            </button>
          )}
          <div className={`${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-3 relative z-10">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={label === "Heartbeat Score" ? -10 : -100}
            max={label === "Heartbeat Score" ? 10 : 100}
            className="w-24 px-3 py-2 bg-[#1a2234] border-2 border-[#353940] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-white text-sm font-medium">{label === "Heartbeat Score" ? "" : "%"}</span>
        </div>
      ) : (
        <div className="relative z-10">
          <div className={`text-xl font-bold transition-all duration-300 group-hover:scale-105 ${getValueColor()}`}>
            {value}{label === "Heartbeat Score" ? "" : "%"}
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
      )}

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
            <span className={`px-3 py-1.5 rounded-lg font-medium ${explanation.category === 'technical' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              explanation.category === 'social' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
              {explanation.category}
            </span>
            <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600/50">
              Range: {explanation.range}
            </span>
            <span className={`px-3 py-1.5 rounded-lg font-medium ${explanation.impact === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              explanation.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
              {explanation.impact} impact
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const MyAgent: React.FC = () => {
  const { data: session, status } = useSession();
  const [agentData, setAgentData] = useState<UserAgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CustomizationOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAgentData = async () => {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user-agents");
        const data = await response.json();

        if (!data.success) {
          if (data.error?.retryable) {
            throw new Error("Database temporarily unavailable. Please refresh the page in a few moments.");
          }
          throw new Error(data.error?.message || "Failed to fetch agent data");
        }

        setAgentData(data.data);
        setEditData(data.data.customizationOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent data");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [status]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...agentData!.customizationOptions });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData) return;

    setSaving(true);
    try {
      const response = await fetch("/api/update-agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (!data.success) {
        if (data.error?.retryable) {
          throw new Error("Database temporarily unavailable. Please try saving again in a few moments.");
        }
        throw new Error(data.error?.message || "Failed to update configuration");
      }

      setAgentData(prev => prev ? { ...prev, customizationOptions: editData } : null);
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      // For save errors, show a toast instead of setting the main error state
      const errorMessage = err instanceof Error ? err.message : "Failed to save configuration";

      // We could add a toast notification here, but for now just show it as a temporary error
      setTimeout(() => {
        setError(errorMessage);
        setTimeout(() => setError(null), 5000); // Clear after 5 seconds
      }, 100);
    } finally {
      setSaving(false);
    }
  };

  const handleMetricChange = (key: keyof CustomizationOptions, value: number) => {
    if (!editData) return;

    // Validate ranges - all metrics use 0-100 range for weightages
    const validatedValue = Math.max(0, Math.min(100, value));

    setEditData(prev => ({
      ...prev!,
      [key]: validatedValue
    }));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
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

  const renderSubscriptionAvatars = (accounts: SubscribedAccount[], agentId: string = "my-agent") => {
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

  const metricExplanations: Record<string, MetricExplanation> = {
    r_last6h_pct: {
      label: "Price Momentum",
      description: "6-hour price return threshold. Higher values increase sensitivity to price movements and generate more frequent trading signals.",
      category: "technical",
      range: "0% to 100%",
      impact: "high"
    },
    d_pct_mktvol_6h: {
      label: "Market Volume",
      description: "Trading volume change weight over 6 hours. Higher values prioritize volume-driven opportunities for better signal accuracy.",
      category: "technical",
      range: "0% to 100%",
      impact: "high"
    },
    d_pct_socvol_6h: {
      label: "Social Volume",
      description: "Social media mentions weight. Higher values focus on community buzz and viral trends for early opportunity detection.",
      category: "social",
      range: "0% to 100%",
      impact: "medium"
    },
    d_pct_sent_6h: {
      label: "Sentiment",
      description: "Market sentiment analysis weight. Higher values emphasize bullish/bearish sentiment trends in community discussions.",
      category: "social",
      range: "0% to 100%",
      impact: "medium"
    },
    d_pct_users_6h: {
      label: "User Growth",
      description: "Community growth rate weight. Higher values track new user adoption and engagement momentum for project health.",
      category: "social",
      range: "0% to 100%",
      impact: "low"
    },
    d_pct_infl_6h: {
      label: "Influencers",
      description: "Influencer mentions weight. Higher values prioritize signals when key opinion leaders discuss assets for market impact.",
      category: "social",
      range: "0% to 100%",
      impact: "medium"
    },
    d_galaxy_6h: {
      label: "Heartbeat Score",
      description: "Composite health metric weightage combining multiple factors. Higher values prioritize signals from projects with stronger fundamentals and ecosystem health.",
      category: "fundamental",
      range: "0% to 100%",
      impact: "high"
    },
    neg_d_altrank_6h: {
      label: "Market Edge",
      description: "Relative market positioning weight. Higher values prioritize assets with better rankings and competitive advantages.",
      category: "fundamental",
      range: "0% to 100%",
      impact: "high"
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your agent...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 mb-4">Please log in to view your agent configuration</div>
          <Link
            href="/influencer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
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
                    const fetchAgentData = async () => {
                      if (status !== "authenticated") {
                        setLoading(false);
                        return;
                      }

                      try {
                        const response = await fetch("/api/user-agents");
                        const data = await response.json();

                        if (data.success) {
                          setAgentData(data.data);
                          setEditData(data.data.customizationOptions);
                          setError(null);
                        } else {
                          setError(data.error?.message || "Failed to fetch agent data");
                        }
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to fetch agent data");
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchAgentData();
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

  if (!agentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 mb-4">No agent configuration found. Please complete your onboarding first.</div>
          <Link
            href="/influencer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-napzerRounded bg-gradient-to-r from-[#AAC9FA] via-[#E1EAF9] to-[#AAC9FA] bg-clip-text text-transparent">
              My Agent Configuration
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] mx-auto rounded-full animate-fade-in-up delay-200" />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-8 animate-fade-in-up delay-300">
            View and customize your personal trading agent configuration
          </p>
        </div>

        {/* Enhanced User Info Card */}
        <div className="bg-gradient-to-br from-[#0D1321] to-[#1a2234] rounded-2xl p-8 mb-10 border-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up delay-400"
          style={{ borderColor: "#353940" }}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                {/* Animated ring around icon */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500 blur-sm -z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-leagueSpartan mb-2 group-hover:text-[#AAC9FA] transition-colors duration-300">
                  @{agentData.twitterUsername}
                </h2>
                <p className="text-gray-400 text-lg group-hover:text-[#B8C5D1] transition-colors duration-300">Personal Trading Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center group">
                <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">{agentData.credits}</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Credits</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">{agentData.subscribedAccounts.length}</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Subscriptions</div>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Edit Configuration
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Agent Configuration */}
          <div className="bg-[#0D1321] rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up delay-500"
            style={{ borderColor: "#353940" }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-leagueSpartan text-2xl font-semibold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                Agent Configuration
                {isEditing && (
                  <span className="text-sm text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-3 py-1.5 rounded-full border border-yellow-500/30 animate-pulse">
                    Editing Mode
                  </span>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EditableMetricCard
                label="Price Momentum"
                value={isEditing && editData ? editData.r_last6h_pct : agentData.customizationOptions.r_last6h_pct}
                icon={<TrendingUp className="w-4 h-4" />}
                color="text-blue-400"
                explanation={metricExplanations.r_last6h_pct}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("r_last6h_pct", value)}
              />
              <EditableMetricCard
                label="Market Volume"
                value={isEditing && editData ? editData.d_pct_mktvol_6h : agentData.customizationOptions.d_pct_mktvol_6h}
                icon={<BarChart3 className="w-4 h-4" />}
                color="text-green-400"
                explanation={metricExplanations.d_pct_mktvol_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_pct_mktvol_6h", value)}
              />
              <EditableMetricCard
                label="Social Volume"
                value={isEditing && editData ? editData.d_pct_socvol_6h : agentData.customizationOptions.d_pct_socvol_6h}
                icon={<Users className="w-4 h-4" />}
                color="text-purple-400"
                explanation={metricExplanations.d_pct_socvol_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_pct_socvol_6h", value)}
              />
              <EditableMetricCard
                label="Sentiment"
                value={isEditing && editData ? editData.d_pct_sent_6h : agentData.customizationOptions.d_pct_sent_6h}
                icon={<TrendingUp className="w-4 h-4" />}
                color="text-yellow-400"
                explanation={metricExplanations.d_pct_sent_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_pct_sent_6h", value)}
              />
              <EditableMetricCard
                label="User Growth"
                value={isEditing && editData ? editData.d_pct_users_6h : agentData.customizationOptions.d_pct_users_6h}
                icon={<Users className="w-4 h-4" />}
                color="text-cyan-400"
                explanation={metricExplanations.d_pct_users_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_pct_users_6h", value)}
              />
              <EditableMetricCard
                label="Influencers"
                value={isEditing && editData ? editData.d_pct_infl_6h : agentData.customizationOptions.d_pct_infl_6h}
                icon={<Shield className="w-4 h-4" />}
                color="text-pink-400"
                explanation={metricExplanations.d_pct_infl_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_pct_infl_6h", value)}
              />
              <EditableMetricCard
                label="Heartbeat Score"
                value={isEditing && editData ? editData.d_galaxy_6h : agentData.customizationOptions.d_galaxy_6h}
                icon={<Shield className="w-4 h-4" />}
                color="text-indigo-400"
                explanation={metricExplanations.d_galaxy_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("d_galaxy_6h", value)}
              />
              <EditableMetricCard
                label="Market Edge"
                value={isEditing && editData ? editData.neg_d_altrank_6h : agentData.customizationOptions.neg_d_altrank_6h}
                icon={<TrendingUp className="w-4 h-4" />}
                color="text-orange-400"
                explanation={metricExplanations.neg_d_altrank_6h}
                isEditing={isEditing}
                onChange={(value) => handleMetricChange("neg_d_altrank_6h", value)}
              />
            </div>
          </div>

          {/* Enhanced Subscribed Accounts */}
          <div className="bg-[#0D1321] rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up delay-600"
            style={{ borderColor: "#353940" }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-leagueSpartan text-2xl font-semibold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                Subscribed Accounts
              </h3>
              <span className="text-sm text-gray-400 bg-[#1a2234] px-3 py-1.5 rounded-full border border-[#353940]">
                {agentData.subscribedAccounts.length} active subscriptions
              </span>
            </div>

            {agentData.subscribedAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No subscriptions yet</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Browse Influencers
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatars Row */}
                <div className="flex items-center justify-center py-4">
                  {renderSubscriptionAvatars(agentData.subscribedAccounts, agentData._id)}
                </div>

                {/* Subscription Details */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {agentData.subscribedAccounts.map((account) => (
                    <div
                      key={account.twitterHandle}
                      className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={account.influencerInfo?.userProfileUrl || `https://picsum.photos/seed/${account.twitterHandle}/40/40`}
                            alt={account.influencerInfo?.name || account.twitterHandle}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://picsum.photos/seed/${account.twitterHandle}/40/40`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium">
                                {account.influencerInfo?.name || account.twitterHandle}
                              </h4>
                              {account.influencerInfo?.verified && (
                                <Shield className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">@{account.twitterHandle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-medium">
                            {account.costPaid > 0 ? `${account.costPaid} credits` : 'FREE'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDate(account.subscriptionDate)} - {formatDate(account.expiryDate)}
                          </div>
                        </div>
                      </div>
                      {account.influencerInfo && (
                        <div className="mt-3 pt-3 border-t border-gray-600/50">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Followers: {formatNumber(account.influencerInfo.followersCount)}</span>
                            <Link
                              href={`/influencer/${account.twitterHandle}`}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              View Profile <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
        
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }
        
        .animate-fade-in-up.delay-300 {
          animation-delay: 0.3s;
        }
        
        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }
        
        .animate-fade-in-up.delay-500 {
          animation-delay: 0.5s;
        }
        
        .animate-fade-in-up.delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default MyAgent;