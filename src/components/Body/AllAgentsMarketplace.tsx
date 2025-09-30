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
  Copy,
  Check,
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
import Image from "next/image";

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
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />

      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10`} style={{ padding: "2px" }}>
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
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
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
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`@${handle}`);
      setCopiedHandle(handle);
      setTimeout(() => setCopiedHandle(null), 1200);
    } catch (_) {
      setCopiedHandle(null);
    }
  };

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
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 max-h-[90vh] rounded-2xl border shadow-2xl animate-fade-in-up transition-all duration-300" style={{ background: "linear-gradient(to bottom, #0D1321, #070915)", borderColor: "#353940" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#353940" }}>
          <div>
            <h2 className="font-leagueSpartan text-2xl font-bold text-white">
              Subscribed Influencers
            </h2>
            <p className="text-[#8ba1bc] mt-1">
              @{agentUsername} • {accounts.length} accounts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1a2234] transition-all duration-200 text-[#8ba1bc] hover:text-white hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b bg-[#141d31]" style={{ borderColor: "#353940" }}>
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
                  className="font-leagueSpartan w-full !pl-10 pr-4 py-3 bg-[#0D1321] border rounded-xl text-white placeholder-[#8ba1bc] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="px-3 py-2 bg-[#0D1321] border rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-colors"
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
                  className="p-2 bg-[#0D1321] border rounded-lg hover:bg-[#1a2234] transition-colors hover:scale-105"
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
                  className="group rounded-xl p-5 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
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
                      <div className="w-20 h-20 rounded-full border-3 overflow-hidden transition-all duration-300 group-hover:border-blue-500/50 group-hover:scale-105" style={{ borderColor: "#353940", background: "#111528" }}>
                        <Image
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
                          width={80}
                          height={80}
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
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[#8ba1bc] text-sm">
                        @{account.twitterHandle}
                      </p>
                      <button
                        onClick={(e) => handleCopy(e, account.twitterHandle)}
                        className="px-2 py-1 rounded-md border text-xs text-[#8ba1bc] hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                        style={{ borderColor: "#353940" }}
                      >
                        {copiedHandle === account.twitterHandle ? (
                          <span className="inline-flex items-center gap-1 text-green-400"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                        )}
                      </button>
                    </div>

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
                  className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "#0D1321", borderColor: "#353940" }}
                  onClick={() =>
                    window.open(
                      `https://twitter.com/${account.twitterHandle}`,
                      "_blank",
                    )
                  }
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 overflow-hidden transition-all duration-300 group-hover:border-blue-500/50 group-hover:scale-105" style={{ borderColor: "#353940", background: "#111528" }}>
                      <Image
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
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[#8ba1bc] text-sm">
                        @{account.twitterHandle}
                      </p>
                      <button
                        onClick={(e) => handleCopy(e, account.twitterHandle)}
                        className="px-2 py-1 rounded-md border text-xs text-[#8ba1bc] hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                        style={{ borderColor: "#353940" }}
                      >
                        {copiedHandle === account.twitterHandle ? (
                          <span className="inline-flex items-center gap-1 text-green-400"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                        )}
                      </button>
                    </div>
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
        const start = performance.now();
        console.log("[AllAgentsMarketplace] Fetch(/api/all-agents) started");
        const response = await fetch("/api/all-agents");
        const httpMs = performance.now() - start;
        const jsonStart = performance.now();
        const data = await response.json();
        const jsonMs = performance.now() - jsonStart;
        console.log("[AllAgentsMarketplace] Fetch(/api/all-agents) completed", {
          httpMs: Math.round(httpMs),
          jsonParseMs: Math.round(jsonMs),
          status: response.status,
          totalAgents: data?.data?.totalAgents ?? (Array.isArray(data?.data) ? data.data.length : undefined),
        });

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
        const start = performance.now();
        console.log("[AllAgentsMarketplace] Fetch(/api/user-agents) started");
        const response = await fetch("/api/user-agents");
        const httpMs = performance.now() - start;
        const jsonStart = performance.now();
        const data = await response.json();
        const jsonMs = performance.now() - jsonStart;
        console.log("[AllAgentsMarketplace] Fetch(/api/user-agents) completed", {
          httpMs: Math.round(httpMs),
          jsonParseMs: Math.round(jsonMs),
          status: response.status,
          hasData: !!data?.success,
          safeConfigsCount: data?.data?.safeConfigs?.length,
        });

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
        return "from-blue-600 to-blue-700";
      case "Fundamental":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStrategyPrimaryColor = (strategyType: string): string => {
    switch (strategyType) {
      case "Social-Driven":
        return "#3b82f6"; // blue-500
      case "Momentum":
        return "#2563eb"; // blue-600
      case "Fundamental":
        return "#22c55e"; // green-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getStrategyGlowColor = (strategyType: string): string => {
    switch (strategyType) {
      case "Social-Driven":
        return "#3b82f6";
      case "Momentum":
        return "#2563eb";
      case "Fundamental":
        return "#22c55e";
      default:
        return "#6b7280";
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
                    <Image
                      src={imageUrl}
                      alt={
                        account.influencerInfo?.name || account.twitterHandle
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${account.twitterHandle}/60/60`;
                      }}
                      width={60}
                      height={60}
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
      <div className="mt-3 p-3 bg-green-500/8 border border-green-500/20 rounded-lg">
        <h4 className="text-green-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          Deployed Safes
        </h4>
        <div className="space-y-2">
          {agentSafeConfigs.map((config) => (
            <div
              key={`${config.type}-${config.safeAddress}`}
              className="flex items-center justify-between bg-green-500/5 p-2 rounded-md"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${config.type === "perpetuals"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
                    }`}
                >
                  {config.type === "perpetuals" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <BarChart3 className="w-3 h-3" />
                  )}
                </div>
                <div>
                  <span className="text-green-300 text-xs font-medium capitalize">
                    {config.type}
                  </span>
                  <div className="text-xs text-gray-500">
                    {config.safeAddress.slice(0, 6)}...{config.safeAddress.slice(-4)}
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
                className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2 py-1 rounded-md transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                View
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
          <div className="h-1 w-24 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] mx-auto rounded-full animate-fade-in-up delay-200" />

          <p className="text-[#8ba1bc] pt-4 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover, explore, and deploy sophisticated trading agents
            configured by the community
          </p>
        </div>

        {/* Enhanced Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAgents.map((agent, index) => {
            const strategyType = getAgentStrategyType(agent);
            const deployedTypes = getAgentDeployedTypes(agent._id);
            const availableTypes = getAvailableAgentTypes(agent._id);
            const isOwn = isOwnAgent(agent.twitterUsername);

            // Static agent descriptions and images
            const getAgentStaticData = (username: string) => {
              const staticData = {
                image: `https://picsum.photos/seed/${username}/400/300`,
                description: strategyType === "Social-Driven"
                  ? "Advanced AI agent that analyzes social sentiment and market volume to identify trending opportunities in real-time."
                  : strategyType === "Momentum"
                    ? "Sophisticated trading bot that captures market momentum through technical analysis and volume-based signals."
                    : strategyType === "Fundamental"
                      ? "Data-driven agent that evaluates fundamental metrics and on-chain analytics for strategic positioning."
                      : "Balanced trading strategy combining technical, social, and fundamental analysis for optimal risk-adjusted returns."
              };
              return staticData;
            };

            // Get random trading platform for each agent
            const getTradingPlatform = (username: string) => {
              const platforms = [
                { name: "GMX", apr: "+7.2%", color: "text-green-400", bgColor: "bg-green-400", icon: <TrendingUp className="w-3 h-3" /> },
                { name: "Hyperliquid", apr: "+4.8%", color: "text-blue-400", bgColor: "bg-blue-400", icon: <BarChart3 className="w-3 h-3" /> },
                { name: "Spot Trading", apr: "+2.1%", color: "text-yellow-400", bgColor: "bg-yellow-400", icon: <Star className="w-3 h-3" /> }
              ];
              const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              return platforms[hash % platforms.length];
            };

            const staticData = getAgentStaticData(agent.twitterUsername);
            const tradingPlatform = getTradingPlatform(agent.twitterUsername);

            return (
              <div
                key={agent._id}
                className="group bg-[#0D1321] rounded-2xl transition-all duration-500 ease-in-out hover:scale-105 relative overflow-hidden animate-fade-in-up border border-[#353940]"
                style={{
                  animationDelay: `${index * 100}ms`,
                  "--hover-border-color": getStrategyPrimaryColor(strategyType),
                  boxShadow: `0 0 10px #6b7280`,
                } as React.CSSProperties}
              >
                {/* Enhanced subtle branded overlay on hover with glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#AAC9FA]/8 via-transparent to-[#E1EAF9]/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Enhanced ring/border highlight on hover with glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-500 group-hover:ring-[var(--hover-border-color)]/40 group-hover:shadow-[0_0_16px_var(--hover-border-color)/30]" />

                {/* Compact Hero Image Section with Blurred Logo Background */}
                <div className="relative h-32 overflow-hidden rounded-t-2xl">
                  {/* Blurred Logo Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0D1321] to-[#1a2234]">
                    <Image
                      src={staticData.image}
                      alt={`${agent.twitterUsername} agent`}
                      className="w-full h-full object-cover opacity-20 blur-sm scale-110 transition-all duration-500 group-hover:blur-md group-hover:scale-125"
                      width={400}
                      height={300}
                    />
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/80 via-transparent to-transparent" />

                  {/* Logo positioned on cover image */}
                  <div className="absolute bottom-0 left-3">
                    <div className={`w-14 h-10 bg-gradient-to-br ${getStrategyColor(strategyType)} rounded-t-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-white/20`}>
                      <Image
                        src="/img/maxxit_icon.svg"
                        alt="Maxxit Logo"
                        className="w-7 h-7 text-white"
                        width={28}
                        height={28}
                      />
                    </div>
                    {/* Enhanced glow effect for logo */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getStrategyColor(strategyType)} opacity-0 group-hover:opacity-40 group-hover:scale-125 transition-all duration-700 blur-lg -z-10`} />
                  </div>

                  {/* Subscription Count Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md border border-white/20 text-white text-xs font-medium flex items-center gap-1 shadow-lg transition-all duration-500 group-hover:scale-105">
                      <Users className="w-2.5 h-2.5" />
                      {agent.subscribedAccounts.length}
                    </div>
                  </div>

                  {/* Own Agent Badge */}
                  {isOwn && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-[#AAC9FA]/90 to-[#E1EAF9]/90 backdrop-blur-sm text-[#0D1321] rounded-md text-xs font-semibold shadow-lg border border-white/20 transition-all duration-500 group-hover:scale-105">
                        Your Agent
                      </span>
                    </div>
                  )}
                </div>

                {/* Compact Content Section */}
                <div className="p-4 relative z-10">
                  {/* Agent Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-leagueSpartan font-bold text-white mb-0.5 group-hover:text-[#AAC9FA] transition-colors duration-500 truncate">
                        @{agent.twitterUsername}
                      </h3>
                      <p className="text-xs text-[#8ba1bc] group-hover:text-[#AAC9FA] transition-colors duration-500">
                        AI Trading Agent
                      </p>
                    </div>
                    {/* Strategy Type Badge */}
                    <div className="relative">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm bg-gradient-to-r ${getStrategyColor(strategyType)} text-white shadow-md border border-white/10 group-hover:scale-105 transition-all duration-500`}>
                        {strategyType}
                      </span>
                      <div className={`absolute inset-0 rounded-md bg-gradient-to-r ${getStrategyColor(strategyType)} opacity-0 group-hover:opacity-25 group-hover:scale-110 transition-all duration-700 blur-md -z-10`} />
                    </div>
                  </div>

                  {/* Compact Description */}
                  <p className="text-[#8ba1bc] text-xs leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-500" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {staticData.description}
                  </p>

                  {/* Compact Trading Performance */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Performance
                      </span>
                      <span className="text-xs text-[#8ba1bc] uppercase tracking-wider">Live APR</span>
                    </div>

                    <div className="bg-[#111528] rounded-lg p-3 border border-[#353940] group-hover:border-[var(--hover-border-color)]/30 group-hover:shadow-lg group-hover:bg-[#1a2234] transition-all duration-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {tradingPlatform.icon}
                          <span className="text-white font-medium text-xs">{tradingPlatform.name}</span>
                        </div>
                        <ArrowUpRight className={`w-3 h-3 ${tradingPlatform.color} transition-transform duration-500 group-hover:rotate-45`} />
                      </div>

                      <div className={`text-lg font-bold ${tradingPlatform.color} mb-2 transition-all duration-500 group-hover:scale-105`}>
                        {tradingPlatform.apr}
                      </div>

                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${tradingPlatform.bgColor} rounded-full transition-all duration-1000 group-hover:animate-pulse`}
                          style={{ width: tradingPlatform.name === "GMX" ? "75%" : tradingPlatform.name === "Hyperliquid" ? "60%" : "40%" }}>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deployed Safe Wallets */}
                  <DeployedSafeWallets agentId={agent._id} />

                  {/* Animated Action Button */}
                  <div className="mt-4">
                    {availableTypes.length === 0 ? (
                      <div className="w-full py-2.5 px-3 bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-400 rounded-lg text-xs font-semibold border border-green-500/25 flex items-center justify-center gap-1.5 group-hover:from-green-500/25 group-hover:to-emerald-500/25 transition-all duration-500">
                        <CheckCircle className="w-3 h-3" />
                        All Strategies Deployed
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
                        className={`group/btn w-full py-2.5 px-3 rounded-full text-xs font-semibold transition-all duration-500 flex items-center justify-center gap-1.5 hover:scale-[1.02] transform relative overflow-hidden ${availableTypes.length === 2
                          ? "bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] hover:from-[#9AC0F9] hover:to-[#D1DAF8] text-[#0D1321] shadow-md hover:shadow-lg"
                          : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                          }`}
                      >
                        {/* Button animation overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                        <Rocket className={`w-3 h-3 transition-transform duration-500 group-hover/btn:scale-110 ${availableTypes.length === 2 ? "group-hover/btn:rotate-12" : ""}`} />
                        <span className="relative z-10">
                          {availableTypes.length === 2
                            ? "Deploy Agent"
                            : `Deploy ${availableTypes[0] === "perpetuals" ? "Perpetuals" : "Spot"}`}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Compact Footer */}
                  {deployedTypes.length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-[#353940]">
                      {deployedTypes.map((type) => (
                        <span
                          key={type}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-500 group-hover:scale-105 ${type === "perpetuals"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                            : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                            }`}
                        >
                          {type === "perpetuals" ? "Perpetuals" : "Spot"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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