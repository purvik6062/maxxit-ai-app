"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useWallet } from "@/components/enzyme/WalletConnector";
import { useSafeWallet } from "@/components/Safe/hooks/useSafeWallet";
import { StepIndicator } from "@/components/Agentic/StepIndicator";
import { Step1SafeSetup } from "@/components/Agentic/steps/Step1SafeSetup";
import { Step2TradingType } from "@/components/Agentic/steps/Step2TradingType";
import { Step3TokenSelection } from "@/components/Agentic/steps/Step3TokenSelection";
import { Step4Summary } from "@/components/Agentic/steps/Step4Summary";

// const MEMECOINS: Token[] = [
//   { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', category: 'memecoin' },
//   { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', category: 'memecoin' },
//   { id: 'pepe', name: 'Pepe', symbol: 'PEPE', category: 'memecoin' },
//   { id: 'floki', name: 'Floki', symbol: 'FLOKI', category: 'memecoin' },
//   { id: 'bonk', name: 'Bonk', symbol: 'BONK', category: 'memecoin' },
// ];

// const BLUECHIPS: Token[] = [
//   { id: 'sol', name: 'Solana', symbol: 'SOL', category: 'bluechip' },
//   { id: 'ada', name: 'Cardano', symbol: 'ADA', category: 'bluechip' },
//   { id: 'dot', name: 'Polkadot', symbol: 'DOT', category: 'bluechip' },
//   { id: 'link', name: 'Chainlink', symbol: 'LINK', category: 'bluechip' },
//   { id: 'uni', name: 'Uniswap', symbol: 'UNI', category: 'bluechip' },
// ];

const AgenticMain = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tradingTypes, setTradingTypes] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  // Flow state
  const [isCreatingMaxxoWallet, setIsCreatingMaxxoWallet] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [hasExistingSetup, setHasExistingSetup] = useState<boolean>(false);

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

  const totalSteps = 4;

  // Derive created Safe address (prefer current network; fallback to first available)
  const createdSafeAddress: string | null = useMemo(() => {
    if (!existingSafe) return null;
    const byCurrent = currentNetworkKey
      ? existingSafe.deployments?.[currentNetworkKey]?.address
      : undefined;
    if (byCurrent) return byCurrent;
    const firstDeployment = existingSafe.deployments
      ? Object.values(existingSafe.deployments)[0]
      : undefined;
    return firstDeployment?.address || null;
  }, [existingSafe, currentNetworkKey]);

  // Step completion gates
  const isStep1Complete = Boolean(existingSafe && createdSafeAddress);
  const isStep2Complete = tradingTypes.length > 0;
  const isStep3Complete = selectedTokens.length > 0;

  const handleNext = async () => {
    // Enforce completion before proceeding
    if (currentStep === 1 && !isStep1Complete) return;
    if (currentStep === 2 && !isStep2Complete) return;
    if (currentStep === 3 && !isStep3Complete) return;

    // Move to next step
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTokenToggle = (tokenId: string) => {
    setSelectedTokens(prev =>
      prev.includes(tokenId)
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleTradingTypeToggle = (type: string) => {
    setTradingTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Persist preferences on explicit Save
  const savePreferences = async () => {
    if (!account || !createdSafeAddress || tradingTypes.length === 0 || selectedTokens.length === 0) return;
    try {
      setIsSavingPreferences(true);
      setSaveError(null);
      setSaveSuccess(false);
      const res = await fetch('/api/agentic-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account,
          networkKey: currentNetworkKey,
          safeAddress: createdSafeAddress,
          tradingTypes,
          selectedTokens,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to save preferences');
      }
      setSaveSuccess(true);
      setHasExistingSetup(true);
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Prefill using GET API if preferences exist
  useEffect(() => {
    const fetchPrefs = async () => {
      if (!account) return;
      try {
        setIsLoadingPrefs(true);
        setSaveError(null);
        const res = await fetch(`/api/agentic-setup?walletAddress=${account}`);
        if (res.status === 404) {
          setHasExistingSetup(false);
          return;
        }
        const data = await res.json();
        if (res.ok && data?.success) {
          const prefs = data.data?.preferences;
          if (prefs) {
            if (Array.isArray(prefs.tradingTypes)) setTradingTypes(prefs.tradingTypes);
            if (Array.isArray(prefs.selectedTokens)) setSelectedTokens(prefs.selectedTokens);
            setHasExistingSetup(true);
            // setSaveSuccess(true);
          } else {
            setHasExistingSetup(false);
          }
        }
      } catch (e) {
        console.error(e);
        // Ignore prefill errors
      } finally {
        setIsLoadingPrefs(false);
      }
    };
    fetchPrefs();
  }, [account]);

  const renderStepIndicator = () => (
    <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
  );

  const renderStep1 = () => (
    <Step1SafeSetup
      account={account}
      isCorrectNetwork={isCorrectNetwork}
      isCheckingSafe={isCheckingSafe}
      safeCheckError={safeCheckError}
      existingSafe={existingSafe}
      currentNetworkKey={currentNetworkKey}
      canExpandNetwork={canExpandNetwork}
      isDeploying={isDeploying}
      deploymentStatus={deploymentStatus}
      deploymentResult={deploymentResult}
      canDeploy={canDeploy}
      handleDeploySafe={handleDeploySafe}
      handleRefresh={handleRefresh}
      checkExistingSafe={checkExistingSafe}
    />
  );

  const renderStep2 = () => (
    <Step2TradingType tradingTypes={tradingTypes} onToggle={handleTradingTypeToggle} />
  );

  const renderStep3 = () => (
    <Step3TokenSelection selectedTokens={selectedTokens} onToggleToken={handleTokenToggle} />
  );

  const renderStep4 = () => (
    <Step4Summary
      createdSafeAddress={createdSafeAddress}
      tradingTypes={tradingTypes}
      selectedTokens={selectedTokens}
      isLoadingPrefs={isLoadingPrefs}
      isSavingPreferences={isSavingPreferences}
      hasExistingSetup={hasExistingSetup}
      saveError={saveError}
      saveSuccess={saveSuccess}
      onSave={savePreferences}
    />
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 font-leagueSpartan">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-napzerRounded mb-4">
            AI Agentic Trading Setup
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Set up your AI-powered trading system with secure wallets and intelligent token selection
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentStep === 1
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>

          <button
            onClick={handleNext}
            disabled={
              currentStep === totalSteps ||
              (currentStep === 1 && !isStep1Complete) ||
              (currentStep === 2 && !isStep2Complete) ||
              (currentStep === 3 && !isStep3Complete)
            }
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentStep === totalSteps
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
              }`}
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgenticMain;