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
    name: "cryptostasher",
    profit: 18320,
    followers: 245000,
    accuracy: 92,
    recentPredictions: 24,
    avatar: "https://pbs.twimg.com/profile_images/1855572086648897536/-EjWHVds.jpg",
    specialties: ["Bitcoin", "Ethereum", "Altcoins"],
  },
  {
    id: "inf2",
    name: "IncomeSharks",
    profit: 15100,
    followers: 198000,
    accuracy: 89,
    recentPredictions: 31,
    avatar: "https://pbs.twimg.com/profile_images/1356359564682092546/_h2xv58V.png",
    specialties: ["DeFi", "NFTs", "Solana"],
  },
  {
    id: "inf3",
    name: "CryptoGemRnld",
    profit: 12750,
    followers: 173000,
    accuracy: 87,
    recentPredictions: 19,
    avatar: "https://pbs.twimg.com/profile_images/1861626003405299712/imutkpc6.jpg",
    specialties: ["Technical Analysis", "Long-term Holds", "Market Cycles"],
  },
  {
    id: "inf4",
    name: "CryptoSlate",
    profit: 10820,
    followers: 156000,
    accuracy: 84,
    recentPredictions: 27,
    avatar: "https://pbs.twimg.com/profile_images/918797950821720064/s_rTndi0.jpg",
    specialties: ["Emerging Markets", "Layer 2", "Gaming Tokens"],
  },
  {
    id: "inf5",
    name: "holdersignals",
    profit: 9650,
    followers: 132000,
    accuracy: 83,
    recentPredictions: 22,
    avatar: "https://pbs.twimg.com/profile_images/1578285795844100096/5j37Z58o.jpg",
    specialties: ["Bitcoin", "Mining", "On-chain Analysis"],
  },
  {
    id: "inf6",
    name: "CryptoWizardd",
    profit: 8340,
    followers: 118000,
    accuracy: 81,
    recentPredictions: 29,
    avatar: "https://pbs.twimg.com/profile_images/1692319430611517440/WwOa201h.jpg",
    specialties: ["Altcoins", "ICOs", "New Listings"],
  },
];
