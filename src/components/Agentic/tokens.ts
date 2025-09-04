export interface Token {
  id: string;
  name: string;
  symbol: string;
}

export const TOKENS: Token[] = [
  { id: "major", name: "Major Tokens", symbol: "Major Tokens" },
  { id: "memecoin", name: "Memecoins", symbol: "Memecoins" },
  { id: "bluechip", name: "Bluechips", symbol: "Bluechips" },
];
