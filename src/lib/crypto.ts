import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";

// Supported cryptocurrencies with their details
export interface CryptoCurrency {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string; // For ERC-20 tokens like USDC
  coingeckoId: string;
  icon: string;
}

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  tokens: {
    [symbol: string]: {
      contractAddress: string;
      decimals: number;
      icon: string; // Icon for the token on this network
      coingeckoId: string; // CoinGecko ID might differ or be shared
    };
  };
}

export const ETHEREUM_MAINNET_CONFIG: NetworkConfig = {
  chainId: 1,
  chainName: "Ethereum Mainnet",
  rpcUrl: `https://mainnet.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || "YOUR_INFURA_ID"
  }`,
  explorerUrl: "https://etherscan.io",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  isTestnet: false,
  tokens: {
    USDC: {
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Corrected checksum
      decimals: 6,
      icon: "💵",
      coingeckoId: "usd-coin",
    },
    USDT: {
      contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      icon: "₮",
      coingeckoId: "tether",
    },
  },
};

export const ARBITRUM_MAINNET_CONFIG: NetworkConfig = {
  chainId: 42161,
  chainName: "Arbitrum One",
  rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || "YOUR_INFURA_ID"
  }`,
  explorerUrl: "https://arbiscan.io",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  isTestnet: false,
  tokens: {
    USDC: {
      contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
      decimals: 6,
      icon: "💵",
      coingeckoId: "usd-coin",
    },
    USDT: {
      contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum USDT
      decimals: 6,
      icon: "₮",
      coingeckoId: "tether",
    },
  },
};

export const ARBITRUM_SEPOLIA_TESTNET_CONFIG: NetworkConfig = {
  chainId: 421614, // Arbitrum Sepolia Testnet Chain ID
  chainName: "Arbitrum Sepolia Testnet",
  rpcUrl: `https://arbitrum-sepolia.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || "YOUR_INFURA_ID"
  }`,
  explorerUrl: "https://sepolia.arbiscan.io",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  isTestnet: true,
  tokens: {
    USDC: {
      // Example: Mock or test USDC on Arbitrum Sepolia
      contractAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // This is an example, replace with actual testnet USDC
      decimals: 6,
      icon: "💵",
      coingeckoId: "usd-coin",
    },
    // Add other testnet tokens if needed
  },
};

export const ETHEREUM_SEPOLIA_TESTNET_CONFIG: NetworkConfig = {
  chainId: 11155111, // Sepolia Testnet Chain ID
  chainName: "Sepolia Testnet",
  rpcUrl: `https://sepolia.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || "YOUR_INFURA_ID"
  }`,
  explorerUrl: "https://sepolia.etherscan.io",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  isTestnet: true,
  tokens: {
    USDC: {
      // Example: Mock or test USDC on Sepolia
      contractAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7a08", // Example Sepolia USDC (check for a real one or deploy mock)
      decimals: 6,
      icon: "💵",
      coingeckoId: "usd-coin",
    },
    USDT: {
      contractAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", // Example Sepolia USDT (check for a real one or deploy mock)
      decimals: 6,
      icon: "₮",
      coingeckoId: "tether",
    },
  },
};

// Determine active network configuration based on environment variable
const ACTIVE_NETWORK_NAME =
  process.env.NEXT_PUBLIC_ACTIVE_NETWORK || "ETHEREUM_MAINNET";

export const getActiveNetworkConfig = (): NetworkConfig => {
  switch (ACTIVE_NETWORK_NAME) {
    case "ETHEREUM_MAINNET":
      return ETHEREUM_MAINNET_CONFIG;
    case "ARBITRUM_MAINNET":
      return ARBITRUM_MAINNET_CONFIG;
    case "ARBITRUM_SEPOLIA_TESTNET":
      return ARBITRUM_SEPOLIA_TESTNET_CONFIG;
    case "ETHEREUM_SEPOLIA_TESTNET":
      return ETHEREUM_SEPOLIA_TESTNET_CONFIG;
    default:
      console.warn(
        `Unsupported network: ${ACTIVE_NETWORK_NAME}, defaulting to Ethereum Mainnet.`
      );
      return ETHEREUM_MAINNET_CONFIG; // Default to Ethereum Mainnet
  }
};

export const ACTIVE_NETWORK: NetworkConfig = getActiveNetworkConfig();

// Update SUPPORTED_CRYPTOS to be dynamic based on the active network
export const getSupportedCryptosForNetwork = (
  network: NetworkConfig
): CryptoCurrency[] => {
  const cryptos: CryptoCurrency[] = [
    {
      symbol: network.nativeCurrency.symbol,
      name: network.nativeCurrency.name,
      decimals: network.nativeCurrency.decimals,
      coingeckoId:
        network.nativeCurrency.symbol === "ETH" ? "ethereum" : "ethereum", // Adjust if native token coingeckoId varies
      icon: "⟠", // Default ETH icon, can be network specific
    },
  ];

  for (const tokenSymbol in network.tokens) {
    const token = network.tokens[tokenSymbol];
    cryptos.push({
      symbol: tokenSymbol,
      name: tokenSymbol, // Or a more descriptive name like "USDC on Arbitrum"
      decimals: token.decimals,
      contractAddress: token.contractAddress,
      coingeckoId: token.coingeckoId,
      icon: token.icon,
    });
  }
  return cryptos;
};

export const SUPPORTED_CRYPTOS: CryptoCurrency[] =
  getSupportedCryptosForNetwork(ACTIVE_NETWORK);

// Your designated wallet address for receiving payments - this remains global
export const PAYMENT_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS ||
  "0x742d35Cc6634C0532925a3b8D401d0ea9D3C8B56";

// ERC-20 Token ABI (simplified for transfer operations)
export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export interface WalletConnection {
  address: string;
  balance: string; // Balance of native currency
  tokenBalances: { [symbol: string]: string }; // Balances of ERC20 tokens
  chainId: number;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  networkConfig: NetworkConfig; // Include current network config
}

export interface CryptoPrice {
  usd: number;
  timestamp: number;
}

export interface PaymentRequest {
  amount: number; // Amount in USD
  currency: CryptoCurrency;
  recipientAddress: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  explorerUrl?: string;
}

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

/**
 * Connect to MetaMask wallet and ensure it's on the ACTIVE_NETWORK
 */
export const connectWallet = async (): Promise<WalletConnection> => {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to continue."
    );
  }
  if (!window.ethereum) {
    throw new Error("Ethereum provider (MetaMask) not found on window object.");
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    // Check if connected to the correct network
    if (Number(network.chainId) !== ACTIVE_NETWORK.chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.toBeHex(ACTIVE_NETWORK.chainId) }],
        });
        // Re-initialize provider and signer after network switch
        const newProvider = new BrowserProvider(window.ethereum as any);
        const newSigner = await newProvider.getSigner();
        const newNetwork = await newProvider.getNetwork();
        const nativeBalance = await newProvider.getBalance(address);

        // Fetch token balances for the new network
        const tokenBalances: { [symbol: string]: string } = {};
        for (const crypto of SUPPORTED_CRYPTOS) {
          if (crypto.contractAddress && ACTIVE_NETWORK.tokens[crypto.symbol]) {
            const balance = await getTokenBalance(
              crypto.contractAddress,
              address,
              newProvider
            );
            tokenBalances[crypto.symbol] = balance;
          }
        }

        return {
          address,
          balance: ethers.formatEther(nativeBalance),
          tokenBalances,
          chainId: Number(newNetwork.chainId),
          provider: newProvider,
          signer: newSigner,
          networkConfig: ACTIVE_NETWORK,
        };
      } catch (switchError: any) {
        // Handle errors like user rejecting the network switch
        if (switchError.code === 4902) {
          // Chain not added to MetaMask
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: ethers.toBeHex(ACTIVE_NETWORK.chainId),
                  chainName: ACTIVE_NETWORK.chainName,
                  rpcUrls: [ACTIVE_NETWORK.rpcUrl],
                  nativeCurrency: ACTIVE_NETWORK.nativeCurrency,
                  blockExplorerUrls: [ACTIVE_NETWORK.explorerUrl],
                },
              ],
            });
            // Retry connection after adding chain
            return connectWallet();
          } catch (addError: any) {
            throw new Error(
              `Failed to add network ${ACTIVE_NETWORK.chainName}: ${addError.message}`
            );
          }
        }
        throw new Error(
          `Please switch to ${ACTIVE_NETWORK.chainName} in MetaMask. Error: ${switchError.message}`
        );
      }
    }

    const nativeBalance = await provider.getBalance(address);
    const tokenBalances: { [symbol: string]: string } = {};
    for (const crypto of SUPPORTED_CRYPTOS) {
      if (crypto.contractAddress && ACTIVE_NETWORK.tokens[crypto.symbol]) {
        const balance = await getTokenBalance(
          crypto.contractAddress,
          address,
          provider
        );
        tokenBalances[crypto.symbol] = balance;
      }
    }

    return {
      address,
      balance: ethers.formatEther(nativeBalance),
      tokenBalances,
      chainId: Number(network.chainId),
      provider,
      signer,
      networkConfig: ACTIVE_NETWORK,
    };
  } catch (error: any) {
    console.error("Connect wallet error:", error);
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
};

/**
 * Fetch current cryptocurrency price from CoinGecko
 */
export const fetchCryptoPrice = async (cryptoId: string): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[cryptoId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${cryptoId}:`, error);
    throw new Error(`Failed to fetch current price for ${cryptoId}`);
  }
};

