"use client";

import { EthersProvider } from '@/providers/EthersProvider';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <EthersProvider>
      {children}
    </EthersProvider>
  );
} 