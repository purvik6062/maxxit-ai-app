"use client";

import React from "react";
import { Shield } from "lucide-react";
import { useWallet } from "@/components/enzyme/WalletConnector";
import { useSafeWallet } from "./hooks/useSafeWallet";
import { ExistingSafeDisplay } from "./components/ExistingSafeDisplay";
import { SafeDeploymentForm } from "./components/SafeDeploymentForm";
import { SafeInfoSection } from "./components/SafeInfoSection";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";

interface SafeWalletDeploymentProps {
  className?: string;
}

export const SafeWalletDeployment: React.FC<SafeWalletDeploymentProps> = ({
  className = "",
}) => {
  const { account, isCorrectNetwork } = useWallet();
  const {
    isDeploying,
    deploymentStatus,
    deploymentResult,
    isCheckingSafe,
    existingSafe,
    safeCheckError,
    currentNetworkKey,
    canExpandNetwork,
    canDeploy,
    handleDeploySafe,
    handleRefresh,
    checkExistingSafe,
  } = useSafeWallet();

  return (
    <div className={`min-h-screen py-12 px-4 font-leagueSpartan ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div> */}
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-napzerRounded mb-4">
            Create Safe Wallet
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Deploy secure multi-signature wallets across multiple blockchain networks with deterministic addresses and advanced security features.
          </p>
        </div>

        {/* Loading state */}
        {isCheckingSafe && account && isCorrectNetwork && (
          <LoadingState
            title="Checking Safe Status"
            description="Verifying if your wallet already has a Safe account..."
          />
        )}

        {/* Error State */}
        {!isCheckingSafe && safeCheckError && (
          <ErrorState
            title="Connection Error"
            error={safeCheckError}
            onRetry={() => account && checkExistingSafe(account)}
          />
        )}

        {/* Main Content */}
        {!isCheckingSafe && !safeCheckError && (
          <>
            {/* Safe Information Section */}
            <SafeInfoSection />

            {/* Safe Display or Deployment Section */}
            {existingSafe ? (
              <div className="mb-8">
                <ExistingSafeDisplay
                  safeData={existingSafe}
                  onRefresh={handleRefresh}
                  currentNetwork={currentNetworkKey || ""}
                  canExpand={canExpandNetwork}
                />
              </div>
            ) : (
              <SafeDeploymentForm
                isDeploying={isDeploying}
                deploymentStatus={deploymentStatus}
                deploymentResult={deploymentResult}
                canDeploy={canDeploy}
                onDeploy={handleDeploySafe}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};