/**
 * Calculate cryptocurrency amount needed for USD payment
 */
export const calculateCryptoAmount = async (
  usdAmount: number,
  currency: CryptoCurrency
): Promise<{ cryptoAmount: string; price: number }> => {
  try {
    const price = await fetchCryptoPrice(currency.coingeckoId);
    if (price <= 0) {
      throw new Error(`Invalid price received for ${currency.symbol}`);
    }

    const cryptoAmount = (usdAmount / price).toFixed(currency.decimals);
    return { cryptoAmount, price };
  } catch (error) {
    throw new Error(`Failed to calculate ${currency.symbol} amount: ${error}`);
  }
};

/**
 * Get token balance for ERC-20 tokens (uses provider from WalletConnection)
 */
export const getTokenBalance = async (
  tokenAddress: string,
  userAddress: string,
  provider: BrowserProvider // Explicitly pass provider
): Promise<string> => {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    const tokenInfo = Object.values(ACTIVE_NETWORK.tokens).find(
      (t) => t.contractAddress === tokenAddress
    );
    const decimals = tokenInfo ? tokenInfo.decimals : await contract.decimals(); // Fallback if not in config
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error(
      "Error getting token balance for",
      tokenAddress,
      "on network",
      ACTIVE_NETWORK.chainName,
      error
    );
    return "0";
  }
};

