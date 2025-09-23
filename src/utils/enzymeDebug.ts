import { ethers } from 'ethers';
import { VAULT_PROXY_ABI, COMPTROLLER_ABI, ERC20_ABI } from '@/contracts/enzymeContracts';

// Additional ABI for policy manager and common policies
const POLICY_MANAGER_ABI = [
  {
    name: 'getEnabledPoliciesForFund',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_comptrollerProxy', type: 'address' }],
    outputs: [{ name: 'policies_', type: 'address[]' }]
  }
] as const;

const INVESTOR_WHITELIST_ABI = [
  {
    name: 'passesRule',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_comptrollerProxy', type: 'address' },
      { name: '_investor', type: 'address' },
      { name: '_investmentAmount', type: 'uint256' }
    ],
    outputs: [{ name: 'isValid_', type: 'bool' }]
  }
] as const;

export interface EnzymeDebugInfo {
  vaultAddress: string;
  comptrollerAddress: string;
  denominationAsset: string;
  userAddress: string;
  userBalance: string;
  userAllowance: string;
  sharePrice: string;
  totalSupply: string;
  userShares: string;
  isValidDeposit: boolean;
  errors: string[];
  policies?: string[];
  policyChecks?: { [key: string]: boolean };
}

export async function debugEnzymeVault(
  provider: ethers.Provider,
  vaultAddress: string,
  userAddress: string,
  depositAmount: string,
  tokenDecimals: number
): Promise<EnzymeDebugInfo> {
  const errors: string[] = [];
  let debugInfo: Partial<EnzymeDebugInfo> = {
    vaultAddress,
    userAddress,
    errors,
    policies: [],
    policyChecks: {}
  };

  try {
    // Create contract instances
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, provider);
    
    // Get comptroller address
    const comptrollerAddress = await vaultContract.getAccessor();
    debugInfo.comptrollerAddress = comptrollerAddress;
    
    const comptrollerContract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
    
    // Get denomination asset
    const denominationAsset = await comptrollerContract.getDenominationAsset();
    debugInfo.denominationAsset = denominationAsset;
    
    const tokenContract = new ethers.Contract(denominationAsset, ERC20_ABI, provider);
    
    // Get user balances and allowances
    const [balance, allowance, sharePrice, totalSupply, userShares] = await Promise.all([
      tokenContract.balanceOf(userAddress),
      tokenContract.allowance(userAddress, comptrollerAddress),
      comptrollerContract.calcGrossShareValue(),
      vaultContract.totalSupply(),
      vaultContract.balanceOf(userAddress)
    ]);
    
    debugInfo.userBalance = ethers.formatUnits(balance, tokenDecimals);
    debugInfo.userAllowance = ethers.formatUnits(allowance, tokenDecimals);
    debugInfo.sharePrice = ethers.formatUnits(sharePrice, tokenDecimals);
    debugInfo.totalSupply = ethers.formatUnits(totalSupply, 18);
    debugInfo.userShares = ethers.formatUnits(userShares, 18);
    
    // Validate deposit
    const amountWei = ethers.parseUnits(depositAmount, tokenDecimals);
    
    if (balance < amountWei) {
      errors.push(`Insufficient balance: ${debugInfo.userBalance} < ${depositAmount}`);
    }
    
    if (allowance < amountWei) {
      errors.push(`Insufficient allowance: ${debugInfo.userAllowance} < ${depositAmount}`);
    }

    // Check for vault policies that might block deposits
    try {
      // Try to get policy manager address (this is a known address on Arbitrum)
      const POLICY_MANAGER_ADDRESS = '0xa69944d328b0045bd87c051b241055d3123b68a1'; // Arbitrum PolicyManager
      const policyManagerContract = new ethers.Contract(POLICY_MANAGER_ADDRESS, POLICY_MANAGER_ABI, provider);
      
      try {
        const enabledPolicies = await policyManagerContract.getEnabledPoliciesForFund(comptrollerAddress);
        debugInfo.policies = enabledPolicies;
        
        if (enabledPolicies.length > 0) {
          
          // Check each policy
          for (const policyAddress of enabledPolicies) {
            try {
              // Try to check if this is an investor whitelist policy
              const policyContract = new ethers.Contract(policyAddress, INVESTOR_WHITELIST_ABI, provider);
              const passesRule = await policyContract.passesRule(comptrollerAddress, userAddress, amountWei);
              debugInfo.policyChecks![policyAddress] = passesRule;
              
              if (!passesRule) {
                errors.push(`Policy ${policyAddress} blocks this deposit`);
              }
            } catch (policyError) {
              console.log(`Could not check policy ${policyAddress}:`, policyError);
            }
          }
        }
      } catch (policyError) {
        console.log('Could not fetch vault policies:', policyError);
      }
    } catch (policyManagerError) {
      console.log('Could not access policy manager:', policyManagerError);
    }

    // Check if vault owner allows deposits
    try {
      const vaultOwner = await vaultContract.getOwner();
      
      // Check if the vault is a "private" vault (owner-only deposits)
      if (vaultOwner.toLowerCase() !== userAddress.toLowerCase()) {
        console.log('⚠️ You are not the vault owner. This might be a private vault.');
      }
    } catch (ownerError) {
      console.log('Could not get vault owner:', ownerError);
    }

    // Try to estimate gas for deposit
    try {
      const expectedShares = (amountWei * ethers.parseUnits('1', 18)) / sharePrice;
      const minShares = (expectedShares * BigInt(99)) / BigInt(100); // 1% slippage
      
      // Check if provider has getSigner method (for JsonRpcProvider)
      if ('getSigner' in provider && typeof provider.getSigner === 'function') {
        const signer = await provider.getSigner();
        const vaultWithSigner = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, signer);
        
        // Try buyShares first
        try {
          await vaultWithSigner.buyShares.estimateGas(amountWei, minShares);
          console.log('✅ buyShares gas estimation successful');
        } catch (buySharesError) {
          console.log('❌ buyShares gas estimation failed:', buySharesError);
          
          // Try deposit as fallback
          try {
            await vaultWithSigner.deposit.estimateGas(amountWei, minShares);
          } catch (depositError) {
            errors.push(`Both buyShares and deposit gas estimation failed`);
          }
        }
      } else {
        console.log('Provider does not support getSigner, skipping gas estimation');
      }
    } catch (gasError) {
      errors.push(`Gas estimation failed: ${gasError instanceof Error ? gasError.message : 'Unknown error'}`);
    }
    
    debugInfo.isValidDeposit = errors.length === 0;
    
  } catch (error) {
    errors.push(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    debugInfo.isValidDeposit = false;
  }
  
  return debugInfo as EnzymeDebugInfo;
}

