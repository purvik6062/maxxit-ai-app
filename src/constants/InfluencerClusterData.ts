export type Influencer = {
  id: string;
  name: string;
  profit: number;
  followers: number;
  accuracy: number;
  recentPredictions: number;
  avatar: string;
  specialties: string[];
};

export const influencerData: Influencer[] = [
  // ... (same influencer data as provided)
  {
    id: "inf1",
    name: "CryptoMaster",
    profit: 18320,
    followers: 245000,
    accuracy: 92,
    recentPredictions: 24,
    avatar: "https://picsum.photos/id/300/200",
    specialties: ["Bitcoin", "Ethereum", "Altcoins"],
  },
  {
    id: "inf2",
    name: "TokenWhisperer",
    profit: 15100,
    followers: 198000,
    accuracy: 89,
    recentPredictions: 31,
    avatar: "https://picsum.photos/id/600/200",
    specialties: ["DeFi", "NFTs", "Solana"],
  },
  {
    id: "inf3",
    name: "BlockchainOracle",
    profit: 12750,
    followers: 173000,
    accuracy: 87,
    recentPredictions: 19,
    avatar: "https://picsum.photos/id/400/200",
    specialties: ["Technical Analysis", "Long-term Holds", "Market Cycles"],
  },
  {
    id: "inf4",
    name: "CoinVoyager",
    profit: 10820,
    followers: 156000,
    accuracy: 84,
    recentPredictions: 27,
    avatar: "https://picsum.photos/id/300/300",
    specialties: ["Emerging Markets", "Layer 2", "Gaming Tokens"],
  },
  {
    id: "inf5",
    name: "SatoshiDisciple",
    profit: 9650,
    followers: 132000,
    accuracy: 83,
    recentPredictions: 22,
    avatar: "https://picsum.photos/id/300/400",
    specialties: ["Bitcoin", "Mining", "On-chain Analysis"],
  },
  {
    id: "inf6",
    name: "AltcoinArchitect",
    profit: 8340,
    followers: 118000,
    accuracy: 81,
    recentPredictions: 29,
    avatar: "https://picsum.photos/id/500/300",
    specialties: ["Altcoins", "ICOs", "New Listings"],
  },
];
