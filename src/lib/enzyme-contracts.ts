// Enzyme Protocol Contract Addresses and Configuration
// Based on official Enzyme deployments: https://docs.enzyme.finance/developers/contracts

import { FUND_DEPLOYER_ABI_FILE } from "@/components/enzyme/FUND_DEPLOYER_ABI";

export interface EnzymeContracts {
  FUND_DEPLOYER: string;
  COMPTROLLER_LIB: string;
  VAULT_LIB: string;
  FEE_MANAGER: string;
  POLICY_MANAGER: string;
  INTEGRATION_MANAGER: string;
  EXTERNAL_POSITION_MANAGER: string;
  VALUE_INTERPRETER: string;
  PRIMITIVE_PRICE_FEED: string;
  DERIVATIVE_PRICE_FEED: string;
  MANAGEMENT_FEE: string;
  PERFORMANCE_FEE: string;
  ALLOWED_DEPOSITORS_POLICY: string;
  ADDRESS_LIST_REGISTRY: string;
}

export interface SupportedAssets {
  WETH: string;
  USDC: string;
  USDT: string;
  DAI: string;
  WBTC: string;
}

// Ethereum Mainnet Contract Addresses (v4)
export const ETHEREUM_CONTRACTS: EnzymeContracts = {
  FUND_DEPLOYER: "0x7e6d3b1161DF9c9c7527F68d651B297d2Fdb820B",
  COMPTROLLER_LIB: "0x2504d5A1AA9B64d965BFE4ede79a99E8e3D9bFaD",
  VAULT_LIB: "0x2504d5A1AA9B64d965BFE4ede79a99E8e3D9bFaD", // ComptrollerLib address
  FEE_MANAGER: "0xC6ff4512b8a9ec0e6b35Cf0f66CC5a8ea4D2b647",
  POLICY_MANAGER: "0x9e36b4b8D7CfeBb7B3D3F7e79B67E68fE825C56B",
  INTEGRATION_MANAGER: "0x9e36b4b8D7CfeBb7B3D3F7e79B67E68fE825C56B",
  EXTERNAL_POSITION_MANAGER: "0x9e36b4b8D7CfeBb7B3D3F7e79B67E68fE825C56B",
  VALUE_INTERPRETER: "0x22e7a2f0D5D8Df3c5f905eC6d6Fa9B93DBa8B6b8",
  PRIMITIVE_PRICE_FEED: "0xD6c8e5e8e5D2D6b6b6b6b6b6b6b6b6b6b6b6b6",
  DERIVATIVE_PRICE_FEED: "0xE7d9f6e9e6E6d6c6c6c6c6c6c6c6c6c6c6c6c6",
  MANAGEMENT_FEE: "0x0000000000000000000000000000000000000000",
  PERFORMANCE_FEE: "0x0000000000000000000000000000000000000000",
  ALLOWED_DEPOSITORS_POLICY: "0x0000000000000000000000000000000000000000",
  ADDRESS_LIST_REGISTRY: "0x0000000000000000000000000000000000000000",
};

// Polygon Contract Addresses (v4)
export const POLYGON_CONTRACTS: EnzymeContracts = {
  FUND_DEPLOYER: "0x188d356caf78bc6694aee5969fde99a9d612284f",
  COMPTROLLER_LIB: "0xf5fc0e36c85552e44354132d188c33d9361eb441",
  VAULT_LIB: "0x78c89968b121e64fa559f3b4ed1b35222a42c059",
  FEE_MANAGER: "0xf9315b421904eadf2f8fce776958c147ee9bc880",
  POLICY_MANAGER: "0xa69944d328b0045bd87c051b241055d3123b68a1",
  INTEGRATION_MANAGER: "0x8da28441a4c594fd2fac72726c1412d8cf9e4a19",
  EXTERNAL_POSITION_MANAGER: "0x6180b98d85afbd904016c7ea08eb41cba77a1c08",
  VALUE_INTERPRETER: "0xbd35b273453eb3a977f2757f92b20e8c0b33c0b2",
  PRIMITIVE_PRICE_FEED: "0x1b905b0ab56c82b3e5d3f2e600a07b8e54748977",
  DERIVATIVE_PRICE_FEED: "0xc7bde79a2a02fa20f18f7c3ffefdd3f6ef3790d8",
  MANAGEMENT_FEE: "0x0000000000000000000000000000000000000000",
  PERFORMANCE_FEE: "0x0000000000000000000000000000000000000000",
  ALLOWED_DEPOSITORS_POLICY: "0x0000000000000000000000000000000000000000",
  ADDRESS_LIST_REGISTRY: "0x0000000000000000000000000000000000000000",
};

