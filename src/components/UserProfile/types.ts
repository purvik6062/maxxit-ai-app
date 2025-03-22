export interface Subscription {
  twitterHandle: string;
  subscriptionDate: Date;
  expiryDate: Date;
  leadsCount?: number; // new field for lead count
}

export interface UserProfile {
  _id: string;
  walletAddress: string;
  telegramId: string;
  chatId: number;
  credits: number;
  subscribedAccounts: Subscription[];
  createdAt: Date;
  updatedAt: Date;
  apiKey?: string;
  apiEndpoint?: string;
}
