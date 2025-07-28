import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWallet } from "@/components/enzyme/WalletConnector";
import { SafeData, SafeDeploymentResponse, IUserInfo } from "../types";
import toast from "react-hot-toast";

export const useSafeWallet = () => {
  const { data: session } = useSession();
  const { account, isCorrectNetwork, chainId } = useWallet();

  // Deployment states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  // Safe account checking states
  const [isCheckingSafe, setIsCheckingSafe] = useState(false);
  const [existingSafe, setExistingSafe] = useState<SafeData | null>(null);
  const [safeCheckError, setSafeCheckError] = useState<string | null>(null);

  // Map chainId to network key for expansion check
  const chainIdToNetworkKey: { [key: number]: string } = {
    1: "ethereum",
    11155111: "sepolia",
    42161: "arbitrum_one",
    421614: "arbitrum_sepolia",
    137: "polygon",
    8453: "base",
    84532: "base_sepolia",
  };

  const currentNetworkKey = chainIdToNetworkKey[chainId || 0];
  const canExpandNetwork =
    existingSafe && currentNetworkKey
      ? !existingSafe.metadata?.activeNetworks?.includes(currentNetworkKey)
      : false;

  const checkExistingSafe = async (address: string): Promise<void> => {
    try {
      setIsCheckingSafe(true);
      setSafeCheckError(null);
      setExistingSafe(null);

      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured"
        );
      }

      const response = await fetch(`${baseUrl}/api/safe/address/${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExistingSafe(result.data);
        } else {
          setExistingSafe(null);
        }
      } else if (response.status === 404) {
        setExistingSafe(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error checking existing Safe:", error);
      setSafeCheckError(
        error instanceof Error ? error.message : "Failed to check existing Safe"
      );
    } finally {
      setIsCheckingSafe(false);
    }
  };

  const handleDeploySafe = async () => {
    if (!session?.user?.id) {
      toast.error("Please login with your Twitter account first");
      return;
    }

    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error(
        "Please switch to Arbitrum Sepolia or Ethereum Sepolia network"
      );
      return;
    }

    const userInfo: IUserInfo = {
      userId: session.user.name || "",
      walletAddress: account,
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

      const baseUrl = process.env.NEXT_PUBLIC_SAFE_WALLET_URL;
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_SAFE_WALLET_URL environment variable is not configured"
        );
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
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success) {
        setDeploymentStatus("success");
        setDeploymentResult(result.data);
        toast.success("Safe wallet deployed successfully!");
        if (account) {
          setTimeout(() => checkExistingSafe(account), 2000);
        }
      } else {
        throw new Error(result.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Safe deployment error:", error);
      setDeploymentStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Failed to deploy Safe wallet";
      toast.error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRefresh = () => {
    setExistingSafe(null);
    if (account) checkExistingSafe(account);
  };

  const canDeploy = Boolean(
    session?.user?.id &&
      account &&
      isCorrectNetwork &&
      !isDeploying &&
      !existingSafe
  );

  // Reset all states when dependencies change
  const resetAllStates = () => {
    setIsDeploying(false);
    setDeploymentStatus("idle");
    setDeploymentResult(null);
    setIsCheckingSafe(false);
    setExistingSafe(null);
    setSafeCheckError(null);
  };

  // Check for existing Safe when account, network, or session changes
  useEffect(() => {
    // Reset all states first
    resetAllStates();

    // Only check for existing Safe if we have valid account and network
    if (account && isCorrectNetwork) {
      checkExistingSafe(account);
    }
  }, [account, isCorrectNetwork, session?.user?.id, chainId]);

  return {
    // State
    isDeploying,
    deploymentStatus,
    deploymentResult,
    isCheckingSafe,
    existingSafe,
    safeCheckError,
    currentNetworkKey,
    canExpandNetwork,
    canDeploy,

    // Actions
    handleDeploySafe,
    handleRefresh,
    checkExistingSafe,
  };
};
