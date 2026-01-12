import { mainnet, base, arbitrum } from 'wagmi/chains'
import { http } from 'wagmi'

// Add new chains here - they will automatically appear in the UI
export const supportedChains = [mainnet, base, arbitrum] as const

export type SupportedChainId = (typeof supportedChains)[number]['id']

// Configure transports for each chain
export const transports = {
  [mainnet.id]: http(),
  [base.id]: http(),
  [arbitrum.id]: http(),
} as const
