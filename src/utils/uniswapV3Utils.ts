import { ethers } from 'ethers';

// Uniswap V3 Quoter V2 contract address on Arbitrum
const QUOTER_V2_ADDRESS = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';

// Quoter V2 ABI (simplified)
const QUOTER_V2_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint256' }
        ]
      }
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint256' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' }
    ]
  },
  // Add the quoteExactInput function for path-based quotes
  {
    name: 'quoteExactInput',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'path', type: 'bytes' },
      { name: 'amountIn', type: 'uint256' }
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96AfterList', type: 'uint160[]' },
      { name: 'initializedTicksCrossedList', type: 'uint32[]' },
      { name: 'gasEstimate', type: 'uint256' }
    ]
  }
] as const;

// Alternative approach using the Uniswap V3 Pool interface directly
const POOL_ABI = [
  {
    name: 'slot0',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ]
  },
  {
    name: 'liquidity',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint128' }]
  }
] as const;

// Uniswap V3 Factory address on Arbitrum
const FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

// Factory ABI (simplified)
const FACTORY_ABI = [
  {
    name: 'getPool',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    outputs: [{ name: 'pool', type: 'address' }]
  }
] as const;

export interface QuoteParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  amountIn: string;
  decimalsIn: number;
  decimalsOut: number;
}

export interface QuoteResult {
  amountOut: string;
  amountOutFormatted: string;
  gasEstimate: string;
  priceImpact?: number;
}

/**
 * Get a quote for a Uniswap V3 swap using multiple fallback methods
 */
export async function getUniswapV3Quote(
  provider: ethers.Provider,
  params: QuoteParams
): Promise<QuoteResult> {
  try {
    // First try using the Quoter V2 contract
    return await getQuoteFromQuoterV2(provider, params);
  } catch (error) {
    console.warn('Failed to get quote from Quoter V2, falling back to direct pool calculation:', error);
    
    try {
      // Fallback to direct pool calculation if Quoter fails
      return await getQuoteFromPoolData(provider, params);
    } catch (poolError) {
      console.error('All quote methods failed:', poolError);
      throw new Error('Failed to get swap quote. The trading pair might not exist or have insufficient liquidity.');
    }
  }
}

/**
 * Get quote using the Quoter V2 contract
 */
async function getQuoteFromQuoterV2(
  provider: ethers.Provider,
  params: QuoteParams
): Promise<QuoteResult> {
  const quoterContract = new ethers.Contract(QUOTER_V2_ADDRESS, QUOTER_V2_ABI, provider);
  const amountInWei = ethers.parseUnits(params.amountIn, params.decimalsIn);
  
  try {
    // Try using quoteExactInputSingle with callStatic
    const result = await quoterContract.quoteExactInputSingle.staticCall({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      fee: params.fee,
      amountIn: amountInWei,
      sqrtPriceLimitX96: 0
    });
    
    const amountOut = result[0]; // First return value is amountOut
    const gasEstimate = result[3] || '200000'; // Fourth return value is gasEstimate
    
    const amountOutFormatted = ethers.formatUnits(amountOut, params.decimalsOut);
    
    return {
      amountOut: amountOut.toString(),
      amountOutFormatted,
      gasEstimate: gasEstimate.toString(),
    };
  } catch (error) {
    // If direct quoteExactInputSingle fails, try with encoded path
    try {
      // Encode the path for a single hop (tokenIn -> tokenOut with fee)
      const path = encodePath([params.tokenIn, params.tokenOut], [params.fee]);
      
      const result = await quoterContract.quoteExactInput.staticCall(
        path,
        amountInWei
      );
      
      const amountOut = result[0]; // First return value is amountOut
      const gasEstimate = result[3] || '200000'; // Fourth return value is gasEstimate
      
      const amountOutFormatted = ethers.formatUnits(amountOut, params.decimalsOut);
      
      return {
        amountOut: amountOut.toString(),
        amountOutFormatted,
        gasEstimate: gasEstimate.toString(),
      };
    } catch (pathError) {
      console.error('Path-based quote failed:', pathError);
      throw pathError;
    }
  }
}

/**
 * Get quote by directly calculating from pool data
 * This is a simplified calculation and may not be as accurate as the Quoter
 */
async function getQuoteFromPoolData(
  provider: ethers.Provider,
  params: QuoteParams
): Promise<QuoteResult> {
  // Get pool address from factory
  const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
  
  // Sort tokens to match how the pool is deployed
  const [token0, token1] = sortTokens(params.tokenIn, params.tokenOut);
  const isInputToken0 = token0.toLowerCase() === params.tokenIn.toLowerCase();
  
  // Get pool address
  const poolAddress = await factoryContract.getPool(token0, token1, params.fee);
  
  if (poolAddress === ethers.ZeroAddress) {
    throw new Error(`No pool found for ${params.tokenIn} and ${params.tokenOut} with fee ${params.fee}`);
  }
  
  // Connect to pool
  const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
  
  // Get pool data
  const [slot0Data, liquidityData] = await Promise.all([
    poolContract.slot0(),
    poolContract.liquidity()
  ]);
  
  const sqrtPriceX96 = slot0Data[0];
  const liquidity = liquidityData;
  
  // Calculate price from sqrtPriceX96
  const price = calculatePriceFromSqrtRatio(sqrtPriceX96);
  
  // Calculate output amount based on price and input amount
  const amountInWei = ethers.parseUnits(params.amountIn, params.decimalsIn);
  
  // Simple price calculation (this is a simplification and doesn't account for slippage)
  let amountOut;
  if (isInputToken0) {
    // If input is token0, multiply by price
    amountOut = (amountInWei * BigInt(Math.floor(price * 1e18))) / BigInt(1e18);
  } else {
    // If input is token1, divide by price
    amountOut = (amountInWei * BigInt(1e18)) / BigInt(Math.floor(price * 1e18));
  }
  
  // Apply a 0.5% discount to account for slippage and fees
  amountOut = (amountOut * BigInt(995)) / BigInt(1000);
  
  const amountOutFormatted = ethers.formatUnits(amountOut, params.decimalsOut);
  
  return {
    amountOut: amountOut.toString(),
    amountOutFormatted,
    gasEstimate: '300000', // Default gas estimate
    priceImpact: 0.5, // Approximate price impact
  };
}

