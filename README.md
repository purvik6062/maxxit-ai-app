# Maxxit Investment Platform

This is the frontend for the Maxxit Investment Platform, which allows users to connect their wallet and deposit/withdraw funds.

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Create a `.env.local` file in the root directory with the following environment variables:

```
# WalletConnect Project ID (Get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID

# Contract address on Sepolia network
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

3. Run the development server:

```bash
yarn dev
```

## Smart Contract Deployment

To deploy the MaxxitInvestmentWallet contract to the Sepolia network:

1. Install Hardhat and OpenZeppelin contracts:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers dotenv @openzeppelin/contracts
```

2. Create a `.env` file in the root directory with the following:

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

3. Create the necessary directories:

```bash
mkdir -p contracts scripts
```

4. Deploy the contract:

```bash
npx hardhat run src/scripts/deploy-contract.js --network sepolia
```

5. Update your `.env.local` file with the deployed contract address.

## Features

- Connect wallet using RainbowKit
- Deposit ETH to the investment contract
- Withdraw funds with minimal fees
- View investment balance and transaction history
- Secure smart contract management

## Smart Contract

The smart contract for this platform is deployed on the Sepolia network. The contract includes:

- Deposit functionality
- Withdrawal with configurable fees
- Balance tracking
- Admin controls

## Technology Stack

- Next.js
- RainbowKit
- wagmi
- Tailwind CSS
- Ethereum (Sepolia testnet)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/purvik6062/trading-minds-app)