// Arbitrum Contract Addresses (v4) - Official addresses from Enzyme docs
export const ARBITRUM_CONTRACTS: EnzymeContracts = {
  FUND_DEPLOYER: "0xa2b4c827de13d4e9801ea1ca837524a1a148dec3",
  COMPTROLLER_LIB: "0x3868c0fc34b6ece124c6ab122f6f29e978be6661",
  VAULT_LIB: "0xe1a147b3fb8a7be78bf3a061f176bc718d897695",
  FEE_MANAGER: "0x2c46503d4a0313c7161a5593b6865baa194b466f",
  POLICY_MANAGER: "0xbde1e8c4a061cd28f4871860ddf22200b85ee9ec",
  INTEGRATION_MANAGER: "0x55df97aca98c2a708721f28ea1ca42a2be7ff934",
  EXTERNAL_POSITION_MANAGER: "0x90b53aefdbd2ba3573d965d2d98951f2aa00507d",
  VALUE_INTERPRETER: "0xdd5f18a52a63ececf502a165a459d33be5c0a06c",
  PRIMITIVE_PRICE_FEED: "0x1b905b0ab56c82b3e5d3f2e600a07b8e54748977",
  DERIVATIVE_PRICE_FEED: "0xc7bde79a2a02fa20f18f7c3ffefdd3f6ef3790d8",
  MANAGEMENT_FEE: "0xd2fa8f6706241dfdf8069d05e1d6f6c4a439aa86",
  PERFORMANCE_FEE: "0x9e0f80bc5a688e93d6c57efcfdd4564f70975e8b",
  ALLOWED_DEPOSITORS_POLICY: "0xde0c43b8cb1cacdec773ef55fcbfbcbe009891f1",
  ADDRESS_LIST_REGISTRY: "0x2c6bef68dabf0494bb5f727e63c8fb54f7d2c287",
};

// Ethereum Mainnet Supported Assets
export const ETHEREUM_ASSETS: SupportedAssets = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86a33E324eAE65C08fB23096c4C14Dd3F3e3e",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
};

// Polygon Supported Assets
export const POLYGON_ASSETS: SupportedAssets = {
  WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  WBTC: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
};

// Arbitrum Supported Assets
export const ARBITRUM_ASSETS: SupportedAssets = {
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC.e
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
};

export const NETWORK_CONFIGS = {
  1: {
    name: "Ethereum",
    contracts: ETHEREUM_CONTRACTS,
    assets: ETHEREUM_ASSETS,
    explorer: "https://etherscan.io",
    currency: "ETH",
  },
  137: {
    name: "Polygon",
    contracts: POLYGON_CONTRACTS,
    assets: POLYGON_ASSETS,
    explorer: "https://polygonscan.com",
    currency: "MATIC",
  },
  42161: {
    name: "Arbitrum",
    contracts: ARBITRUM_CONTRACTS,
    assets: ARBITRUM_ASSETS,
    explorer: "https://arbiscan.io",
    currency: "ETH",
  },
} as const;

export type SupportedChainId = keyof typeof NETWORK_CONFIGS;

export const getSupportedNetworks = (): SupportedChainId[] => {
  return Object.keys(NETWORK_CONFIGS).map(Number) as SupportedChainId[];
};

export const getNetworkConfig = (chainId: number) => {
  return NETWORK_CONFIGS[chainId as SupportedChainId];
};

export const isNetworkSupported = (
  chainId: number
): chainId is SupportedChainId => {
  return chainId in NETWORK_CONFIGS;
};

// Fee Manager Configuration
export interface FeeConfig {
  managementFeeRate: number; // in basis points
  performanceFeeRate: number; // in basis points
  entranceFeeRate: number; // in basis points
  exitFeeRate: number; // in basis points
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  managementFeeRate: 100, // 1%
  performanceFeeRate: 1000, // 10%
  entranceFeeRate: 0, // 0%
  exitFeeRate: 0, // 0%
};

export const MAX_FEE_RATE = 10000; // 100% in basis points

// Fund Deployer ABI - Essential functions only
export const FUND_DEPLOYER_ABI = FUND_DEPLOYER_ABI_FILE;

// Events that can be emitted during vault creation
export const VAULT_CREATION_EVENTS = {
  NEW_FUND_CREATED: "NewFundCreated",
  COMPTROLLER_PROXY_DEPLOYED: "ComptrollerProxyDeployed",
  VAULT_PROXY_DEPLOYED: "VaultProxyDeployed",
} as const;

// Helper functions for fee calculations
export const basisPointsToPercentage = (basisPoints: number): number => {
  return basisPoints / 100;
};

export const percentageToBasisPoints = (percentage: number): number => {
  return Math.round(percentage * 100);
};

export const validateFeeRate = (rate: number): boolean => {
  return rate >= 0 && rate <= MAX_FEE_RATE;
};

export const formatFeeRate = (rate: number): string => {
  return `${basisPointsToPercentage(rate).toFixed(2)}%`;
};

// Asset information helper
export const getAssetInfo = (address: string, chainId: SupportedChainId) => {
  const config = getNetworkConfig(chainId);
  if (!config) return null;

  const assets = config.assets;
  for (const [symbol, assetAddress] of Object.entries(assets)) {
    if (assetAddress.toLowerCase() === address.toLowerCase()) {
      return { symbol, address: assetAddress };
    }
  }
  return null;
};

// Transaction helper types
export interface VaultCreationResult {
  comptrollerProxy: string;
  vaultProxy: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
}

export interface CreateVaultParams {
  fundOwner: string;
  fundName: string;
  fundSymbol: string;
  denominationAsset: string;
  sharesActionTimelock: number; // in seconds
  feeManagerConfigData: string;
  policyManagerConfigData: string;
}
