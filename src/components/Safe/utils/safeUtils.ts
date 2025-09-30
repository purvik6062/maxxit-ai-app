// Format gas price for display
export const formatGasPrice = (gasPrice: string, chainId: number): string => {
  const price = parseFloat(gasPrice);
  if (chainId === 421614 || chainId === 84532) {
    // Arbitrum Sepolia, Base Sepolia
    return `${(price / 1e9).toFixed(2)} Gwei`;
  }
  return `${(price / 1e9).toFixed(2)} Gwei`;
};

// Format timestamp
export const formatTimestamp = (timestamp: any): string => {
  const date = timestamp?.$date
    ? new Date(timestamp.$date)
    : new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Calculate total gas cost
export const calculateTotalGasCost = (deployments: any): string => {
  let totalCost = 0;
  Object.values(deployments || {}).forEach((deployment: any) => {
    if (deployment.gasUsed && deployment.gasPrice) {
      const cost =
        (parseFloat(deployment.gasUsed) * parseFloat(deployment.gasPrice)) /
        1e18;
      totalCost += cost;
    }
  });
  return totalCost.toFixed(6);
};

// Get status icon based on deployment status
export const getStatusIcon = (
  deploymentStatus: "idle" | "deploying" | "success" | "error"
) => {
  switch (deploymentStatus) {
    case "deploying":
      return "animate-spin";
    case "success":
      return "text-green-400";
    case "error":
      return "text-red-400";
    default:
      return "";
  }
};

// Get button text based on deployment status
export const getButtonText = (
  deploymentStatus: "idle" | "deploying" | "success" | "error"
): string => {
  switch (deploymentStatus) {
    case "deploying":
      return "Creating Safe Wallet...";
    case "success":
      return "Safe Wallet Created!";
    case "error":
      return "Creation Failed - Retry";
    default:
      return "Create Safe Wallet";
  }
};

// Supported networks data
export const supportedNetworks = [
  {
    name: "Ethereum",
    chainId: 1,
    type: "Mainnet",
    features: ["DeFi Hub", "Highest Liquidity"],
  },
  {
    name: "Sepolia",
    chainId: 11155111,
    type: "Testnet",
    features: ["Testing", "Development"],
  },
  {
    name: "Arbitrum One",
    chainId: 42161,
    type: "Mainnet",
    features: ["Low Fees", "Fast Execution"],
  },
  {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    type: "Testnet",
    features: ["Testing", "Low Fees"],
  },
  {
    name: "Polygon",
    chainId: 137,
    type: "Mainnet",
    features: ["Ultra Low Fees", "Gaming"],
  },
  {
    name: "Base",
    chainId: 8453,
    type: "Mainnet",
    features: ["Coinbase Integration"],
  },
];

// All networks with their details for expansion
export const allNetworks = [
  {
    key: "ethereum",
    name: "Ethereum Mainnet",
    chainId: 1,
    type: "Mainnet",
    icon: "/img/ethereum-sepolia.png",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "sepolia",
    name: "Ethereum Sepolia",
    chainId: 11155111,
    type: "Testnet",
    icon: "/img/ethereum-sepolia.png",
    color: "from-blue-400 to-blue-500",
  },
  {
    key: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    type: "Mainnet",
    icon: "/img/arbitrum-sepolia.png",
    color: "from-blue-600 to-indigo-600",
  },
  {
    key: "arbitrum_sepolia",
    name: "Arbitrum Sepolia",
    chainId: 421614,
    type: "Testnet",
    icon: "/img/arbitrum-sepolia.png",
    color: "from-blue-500 to-indigo-500",
  },
  // {
  //   key: "polygon",
  //   name: "Polygon",
  //   chainId: 137,
  //   type: "Mainnet",
  //   icon: "/img/polygon.png",
  //   color: "from-purple-500 to-purple-600",
  // },
  // {
  //   key: "base",
  //   name: "Base",
  //   chainId: 8453,
  //   type: "Mainnet",
  //   icon: "/img/base-sepolia.png",
  //   color: "from-blue-500 to-cyan-500",
  // },
  // {
  //   key: "base_sepolia",
  //   name: "Base Sepolia",
  //   chainId: 84532,
  //   type: "Testnet",
  //   icon: "/img/base-sepolia.png",
  //   color: "from-blue-400 to-cyan-400",
  // },
];

// Chain ID to network key mapping
export const chainIdToNetworkKey: { [key: number]: string } = {
  1: "ethereum",
  11155111: "sepolia",
  42161: "arbitrum",
  421614: "arbitrum_sepolia",
  137: "polygon",
  8453: "base",
  84532: "base_sepolia",
};
