import { ethers } from "ethers";
import toast from "react-hot-toast";
import { createVaultAgentSigner } from "@/lib/vault-signer";
import {
  getNetworkConfig,
  FUND_DEPLOYER_ABI,
  type VaultCreationResult,
} from "@/lib/enzyme-contracts";
import type { VaultConfig, AIAgent } from "@/components/enzyme/types";

export interface VaultCreationParams {
  vaultConfig: VaultConfig;
  selectedAgent: AIAgent | null;
  chainId: number;
  userAccount: string; // The user who will be the fund owner
}

export interface VaultCreationOptions {
  onProgress?: (message: string) => void;
  gasLimit?: number;
}

/**
 * Creates a vault using the backend signer instead of user's wallet
 * This allows vault creation without requiring user transaction signatures
 */
export async function createVaultWithBackendSigner(
  params: VaultCreationParams,
  options: VaultCreationOptions = {}
): Promise<VaultCreationResult> {
  const { vaultConfig, selectedAgent, chainId, userAccount } = params;
  const { onProgress, gasLimit = 5000000 } = options;

  try {
    // Validate inputs
    if (!vaultConfig.name.trim()) {
      throw new Error("Vault name is required");
    }
    if (!vaultConfig.symbol.trim()) {
      throw new Error("Vault symbol is required");
    }
    if (!userAccount) {
      throw new Error("User account is required");
    }

    onProgress?.("Initializing backend signer...");

    // Create backend signer
    const vaultSigner = createVaultAgentSigner(chainId);
    if (!vaultSigner) {
      throw new Error("Failed to create vault agent signer");
    }

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      throw new Error(`Network configuration not found for chain ${chainId}`);
    }

    onProgress?.("Preparing vault deployment...");

    // Create fund deployer contract instance with backend signer
    const fundDeployer = new ethers.Contract(
      networkConfig.contracts.FUND_DEPLOYER,
      FUND_DEPLOYER_ABI,
      vaultSigner.signer
    );

    // Prepare configuration data
    const feeManagerConfigData = createFeeManagerConfigData(
      vaultConfig,
      networkConfig
    );
    const policyManagerConfigData = createPolicyManagerConfigData(
      vaultConfig,
      selectedAgent,
      userAccount,
      networkConfig
    );

    const sharesActionTimelock =
      parseInt(vaultConfig.sharesActionTimelock) * 3600;

    onProgress?.("Deploying vault on blockchain...");

    // Create the vault using backend signer
    const tx = await fundDeployer.createNewFund(
      //   vaultSigner.address, // Fund owner is the vault agent
      userAccount, // Fund owner is still the user
      vaultConfig.name,
      vaultConfig.symbol,
      vaultConfig.denominationAsset,
      sharesActionTimelock,
      //   feeManagerConfigData,
      //   policyManagerConfigData,
      "0x",
      "0x",
      { gasLimit }
    );

    onProgress?.("Waiting for transaction confirmation...");

    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }

    // Parse logs to extract vault addresses
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

    if (!comptrollerProxy || !vaultProxy) {
      throw new Error("Failed to extract vault addresses from transaction");
    }

    onProgress?.("Vault created successfully!");

    return {
      comptrollerProxy,
      vaultProxy,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error creating vault with backend signer:", error);

    // Enhanced error handling
    let errorMessage = "Failed to create vault";

    if (error instanceof Error) {
      if (error.message.includes("CALL_EXCEPTION")) {
        errorMessage =
          "Transaction reverted. Please check your configuration and try again.";
      } else if (error.message.includes("INSUFFICIENT_FUNDS")) {
        errorMessage = "Insufficient funds for gas in backend wallet";
      } else if (error.message.includes("VAULT_AGENT_PRIVATE_KEY")) {
        errorMessage = "Backend wallet not properly configured";
      } else {
        errorMessage = error.message;
      }
    }

    throw new Error(errorMessage);
  }
}

/**
 * Creates fee manager configuration data based on vault config
 */
function createFeeManagerConfigData(
  vaultConfig: VaultConfig,
  networkConfig: any
): string {
  if (!vaultConfig.includeFees) {
    return "0x";
  }

  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  try {
    // Calculate fee rates in basis points
    const managementFeeRate = Math.round(
      parseFloat(vaultConfig.managementFeeRate) * 100
    );
    const performanceFeeRate = Math.round(
      parseFloat(vaultConfig.performanceFeeRate) * 100
    );

    // Prepare fee configuration (simplified version)
    // This is a basic implementation - you may need to adjust based on your specific fee structure
    const feeManagerConfigData = abiCoder.encode(
      ["address[]", "bytes[]"],
      [[], []] // Empty for now - configure based on your fee requirements
    );

    return feeManagerConfigData;
  } catch (error) {
    console.error("Error creating fee manager config:", error);
    return "0x";
  }
}

/**
 * Creates policy manager configuration data based on vault config
 */
function createPolicyManagerConfigData(
  vaultConfig: VaultConfig,
  selectedAgent: AIAgent | null,
  userAccount: string,
  networkConfig: any
): string {
  if (!vaultConfig.includePolicies || !vaultConfig.allowedDepositorsOnly) {
    return "0x";
  }

  try {
    const allowedDepositorsPolicy =
      networkConfig.contracts.ALLOWED_DEPOSITORS_POLICY;

    if (
      allowedDepositorsPolicy === "0x0000000000000000000000000000000000000000"
    ) {
      console.warn("Policy contract addresses not configured for this network");
      return "0x";
    }

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    // Build allowed depositors list
    const allowedAddresses = [userAccount];
    if (selectedAgent?.walletAddress) {
      allowedAddresses.push(selectedAgent.walletAddress);
    }

    // Create policy configuration
    const newListsArgs = abiCoder.encode(
      ["uint8", "address[]"],
      [3, allowedAddresses] // 3 = ADD_TO_LIST operation
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
  } catch (error) {
    console.error("Error creating policy manager config:", error);
    return "0x";
  }
}

/**
 * Estimate gas for vault creation
 */
export async function estimateVaultCreationGas(
  params: VaultCreationParams
): Promise<bigint> {
  const { vaultConfig, selectedAgent, chainId, userAccount } = params;

  try {
    const vaultSigner = createVaultAgentSigner(chainId);
    if (!vaultSigner) {
      throw new Error("Failed to create vault agent signer");
    }

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      throw new Error(`Network configuration not found for chain ${chainId}`);
    }

    const fundDeployer = new ethers.Contract(
      networkConfig.contracts.FUND_DEPLOYER,
      FUND_DEPLOYER_ABI,
      vaultSigner.signer
    );

    const feeManagerConfigData = createFeeManagerConfigData(
      vaultConfig,
      networkConfig
    );
    const policyManagerConfigData = createPolicyManagerConfigData(
      vaultConfig,
      selectedAgent,
      userAccount,
      networkConfig
    );
    const sharesActionTimelock =
      parseInt(vaultConfig.sharesActionTimelock) * 3600;

    // Estimate gas
    const gasEstimate = await fundDeployer.createNewFund.estimateGas(
      userAccount,
      vaultConfig.name,
      vaultConfig.symbol,
      vaultConfig.denominationAsset,
      sharesActionTimelock,
      //   feeManagerConfigData,
      //   policyManagerConfigData
      "0x",
      "0x"
    );

    return gasEstimate;
  } catch (error) {
    console.error("Error estimating gas:", error);
    // Return a reasonable default if estimation fails
    return BigInt(5000000);
  }
}
