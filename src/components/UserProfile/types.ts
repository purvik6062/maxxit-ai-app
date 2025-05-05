export interface Subscription {
  twitterHandle: string;
  subscriptionDate: Date;
  expiryDate: Date;
  leadsCount?: number; // new field for lead count
}

export interface WeeklyStats {
  activeSubscriptions: number;
  totalLeads: number;
  exitedTradesCount: number;
  profitableTradesCount: number;
  totalPnL: number;
  weekStart: string;
  weekEnd: string;
}

export interface UserProfile {
  _id: string;
  walletAddress?: string;
  twitterId: string;
  telegramId: string;
  chatId: number;
  credits: number;
  subscribedAccounts: Subscription[];
  createdAt: Date;
  updatedAt: Date;
  apiKey?: string;
  apiEndpoint?: string;
}
