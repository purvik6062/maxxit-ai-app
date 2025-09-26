"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Coins, Shield, ExternalLink, ArrowLeft, CheckCircle, TrendingUpDown } from "lucide-react";
import { SafeDeploymentForm } from "@/components/Safe/components/SafeDeploymentForm";
import { useAgentSafeDeployment } from "@/components/Safe/hooks/useAgentSafeDeployment";

interface AgentDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentUsername: string;
  agentId: string;
  existingSafeConfigs: Array<{ type: 'perpetuals' | 'spot'; safeAddress: string; agentId: string }>;
  onDeploymentSuccess?: () => void;
}

type DeploymentStep = 'type-selection' | 'safe-creation' | 'funding' | 'confirmation';

export const AgentDeploymentModal: React.FC<AgentDeploymentModalProps> = ({
  isOpen,
  onClose,
  agentUsername,
  agentId,
  existingSafeConfigs,
  onDeploymentSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('type-selection');
  const [selectedType, setSelectedType] = useState<'perpetuals' | 'spot' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Use agent-specific Safe wallet deployment hook
  const {
    isDeploying,
    deploymentStatus,
    deploymentResult,
    existingSafe,
    safeCheckError,
    currentNetworkKey,
    canDeploy,
    isCheckingAgentSafe,
    handleDeploySafe,
    checkAgentSpecificSafe
  } = useAgentSafeDeployment({
    agentId,
    agentType: selectedType || undefined
  });

  console.log('existingSafeConfigs', existingSafeConfigs);

  // Determine which agent types are already deployed for this specific agent
  const agentSafeConfigs = existingSafeConfigs.filter(config => config.agentId === agentId);
  const deployedTypes: Array<'perpetuals' | 'spot'> = agentSafeConfigs.map(config => config.type);
  const allTypes: Array<'perpetuals' | 'spot'> = ['perpetuals', 'spot'];
  const availableTypes: Array<'perpetuals' | 'spot'> = allTypes.filter(
    (type): type is 'perpetuals' | 'spot' => !deployedTypes.includes(type)
  );

  // Set default selected type to first available type
  useEffect(() => {
    if (availableTypes.length > 0 && !selectedType) {
      setSelectedType(availableTypes[0]);
    }
  }, [availableTypes, selectedType]);

  // Update safe address when deployment is successful
  useEffect(() => {
    if (deploymentStatus === 'success' && deploymentResult) {
      console.log('useEffect triggered with deployment result:', {
        deploymentResult,
        currentNetworkKey,
        isCheckingAgentSafe,
        selectedType
      });

      // First, try to get the safe address directly from deploymentResult
      // This is more reliable than finding existingSafe document
      let safeAddress: string | null = null;

      // Check if deploymentResult has deployments object (SafeData format)
      if (
        deploymentResult.deployments &&
        currentNetworkKey &&
        typeof currentNetworkKey === 'string' &&
        (deploymentResult.deployments as Record<string, any>)[currentNetworkKey]
      ) {
        safeAddress = (deploymentResult.deployments as Record<string, any>)[currentNetworkKey].address;
      }
      // Check if deploymentResult has networks array
      else if (deploymentResult.networks && Array.isArray(deploymentResult.networks)) {
        const networkDeployment = deploymentResult.networks.find((network: any) => network.networkKey === currentNetworkKey);
        if (networkDeployment) {
          safeAddress = networkDeployment.address;
        }
      }
      // Check if deploymentResult is itself a deployment object
      else if (deploymentResult.networkKey && deploymentResult.networkKey === currentNetworkKey) {
        safeAddress = deploymentResult.address;
      }

      if (safeAddress && selectedType) {
        setSafeAddress(safeAddress);
        console.log(`Safe deployment successful! Found ${selectedType} agent Safe address from deployment result:`, safeAddress);

        // Automatically save configuration and move to funding step
        const saveConfig = async () => {
          const success = await saveSafeConfiguration(safeAddress, selectedType);
          if (success) {
            setTimeout(() => setCurrentStep('funding'), 1000);
          } else {
            // Configuration failed, stay on current step to show error
            console.error('Failed to save safe configuration automatically');
          }
        };
        saveConfig();
        return;
      }

      // Fallback: try to get from existingSafe if deployment result doesn't have it
      if (existingSafe && !isCheckingAgentSafe) {
        console.log('Falling back to existingSafe:', {
          safeId: existingSafe.safeId,
          agentId: existingSafe.userInfo?.agentId,
          agentType: existingSafe.userInfo?.agentType,
        });

        // Only proceed if the agentType matches what we're expecting
        if (existingSafe.userInfo?.agentType === selectedType) {
          // Get the Safe address from the existingSafe's deployments for the current network
          const safeDeployments = existingSafe.deployments as Record<string, any> | undefined;
          if (
            safeDeployments &&
            currentNetworkKey &&
            typeof currentNetworkKey === 'string' &&
            safeDeployments[currentNetworkKey] &&
            selectedType
          ) {
            const safeAddress = safeDeployments[currentNetworkKey].address;
            setSafeAddress(safeAddress);
            console.log(`Safe deployment successful! Found ${selectedType} agent Safe address from existingSafe:`, safeAddress);

            // Automatically save configuration and move to funding step
            const saveConfig = async () => {
              const success = await saveSafeConfiguration(safeAddress, selectedType);
              if (success) {
                setTimeout(() => setCurrentStep('funding'), 1000);
              } else {
                console.error('Failed to save safe configuration automatically');
              }
            };
            saveConfig();
          } else {
            console.error('No deployment found for current network in existingSafe:', {
              safeDeployments: Object.keys(safeDeployments || {}),
              currentNetworkKey,
              selectedType: selectedType || 'undefined'
            });
          }
        } else {
          console.log('Skipping useEffect - agentType mismatch:', {
            existingAgentType: existingSafe.userInfo?.agentType,
            expectedAgentType: selectedType
          });
        }
      } else {
        console.error('No deployment found for current network in deployment result or existingSafe');
      }
    }
  }, [deploymentStatus, deploymentResult, existingSafe, currentNetworkKey, selectedType, isCheckingAgentSafe]);

  const resetModal = () => {
    setCurrentStep('type-selection');
    setSelectedType(availableTypes[0] || null);
    setSafeAddress(null);
    setIsLoading(false);
    setError('');
  };

  // Clear error when starting a new deployment
  const handleTypeSelect = (type: 'perpetuals' | 'spot') => {
    setSelectedType(type);
    setError(''); // Clear any previous errors
    setCurrentStep('safe-creation');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBackToMarketplace = () => {
    // Call the refresh callback if provided
    if (onDeploymentSuccess) {
      onDeploymentSuccess();
    }
    handleClose();
  };

  const handleCopyAddress = async () => {
    if (!safeAddress) return;
    try {
      await navigator.clipboard.writeText(safeAddress);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 1500);
    } catch (err) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 1500);
    }
  };

  const saveSafeConfiguration = async (address: string, agentType: 'perpetuals' | 'spot') => {
    // Validate all required parameters
    if (!address || !agentType || !agentId || !currentNetworkKey) {
      console.error('Cannot save configuration: missing required parameters', {
        address: !!address,
        agentType: !!agentType,
        agentId: !!agentId,
        currentNetworkKey: !!currentNetworkKey
      });
      setError('Missing required configuration parameters');
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Saving safe configuration automatically...', {
        agentId,
        type: agentType,
        safeAddress: address,
        networkKey: currentNetworkKey
      });

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/update-safe-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          type: agentType,
          safeAddress: address,
          networkKey: currentNetworkKey,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      console.log('Safe configuration saved successfully');
      return true;
    } catch (err) {
      console.error('Failed to save safe configuration:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Configuration save timed out. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to save configuration');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToSafeApp = () => {
    if (!safeAddress) return;

    const network = currentNetworkKey === 'arbitrum_sepolia' ? 'arbitrum_sepolia' : 'ethereum';
    const safeAppUrl = `https://app.safe.global/home?safe=${network}:${safeAddress}`;
    window.open(safeAppUrl, '_blank');
  };

  const handleBack = () => {
    if (currentStep === 'type-selection') {
      onClose();
    } else if (currentStep === 'safe-creation') {
      setCurrentStep('type-selection');
    } else if (currentStep === 'funding') {
      setCurrentStep('safe-creation');
    }
  };

  const hasExistingConfigForType = (type: 'perpetuals' | 'spot') => {
    return existingSafeConfigs.some(config => config.type === type && config.agentId === agentId);
  };

  if (!isOpen) return null;

  // If no available types, show message
  if (availableTypes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-md w-full">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">All Agents Deployed</h3>
            <p className="text-gray-300 mb-6">
              You have already deployed both GMX and Spot agents for @{agentUsername}.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0D1321] via-[#0b1020] to-[#0a0e1c] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl transition-all duration-300 ease-out hover:shadow-blue-900/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-white/5 via-transparent to-white/5">
          <div>
            <h2 className="font-leagueSpartan text-2xl md:text-3xl font-semibold tracking-tight text-white">Deploy Agent</h2>
            <p className="text-gray-300 text-sm md:text-base">Configure @{agentUsername} for automated trading</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Safe Wallet Error Display */}
          {safeCheckError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-300 text-sm">Safe Wallet Error: {safeCheckError}</p>
            </div>
          )}

          <>
            {/* Type Selection Step */}
            {currentStep === 'type-selection' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40 animate-pulse">
                    <TrendingUpDown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-leagueSpartan text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">Choose Trading Type</h3>
                  <p className="text-gray-300">Select the type of trading strategy you want to deploy</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {availableTypes.map((type) => (
                    <div
                      key={type}
                      className={`group p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${hasExistingConfigForType(type)
                        ? 'border-gray-700 bg-[#0F172A] opacity-50'
                        : 'border-gray-700 bg-[#0F172A] hover:border-blue-500 hover:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]'
                        }`}
                      onClick={() => !hasExistingConfigForType(type) && handleTypeSelect(type)}
                    >
                      <div className="text-center">
                        <div className={`font-leagueSpartan w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:rotate-3 ${type === 'perpetuals'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600'
                          }`}>
                          {type === 'perpetuals' ? (
                            <TrendingUp className="w-8 h-8 text-white" />
                          ) : (
                            <Coins className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-2 capitalize">
                          {type === 'perpetuals' ? 'GMX' : 'Spot Trading'}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                          {type === 'perpetuals'
                            ? 'Trade with leverage on futures contracts. Higher risk, higher potential returns.'
                            : 'Buy and sell actual cryptocurrencies. Lower risk, stable returns.'
                          }
                        </p>
                        {hasExistingConfigForType(type) && (
                          <div className="flex items-center justify-center text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Already Configured
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe Creation Step */}
            {currentStep === 'safe-creation' && selectedType && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">Create Safe Wallet</h3>
                  <p className="text-gray-300">Deploy a secure multi-signature wallet for {selectedType} trading</p>
                </div>

                <SafeDeploymentForm
                  isDeploying={isDeploying}
                  deploymentStatus={deploymentStatus}
                  deploymentResult={deploymentResult}
                  canDeploy={canDeploy}
                  onDeploy={handleDeploySafe}
                  agentId={agentId}
                  agentType={selectedType}
                />
              </div>
            )}

            {/* Funding Step */}
            {currentStep === 'funding' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
                    {isLoading ? 'Configuring Your Agent...' : 'Fund Your Safe Wallet'}
                  </h3>
                  <p className="text-gray-300">
                    {isLoading ? 'Setting up your agent configuration' : 'Deposit funds to start automated trading'}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg md:text-xl font-semibold tracking-tight text-white mb-4">Your Safe Wallet</h4>
                  <div className="bg-[#0F172A] rounded-lg p-4 mb-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Safe Address</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm text-white font-mono break-all">
                        {isCheckingAgentSafe ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-400">Finding your {selectedType} agent Safe wallet...</span>
                          </div>
                        ) : safeAddress || 'Unknown'}
                      </div>
                      <button
                        onClick={handleCopyAddress}
                        disabled={!safeAddress}
                        className="px-3 py-1.5 text-xs rounded-md border border-gray-600 text-gray-200 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 transition-all"
                      >
                        {copyStatus || 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Show configuration status prominently */}
                  {isLoading && (
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-blue-400 font-medium">
                          Saving agent configuration to your account...
                        </p>
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && safeAddress && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <p className="text-sm text-green-400 font-medium">
                        ✅ Agent configuration saved successfully!
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-sm text-red-400 font-medium">
                        ❌ Configuration Error: {error}
                      </p>
                    </div>
                  )}

                  {!isLoading && (
                    <>
                      <p className="text-gray-300 mb-6">
                        To start trading, you need to deposit funds into your Safe wallet. Click the button below to open the Safe app and add funds.
                      </p>

                      <button
                        onClick={redirectToSafeApp}
                        disabled={!safeAddress}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30"
                      >
                        Open Safe App to Add Funds
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {!error && safeAddress && (
                        <button
                          onClick={handleBackToMarketplace}
                          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/30"
                        >
                          Back to Marketplace
                        </button>
                      )}
                    </>
                  )}

                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                    <p className="text-sm text-blue-400">
                      💡 After adding funds, your {selectedType} agent will be ready to start trading.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gradient-to-r from-white/5 via-transparent to-white/5">
          <div className="flex-1 mr-4">
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500`}
                style={{ width: `${(currentStep === 'type-selection' ? 33 : currentStep === 'safe-creation' ? 66 : 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep === 'type-selection' ? 1 : currentStep === 'safe-creation' ? 2 : 3} of 3
          </div>
        </div>
      </div>
    </div>
  );
};