/**
 * Helper function to sort token addresses
 */
function sortTokens(tokenA: string, tokenB: string): [string, string] {
  return tokenA.toLowerCase() < tokenB.toLowerCase() 
    ? [tokenA, tokenB] 
    : [tokenB, tokenA];
}

/**
 * Helper function to calculate price from sqrtPriceX96
 */
function calculatePriceFromSqrtRatio(sqrtPriceX96: bigint): number {
  // Convert sqrtPriceX96 to price
  // price = (sqrtPriceX96 / 2^96)^2
  const numerator = sqrtPriceX96 * sqrtPriceX96;
  const denominator = BigInt(1) << BigInt(192); // 2^192
  return Number(numerator) / Number(denominator);
}

/**
 * Encode path for multi-hop swaps
 */
function encodePath(path: string[], fees: number[]): string {
  if (path.length !== fees.length + 1) {
    throw new Error('Path and fees length mismatch');
  }
  
  let encoded = '0x';
  for (let i = 0; i < fees.length; i++) {
    // Encode token
    encoded += path[i].slice(2);
    // Encode fee as 3 bytes
    encoded += fees[i].toString(16).padStart(6, '0');
  }
  // Encode last token
  encoded += path[path.length - 1].slice(2);
  
  return encoded;
}

/**
 * Calculate minimum amount out with slippage tolerance
 */
export function calculateMinAmountOut(
  amountOut: string,
  slippagePercent: number,
  decimals: number
): string {
  const amount = parseFloat(ethers.formatUnits(amountOut, decimals));
  const slippageMultiplier = (100 - slippagePercent) / 100;
  const minAmount = amount * slippageMultiplier;
  
  return ethers.parseUnits(minAmount.toFixed(decimals), decimals).toString();
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
  maxDecimals: number = 6
): string {
  const formatted = ethers.formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  
  return num.toFixed(Math.min(maxDecimals, decimals));
}

/**
 * Get the optimal fee tier for a token pair based on price difference
 */
export function getOptimalFeeTier(
  tokenAPrice: number,
  tokenBPrice: number
): number {
  const priceRatio = Math.max(tokenAPrice, tokenBPrice) / Math.min(tokenAPrice, tokenBPrice);
  
  // Stablecoin pairs (very close in price)
  if (priceRatio < 1.01) {
    return 100; // 0.01%
  }
  
  // Similar valued tokens
  if (priceRatio < 2) {
    return 500; // 0.05%
  }
  
  // Standard pairs
  if (priceRatio < 10) {
    return 3000; // 0.30%
  }
  
  // Exotic pairs
  return 10000; // 1.00%
}

/**
 * Validate swap parameters
 */
export function validateSwapParams(params: {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  fee: number;
}): { isValid: boolean; error?: string } {
  const { tokenIn, tokenOut, amountIn, slippage, fee } = params;
  
  // Check if tokens are different
  if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
    return { isValid: false, error: 'Cannot swap the same token' };
  }
  
  // Check amount
  const amount = parseFloat(amountIn);
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Invalid swap amount' };
  }
  
  // Check slippage
  if (slippage < 0 || slippage > 50) {
    return { isValid: false, error: 'Slippage must be between 0% and 50%' };
  }
  
  // Check fee tier
  const validFees = [100, 500, 3000, 10000];
  if (!validFees.includes(fee)) {
    return { isValid: false, error: 'Invalid fee tier' };
  }
  
  return { isValid: true };
}

// Uniswap V3 fee tiers (in basis points)
export const UNISWAP_V3_FEE_TIERS = {
  LOWEST: 100,  // 0.01%
  LOW: 500,     // 0.05%
  MEDIUM: 3000, // 0.30%
  HIGH: 10000,  // 1.00%
} as const;

// Common token pairs with recommended fee tiers for Arbitrum
export const UNISWAP_V3_COMMON_PAIRS = {
  USDC_WETH: { tokens: ['USDC', 'WETH'], fee: UNISWAP_V3_FEE_TIERS.MEDIUM },
  USDC_ARB: { tokens: ['USDC', 'ARB'], fee: UNISWAP_V3_FEE_TIERS.MEDIUM },
  WETH_ARB: { tokens: ['WETH', 'ARB'], fee: UNISWAP_V3_FEE_TIERS.MEDIUM },
} as const;