import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { supportedChains, transports } from './chains'

export const config = getDefaultConfig({
  appName: 'Morpho Vault',
  projectId: 'morpho-vault-ui', // WalletConnect project ID (get one at cloud.walletconnect.com)
  chains: supportedChains,
  transports,
})