export function logEnzymeDebugInfo(debugInfo: EnzymeDebugInfo) {
  console.group('🔍 Enzyme Vault Debug Information');
  
  if (debugInfo.policies && debugInfo.policies.length > 0) {
    console.group('🔒 Vault Policies:');
    debugInfo.policies.forEach(policy => {
      const passes = debugInfo.policyChecks?.[policy];
      console.log(`${policy}: ${passes !== undefined ? (passes ? '✅ Passes' : '❌ Blocks') : '❓ Unknown'}`);
    });
    console.groupEnd();
  }
  
  if (debugInfo.errors.length > 0) {
    console.group('❌ Errors:');
    debugInfo.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  console.groupEnd();
}

export function getDepositRecommendations(debugInfo: EnzymeDebugInfo): string[] {
  const recommendations: string[] = [];
  
  // Check for common issues and provide recommendations
  if (debugInfo.errors.some(error => error.includes('Policy') && error.includes('blocks'))) {
    recommendations.push('🔒 POLICY RESTRICTION: This vault has policies that prevent your deposit. You may need to:');
    recommendations.push('   • Be added to an investor whitelist by the vault owner');
    recommendations.push('   • Meet minimum deposit requirements');
    recommendations.push('   • Contact the vault manager for access');
  }
  
  if (debugInfo.errors.some(error => error.includes('Insufficient allowance'))) {
    recommendations.push('💰 ALLOWANCE ISSUE: Approve the vault to spend your tokens first');
  }
  
  if (debugInfo.errors.some(error => error.includes('Insufficient balance'))) {
    recommendations.push('💸 BALANCE ISSUE: You need more tokens to make this deposit');
  }
  
  if (debugInfo.errors.some(error => error.includes('gas estimation failed'))) {
    recommendations.push('⛽ TRANSACTION ISSUE: The deposit transaction would fail. Possible causes:');
    recommendations.push('   • Vault is private/restricted');
    recommendations.push('   • Vault has deposit policies blocking you');
    recommendations.push('   • Vault is paused or has other restrictions');
    recommendations.push('   • Wrong vault address or network');
  }
  
  // Check if no specific errors but still failing
  if (debugInfo.errors.length === 0 && !debugInfo.isValidDeposit) {
    recommendations.push('❓ UNKNOWN ISSUE: Basic checks pass but deposit still fails');
    recommendations.push('   • Try a smaller deposit amount');
    recommendations.push('   • Check if vault has minimum deposit requirements');
    recommendations.push('   • Verify you\'re on the correct network (Arbitrum)');
  }
  
  // If vault has policies but we couldn't check them
  if (debugInfo.policies && debugInfo.policies.length > 0) {
    const unknownPolicies = debugInfo.policies.filter(policy => 
      debugInfo.policyChecks?.[policy] === undefined
    );
    
    if (unknownPolicies.length > 0) {
      recommendations.push('🔍 POLICY CHECK NEEDED: Some vault policies could not be verified');
      recommendations.push('   • Contact the vault owner to confirm access requirements');
    }
  }
  
  return recommendations;
}

export function logDepositRecommendations(debugInfo: EnzymeDebugInfo) {
  const recommendations = getDepositRecommendations(debugInfo);
  
  if (recommendations.length > 0) {
    console.group('💡 Recommendations to Fix Deposit Issues:');
    recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
} 