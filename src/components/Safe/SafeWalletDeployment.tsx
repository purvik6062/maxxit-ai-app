"use client";

/**
 * SafeWalletDeployment Component
 * 
 * Requires the following environment variable:
 * NEXT_PUBLIC_SAFE_WALLET_URL - The base URL for the Safe wallet deployment service
 * 
 * Example: NEXT_PUBLIC_SAFE_WALLET_URL=https://your-safe-service.com
 */

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWallet, WalletConnector } from "@/components/enzyme/WalletConnector";
import { IUserInfo, SafeDeploymentResponse } from "./types";
import toast from "react-hot-toast";
import { Loader2, Shield, CheckCircle, AlertCircle, Wallet, ExternalLink } from "lucide-react";

interface SafeWalletDeploymentProps {
  className?: string;
}

// Component to display existing Safe account information
const ExistingSafeDisplay = ({ safeData, onRefresh }: { safeData: any; onRefresh: () => void }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandResult, setExpandResult] = useState<any>(null);

  const handleExpandSafe = async () => {
    try {
      setIsExpanding(true);
      setExpandResult(null);

      // Get the base URL from environment variable
      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured");
      }

      // Use the Safe ID from safeData (could be safeAddress or id field)
      const safeId = safeData.safeId;
      console.log("safeId", safeId, safeData);
      if (!safeId) {
        throw new Error("Safe ID not found in Safe data");
      }

      // Define networks to expand to - you can modify this array as needed
      const networks = ["arbitrum"];

      const response = await fetch(`${baseUrl}/api/safe/${safeId}/expand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ networks }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setExpandResult(result.data);
        toast.success(`Safe expanded to ${result.data.successfulNetworks?.length || 0} new network(s)!`);
        // Optionally refresh the Safe data after expansion
        setTimeout(() => onRefresh(), 2000);
      } else {
        throw new Error(result.error || result.message || "Expansion failed");
      }
    } catch (error) {
      console.error("Safe expansion error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to expand Safe";
      toast.error(errorMessage);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Existing Safe Account Found
        </h2>
        <p className="text-gray-600">
          Your wallet address already has a Safe account
        </p>
      </div>

      {/* Safe Information */}
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Safe Account Details</h3>
          <div className="space-y-3">
            {safeData.safeAddress && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Safe Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-green-600">
                    {`${safeData.safeAddress.slice(0, 6)}...${safeData.safeAddress.slice(-4)}`}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(safeData.safeAddress)}
                    className="text-green-600 hover:text-green-800"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {safeData.owners && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-green-700">Owners:</span>
                <div className="text-sm text-green-600 text-right">
                  {Array.isArray(safeData.owners) ? safeData.owners.length : 'N/A'} owner(s)
                </div>
              </div>
            )}

            {safeData.threshold && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Threshold:</span>
                <span className="text-sm text-green-600">{safeData.threshold}</span>
              </div>
            )}

            {safeData.version && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Version:</span>
                <span className="text-sm text-green-600">{safeData.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Data Display */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Complete Safe Data
        </h3>
        <div className="text-sm text-gray-300">
          <pre className="whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(safeData, null, 2)}
          </pre>
        </div>
      </div>

      {/* Expansion Result */}
      {expandResult && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Safe Expansion Result
          </h3>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Successful Networks:</span>
              <span className="text-sm text-blue-600">{expandResult.successfulNetworks?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total Networks:</span>
              <span className="text-sm text-blue-600">{expandResult.totalNewNetworks || 0}</span>
            </div>
            {expandResult.successfulNetworks && expandResult.successfulNetworks.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-blue-700">Networks:</span>
                <div className="text-sm text-blue-600 text-right">
                  {expandResult.successfulNetworks.join(', ')}
                </div>
              </div>
            )}
          </div>
          <div className="text-sm text-blue-700">
            <pre className="whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(expandResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.open(`https://app.safe.global/home?safe=${safeData.safeAddress}`, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Safe App
        </button>

        <button
          onClick={handleExpandSafe}
          disabled={isExpanding}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isExpanding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Expanding...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Expand
            </>
          )}
        </button>

        <button
          onClick={onRefresh}
          className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export const SafeWalletDeployment: React.FC<SafeWalletDeploymentProps> = ({
  className = "",
}) => {
  const { data: session } = useSession();
  const { account, isCorrectNetwork } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  // Safe account checking states
  const [isCheckingSafe, setIsCheckingSafe] = useState(false);
  const [existingSafe, setExistingSafe] = useState<any>(null);
  const [safeCheckError, setSafeCheckError] = useState<string | null>(null);

  // Function to check if the address already has a Safe account
  const checkExistingSafe = async (address: string) => {
    try {
      setIsCheckingSafe(true);
      setSafeCheckError(null);
      setExistingSafe(null);

      // Get the base URL from environment variable
      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured");
      }

      const response = await fetch(`${baseUrl}/api/safe/address/${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseSupportedNetworks = await fetch(`${baseUrl}/api/network/supported`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const supportedNetworks = await responseSupportedNetworks.json();

      console.log("responseSupportedNetworks", supportedNetworks);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExistingSafe(result.data);
        } else {
          // No Safe found for this address
          setExistingSafe(null);
        }
      } else if (response.status === 404) {
        // No Safe found for this address
        setExistingSafe(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error checking existing Safe:", error);
      setSafeCheckError(error instanceof Error ? error.message : "Failed to check existing Safe");
    } finally {
      setIsCheckingSafe(false);
    }
  };

  // Check for existing Safe when account changes
  useEffect(() => {
    if (account && isCorrectNetwork) {
      checkExistingSafe(account);
    } else {
      setExistingSafe(null);
      setSafeCheckError(null);
    }
  }, [account, isCorrectNetwork]);

  const handleDeploySafe = async () => {
    // Validation checks
    if (!session?.user?.id) {
      toast.error("Please login with your Twitter account first");
      return;
    }

    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to Arbitrum Sepolia or Ethereum Sepolia network");
      return;
    }

    console.log("session", session);

    // Prepare user info
    const userInfo: IUserInfo = {
      userId: session.user.name || "",
      walletAddress: account,
      // email: session.user.email || undefined,
      preferences: {
        defaultNetworks: ["sepolia"],
        autoExpand: true,
        notifications: {
          email: false,
          webhook: false,
        },
      },
    };

    try {
      setIsDeploying(true);
      setDeploymentStatus("deploying");
      setDeploymentResult(null);

      // Get the base URL from environment variable
      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured");
      }

      const response = await fetch(`${baseUrl}/api/safe/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfo }),
      });

      const result: SafeDeploymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setDeploymentStatus("success");
        setDeploymentResult(result.data);
        toast.success("Safe wallet deployed successfully!");
        // Refresh the Safe check after successful deployment
        if (account) {
          setTimeout(() => checkExistingSafe(account), 2000);
        }
      } else {
        throw new Error(result.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Safe deployment error:", error);
      setDeploymentStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to deploy Safe wallet";
      toast.error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case "deploying":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (deploymentStatus) {
      case "deploying":
        return "bg-blue-600 hover:bg-blue-700";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-indigo-600 hover:bg-indigo-700";
    }
  };

  const getButtonText = () => {
    switch (deploymentStatus) {
      case "deploying":
        return "Deploying...";
      case "success":
        return "Deployed Successfully";
      case "error":
        return "Deployment Failed";
      default:
        return "Deploy Safe Wallets";
    }
  };

  const canDeploy = session?.user?.id && account && isCorrectNetwork && !isDeploying;

  const handleRefresh = () => {
    setExistingSafe(null);
    if (account) checkExistingSafe(account);
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      {/* Loading state while checking for existing Safe */}
      {isCheckingSafe && account && isCorrectNetwork && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Checking for Existing Safe Account
            </h3>
            <p className="text-gray-600">
              Please wait while we check if your wallet already has a Safe account...
            </p>
          </div>
        </div>
      )}

      {/* Show existing Safe if found */}
      {!isCheckingSafe && existingSafe && (
        <ExistingSafeDisplay safeData={existingSafe} onRefresh={handleRefresh} />
      )}

      {/* Show error if Safe check failed */}
      {!isCheckingSafe && safeCheckError && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Checking Safe Account
            </h3>
            <p className="text-red-600 text-sm mb-4">{safeCheckError}</p>
            <button
              onClick={() => account && checkExistingSafe(account)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry Check
            </button>
          </div>
        </div>
      )}

      {/* Show deployment component if no existing Safe found */}
      {!isCheckingSafe && !existingSafe && !safeCheckError && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Deploy Safe Wallets
            </h2>
            <p className="text-gray-600">
              Create secure multi-signature wallets for your organization
            </p>
          </div>

          {/* Status Information */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Twitter Account:</span>
              <span className={`text-sm ${session?.user?.id ? "text-green-600" : "text-red-600"}`}>
                {session?.user?.id ? `@${session.user.username || session.user.name}` : "Not connected"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Wallet Address:</span>
              <span className={`text-sm ${account ? "text-green-600" : "text-red-600"}`}>
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Network:</span>
              <span className={`text-sm ${isCorrectNetwork ? "text-green-600" : "text-red-600"}`}>
                {isCorrectNetwork ? "Supported Network ✓" : "Please switch to Arbitrum Sepolia or Ethereum Sepolia"}
              </span>
            </div>
          </div>

          {/* Deployment Button */}
          <button
            onClick={handleDeploySafe}
            disabled={!canDeploy}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getButtonText()}
          </button>

          {/* Deployment Result */}
          {deploymentResult && deploymentStatus === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Deployment Successful
              </h3>
              <div className="text-sm text-green-700">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(deploymentResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Wallet Connector */}
          {!account && (
            <div className="mt-6">
              <WalletConnector className="flex justify-center" />
            </div>
          )}

          {/* Requirements */}
          {!canDeploy && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Requirements to Deploy
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {!session?.user?.id && (
                  <li>• Connect your Twitter account</li>
                )}
                {!account && (
                  <li>• Connect your wallet</li>
                )}
                {!isCorrectNetwork && (
                  <li>• Switch to Arbitrum Sepolia or Ethereum Sepolia network</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 