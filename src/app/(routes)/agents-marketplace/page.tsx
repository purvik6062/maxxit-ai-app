import AllAgentsMarketplace from '@/components/Body/AllAgentsMarketplace'
import { WalletProvider } from '@/components/enzyme/WalletConnector'

function AgentsMarketplacePage() {
  return (
    <WalletProvider>
      <AllAgentsMarketplace />
    </WalletProvider>
  )
}

export default AgentsMarketplacePage