/**
 * Process ETH (Native Currency) payment
 */
export const processNativePayment = async (
  amount: string, // Amount in native currency (e.g., ETH)
  recipientAddress: string,
  signer: JsonRpcSigner,
  networkConfig: NetworkConfig // Pass network config for explorer URL
): Promise<PaymentResult> => {
  try {
    const transaction = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseUnits(amount, networkConfig.nativeCurrency.decimals),
    });

    const receipt = await transaction.wait();

    if (receipt?.status === 1) {
      return {
        success: true,
        transactionHash: receipt.hash,
        explorerUrl: `${networkConfig.explorerUrl}/tx/${receipt.hash}`,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed on chain",
      };
    }
  } catch (error: any) {
    console.error(
      `${networkConfig.nativeCurrency.symbol} payment error:`,
      error
    );
    return {
      success: false,
      error:
        error.code === "ACTION_REJECTED"
          ? "Transaction rejected by user."
          : error.message || "Transaction failed",
    };
  }
};

/**
 * Process ERC-20 token payment (USDC, USDT, etc.)
 */
export const processTokenPayment = async (
  amount: string, // Amount in token units
  currency: CryptoCurrency, // This contains contractAddress and decimals for the specific token
  recipientAddress: string,
  signer: JsonRpcSigner,
  networkConfig: NetworkConfig // Pass network config for explorer URL
): Promise<PaymentResult> => {
  if (!currency.contractAddress) {
    throw new Error(
      "Token contract address not provided in CryptoCurrency object"
    );
  }
  // Ensure the token exists on the current active network
  const tokenInfo = networkConfig.tokens[currency.symbol];
  if (!tokenInfo || tokenInfo.contractAddress !== currency.contractAddress) {
    throw new Error(
      `${currency.symbol} is not configured for ${networkConfig.chainName} or contract address mismatch.`
    );
  }

  try {
    const contract = new ethers.Contract(
      currency.contractAddress,
      ERC20_ABI,
      signer
    );
    const amountInSmallestUnit = ethers.parseUnits(amount, currency.decimals);

    const transaction = await contract.transfer(
      recipientAddress,
      amountInSmallestUnit
    );
    const receipt = await transaction.wait();

    if (receipt?.status === 1) {
      return {
        success: true,
        transactionHash: receipt.hash,
        explorerUrl: `${networkConfig.explorerUrl}/tx/${receipt.hash}`,
      };
    } else {
      return {
        success: false,
        error: "Token transaction failed on chain",
      };
    }
  } catch (error: any) {
    console.error(
      `${currency.symbol} payment error on ${networkConfig.chainName}:`,
      error
    );
    return {
      success: false,
      error:
        error.code === "ACTION_REJECTED"
          ? "Transaction rejected by user."
          : error.message || "Token transaction failed",
    };
  }
};

