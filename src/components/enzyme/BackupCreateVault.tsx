"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletConnector";
import toast from "react-hot-toast";
import {
  getNetworkConfig,
  isNetworkSupported,
  FUND_DEPLOYER_ABI,
  type SupportedChainId,
} from "@/lib/enzyme-contracts";

// Import modular components
import VaultFormLayout from "./VaultForm/VaultFormLayout";
import VaultBasicInfo from "./VaultForm/VaultBasicInfo";
import VaultFeeSettings from "./VaultForm/VaultFeeSettings";
import VaultPolicySettings from "./VaultForm/VaultPolicySettings";
import VaultInfoPanel from "./VaultForm/VaultInfoPanel";
import VaultSuccessModal from "./VaultForm/VaultSuccessModal";
import UnsupportedNetworkModal from "./VaultForm/UnsupportedNetworkModal";

// Import types
import { VaultConfig, CreatedVault } from "./types";

const CreateVaultPage: React.FC = () => {
  const { account, signer, chainId } = useWallet();
  const [vaultConfig, setVaultConfig] = useState<VaultConfig>({
    name: "",
    symbol: "",
    denominationAsset: "",
    sharesActionTimelock: "24",
    managementFeeRate: "1",
    performanceFeeRate: "10",
    includeFees: false,
    includePolicies: false,
    allowedDepositorsOnly: false,
    allowedDepositors: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [createdVault, setCreatedVault] = useState<CreatedVault | null>(null);

  // Get current network configuration
  const networkConfig = chainId ? getNetworkConfig(chainId) : null;

  // Set default denomination asset when network changes
  useEffect(() => {
    if (networkConfig && !vaultConfig.denominationAsset) {
      setVaultConfig((prev) => ({
        ...prev,
        denominationAsset: networkConfig.assets.WETH,
      }));
    }
  }, [networkConfig, vaultConfig.denominationAsset]);

  const handleVaultConfigChange = (field: keyof VaultConfig, value: string) => {
    if (
      field === "includeFees" ||
      field === "includePolicies" ||
      field === "allowedDepositorsOnly"
    ) {
      setVaultConfig((prev) => ({ ...prev, [field]: value === "true" }));
    } else {
      setVaultConfig((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = (): string | null => {
    if (!vaultConfig.name.trim()) return "Vault name is required";
    if (!vaultConfig.symbol.trim()) return "Vault symbol is required";
    if (vaultConfig.symbol.length > 10)
      return "Symbol should be 10 characters or less";
    if (!account) return "Please connect your wallet";
    if (!chainId || !isNetworkSupported(chainId))
      return "Please switch to a supported network (Ethereum, Polygon, or Arbitrum)";

    if (
      vaultConfig.includePolicies &&
      vaultConfig.allowedDepositorsOnly &&
      vaultConfig.allowedDepositors.trim()
    ) {
      const addresses = vaultConfig.allowedDepositors
        .split(",")
        .map((addr) => addr.trim());
      const invalidAddresses = addresses.filter((addr) => {
        try {
          return !ethers.isAddress(addr);
        } catch {
          return true;
        }
      });

      if (invalidAddresses.length > 0) {
        return `Invalid Ethereum addresses: ${invalidAddresses.join(", ")}`;
      }
    }

    return null;
  };

  const createPolicyManagerConfigData = (): string => {
    if (!vaultConfig.includePolicies || !networkConfig || !account) {
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

    if (vaultConfig.allowedDepositorsOnly) {
      let allowedAddresses = [account];

      if (vaultConfig.allowedDepositors.trim()) {
        const externalAddresses = vaultConfig.allowedDepositors
          .split(",")
          .map((addr) => addr.trim())
          .filter((addr) => {
            try {
              return ethers.isAddress(addr);
            } catch {
              return false;
            }
          })
          .map((addr) => ethers.getAddress(addr));

        externalAddresses.forEach((addr) => {
          if (
            !allowedAddresses.some(
              (existing) => existing.toLowerCase() === addr.toLowerCase()
            )
          ) {
            allowedAddresses.push(addr);
          }
        });
      }

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
    }

    return "0x";
  };

  const calculateManagementFeeRate = (annualRatePercent: number): string => {
    const annualRate = annualRatePercent / 100;
    const secondsPerYear = 31536000;
    const scaledPerSecondRate = Math.pow(
      1 / (1 - annualRate),
      1 / secondsPerYear
    );
    const scaledRate = BigInt(Math.floor(scaledPerSecondRate * 1e27));
    return scaledRate.toString();
  };

  const createFeeManagerConfigData = (): string => {
    if (!vaultConfig.includeFees || !networkConfig) {
      return "0x";
    }

    const managementFeeAddress = networkConfig.contracts.MANAGEMENT_FEE;
    const performanceFeeAddress = networkConfig.contracts.PERFORMANCE_FEE;

    if (
      managementFeeAddress === "0x0000000000000000000000000000000000000000" ||
      performanceFeeAddress === "0x0000000000000000000000000000000000000000"
    ) {
      console.warn("Fee contract addresses not configured for this network");
      return "0x";
    }

    const managementFeeRate = parseFloat(vaultConfig.managementFeeRate) || 0;
    const performanceFeeRate = parseFloat(vaultConfig.performanceFeeRate) || 0;

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    const managementFeeSettings = abiCoder.encode(
      ["uint256", "address"],
      [
        calculateManagementFeeRate(managementFeeRate),
        "0x0000000000000000000000000000000000000000",
      ]
    );

    const performanceFeeSettings = abiCoder.encode(
      ["uint256", "address"],
      [
        Math.floor(performanceFeeRate * 100),
        "0x0000000000000000000000000000000000000000",
      ]
    );

    const feeManagerConfigData = abiCoder.encode(
      ["address[]", "bytes[]"],
      [
        [managementFeeAddress, performanceFeeAddress],
        [managementFeeSettings, performanceFeeSettings],
      ]
    );

    return feeManagerConfigData;
  };

  const createVault = async () => {
    const validation = validateForm();
    if (validation) {
      toast.error(validation);
      return;
    }

    if (!signer || !networkConfig) {
      toast.error("Wallet not connected or unsupported network");
      return;
    }

    setIsCreating(true);

    try {
      const fundDeployer = new ethers.Contract(
        networkConfig.contracts.FUND_DEPLOYER,
        FUND_DEPLOYER_ABI,
        signer
      );

      const policyManagerConfigData = createPolicyManagerConfigData();
      const feeManagerConfigData = createFeeManagerConfigData();
      const sharesActionTimelock =
        parseInt(vaultConfig.sharesActionTimelock) * 3600;

      toast.loading(
        "Creating vault... Please confirm the transaction in your wallet.",
        { id: "creating-vault" }
      );

      const tx = await fundDeployer.createNewFund(
        account,
        vaultConfig.name,
        vaultConfig.symbol,
        vaultConfig.denominationAsset,
        sharesActionTimelock,
        feeManagerConfigData,
        policyManagerConfigData,
        {
          gasLimit: 5000000,
        }
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

        toast.success("Vault created successfully!", {
          id: "creating-vault",
        });

        setCreatedVault({
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

  const getDenominationAssetName = (address: string): string => {
    if (!networkConfig) return "Unknown";

    const assets = networkConfig.assets;
    for (const [symbol, assetAddress] of Object.entries(assets)) {
      if (assetAddress.toLowerCase() === address.toLowerCase()) {
        return symbol;
      }
    }
    return "Custom Token";
  };

  const handleCreateAnother = () => {
    setCreatedVault(null);
    setVaultConfig({
      name: "",
      symbol: "",
      denominationAsset: networkConfig?.assets.WETH || "",
      sharesActionTimelock: "24",
      managementFeeRate: "1",
      performanceFeeRate: "10",
      includeFees: false,
      includePolicies: false,
      allowedDepositorsOnly: false,
      allowedDepositors: "",
    });
  };

  // Show unsupported network modal
  if (chainId && !isNetworkSupported(chainId)) {
    return <UnsupportedNetworkModal />;
  }

  // Show success modal
  if (createdVault) {
    return (
      <VaultSuccessModal
        createdVault={createdVault}
        vaultConfig={vaultConfig}
        networkConfig={networkConfig}
        onCreateAnother={handleCreateAnother}
        getDenominationAssetName={getDenominationAssetName}
      />
    );
  }

  // Main form
  return (
    <VaultFormLayout
      title="Create Your Enzyme Vault"
      subtitle="Launch a professional investment vault with customizable fees and policies"
    >
      <div className="space-y-8">
        {/* Basic Information */}
        <VaultBasicInfo
          vaultConfig={vaultConfig}
          networkConfig={networkConfig}
          onConfigChange={handleVaultConfigChange}
        />

        {/* Fee Settings */}
        <VaultFeeSettings
          vaultConfig={vaultConfig}
          onConfigChange={handleVaultConfigChange}
        />

        {/* Policy Settings */}
        <VaultPolicySettings
          vaultConfig={vaultConfig}
          account={account}
          onConfigChange={handleVaultConfigChange}
        />

        {/* Create Button */}
        <div className="pt-6 border-t border-[#253040]">
          <button
            onClick={createVault}
            disabled={isCreating || !account}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed 
                     text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 
                     transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none 
                     flex items-center justify-center gap-3 text-lg"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
                <span>Creating Vault...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
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
                <span>Create Vault</span>
              </>
            )}
          </button>

          {!account && (
            <p className="text-center text-[#8ba1bc] mt-4">
              Please connect your wallet to create a vault
            </p>
          )}
        </div>

        {/* Information Panel */}
        <VaultInfoPanel />
      </div>
    </VaultFormLayout>
  );
};

export default CreateVaultPage;
