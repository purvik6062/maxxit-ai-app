"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Shield, TrendingUp, Coins, Wallet, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useWallet } from "@/components/enzyme/WalletConnector";
import { useSafeWallet } from "@/components/Safe/hooks/useSafeWallet";
import { SafeDeploymentForm } from "@/components/Safe/components/SafeDeploymentForm";
import { ExistingSafeDisplay } from "@/components/Safe/components/ExistingSafeDisplay";
import { LoadingState } from "@/components/Safe/components/LoadingState";
import { ErrorState } from "@/components/Safe/components/ErrorState";

interface Token {
  id: string;
  name: string;
  symbol: string;
  // category: 'major' | 'memecoin' | 'bluechip';
  // icon?: string;
}

const TOKENS: Token[] = [
  { id: 'major', name: 'Major Tokens', symbol: 'Major Tokens' },
  { id: 'memecoin', name: 'Memecoins', symbol: 'Memecoins' },
  { id: 'bluechip', name: 'Bluechips', symbol: 'Bluechips' },
];

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
  const [tradingType, setTradingType] = useState<'perpetuals' | 'spot' | null>(null);
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
  const isStep2Complete = Boolean(tradingType);
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

  // Persist preferences on explicit Save
  const savePreferences = async () => {
    if (!account || !createdSafeAddress || !tradingType || selectedTokens.length === 0) return;
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
          tradingType,
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
            if (prefs.tradingType) setTradingType(prefs.tradingType);
            if (Array.isArray(prefs.selectedTokens)) setSelectedTokens(prefs.selectedTokens);
            setHasExistingSetup(true);
            setSaveSuccess(true);
          } else {
            setHasExistingSetup(false);
          }
        }
      } catch (_) {
        // Ignore prefill errors
      } finally {
        setIsLoadingPrefs(false);
      }
    };
    fetchPrefs();
  }, [account]);

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep > index + 1
              ? 'bg-green-500 border-green-500 text-white'
              : currentStep === index + 1
                ? 'bg-gradient-to-r from-indigo-400 to-purple-600 border-transparent text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
              {currentStep > index + 1 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-600'
                }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => {
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

        {/* <SafeDeploymentForm
          isDeploying={isDeploying}
          deploymentStatus={deploymentStatus}
          deploymentResult={deploymentResult}
          canDeploy={canDeploy}
          onDeploy={handleDeploySafe}
        /> */}

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
        {/* {!isCheckingSafe && !safeCheckError && ( */}
        {/* Safe Display or Deployment Section */}
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
        {/* )} */}
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 2: Choose Trading Type
        </h2>
        <p className="text-gray-300 text-lg">
          Select your preferred trading strategy
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${tradingType === 'perpetuals'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          onClick={() => setTradingType('perpetuals')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Perpetuals</h3>
            <p className="text-gray-300 text-sm">
              Trade with leverage on futures contracts. Higher risk, higher potential returns.
            </p>
            <ul className="text-gray-400 text-xs mt-3 space-y-1">
              <li>• Up to 100x leverage</li>
              <li>• 24/7 trading</li>
              <li>• Advanced order types</li>
            </ul>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${tradingType === 'spot'
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          onClick={() => setTradingType('spot')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spot Trading</h3>
            <p className="text-gray-300 text-sm">
              Buy and sell actual cryptocurrencies. Lower risk, stable returns.
            </p>
            <ul className="text-gray-400 text-xs mt-3 space-y-1">
              <li>• No leverage</li>
              <li>• Own the actual assets</li>
              <li>• Staking opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <Coins className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 3: Select Tokens
        </h2>
        <p className="text-gray-300 text-lg">
          Choose the tokens you want to trade with
        </p>
      </div>

      <div className="space-y-6">
        {/* Major Tokens */}
        <div>
          {/* <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            Major Tokens
          </h3> */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOKENS.map((token) => (
              <div
                key={token.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${selectedTokens.includes(token.id)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                onClick={() => handleTokenToggle(token.id)}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memecoins */}
        {/* <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-pink-500 rounded-full mr-3"></span>
            Memecoins
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MEMECOINS.map((token) => (
              <div
                key={token.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${selectedTokens.includes(token.id)
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                onClick={() => handleTokenToggle(token.id)}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Bluechips */}
        {/* <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            Bluechips
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {BLUECHIPS.map((token) => (
              <div
                key={token.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${selectedTokens.includes(token.id)
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                onClick={() => handleTokenToggle(token.id)}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {selectedTokens.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Selected Tokens ({selectedTokens.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTokens.map((tokenId) => {
              const token = [...TOKENS].find(t => t.id === tokenId);
              return (
                <span key={tokenId} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {token?.symbol}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 4: Summary
        </h2>
        <p className="text-gray-300 text-lg">
          Review your selections and deployment details
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Configuration Summary</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Safe Address:</span>
              <span className="text-white font-semibold truncate">{createdSafeAddress || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Trading Type:</span>
              <span className="text-white font-semibold capitalize">{tradingType}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Tokens:</span>
              <span className="text-white font-semibold capitalize">{selectedTokens.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          {isLoadingPrefs && (
            <div className="inline-flex items-center text-gray-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Loading saved setup...
            </div>
          )}
          {!isLoadingPrefs && hasExistingSetup && !isSavingPreferences && (
            <div className="text-green-400 font-semibold">Setup already saved.</div>
          )}
          {!isSavingPreferences && saveError && (
            <div className="text-red-400 font-semibold">{saveError}</div>
          )}
          <button
            onClick={savePreferences}
            disabled={
              isSavingPreferences ||
              !createdSafeAddress ||
              !tradingType ||
              selectedTokens.length === 0
            }
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${isSavingPreferences || !createdSafeAddress || !tradingType || selectedTokens.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow'
              }`}
          >
            {isSavingPreferences ? 'Saving...' : (hasExistingSetup ? 'Update' : 'Save')}
          </button>
          {/* {!isSavingPreferences && saveSuccess && (
            <div className="text-green-400">Preferences saved successfully.</div>
          )} */}
        </div>
      </div>
    </div>
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