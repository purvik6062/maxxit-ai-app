"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../wagmi";
import { Toaster } from "react-hot-toast";
import { ProgressProvider } from "@bprogress/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ProgressProvider
          height="4px"
          color="#2299dd"
          options={{ showSpinner: true }}
          shallowRouting
        >
          <RainbowKitProvider>
            {children}
            <Toaster />
          </RainbowKitProvider>
        </ProgressProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
