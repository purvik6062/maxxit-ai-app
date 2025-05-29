# Enzyme Vault Deposit Troubleshooting Guide

## ✅ SOLUTION: Use ComptrollerProxy for Deposits

**The main issue causing "missing revert data" errors was calling deposit functions on the wrong contract.**

### Key Fix Applied:
1. **Deposits must go through the ComptrollerProxy, not the vault directly**
2. **Token approvals must be made to the ComptrollerProxy, not the vault**
3. **Use `buyShares()` function on the ComptrollerProxy**

### Before (Incorrect):
```javascript
// ❌ Wrong - calling vault directly
await vaultContract.buyShares(amount, minShares);
await tokenContract.approve(vaultAddress, amount);
```

### After (Correct):
```javascript
// ✅ Correct - using ComptrollerProxy
const comptrollerAddress = await vaultContract.getAccessor();
await tokenContract.approve(comptrollerAddress, amount);
await comptrollerContract.buyShares(amount, minShares);
```

## Common "Missing Revert Data" Error Solutions

When you encounter the "missing revert data in call exception" error with Enzyme vault deposits, it typically means the transaction is failing due to vault policies or restrictions, but the contract isn't providing a specific error message.

## Step-by-Step Troubleshooting

### 1. Use the Debug Tool
First, use the built-in debug functionality:
1. Open your browser's developer console (F12)
2. In the deposit form, click the "Debug Vault" button (visible in development mode)
3. Review the detailed output for specific issues

### 2. Check Common Issues

#### A. Vault Policies
**Problem**: The vault has policies that restrict who can deposit
**Solutions**:
- Contact the vault owner to be added to the investor whitelist
- Check if there are minimum deposit requirements
- Verify if the vault is public or private

#### B. Insufficient Allowance
**Problem**: The vault doesn't have permission to spend your tokens
**Solutions**:
- Click "Approve" before depositing
- Ensure the approval transaction completes successfully
- Check that the approved amount is sufficient

#### C. Wrong Function Name
**Problem**: Different Enzyme vault versions use different function names
**Solutions**:
- The code now automatically tries both `buyShares` and `deposit`
- Check console logs to see which function is being used

#### D. Network Issues
**Problem**: Wrong network or RPC issues
**Solutions**:
- Ensure you're connected to Arbitrum network
- Try switching RPC providers
- Check if the vault address is correct for Arbitrum

### 3. Vault-Specific Checks

#### Check Vault Owner
```javascript
// In browser console
const vaultContract = new ethers.Contract(vaultAddress, VAULT_PROXY_ABI, provider);
const owner = await vaultContract.getOwner();
console.log('Vault owner:', owner);
```

#### Check Your Address
```javascript
// Compare with your wallet address
console.log('Your address:', account);
console.log('Are you the owner?', owner.toLowerCase() === account.toLowerCase());
```

### 4. Policy Types That Can Block Deposits

1. **Investor Whitelist**: Only specific addresses can deposit
2. **Minimum Investment**: Deposit amount too small
3. **Maximum Investment**: Deposit amount too large
4. **Buy Shares Caller Whitelist**: Only specific callers allowed
5. **Asset Whitelist**: Only specific tokens allowed

### 5. Manual Checks

#### Check Vault on Enzyme App
1. Go to [app.enzyme.finance](https://app.enzyme.finance)
2. Search for your vault address
3. Check the vault's policies and settings
4. See if deposits are enabled

#### Verify Token Contract
1. Ensure you're using the correct denomination asset
2. Check token decimals match expectations
3. Verify sufficient balance and allowance

### 6. Advanced Debugging

#### Check Transaction Data
The error logs show transaction data like:
- `buyShares`: `0xbeebc5da...`
- `deposit`: `0xe2bbb158...`

This confirms the functions are being called correctly.

#### Gas Estimation
If gas estimation fails, it usually means:
- The transaction would revert
- Vault policies block the deposit
- Insufficient permissions

### 7. Common Solutions

#### For Private Vaults
- Contact the vault manager
- Request to be added to the whitelist
- Verify minimum deposit requirements

#### For Public Vaults
- Check if there are any deposit restrictions
- Ensure you meet minimum requirements
- Try a different deposit amount

#### For Technical Issues
- Clear browser cache
- Try a different wallet/browser
- Check network connectivity
- Verify contract addresses

### 8. When to Contact Support

Contact the vault owner or Enzyme support if:
- Debug tool shows policy restrictions
- You believe you should have access
- Technical issues persist after troubleshooting
- Vault appears misconfigured

### 9. Prevention

- Always test with small amounts first
- Verify vault policies before depositing
- Ensure you understand the vault's requirements
- Keep transaction receipts for reference

## Debug Output Interpretation

When using the debug tool, look for:
- ✅ Green checkmarks: Everything OK
- ❌ Red X marks: Issues found
- 🔒 Lock icons: Policy restrictions
- ⚠️ Warning signs: Potential issues

The debug tool will provide specific recommendations based on the issues found. 