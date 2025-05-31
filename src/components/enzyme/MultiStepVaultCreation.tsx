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
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  getNetworkConfig,
  isNetworkSupported,
  FUND_DEPLOYER_ABI,
} from "@/lib/enzyme-contracts";

const MultiStepVaultCreation: React.FC = () => {
  const { account } = useWallet();

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

  return (
    <div>
      {/* Stepper */}
      <VaultCreationStepper steps={steps} />

      {/* Current Step Content */}
      <div className="py-8">{renderCurrentStep()}</div>
    </div>
  );
};

// Enhanced ModifiedCreateVault component with full functionality
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
  const { account, signer, chainId } = useWallet();
  const [vaultConfig, setVaultConfig] = useState<VaultConfig>(initialConfig);
  const [isCreating, setIsCreating] = useState(false);

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
    return null;
  };

  const createVault = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!signer || !networkConfig) {
      toast.error("Wallet not properly connected");
      return;
    }

    try {
      setIsCreating(true);

      const fundDeployer = new ethers.Contract(
        networkConfig.contracts.FUND_DEPLOYER,
        FUND_DEPLOYER_ABI,
        signer
      );

      const feeManagerConfigData = "0x";
      const policyManagerConfigData = createPolicyManagerConfigData();
      const sharesActionTimelock =
        parseInt(vaultConfig.sharesActionTimelock) * 3600;

      toast.loading(
        "Creating vault... Please confirm the transaction in your wallet.",
        {
          id: "creating-vault",
        }
      );

      const tx = await fundDeployer.createNewFund(
        account,
        vaultConfig.name,
        vaultConfig.symbol,
        vaultConfig.denominationAsset,
        sharesActionTimelock,
        feeManagerConfigData,
        policyManagerConfigData,
        { gasLimit: 5000000 }
      );

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: "creating-vault",
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        let comptrollerProxy = "";
        let vaultProxy = "";

        for (const log of receipt.logs) {
          try {
            const parsedLog = fundDeployer.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "NewFundCreated") {
              comptrollerProxy = parsedLog.args.comptrollerProxy;
              vaultProxy = parsedLog.args.vaultProxy;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        toast.success("Vault created successfully!", { id: "creating-vault" });

        onVaultCreated({
          comptrollerProxy: comptrollerProxy || "0x...",
          vaultProxy: vaultProxy || "0x...",
          txHash: tx.hash,
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Error creating vault:", error);
      let errorMessage = "Failed to create vault";

      if (error.code === "CALL_EXCEPTION") {
        errorMessage =
          "Transaction reverted. Please check your configuration and try again.";
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "creating-vault" });
    } finally {
      setIsCreating(false);
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
