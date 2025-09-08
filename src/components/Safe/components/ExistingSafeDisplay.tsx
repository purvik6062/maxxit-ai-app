import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  Wallet,
  ExternalLink,
  Users,
  Lock,
  Network,
  Info,
  Globe,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { SafeData, SafeDeployment } from "../types";
import { NetworkDropdown } from "./NetworkDropdown";
import {
  formatGasPrice,
  formatTimestamp,
  calculateTotalGasCost,
  allNetworks,
} from "../utils/safeUtils";
import toast from "react-hot-toast";
import Image from "next/image";

interface ExistingSafeDisplayProps {
  safeData: SafeData;
  onRefresh: () => void;
  currentNetwork: string;
  canExpand: boolean;
}

export const ExistingSafeDisplay: React.FC<ExistingSafeDisplayProps> = ({
  safeData,
  onRefresh,
  currentNetwork,
  canExpand,
}) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandResult, setExpandResult] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  // Get active networks from deployments
  const activeNetworks = safeData.metadata?.activeNetworks || [];
  const availableNetworks = allNetworks.filter(
    (network) => !activeNetworks.includes(network.key)
  );

  // Reset expansion states when currentNetwork changes
  useEffect(() => {
    setSelectedNetwork("");
    setShowNetworkSelector(false);
    setExpandResult(null);
  }, [currentNetwork]);

  const handleExpandSafe = async () => {
    if (!selectedNetwork) {
      toast.error("Please select a network to expand to");
      return;
    }

    try {
      setIsExpanding(true);
      setExpandResult(null);

      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured"
        );
      }

      const safeId = safeData.safeId;
      if (!safeId) {
        throw new Error("Safe ID not found in Safe data");
      }

      const response = await fetch(`${baseUrl}/api/safe/${safeId}/expand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ networks: [selectedNetwork] }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      if (result.success) {
        setExpandResult(result.data);
        toast.success(
          `Safe expanded to new network(s)!`
        );
        setSelectedNetwork("");
        setShowNetworkSelector(false);
        setTimeout(() => onRefresh(), 2000);
      } else {
        throw new Error(result.error || result.message || "Expansion failed");
      }
    } catch (error) {
      console.error("Safe expansion error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to expand Safe";
      toast.error(errorMessage);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-gray-900/40 backdrop-blur-sm p-8">
      {/* Header */}
      <div className="text-center mb-8">
        {/* <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div> */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent font-napzerRounded mb-3">
          Safe Wallet Active
        </h2>
        <p className="text-gray-300 text-lg">
          Your multi-signature wallet is deployed and ready to use
        </p>
      </div>

      {/* Safe Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm text-green-300 font-medium">
                Safe Address
              </div>
              <div className="text-green-100 font-mono text-sm">
                {safeData.deployments &&
                Object.values(safeData.deployments)[0]?.address
                  ? `${(
                      Object.values(safeData.deployments)[0] as SafeDeployment
                    ).address.slice(0, 8)}...${(
                      Object.values(safeData.deployments)[0] as SafeDeployment
                    ).address.slice(-6)}`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm text-blue-300 font-medium">Owners</div>
              <div className="text-blue-100">
                {safeData.config?.owners?.length || 0} owner(s)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm text-purple-300 font-medium">
                Threshold
              </div>
              <div className="text-purple-100">
                {safeData.config?.threshold || "N/A"} signature(s)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-sm text-indigo-300 font-medium">
                Networks
              </div>
              <div className="text-indigo-100">
                {safeData.metadata?.totalDeployments || 0} deployed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Configuration Details */}
      <div className="mb-8 p-6 rounded-xl bg-gray-800/30 border border-gray-700/30">
        <h3 className="text-xl font-bold text-white mb-4 font-napzerRounded flex items-center gap-2">
          <Info className="w-5 h-5" />
          Safe Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              General Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-gray-200">
                  {safeData.config?.safeVersion || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-300 capitalize">
                  {safeData.status || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-200">
                  {formatTimestamp(safeData.metadata?.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              Analytics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Transactions:</span>
                <span className="text-gray-200">
                  {safeData.analytics?.totalTransactions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Value Transferred:</span>
                <span className="text-gray-200">
                  {safeData.analytics?.totalValueTransferred || "0"} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Gas Cost:</span>
                <span className="text-gray-200">
                  {calculateTotalGasCost(safeData.deployments)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-gray-200">
                  {formatTimestamp(safeData.metadata?.lastActivityAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Networks - Enhanced */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 font-napzerRounded flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Active Networks ({activeNetworks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(safeData.deployments || {}).map(
            ([networkKey, deployment]: [string, any]) => {
              const networkInfo = allNetworks.find((n) => n.key === networkKey);
              return (
                <div
                  key={networkKey}
                  className="p-6 rounded-lg bg-gray-800/70 border border-gray-700/70 hover:border-gray-600/70 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {/* {networkInfo?.icon || "🔗"} */}
                        <Image src={networkInfo?.icon || ""} alt={networkKey} width={24} height={24} className="w-6 h-6 bg-white p-[2px] rounded-full" />
                      </span>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {networkInfo?.name || networkKey}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            deployment.deploymentStatus === "deployed"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {deployment.deploymentStatus || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <a
                      href={deployment.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chain ID:</span>
                      <span className="text-gray-200">
                        {deployment.chainId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block:</span>
                      <span className="text-gray-200">
                        {deployment.deploymentBlockNumber?.toLocaleString()}
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                    <span className="text-gray-400">Gas Used:</span>
                    <span className="text-gray-200">{parseInt(deployment.gasUsed || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Price:</span>
                    <span className="text-gray-200">{formatGasPrice(deployment.gasPrice || '0', deployment.chainId)}</span>
                  </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deployed:</span>
                      <span className="text-gray-200">
                        {formatTimestamp(deployment.deploymentTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Network Expansion Section */}
      {availableNetworks.length > 0 && (
        <div className="mb-8 p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-4 font-napzerRounded flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Expand to New Networks
          </h3>
          <p className="text-gray-300 mb-4">
            Deploy your Safe to additional networks. Your Safe address will
            remain the same across all networks.
          </p>

          {!showNetworkSelector ? (
            <button
              onClick={() => setShowNetworkSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Network className="w-4 h-4" />
              Select Network to Expand
            </button>
          ) : (
            <div className="space-y-4">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose a network to expand to:
                </label>
                <NetworkDropdown
                  networks={availableNetworks}
                  selectedNetwork={selectedNetwork}
                  onSelect={setSelectedNetwork}
                  placeholder="Select a network to expand to"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExpandSafe}
                  disabled={!selectedNetwork || isExpanding}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all duration-200"
                >
                  {isExpanding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Expanding...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Expand Safe
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowNetworkSelector(false);
                    setSelectedNetwork("");
                  }}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expansion Result */}
      {expandResult && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Network Expansion Successful
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-200">New Networks:</span>
              <span className="text-blue-100 ml-2">
                {expandResult.successfulNetworks?.length || 0}
              </span>
            </div>
            <div>
              <span className="text-blue-200">Total Networks:</span>
              <span className="text-blue-100 ml-2">
                {(activeNetworks.length || 0) +
                  (expandResult.successfulNetworks?.length || 0)}
              </span>
            </div>
          </div>
          {expandResult.successfulNetworks &&
            expandResult.successfulNetworks.length > 0 && (
              <div className="mt-2">
                <span className="text-blue-200 text-sm">Networks: </span>
                <span className="text-blue-100 text-sm">
                  {expandResult.successfulNetworks.join(", ")}
                </span>
              </div>
            )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            const safeAddress = safeData.deployments?.arbitrum?.address;
            if (safeAddress) {
              window.open(
                `https://app.safe.global/home?safe=arb1:${safeAddress}`,
                "_blank"
              );
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ExternalLink className="w-5 h-5" />
          Open Safe App
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Data
        </button>
      </div>
    </div>
  );
};
