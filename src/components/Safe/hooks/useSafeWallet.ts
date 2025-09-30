import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccount, useChainId } from "wagmi";
import { SafeData, SafeDeploymentResponse, IUserInfo } from "../types";
import toast from "react-hot-toast";

export const useSafeWallet = () => {
  const { data: session } = useSession();
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Supported testnet chain IDs
  const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  const ARBITRUM_MAINNET_CHAIN_ID = 42161;
  const SUPPORTED_CHAIN_IDS = [ARBITRUM_SEPOLIA_CHAIN_ID, ETHEREUM_SEPOLIA_CHAIN_ID, ARBITRUM_MAINNET_CHAIN_ID];
  const isCorrectNetwork = chainId ? SUPPORTED_CHAIN_IDS.includes(chainId) : false;

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
    42161: "arbitrum",
    421614: "arbitrum_sepolia",
    137: "polygon",
    8453: "base",
    84532: "base_sepolia",
  };

  const currentNetworkKey = chainId ? chainIdToNetworkKey[chainId] : undefined;
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
      userId: session.user.id || "",
      walletAddress: account,
      preferences: {
        defaultNetworks: ["arbitrum"],
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

  // Debug logging to see what's preventing deployment
  console.error("🔍 DEBUGGING canDeploy - START");
  console.error("session?.user?.id:", session?.user?.id);
  console.error("account:", account);
  console.error("isConnected:", isConnected);
  console.error("isCorrectNetwork:", isCorrectNetwork);
  console.error("chainId:", chainId);
  console.error("isDeploying:", isDeploying);
  console.error("existingSafe:", existingSafe);
  console.error("canDeploy RESULT:", canDeploy);
  console.error("🔍 DEBUGGING canDeploy - END");

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
