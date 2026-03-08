import { mainnet, base, arbitrum } from 'wagmi/chains'
import { http } from 'wagmi'

// Add new chains here - they will automatically appear in the UI
export const supportedChains = [mainnet, base, arbitrum] as const

export type SupportedChainId = (typeof supportedChains)[number]['id']

// Configure transports for each chain
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY

export const transports = {
  [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
  [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`),
  [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`),
} as const
