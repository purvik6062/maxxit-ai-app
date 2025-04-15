export interface SignalData {
  _id: string;
  tokenId: string;
  entryPrice: number;
  exitPrice: number;
  pnl: string;
  reasoning: string;
  stopLoss: number;
  signalGenerationDate: string;
  takeProfit1: number;
  takeProfit2: number;
  ipfsLink: string;
}

export interface SignalResponse {
  signals: SignalData[];
  total: number;
  page: number;
  limit: number;
}
