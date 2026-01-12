import { supportedChains } from '../config/chains'
import type { SavedVault } from '../hooks/useVaultHistory'

interface VaultInputProps {
  vaultAddress: string
  setVaultAddress: (address: string) => void
  chainId: number
  setChainId: (chainId: number) => void
  savedVaults: SavedVault[]
  onSelectVault: (vault: SavedVault) => void
  onRemoveVault: (address: string, chainId: number) => void
}

export function VaultInput({
  vaultAddress,
  setVaultAddress,
  chainId,
  setChainId,
  savedVaults,
  onSelectVault,
  onRemoveVault,
}: VaultInputProps) {
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(vaultAddress)

  const getChainName = (id: number) => {
    const chain = supportedChains.find((c) => c.id === id)
    return chain?.name ?? `Chain ${id}`
  }

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

      {savedVaults.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Saved Vaults
          </label>
          <div className="space-y-2">
            {savedVaults.map((vault) => (
              <div
                key={`${vault.chainId}-${vault.address}`}
                className={`flex items-center gap-2 p-3 bg-gray-800 border rounded-lg cursor-pointer hover:bg-gray-750 transition-colors ${
                  vaultAddress.toLowerCase() === vault.address.toLowerCase() && chainId === vault.chainId
                    ? 'border-blue-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => onSelectVault(vault)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">{vault.name}</span>
                    <span className="text-gray-500 text-sm">({vault.symbol})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-1.5 py-0.5 bg-gray-700 rounded">{getChainName(vault.chainId)}</span>
                    <span className="font-mono truncate">{vault.address.slice(0, 10)}...{vault.address.slice(-8)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveVault(vault.address, vault.chainId)
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Remove from saved"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
