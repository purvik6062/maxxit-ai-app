"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { SafeDeploymentForm } from "@/components/Safe/components/SafeDeploymentForm";
import { ExistingSafeDisplay } from "@/components/Safe/components/ExistingSafeDisplay";
import { LoadingState } from "@/components/Safe/components/LoadingState";
import { ErrorState } from "@/components/Safe/components/ErrorState";

interface Step1SafeSetupProps {
  account: string | null | undefined;
  isCorrectNetwork: boolean | undefined;
  isCheckingSafe: boolean;
  safeCheckError: string | null;
  existingSafe: any;
  currentNetworkKey: string | null | undefined;
  canExpandNetwork: boolean;
  isDeploying: boolean;
  deploymentStatus: any;
  deploymentResult: any;
  canDeploy: boolean;
  handleDeploySafe: () => void;
  handleRefresh: () => void;
  checkExistingSafe: (wallet: string) => void;
}

export const Step1SafeSetup: React.FC<Step1SafeSetupProps> = ({
  account,
  isCorrectNetwork,
  isCheckingSafe,
  safeCheckError,
  existingSafe,
  currentNetworkKey,
  canExpandNetwork,
  isDeploying,
  deploymentStatus,
  deploymentResult,
  canDeploy,
  handleDeploySafe,
  handleRefresh,
  checkExistingSafe,
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 1: Create Safe Wallet
        </h2>
        <p className="text-gray-300 text-lg">
          Deploy a secure multi-signature wallet to manage your trading operations
        </p>
      </div>

      {isCheckingSafe && account && isCorrectNetwork && (
        <LoadingState
          title="Checking Safe Status"
          description="Verifying if your wallet already has a Safe account..."
        />
      )}

      {!isCheckingSafe && safeCheckError && (
        <ErrorState
          title="Connection Error"
          error={safeCheckError}
          onRetry={() => account && checkExistingSafe(account)}
        />
      )}

      <>
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
    </div>
  );
};


