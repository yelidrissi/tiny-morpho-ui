import { supportedChains } from '../config/chains'

interface VaultInputProps {
  vaultAddress: string
  setVaultAddress: (address: string) => void
  chainId: number
  setChainId: (chainId: number) => void
}

export function VaultInput({
  vaultAddress,
  setVaultAddress,
  chainId,
  setChainId,
}: VaultInputProps) {
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(vaultAddress)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Chain
        </label>
        <select
          value={chainId}
          onChange={(e) => setChainId(Number(e.target.value))}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {supportedChains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Vault Address
        </label>
        <input
          type="text"
          value={vaultAddress}
          onChange={(e) => setVaultAddress(e.target.value)}
          placeholder="0x..."
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
            vaultAddress && !isValidAddress
              ? 'border-red-500'
              : 'border-gray-700'
          }`}
        />
        {vaultAddress && !isValidAddress && (
          <p className="mt-1 text-sm text-red-400">Invalid address format</p>
        )}
      </div>
    </div>
  )
}
