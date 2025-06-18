// TypeScript declarations for window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
