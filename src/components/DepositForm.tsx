import { useState, useEffect } from 'react'
import { parseUnits, formatUnits, maxUint256, type Address } from 'viem'
import { useAccount } from 'wagmi'
import { useVaultActions } from '../hooks/useVaultActions'

interface DepositFormProps {
  vaultAddress: Address
  assetAddress: Address
  assetSymbol: string
  assetDecimals: number
  userAssetBalance: bigint
  userAllowance: bigint
  onSuccess: () => void
}

const MAX_APPROVAL_THRESHOLD = maxUint256 / 2n

export function DepositForm({
  vaultAddress,
  assetAddress,
  assetSymbol,
  assetDecimals,
  userAssetBalance,
  userAllowance,
  onSuccess,
}: DepositFormProps) {
  const { address: userAddress } = useAccount()
  const [amount, setAmount] = useState('')
  const [unlimitedApproval, setUnlimitedApproval] = useState(true)
  const { approve, deposit, isPending, isConfirming, isSuccess, error, reset } = useVaultActions()
  const [pendingAction, setPendingAction] = useState<'approve' | 'revoke' | 'deposit' | null>(null)

  const parsedAmount = (() => {
    try {
      if (!amount || parseFloat(amount) === 0) return 0n
      return parseUnits(amount, assetDecimals)
    } catch {
      return 0n
    }
  })()

  const hasInsufficientBalance = parsedAmount > userAssetBalance
  const isValidAmount = parsedAmount > 0n && !hasInsufficientBalance
  const needsApproval = parsedAmount > 0n && userAllowance < parsedAmount
  const hasUnlimitedApproval = userAllowance >= MAX_APPROVAL_THRESHOLD

  // Format allowance for display
  const displayAllowance = hasUnlimitedApproval
    ? 'Unlimited'
    : parseFloat(formatUnits(userAllowance, assetDecimals)).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      })

  useEffect(() => {
    if (isSuccess) {
      if (pendingAction === 'approve' || pendingAction === 'revoke') {
        reset()
        setPendingAction(null)
        onSuccess() // Refresh to get new allowance
      } else if (pendingAction === 'deposit') {
        setAmount('')
        onSuccess()
        reset()
        setPendingAction(null)
      }
    }
  }, [isSuccess, pendingAction, onSuccess, reset])

  const handleApprove = () => {
    if (!userAddress) return
    setPendingAction('approve')
    const approvalAmount = unlimitedApproval ? maxUint256 : parsedAmount
    approve(assetAddress, vaultAddress, approvalAmount)
  }

  const handleDeposit = () => {
    if (!userAddress || !isValidAmount) return
    setPendingAction('deposit')
    deposit(vaultAddress, parsedAmount, userAddress)
  }

  const handleMax = () => {
    setAmount(formatUnits(userAssetBalance, assetDecimals))
  }

  const formattedBalance = formatUnits(userAssetBalance, assetDecimals)
  const displayBalance = parseFloat(formattedBalance).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })

  const isApproving = (isPending || isConfirming) && pendingAction === 'approve'
  const isRevoking = (isPending || isConfirming) && pendingAction === 'revoke'
  const isDepositing = (isPending || isConfirming) && pendingAction === 'deposit'

  const handleRevoke = () => {
    if (!userAddress) return
    setPendingAction('revoke')
    approve(assetAddress, vaultAddress, 0n)
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
      <h3 className="text-lg font-semibold text-white">Deposit</h3>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Amount</span>
          <span className="text-gray-400">
            Balance: {displayBalance} {assetSymbol}
          </span>
        </div>
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className={`flex-1 min-w-0 px-4 h-12 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
              hasInsufficientBalance ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          <button
            onClick={handleMax}
            className="px-4 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            MAX
          </button>
        </div>
        {hasInsufficientBalance && (
          <p className="mt-1 text-sm text-red-400">Insufficient balance</p>
        )}
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Allowance:</span>
        <div className="flex items-center gap-2">
          <span className={hasUnlimitedApproval ? 'text-green-400' : 'text-gray-300'}>
            {displayAllowance} {!hasUnlimitedApproval && assetSymbol}
          </span>
          {userAllowance > 0n && (
            <button
              onClick={handleRevoke}
              disabled={isApproving || isRevoking || isDepositing}
              className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-50 transition-colors"
            >
              {isRevoking ? 'Revoking...' : 'Revoke'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 rounded-lg border border-red-800">
          <p className="text-sm text-red-400">
            {error.message.split('\n')[0]}
          </p>
        </div>
      )}

      {needsApproval && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={unlimitedApproval}
              onChange={(e) => setUnlimitedApproval(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
            />
            <span className="text-sm text-gray-300">Unlimited approval</span>
          </label>

          <button
            onClick={handleApprove}
            disabled={isApproving || isRevoking || isDepositing}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors"
          >
            {isApproving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Approving...
              </span>
            ) : (
              `Approve ${assetSymbol}`
            )}
          </button>
        </div>
      )}

      <button
        onClick={handleDeposit}
        disabled={!isValidAmount || needsApproval || isApproving || isRevoking || isDepositing}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {isDepositing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Depositing...
          </span>
        ) : (
          'Deposit'
        )}
      </button>
    </div>
  )
}