/**
 * Main payment processing function - updated for multi-network
 */
export const processCryptoPayment = async (
  paymentRequest: PaymentRequest, // Amount in USD
  walletConnection: WalletConnection
): Promise<PaymentResult> => {
  try {
    // Calculate crypto amount needed from USD amount
    const { cryptoAmount } = await calculateCryptoAmount(
      paymentRequest.amount, // This is USD amount
      paymentRequest.currency // Contains coingeckoId for price fetching and decimals
    );

    let result: PaymentResult;

    // Check if it's the native currency for the connected network
    if (
      paymentRequest.currency.symbol ===
        walletConnection.networkConfig.nativeCurrency.symbol &&
      !paymentRequest.currency.contractAddress
    ) {
      result = await processNativePayment(
        cryptoAmount,
        paymentRequest.recipientAddress,
        walletConnection.signer,
        walletConnection.networkConfig
      );
    } else if (paymentRequest.currency.contractAddress) {
      // It's an ERC20 token
      result = await processTokenPayment(
        cryptoAmount,
        paymentRequest.currency, // Contains contractAddress and decimals
        paymentRequest.recipientAddress,
        walletConnection.signer,
        walletConnection.networkConfig
      );
    } else {
      throw new Error(
        `Unsupported currency for payment: ${paymentRequest.currency.symbol}`
      );
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Payment processing failed",
    };
  }
};

/**
 * Verify transaction status (uses provider from WalletConnection)
 */
export const verifyTransaction = async (
  transactionHash: string,
  provider: BrowserProvider // Pass provider explicitly
): Promise<{ confirmed: boolean; confirmations: number }> => {
  try {
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
      return { confirmed: false, confirmations: 0 };
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    return {
      confirmed: receipt.status === 1 && confirmations >= 1,
      confirmations,
    };
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return { confirmed: false, confirmations: 0 };
  }
};

/**
 * Format cryptocurrency amount for display
 */
export const formatCryptoAmount = (amount: string, symbol: string): string => {
  const num = parseFloat(amount);
  if (num === 0) return `0 ${symbol}`;

  if (num < 0.0001) {
    return `${num.toExponential(2)} ${symbol}`;
  } else if (num < 1) {
    return `${num.toFixed(6)} ${symbol}`;
  } else {
    return `${num.toFixed(4)} ${symbol}`;
  }
};

/**
 * Get network name from chain ID (can be enhanced or use networkConfig.chainName)
 */
export const getNetworkName = (chainId: number): string => {
  // This can be simplified if ACTIVE_NETWORK is always used
  const networks: { [key: number]: string } = {
    [ETHEREUM_MAINNET_CONFIG.chainId]: ETHEREUM_MAINNET_CONFIG.chainName,
    [ARBITRUM_MAINNET_CONFIG.chainId]: ARBITRUM_MAINNET_CONFIG.chainName,
    [ARBITRUM_SEPOLIA_TESTNET_CONFIG.chainId]:
      ARBITRUM_SEPOLIA_TESTNET_CONFIG.chainName,
    [ETHEREUM_SEPOLIA_TESTNET_CONFIG.chainId]:
      ETHEREUM_SEPOLIA_TESTNET_CONFIG.chainName,
  };
  return networks[chainId] || `Unknown Network (ID: ${chainId})`;
};
