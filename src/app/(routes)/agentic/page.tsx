import AgenticMain from '@/components/Agentic/AgenticMain'
import { WalletProvider } from '@/components/enzyme/WalletConnector'
import React from 'react'

function AgenticPage() {
  return (
    <WalletProvider>
      <AgenticMain />
    </WalletProvider>
  )
}

export default AgenticPage