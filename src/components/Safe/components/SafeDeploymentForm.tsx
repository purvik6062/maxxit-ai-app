import React from "react";
import { useSession } from "next-auth/react";
import { useAccount, useChainId } from "wagmi";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info
} from "lucide-react";
import { getStatusIcon, getButtonText } from "../utils/safeUtils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface SafeDeploymentFormProps {
  isDeploying: boolean;
  deploymentStatus: "idle" | "deploying" | "success" | "error";
  deploymentResult: any;
  canDeploy: boolean;
  onDeploy: (agentId?: string, agentType?: 'gmx' | 'spot') => void;
  agentId?: string;
  agentType?: 'gmx' | 'spot';
}

export const SafeDeploymentForm: React.FC<SafeDeploymentFormProps> = ({
  isDeploying,
  deploymentStatus,
  deploymentResult,
  canDeploy,
  onDeploy,
  agentId,
  agentType,
}) => {
  const { data: session } = useSession();
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Supported testnet chain IDs
  const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  const ARBITRUM_MAINNET_CHAIN_ID = 42161;
  const SUPPORTED_CHAIN_IDS = [ARBITRUM_SEPOLIA_CHAIN_ID, ETHEREUM_SEPOLIA_CHAIN_ID, ARBITRUM_MAINNET_CHAIN_ID];
  const isCorrectNetwork = chainId ? SUPPORTED_CHAIN_IDS.includes(chainId) : false;
  
  console.log("account::::", account);
  console.log("isConnected::::", isConnected);
  console.log("chainId::::", chainId);
  console.log("isCorrectNetwork::::", isCorrectNetwork);
  console.log("canDeploy prop received:", canDeploy);

  const getStatusIconComponent = () => {
    switch (deploymentStatus) {
      case "deploying":
        return <Loader2 className="w-6 h-6 animate-spin" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-blue-950/70 to-[#070915]/50 backdrop-blur-sm p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 font-napzerRounded">
          Ready to Create Safe Wallet?
        </h2>
        <p className="text-gray-300 text-lg">
          Create your secure multi-signature wallet in seconds
        </p>
      </div>

      {/* Status Checklist */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${session?.user?.id ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-medium text-gray-300">Twitter Account</span>
          </div>
          <span className={`text-sm font-medium ${session?.user?.id ? "text-green-400" : "text-red-400"}`}>
            {session?.user?.id ? `@${session.user.username || session.user.name}` : "Not connected"}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-medium text-gray-300">Wallet Connection</span>
          </div>
          <span className={`text-sm font-medium ${account ? "text-green-400" : "text-red-400"}`}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-medium text-gray-300">Network Status</span>
          </div>
          <span className={`text-sm font-medium ${isCorrectNetwork ? "text-green-400" : "text-red-400"}`}>
            {isCorrectNetwork ? "Supported Network ✓" : "Switch to supported network"}
          </span>
        </div>
      </div>

      {/* Deploy Button */}
      <button
        onClick={() => onDeploy(agentId, agentType)}
        disabled={!canDeploy}
        className={`w-full flex items-center justify-center gap-3 px-8 py-6 rounded-xl font-bold text-white text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl ${deploymentStatus === "success"
            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            : deploymentStatus === "error"
              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              : "bg-gradient-to-r from-indigo-950 to-blue-900 hover:from-indigo-950 hover:to-blue-950"
          }`}
      >
        {getStatusIconComponent()}
        {getButtonText(deploymentStatus)}
      </button>

      {/* Deployment Result */}
      {deploymentResult && deploymentStatus === "success" && (
        <div className="mt-6 p-6 rounded-lg bg-green-500/10 border border-green-500/20">
          <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Safe Wallet Created Successfully!
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-200">Networks Deployed:</span>
              <span className="text-green-100">{deploymentResult.networks?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Safe Version:</span>
              <span className="text-green-100">1.4.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Status:</span>
              <span className="text-green-100">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connector */}
      {!isConnected && (
        <div className="mt-8 flex justify-center">
          <ConnectButton />
        </div>
      )}

      {/* Requirements Info */}
      {!canDeploy && (
        <div className="mt-6 p-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 mb-2">Requirements Checklist</h3>
              <ul className="text-sm text-amber-200 space-y-1">
                {!session?.user?.id && <li>• Connect your Twitter account for identity verification</li>}
                {!isConnected && <li>• Connect your wallet to enable deployment</li>}
                {!isCorrectNetwork && <li>• Switch to a supported network (Arbitrum Sepolia or Ethereum Sepolia)</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 