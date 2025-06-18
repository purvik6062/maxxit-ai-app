import { ethers } from "ethers";
import { getNetworkConfig, isNetworkSupported } from "./enzyme-contracts";

/**
 * Backend signer utility for vault creation operations
 * Uses VAULT_AGENT_PRIVATE_KEY from environment variables
 */

export interface VaultSigner {
  signer: ethers.Wallet;
  address: string;
  chainId: number;
}

/**
 * Creates a backend signer using the private key from environment variables
 * This signer is used specifically for vault creation operations
 */
export function createVaultAgentSigner(chainId: number): VaultSigner | null {
  // Validate network support
  if (!isNetworkSupported(chainId)) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  // Get private key from environment
  const privateKey = process.env.VAULT_AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "VAULT_AGENT_PRIVATE_KEY not found in environment variables"
    );
  }

  // Validate private key format
  if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
    throw new Error(
      "Invalid private key format. Expected 0x-prefixed 64-character hex string"
    );
  }

  try {
    // Create provider for the specific network
    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      throw new Error(`Network configuration not found for chain ${chainId}`);
    }

    // Create provider based on network
    let rpcUrl: string;
    switch (chainId) {
      case 1: // Ethereum
        rpcUrl = process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com";
        break;
      case 137: // Polygon
        rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon.llamarpc.com";
        break;
      case 42161: // Arbitrum
        rpcUrl = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
        break;
      default:
        throw new Error(`No RPC URL configured for chain ${chainId}`);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create wallet with private key and connect to provider
    const wallet = new ethers.Wallet(privateKey, provider);

    return {
      signer: wallet,
      address: wallet.address,
      chainId,
    };
  } catch (error) {
    console.error("Error creating vault agent signer:", error);
    throw error;
  }
}

/**
 * Get the vault agent address without creating the full signer
 * Useful for frontend display purposes
 */
export function getVaultAgentAddress(): string | null {
  const privateKey = process.env.VAULT_AGENT_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    console.error("Error getting vault agent address:", error);
    return null;
  }
}

/**
 * Validate that the vault agent is properly configured
 */
export function validateVaultAgentConfig(): {
  isValid: boolean;
  error?: string;
  address?: string;
} {
  try {
    const privateKey = process.env.VAULT_AGENT_PRIVATE_KEY;

    if (!privateKey) {
      return {
        isValid: false,
        error: "VAULT_AGENT_PRIVATE_KEY not configured",
      };
    }

    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      return {
        isValid: false,
        error: "Invalid private key format",
      };
    }

    const wallet = new ethers.Wallet(privateKey);

    return {
      isValid: true,
      address: wallet.address,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
