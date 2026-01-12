import { formatUnits } from 'viem'

interface VaultInfoProps {
  vaultName?: string
  vaultSymbol?: string
  assetSymbol?: string
  assetDecimals?: number
  vaultDecimals?: number
  userShares?: bigint
  userSharesValue?: bigint
  userAssetBalance?: bigint
  isLoading: boolean
  isError: boolean
}

export function VaultInfo({
  vaultName,
  vaultSymbol,
  assetSymbol,
  assetDecimals,
  vaultDecimals,
  userShares,
  userSharesValue,
  userAssetBalance,
  isLoading,
  isError,
}: VaultInfoProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Loading vault info...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-900/20 rounded-lg border border-red-800">
        <p className="text-red-400">Failed to load vault. Make sure the address is correct and you're on the right chain.</p>
      </div>
    )
  }

  if (!vaultName) {
    return null
  }

  const assetDec = assetDecimals ?? 18
  const vaultDec = vaultDecimals ?? 18

  const formatBalance = (value: bigint | undefined) => {
    if (value === undefined) return '-'
    const formatted = formatUnits(value, assetDec)
    const num = parseFloat(formatted)
    if (num === 0) return '0'
    if (num < 0.0001) return '<0.0001'
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }

  const formatShares = (value: bigint | undefined) => {
    if (value === undefined) return '-'
    const formatted = formatUnits(value, vaultDec)
    const num = parseFloat(formatted)
    if (num === 0) return '0'
    if (num < 0.0001) return '<0.0001'
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{vaultName}</h3>
        <span className="text-sm text-gray-400">{vaultSymbol}</span>
      </div>

      <div className="text-sm text-gray-400">
        Underlying asset: <span className="text-white">{assetSymbol}</span>
      </div>

      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Your {assetSymbol} balance:</span>
          <span className="text-white font-mono">
            {formatBalance(userAssetBalance)} {assetSymbol}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Your vault shares:</span>
          <span className="text-white font-mono">
            {formatShares(userShares)} {vaultSymbol}
          </span>
        </div>

        {userShares !== undefined && userShares > 0n && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Shares value:</span>
            <span className="text-green-400 font-mono">
              ~{formatBalance(userSharesValue)} {assetSymbol}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
