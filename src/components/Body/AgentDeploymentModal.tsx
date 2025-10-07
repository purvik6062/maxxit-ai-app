"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Coins, Shield, ExternalLink, ArrowLeft, CheckCircle, TrendingUpDown, Settings, Wallet, Sparkles, Info } from "lucide-react";
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

interface StepIndicatorProps {
  currentStep: DeploymentStep;
  onStepClick?: (step: DeploymentStep) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 'type-selection' as const, label: 'Type', icon: Settings, description: 'Choose Strategy' },
    { id: 'safe-creation' as const, label: 'Safe', icon: Shield, description: 'Deploy Wallet' },
    { id: 'funding' as const, label: 'Fund', icon: Wallet, description: 'Add Funds' },
    { id: 'confirmation' as const, label: 'Confirm', icon: CheckCircle, description: 'Complete' }
  ];

  const getStepIndex = (step: DeploymentStep) => {
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center justify-between ">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 bg-[#312e37] -translate-y-1/2 z-0">
                <div
                  className={`h-full bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'
                    }`}
                />
              </div>
            )}

            {/* Step Circle */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                ? 'bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] shadow-lg shadow-[#AAC9FA]/30 scale-110'
                : isCompleted
                  ? 'bg-gradient-to-br from-[#19294c] to-[#287bf0] shadow-lg shadow-white-100/30'
                  : 'bg-[#312e37] border border-[#4A5568]'
                } ${isClickable ? 'cursor-pointer hover:scale-105' : ''}`}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <Icon
                className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-[#0D1321]' : isCompleted ? 'text-white' : 'text-[#8ba1bc]'
                  }`}
              />
            </div>

            {/* Step Label */}
            <div className="mt-3 text-center">
              <div className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-[#b4ccfc]' : 'text-gray-400'
                }`}>
                {step.label}
              </div>
              <div className={`text-xs transition-colors duration-300 ${isActive ? 'text-gray-300' : isCompleted ? 'text-[#8a97b1]' : 'text-gray-500'
                }`}>
                {step.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

  const handleBackToMarketplace = async () => {
    // Call the refresh callback if provided
    if (onDeploymentSuccess) {
      console.log('Refreshing marketplace data after successful deployment...');
      await onDeploymentSuccess();
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
    } else if (currentStep === 'confirmation') {
      setCurrentStep('funding');
    }
  };

  const handleStepClick = (step: DeploymentStep) => {
    // Only allow going back to previous steps or current step
    const stepOrder = ['type-selection', 'safe-creation', 'funding', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);

    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  const handleCompleteDeployment = async () => {
    // Call the refresh callback if provided
    if (onDeploymentSuccess) {
      console.log('Refreshing marketplace data after successful deployment...');
      await onDeploymentSuccess();
    }
    handleClose();
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0D1321] via-[#0e1424] to-[#0D1321] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-[#312e37] shadow-2xl transition-all duration-500 ease-out hover:shadow-[#AAC9FA]/20">
        {/* Header */}
        <div className="relative p-6 border-b border-[#312e37] bg-gradient-to-r from-[#0D1321] to-[#0e1424]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-xl flex items-center justify-center shadow-lg shadow-[#AAC9FA]/30">
                <Sparkles className="w-5 h-5 text-[#0D1321]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
                  Deploy Agent
                </h2>
                <p className="text-[#8ba1bc] text-sm">Configure @{agentUsername} for automated trading</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#1a2234] rounded-lg transition-all duration-300 hover:rotate-90 group"
            >
              <X className="w-5 h-5 text-[#8ba1bc] group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-[#141d31] border-b border-[#312e37]">
          <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto  max-h-[calc(90vh-300px)]">
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
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#AAC9FA]/30">
                    <Settings className="w-8 h-8 text-[#0D1321]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Choose Trading Strategy</h3>
                  <p className="text-[#8ba1bc] text-sm max-w-2xl mx-auto">
                    Select the type of trading strategy you want to deploy for @{agentUsername}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {availableTypes.map((type) => (
                    <div
                      key={type}
                      className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ${hasExistingConfigForType(type)
                        ? 'border-[#312e37] bg-[#0d13218a] opacity-60 cursor-not-allowed'
                        : 'border-[#312e37] bg-[#182543] hover:border-[#AAC9FA] hover:shadow-lg hover:shadow-[#AAC9FA]/20 hover:-translate-y-1'
                        }`}
                      onClick={() => !hasExistingConfigForType(type) && handleTypeSelect(type)}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 ${type === 'perpetuals'
                          ? 'bg-gradient-to-br from-[#04c3fc] to-[#73C7E1] shadow-lg shadow-[#04c3fc]/30'
                          : 'bg-gradient-to-br from-[#3484B3] to-[#4A9CC4] shadow-lg shadow-[#3484B3]/30'
                          }`}>
                          {type === 'perpetuals' ? (
                            <TrendingUp className="w-6 h-6 text-white" />
                          ) : (
                            <Coins className="w-6 h-6 text-white" />
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">
                          {type === 'perpetuals' ? 'GMX Perpetuals' : 'Spot Trading'}
                        </h3>

                        <p className="text-[#8ba1bc] text-xs mb-4 leading-relaxed">
                          {type === 'perpetuals'
                            ? 'Trade with leverage on futures contracts. Higher risk, higher potential returns.'
                            : 'Buy and sell actual cryptocurrencies. Lower risk, stable returns.'
                          }
                        </p>

                        {hasExistingConfigForType(type) ? (
                          <div className="flex items-center justify-center text-[#04c3fc] text-xs font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Already Configured
                          </div>
                        ) : (
                          <div className="text-[#AAC9FA] text-xs font-medium group-hover:text-[#E1EAF9] transition-colors">
                            Click to select →
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
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#AAC9FA]/30">
                    <Shield className="w-8 h-8 text-[#0D1321]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Deploy Safe Wallet</h3>
                  <p className="text-[#8ba1bc] text-sm max-w-2xl mx-auto">
                    Create a secure multi-signature wallet for your {selectedType} trading strategy
                  </p>
                </div>

                {/* <div className="max-w-2xl mx-auto"> */}
                <SafeDeploymentForm
                  isDeploying={isDeploying}
                  deploymentStatus={deploymentStatus}
                  deploymentResult={deploymentResult}
                  canDeploy={canDeploy}
                  onDeploy={handleDeploySafe}
                  agentId={agentId}
                  agentType={selectedType}
                />
                {/* </div> */}
              </div>
            )}

            {/* Funding Step */}
            {currentStep === 'funding' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#AAC9FA]/30">
                    <Wallet className="w-8 h-8 text-[#0D1321]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isLoading ? 'Configuring Agent...' : 'Fund Your Safe Wallet'}
                  </h3>
                  <p className="text-[#8ba1bc] text-sm max-w-2xl mx-auto">
                    {isLoading ? 'Setting up your agent configuration' : 'Deposit funds to start automated trading'}
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-[#0D1321] rounded-xl p-6 border border-[#312e37]">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-[#0D1321]" />
                      </div>
                      Your Safe Wallet
                    </h4>

                    <div className="bg-[#111528] rounded-lg p-4 mb-4 border border-[#312e37]">
                      <p className="text-xs text-[#8ba1bc] mb-2 font-medium">Safe Address</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-xs text-white font-mono break-all bg-[#0D1321] p-2 rounded">
                          {isCheckingAgentSafe ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#04c3fc] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[#8ba1bc]">Finding your {selectedType} agent Safe wallet...</span>
                            </div>
                          ) : safeAddress || 'Unknown'}
                        </div>
                        <button
                          onClick={handleCopyAddress}
                          disabled={!safeAddress}
                          className="px-3 py-1.5 text-xs rounded border border-[#312e37] text-[#8ba1bc] hover:text-white hover:border-[#AAC9FA] hover:bg-[#AAC9FA]/10 disabled:opacity-50 transition-all duration-300"
                        >
                          {copyStatus || 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Configuration Status */}
                    {isLoading && (
                      <div className="mb-4 p-3 bg-[#04c3fc]/10 border border-[#04c3fc]/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#04c3fc] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-[#04c3fc] font-medium">
                            Saving agent configuration to your account...
                          </p>
                        </div>
                      </div>
                    )}

                    {!isLoading && !error && safeAddress && (
                      <div className="mb-4 p-3 bg-[#04c3fc]/10 border border-[#04c3fc]/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#04c3fc]" />
                          <p className="text-xs text-[#04c3fc] font-medium">
                            Agent configuration saved successfully!
                          </p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-400" />
                          <p className="text-xs text-red-400 font-medium">
                            Configuration Error: {error}
                          </p>
                        </div>
                      </div>
                    )}

                    {!isLoading && (
                      <>
                        <p className="text-[#8ba1bc] text-sm mb-6 text-center">
                          To start trading, you need to deposit funds into your Safe wallet. Click the button below to open the Safe app and add funds.
                        </p>

                        <div className="space-y-3">
                          <button
                            onClick={redirectToSafeApp}
                            disabled={!safeAddress}
                            className="w-full px-6 py-3 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] text-[#0D1321] rounded-lg hover:from-[#9AC0F9] hover:to-[#D1DAF8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#AAC9FA]/30 font-medium"
                          >
                            Open Safe App to Add Funds
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {!error && safeAddress && (
                            <button
                              onClick={() => setCurrentStep('confirmation')}
                              className="w-full px-6 py-3 bg-gradient-to-r from-[#04c3fc] to-[#73C7E1] text-white rounded-lg hover:from-[#03b3eb] hover:to-[#6bb8d6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#04c3fc]/30 font-medium"
                            >
                              Continue to Confirmation
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    <div className="mt-4 p-3 bg-[#AAC9FA]/10 border border-[#AAC9FA]/50 rounded-lg">
                      <p className="text-xs text-[#AAC9FA] text-center">
                        💡 After adding funds, your {selectedType} agent will be ready to start trading.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#04c3fc] to-[#73C7E1] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#04c3fc]/30">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Deployment Complete!</h3>
                  <p className="text-[#8ba1bc] text-sm max-w-2xl mx-auto">
                    Your {selectedType} agent has been successfully configured and is ready for trading.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-[#0D1321] rounded-xl p-6 border border-[#312e37]">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#04c3fc] to-[#73C7E1] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1">Agent Successfully Deployed</h4>
                      <p className="text-[#8ba1bc] text-sm">
                        @{agentUsername} is now configured for {selectedType} trading
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[#111528] rounded-lg p-4 border border-[#312e37]">
                        <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-lg flex items-center justify-center">
                            <Shield className="w-3 h-3 text-[#0D1321]" />
                          </div>
                          Safe Wallet Details
                        </h5>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-[#8ba1bc] mb-1">Safe Address</p>
                            <p className="text-xs text-white font-mono bg-[#0D1321] p-2 rounded break-all">
                              {safeAddress || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#8ba1bc] mb-1">Trading Type</p>
                            <p className="text-xs text-white capitalize">
                              {selectedType === 'perpetuals' ? 'GMX Perpetuals' : 'Spot Trading'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#AAC9FA]/10 border border-[#AAC9FA]/50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-[#AAC9FA] mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] rounded-lg flex items-center justify-center">
                            <Wallet className="w-3 h-3 text-[#0D1321]" />
                          </div>
                          Next Steps
                        </h5>
                        <ul className="space-y-1 text-[#8ba1bc] text-xs">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#AAC9FA] rounded-full"></div>
                            Add funds to your Safe wallet to start trading
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#AAC9FA] rounded-full"></div>
                            Monitor your agent's performance in the dashboard
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#AAC9FA] rounded-full"></div>
                            Adjust settings as needed for optimal performance
                          </li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={redirectToSafeApp}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] text-[#0D1321] rounded-lg hover:from-[#9AC0F9] hover:to-[#D1DAF8] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#AAC9FA]/30 font-medium text-sm"
                        >
                          Open Safe App
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCompleteDeployment}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#04c3fc] to-[#73C7E1] text-white rounded-lg hover:from-[#03b3eb] hover:to-[#6bb8d6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#04c3fc]/30 font-medium text-sm"
                        >
                          Back to Marketplace
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>


        {/* </div> */}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-[#312e37] bg-[#141d31]">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-[#8ba1bc] hover:text-white transition-all duration-300 hover:-translate-x-1 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="text-xs text-[#8ba1bc]">
            Step {currentStep === 'type-selection' ? 1 : currentStep === 'safe-creation' ? 2 : currentStep === 'funding' ? 3 : 4} of 4
          </div>
        </div>
      </div>
    </div>
  );
};