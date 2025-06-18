import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletConnector";
import {
  VaultCreationState,
  VaultCreationStep,
  AIAgent,
  VaultConfig,
} from "./types";
import VaultCreationStepper from "./VaultCreationStepper";
import AIAgentSelection from "./AIAgentSelection";
import ExistingVaultView from "./ExistingVaultView";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  getNetworkConfig,
  isNetworkSupported,
  FUND_DEPLOYER_ABI,
} from "@/lib/enzyme-contracts";
import { useSession } from "next-auth/react";
import { useUserVault } from "@/hooks/useUserVault";
import { useBackendVaultCreation } from "@/hooks/useBackendVaultCreation";

const MultiStepVaultCreation: React.FC = () => {
  const { account, isCorrectNetwork, chainId } = useWallet();
  const {
    userVaults,
    isLoading: isLoadingVaults,
    hasVaults,
    latestVault,
  } = useUserVault();
  const {
    createVault: createVaultWithBackend,
    isCreating: isCreatingWithBackend,
    isAvailable: isBackendAvailable,
    vaultAgentAddress,
    checkAvailability,
  } = useBackendVaultCreation();

  // State to manage vault view - whether to show existing vault or create new one
  const [showExistingVault, setShowExistingVault] = useState(false);

  const [state, setState] = useState<VaultCreationState>({
    currentStep: 1,
    selectedAgent: null,
    vaultConfig: {
      name: "",
      symbol: "",
      denominationAsset: "",
      sharesActionTimelock: "24",
      managementFeeRate: "1",
      performanceFeeRate: "10",
      includeFees: false,
      includePolicies: true, // Enable policies by default for AI agent integration
      allowedDepositorsOnly: true, // Enable restricted deposits for AI agent
      allowedDepositors: "",
    },
    createdVault: null,
    isProcessing: false,
  });

  // Auto-show existing vault if user has vaults and is not in the middle of creating a new one
  useEffect(() => {
    if (
      hasVaults &&
      !isLoadingVaults &&
      state.currentStep === 1 &&
      !state.selectedAgent
    ) {
      setShowExistingVault(true);
    }
  }, [hasVaults, isLoadingVaults, state.currentStep, state.selectedAgent]);

  // Check backend vault creation availability on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const steps: VaultCreationStep[] = [
    {
      step: 1,
      title: "Select AI Agent",
      description: "Choose your trading strategy",
      completed: state.currentStep > 1,
      current: state.currentStep === 1,
    },
    {
      step: 2,
      title: "Configure Vault",
      description: "Set up vault parameters",
      completed: state.currentStep > 2,
      current: state.currentStep === 2,
    },
    {
      step: 3,
      title: "Deploy Vault",
      description: "Launch your vault",
      completed: state.currentStep > 3,
      current: state.currentStep === 3,
    },
  ];

  // Update vault config with AI agent address when agent is selected
  useEffect(() => {
    if (state.selectedAgent) {
      setState((prev) => ({
        ...prev,
        vaultConfig: {
          ...prev.vaultConfig,
          allowedDepositors: state.selectedAgent!.walletAddress,
        },
      }));
    }
  }, [state.selectedAgent]);

  console.log(state.selectedAgent);

  const handleAgentSelected = (agent: AIAgent) => {
    setState((prev) => ({
      ...prev,
      selectedAgent: agent,
      currentStep: 2,
    }));
  };

  const handleNextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const handlePrevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  };

  const handleVaultCreated = (createdVault: any) => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
      createdVault,
    }));
  };

  const handleStartOver = () => {
    setState({
      currentStep: 1,
      selectedAgent: null,
      vaultConfig: {
        name: "",
        symbol: "",
        denominationAsset: "",
        sharesActionTimelock: "24",
        managementFeeRate: "1",
        performanceFeeRate: "10",
        includeFees: false,
        includePolicies: true,
        allowedDepositorsOnly: true,
        allowedDepositors: "",
      },
      createdVault: null,
      isProcessing: false,
    });
    setShowExistingVault(false);
  };

  const handleCreateNewVault = () => {
    setShowExistingVault(false);
    handleStartOver();
  };

  const handleManageExistingVault = () => {
    setShowExistingVault(true);
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <AIAgentSelection
            onAgentSelected={handleAgentSelected}
            selectedAgent={state.selectedAgent}
          />
        );

      case 2:
        return (
          <div>
            {/* Agent Summary */}
            {state.selectedAgent && (
              <div className="max-w-4xl mx-auto px-4 mb-8">
                <div className="bg-[#0D1321] border border-[#253040] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{state.selectedAgent.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#E4EFFF]">
                          {state.selectedAgent.name}
                        </h3>
                        <p className="text-[#8ba1bc]">
                          Selected AI Trading Agent
                        </p>
                        <p className="text-xs text-[#6b7280] font-mono mt-1">
                          Agent Address:{" "}
                          {state.selectedAgent.walletAddress.slice(0, 10)}...
                          {state.selectedAgent.walletAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePrevStep}
                      className="text-[#8ba1bc] hover:text-[#E4EFFF] transition-colors text-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 17l-5-5m0 0l5-5m-5 5h12"
                        />
                      </svg>
                      Change Agent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modified CreateVault that accepts pre-filled config */}
            <ModifiedCreateVault
              initialConfig={state.vaultConfig}
              selectedAgent={state.selectedAgent}
              onVaultCreated={handleVaultCreated}
              onBack={handlePrevStep}
              onConfigChange={(field, value) => {
                setState((prev) => ({
                  ...prev,
                  vaultConfig: {
                    ...prev.vaultConfig,
                    [field]: value,
                  },
                }));
              }}
            />
          </div>
        );

      case 3:
        return (
          <VaultSuccessView
            createdVault={state.createdVault}
            selectedAgent={state.selectedAgent}
            vaultConfig={state.vaultConfig}
            onStartOver={handleStartOver}
          />
        );

      default:
        return <div>Step not implemented</div>;
    }
  };

  // Loading state while fetching user vaults
  if (isLoadingVaults) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8ba1bc]">Checking your existing vaults...</p>
        </div>
      </div>
    );
  }

  // Show existing vault management if user has vaults and chose to manage them
  if (showExistingVault && hasVaults && latestVault) {
    return (
      <div>
        {/* Header with options */}
        {/* <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#E4EFFF]">Vault Management</h2>
              <p className="text-[#8ba1bc] mt-1">Manage your existing AI-powered vault</p>
            </div>
            <button
              onClick={handleCreateNewVault}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                       text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 
                       flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Vault
            </button>
          </div>
        </div> */}

        {/* Network Warning Banner */}
        {account && !isCorrectNetwork && (
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-red-400 font-medium">
                    Unsupported Network
                  </h3>
                  <p className="text-red-300 text-sm">
                    Please switch to Arbitrum One network to manage your vaults.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Vault View */}
        <div className="py-8">
          <ExistingVaultView
            vaultAddress={latestVault.vaultAddress}
            onCreateNewVault={handleCreateNewVault}
          />
        </div>
      </div>
    );
  }

  // Show vault creation flow (existing or first time users)
  return (
    <div>
      {/* Vault Choice Banner for users with existing vaults */}
      {hasVaults && !showExistingVault && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-blue-400 font-medium">
                    Existing Vault Found
                  </h3>
                  <p className="text-blue-300 text-sm">
                    You have {userVaults.length} existing vault
                    {userVaults.length > 1 ? "s" : ""}. You can manage your
                    existing vault or create a new one.
                  </p>
                </div>
              </div>
              <button
                onClick={handleManageExistingVault}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Manage Existing Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <VaultCreationStepper steps={steps} />

      {/* Network Warning Banner */}
      {account && !isCorrectNetwork && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-red-400 font-medium">
                  Unsupported Network
                </h3>
                <p className="text-red-300 text-sm">
                  Please switch to Arbitrum One network to create vaults and
                  purchase AI agents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Step Content */}
      <div className="py-8">{renderCurrentStep()}</div>
    </div>
  );
};

// Enhanced ModifiedCreateVault component with full functionality
// Helper function for user registration
const registerUserForAutomatedTrading = async ({
  vaultProxy,
  selectedAgent,
  vaultConfig,
  session,
  account,
}: {
  vaultProxy: string;
  selectedAgent: AIAgent | null;
  vaultConfig: VaultConfig;
  session: any;
  account: string | undefined;
}) => {
  try {
    // Validate required data
    if (!vaultProxy || !selectedAgent || !account) {
      console.warn("Missing required data for registration");
      toast(
        "Vault created successfully! Note: Missing data for automated trading registration.",
        {
          id: "creating-vault",
          icon: "⚠️",
        }
      );
      return;
    }

    const registrationData = {
      username: session?.user?.username || account || "",
      vaultAddress: vaultProxy,
      tradingSettings: {
        agentAddress: selectedAgent.walletAddress,
        agentName: selectedAgent.name,
        riskLevel: selectedAgent.riskLevel,
        vaultName: vaultConfig.name,
        vaultSymbol: vaultConfig.symbol,
        denominationAsset: vaultConfig.denominationAsset,
      },
    };

    console.log("Registering user for automated trading:", registrationData);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const registrationResponse = await fetch(`/api/user-vault-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!registrationResponse.ok) {
        const errorData = await registrationResponse.json().catch(() => null);
        const errorMessage = errorData?.details || "Registration service error";

        console.warn("Registration failed:", errorMessage);
        toast(`Vault created successfully! Note: ${errorMessage}`, {
          id: "creating-vault",
          icon: "⚠️",
        });
        return;
      }

      const registrationResult = await registrationResponse.json();
      console.log(
        "User successfully registered for automated trading:",
        registrationResult
      );

      toast.success("Vault created and registered for automated trading!", {
        id: "creating-vault",
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (
        fetchError instanceof DOMException &&
        fetchError.name === "AbortError"
      ) {
        console.warn("Registration request timed out");
        toast(
          "Vault created successfully! Note: Registration request timed out.",
          {
            id: "creating-vault",
            icon: "⚠️",
          }
        );
      } else {
        throw fetchError; // Re-throw to be caught by outer try-catch
      }
    }
  } catch (registrationError) {
    console.warn(
      "Error registering user for automated trading:",
      registrationError
    );
    toast.success(
      "Vault created successfully! (Automated trading registration failed)",
      {
        id: "creating-vault",
      }
    );
  }
};

const ModifiedCreateVault: React.FC<{
  initialConfig: VaultConfig;
  selectedAgent: AIAgent | null;
  onVaultCreated: (vault: any) => void;
  onBack: () => void;
  onConfigChange: (field: keyof VaultConfig, value: string) => void;
}> = ({
  initialConfig,
  selectedAgent,
  onVaultCreated,
  onBack,
  onConfigChange,
}) => {
  const { account, chainId } = useWallet();
  const { data: session } = useSession();
  const [vaultConfig, setVaultConfig] = useState<VaultConfig>(initialConfig);
  const {
    createVault: createVaultWithBackend,
    isCreating,
    isAvailable: isBackendAvailable,
    vaultAgentAddress,
  } = useBackendVaultCreation();

  // Get current network configuration
  const networkConfig = chainId ? getNetworkConfig(chainId) : null;

  // Set default denomination asset when network changes
  useEffect(() => {
    if (networkConfig && !vaultConfig.denominationAsset) {
      const newConfig = {
        ...vaultConfig,
        denominationAsset: networkConfig.assets.WETH,
      };
      setVaultConfig(newConfig);
      onConfigChange("denominationAsset", networkConfig.assets.WETH);
    }
  }, [networkConfig]);

  const handleConfigChange = (field: keyof VaultConfig, value: string) => {
    setVaultConfig((prev) => ({ ...prev, [field]: value }));
    onConfigChange(field, value);
  };

  const validateForm = (): string | null => {
    if (!vaultConfig.name.trim()) return "Vault name is required";
    if (!vaultConfig.symbol.trim()) return "Vault symbol is required";
    if (vaultConfig.symbol.length > 10)
      return "Symbol should be 10 characters or less";
    if (!account) return "Please connect your wallet";
    if (!chainId || !isNetworkSupported(chainId))
      return "Please switch to a supported network";
    // if (!isBackendAvailable)
    //   return "Backend vault creation service is not available";
    return null;
  };

  const createVault = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!account || !chainId) {
      toast.error("Wallet not properly connected");
      return;
    }

    try {
      // Use backend vault creation service instead of user's wallet
      const result = await createVaultWithBackend({
        vaultConfig,
        selectedAgent,
        chainId,
        userAccount: account,
      });

      if (result) {
        // Register user for automated trading
        await registerUserForAutomatedTrading({
          vaultProxy: result.vaultProxy,
          selectedAgent,
          vaultConfig,
          session,
          account: account || "",
        });

        onVaultCreated({
          comptrollerProxy: result.comptrollerProxy,
          vaultProxy: result.vaultProxy,
          txHash: result.transactionHash,
        });
      }
    } catch (error: any) {
      console.error("Error creating vault:", error);
      // Error handling is done in the useBackendVaultCreation hook
    }
  };

  const createPolicyManagerConfigData = (): string => {
    if (!networkConfig || !account || !selectedAgent) {
      return "0x";
    }

    const allowedDepositorsPolicy =
      networkConfig.contracts.ALLOWED_DEPOSITORS_POLICY;
    if (
      allowedDepositorsPolicy === "0x0000000000000000000000000000000000000000"
    ) {
      console.warn("Policy contract addresses not configured for this network");
      return "0x";
    }

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const allowedAddresses = [account, selectedAgent.walletAddress];

    const newListsArgs = abiCoder.encode(
      ["uint8", "address[]"],
      [3, allowedAddresses]
    );
    const policySettingsData = abiCoder.encode(
      ["uint256[]", "bytes[]"],
      [[], [newListsArgs]]
    );
    const policyManagerConfigData = abiCoder.encode(
      ["address[]", "bytes[]"],
      [[allowedDepositorsPolicy], [policySettingsData]]
    );

    return policyManagerConfigData;
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-[#0D1321] border border-[#253040] rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#E4EFFF] mb-4">
            Configure Your Vault
          </h2>
          <p className="text-[#8ba1bc]">
            Set up your vault parameters. The AI agent will be automatically
            configured as the depositor.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
              Vault Name *
            </label>
            <input
              type="text"
              value={vaultConfig.name}
              onChange={(e) => handleConfigChange("name", e.target.value)}
              placeholder="Enter vault name"
              className="w-full bg-[#0A0F1A] border border-[#253040] rounded-lg px-4 py-3 text-[#E4EFFF] placeholder-[#6b7280] focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
              Vault Symbol *
            </label>
            <input
              type="text"
              value={vaultConfig.symbol}
              onChange={(e) =>
                handleConfigChange("symbol", e.target.value.toUpperCase())
              }
              placeholder="Enter vault symbol (e.g., MYVAULT)"
              className="w-full bg-[#0A0F1A] border border-[#253040] rounded-lg px-4 py-3 text-[#E4EFFF] placeholder-[#6b7280] focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
              Denomination Asset
            </label>
            <select
              value={vaultConfig.denominationAsset}
              onChange={(e) =>
                handleConfigChange("denominationAsset", e.target.value)
              }
              className="w-full bg-[#0A0F1A] border border-[#253040] rounded-lg px-4 py-3 text-[#E4EFFF] focus:border-blue-500 focus:outline-none transition-colors"
            >
              {networkConfig &&
                Object.entries(networkConfig.assets).map(
                  ([symbol, address]) => (
                    <option key={symbol} value={address}>
                      {symbol}
                    </option>
                  )
                )}
            </select>
          </div>

          {/* AI Agent Integration Info */}
          {selectedAgent && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">
                AI Agent Integration
              </h4>
              <div className="space-y-2 text-sm text-[#8ba1bc]">
                <div className="flex justify-between">
                  <span>Trading Strategy:</span>
                  <span className="text-blue-400">{selectedAgent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Address:</span>
                  <span className="text-cyan-400 font-mono">
                    {selectedAgent.walletAddress.slice(0, 6)}...
                    {selectedAgent.walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <span
                    className={`${
                      selectedAgent.riskLevel === "Low"
                        ? "text-green-400"
                        : selectedAgent.riskLevel === "Medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedAgent.riskLevel}
                  </span>
                </div>
                <div className="text-xs text-[#6b7280] mt-2">
                  The AI agent will be automatically added as an allowed
                  depositor along with your wallet address.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={onBack}
              disabled={isCreating}
              className="flex-1 bg-[#253040] hover:bg-[#353940] disabled:opacity-50 text-[#E4EFFF] font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Agent Selection
            </button>

            <button
              onClick={createVault}
              disabled={
                isCreating ||
                !account ||
                !vaultConfig.name ||
                !vaultConfig.symbol
              }
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                  Creating Vault...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Vault with AI Agent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success view component
const VaultSuccessView: React.FC<{
  createdVault: any;
  selectedAgent: AIAgent | null;
  vaultConfig: VaultConfig;
  onStartOver: () => void;
}> = ({ createdVault, selectedAgent, vaultConfig, onStartOver }) => {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-[#0D1321] border border-[#253040] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-[#E4EFFF] mb-4">
          Vault Created Successfully!
        </h2>

        <p className="text-[#8ba1bc] mb-8">
          Your AI-powered investment vault has been deployed and is ready to
          start trading.
        </p>

        {selectedAgent && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-2xl">{selectedAgent.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-[#E4EFFF]">
                  {selectedAgent.name} Active
                </h3>
                <p className="text-[#8ba1bc] text-sm">
                  AI Trading Agent Deployed
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
            <div className="text-sm text-[#8ba1bc] mb-1">Vault Name</div>
            <div className="text-[#E4EFFF] font-medium">{vaultConfig.name}</div>
          </div>

          <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
            <div className="text-sm text-[#8ba1bc] mb-1">Transaction Hash</div>
            <div className="text-cyan-400 font-mono text-sm">
              {createdVault?.txHash}
            </div>
          </div>
        </div>

        <button
          onClick={onStartOver}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
        >
          Create Another Vault
        </button>
      </div>
    </div>
  );
};

export default MultiStepVaultCreation;
