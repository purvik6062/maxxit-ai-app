"use client";

import React from 'react';
import { WalletProvider } from '@/components/enzyme/WalletConnector';
import { SafeWalletDeployment } from '@/components/Safe';

function CreateSafePage() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <SafeWalletDeployment />
        </div>
      </div>
    </WalletProvider>
  );
}

export default CreateSafePage;