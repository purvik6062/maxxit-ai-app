"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { ProgressProvider } from "@bprogress/next/app";
import { Web3Provider } from "@/providers/Web3Provider";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ProgressProvider
      height="4px"
      color="#2299dd"
      options={{ showSpinner: true }}
      shallowRouting
    >
      <Web3Provider>
        {children}
        <Toaster />
      </Web3Provider>
    </ProgressProvider>
  );
}
