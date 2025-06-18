import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import type { VaultConfig, AIAgent } from "@/components/enzyme/types";
import type { VaultCreationResult } from "@/lib/enzyme-contracts";

interface BackendVaultCreationState {
  isCreating: boolean;
  isAvailable: boolean | null;
  vaultAgentAddress: string | null;
  error: string | null;
}

interface CreateVaultParams {
  vaultConfig: VaultConfig;
  selectedAgent: AIAgent | null;
  chainId: number;
  userAccount: string;
}

interface VaultCreationResponse {
  success: boolean;
  message?: string;
  data?: VaultCreationResult & {
    vaultAgentAddress: string;
  };
  error?: string;
  details?: string;
}

export function useBackendVaultCreation() {
  const { data: session } = useSession();
  const [state, setState] = useState<BackendVaultCreationState>({
    isCreating: false,
    isAvailable: null,
    vaultAgentAddress: null,
    error: null,
  });

  // Check if backend vault creation is available
  const checkAvailability = useCallback(async () => {
    console.log("🔍 Checking backend vault creation availability...");
    console.log("Session status:", !!session);

    try {
      console.log("🌐 Making fetch request to /api/vault/create");
      const response = await fetch("/api/vault/create", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📄 Response data:", data);

      setState((prev) => ({
        ...prev,
        isAvailable: data.available,
        vaultAgentAddress: data.vaultAgentAddress,
        error: data.error || null,
      }));

      return data.available;
    } catch (error) {
      console.error("❌ Error checking vault creation availability:", error);
      setState((prev) => ({
        ...prev,
        isAvailable: false,
        error: "Failed to check service availability",
      }));
      return false;
    }
  }, [session]);

  // Create vault using backend signer
  const createVault = useCallback(
    async (params: CreateVaultParams): Promise<VaultCreationResult | null> => {
      if (!session) {
        toast.error("Please sign in to create a vault");
        return null;
      }

      setState((prev) => ({ ...prev, isCreating: true, error: null }));

      try {
        toast.loading("Creating vault with backend signer...", {
          id: "backend-vault-creation",
        });

        const response = await fetch("/api/vault/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        const data: VaultCreationResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `Request failed with status ${response.status}`
          );
        }

        if (!data.success || !data.data) {
          throw new Error(data.error || "Vault creation failed");
        }

        toast.success("Vault created successfully!", {
          id: "backend-vault-creation",
        });

        setState((prev) => ({ ...prev, isCreating: false }));

        return {
          comptrollerProxy: data.data.comptrollerProxy,
          vaultProxy: data.data.vaultProxy,
          transactionHash: data.data.transactionHash,
          blockNumber: data.data.blockNumber,
          gasUsed: data.data.gasUsed,
        };
      } catch (error) {
        console.error("Error creating vault:", error);

        let errorMessage = "Failed to create vault";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, { id: "backend-vault-creation" });

        setState((prev) => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
        }));

        return null;
      }
    },
    [session]
  );

  // Estimate gas for vault creation
  const estimateGas = useCallback(
    async (params: CreateVaultParams): Promise<string | null> => {
      try {
        const response = await fetch("/api/vault/create", {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gas estimation failed");
        }

        return data.gasEstimate;
      } catch (error) {
        console.error("Error estimating gas:", error);
        return null;
      }
    },
    []
  );

  // Reset state
  const reset = useCallback(() => {
    setState({
      isCreating: false,
      isAvailable: null,
      vaultAgentAddress: null,
      error: null,
    });
  }, []);

  return {
    // State
    isCreating: state.isCreating,
    isAvailable: state.isAvailable,
    vaultAgentAddress: state.vaultAgentAddress,
    error: state.error,

    // Actions
    createVault,
    checkAvailability,
    estimateGas,
    reset,
  };
}
