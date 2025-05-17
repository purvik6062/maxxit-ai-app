"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { ProgressProvider } from "@bprogress/next/app";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ProgressProvider
      height="4px"
      color="#2299dd"
      options={{ showSpinner: true }}
      shallowRouting
    >
      {children}
      <Toaster />
    </ProgressProvider>
  );
}
