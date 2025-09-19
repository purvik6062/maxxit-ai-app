"use client";

import { EthersProvider } from '@/providers/EthersProvider';
import { RainbowProvider } from './RainbowProvider';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    // <EthersProvider>
    <RainbowProvider>
      {children}
    </RainbowProvider>
    // </EthersProvider>
  );
} 