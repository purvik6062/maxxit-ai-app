import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import {
  createVaultWithBackendSigner,
  estimateVaultCreationGas,
  type VaultCreationParams,
} from "@/services/vaultCreationService";
import { validateVaultAgentConfig } from "@/lib/vault-signer";
import type { VaultConfig, AIAgent } from "@/components/enzyme/types";

interface CreateVaultRequest {
  vaultConfig: VaultConfig;
  selectedAgent: AIAgent | null;
  chainId: number;
  userAccount: string;
}

function validateCreateVaultRequest(data: any): data is CreateVaultRequest {
  return (
    data &&
    typeof data.chainId === "number" &&
    typeof data.userAccount === "string" &&
    data.vaultConfig &&
    typeof data.vaultConfig.name === "string" &&
    typeof data.vaultConfig.symbol === "string" &&
    typeof data.vaultConfig.denominationAsset === "string" &&
    typeof data.vaultConfig.sharesActionTimelock === "string" &&
    typeof data.vaultConfig.managementFeeRate === "string" &&
    typeof data.vaultConfig.performanceFeeRate === "string" &&
    typeof data.vaultConfig.includeFees === "boolean" &&
    typeof data.vaultConfig.includePolicies === "boolean" &&
    typeof data.vaultConfig.allowedDepositorsOnly === "boolean" &&
    (data.selectedAgent === null ||
      (data.selectedAgent &&
        typeof data.selectedAgent.id === "string" &&
        typeof data.selectedAgent.name === "string" &&
        typeof data.selectedAgent.walletAddress === "string"))
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate vault agent configuration
    const vaultAgentConfig = validateVaultAgentConfig();
    if (!vaultAgentConfig.isValid) {
      console.error(
        "Vault agent not properly configured:",
        vaultAgentConfig.error
      );
      console.error(
        "Debug - VAULT_AGENT_PRIVATE_KEY exists:",
        !!process.env.VAULT_AGENT_PRIVATE_KEY
      );
      console.error(
        "Debug - VAULT_AGENT_PRIVATE_KEY length:",
        process.env.VAULT_AGENT_PRIVATE_KEY?.length
      );
      return NextResponse.json(
        {
          error: "Vault creation service not available",
          details:
            vaultAgentConfig.error || "Backend wallet configuration error",
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    if (!validateCreateVaultRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: "Missing or invalid required fields",
        },
        { status: 400 }
      );
    }

    const { vaultConfig, selectedAgent, chainId, userAccount } = body;

    // Additional validation
    if (!vaultConfig.name.trim()) {
      return NextResponse.json(
        { error: "Vault name is required" },
        { status: 400 }
      );
    }

    if (!vaultConfig.symbol.trim()) {
      return NextResponse.json(
        { error: "Vault symbol is required" },
        { status: 400 }
      );
    }

    if (vaultConfig.symbol.length > 10) {
      return NextResponse.json(
        { error: "Vault symbol must be 10 characters or less" },
        { status: 400 }
      );
    }

    // Note: User is already authenticated, trusting the userAccount from request
    // Additional validation could be added here if needed

    const vaultCreationParams: VaultCreationParams = {
      vaultConfig,
      selectedAgent,
      chainId,
      userAccount,
    };

    // Create the vault using backend signer
    const result = await createVaultWithBackendSigner(vaultCreationParams, {
      onProgress: (message) => {
        console.log(`Vault creation progress: ${message}`);
      },
    });

    return NextResponse.json({
      success: true,
      message: "Vault created successfully",
      data: {
        comptrollerProxy: result.comptrollerProxy,
        vaultProxy: result.vaultProxy,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        vaultAgentAddress: vaultAgentConfig.address,
      },
    });
  } catch (error) {
    console.error("Error in vault creation API:", error);

    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Map specific errors to appropriate status codes
      if (
        error.message.includes("Invalid request data") ||
        error.message.includes("required") ||
        error.message.includes("invalid")
      ) {
        statusCode = 400;
      } else if (error.message.includes("INSUFFICIENT_FUNDS")) {
        statusCode = 503;
        errorMessage = "Insufficient funds in backend wallet for gas fees";
      } else if (error.message.includes("VAULT_AGENT_PRIVATE_KEY")) {
        statusCode = 503;
        errorMessage = "Vault creation service temporarily unavailable";
      } else if (error.message.includes("Unsupported network")) {
        statusCode = 400;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("GET /api/vault/create: No session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("GET /api/vault/create: Session found, checking vault config");

    // Get vault agent status
    const vaultAgentConfig = validateVaultAgentConfig();

    console.log("Vault agent config:", {
      isValid: vaultAgentConfig.isValid,
      error: vaultAgentConfig.error,
      hasAddress: !!vaultAgentConfig.address,
    });

    return NextResponse.json({
      available: vaultAgentConfig.isValid,
      vaultAgentAddress: vaultAgentConfig.address,
      error: vaultAgentConfig.error,
    });
  } catch (error) {
    console.error("Error checking vault creation status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Estimate gas endpoint (optional)
export async function OPTIONS(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!validateCreateVaultRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { vaultConfig, selectedAgent, chainId, userAccount } = body;

    const vaultCreationParams: VaultCreationParams = {
      vaultConfig,
      selectedAgent,
      chainId,
      userAccount,
    };

    const gasEstimate = await estimateVaultCreationGas(vaultCreationParams);

    return NextResponse.json({
      gasEstimate: gasEstimate.toString(),
    });
  } catch (error) {
    console.error("Error estimating gas:", error);
    return NextResponse.json(
      { error: "Failed to estimate gas" },
      { status: 500 }
    );
  }
}
