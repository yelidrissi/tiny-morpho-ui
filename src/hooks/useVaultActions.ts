import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc4626Abi } from '../abi/erc4626'
import { erc20Abi } from '../abi/erc20'
import type { Address } from 'viem'

export function useVaultActions() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (
    assetAddress: Address,
    spender: Address,
    amount: bigint
  ) => {
    writeContract({
      address: assetAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  const deposit = (
    vaultAddress: Address,
    amount: bigint,
    receiver: Address
  ) => {
    writeContract({
      address: vaultAddress,
      abi: erc4626Abi,
      functionName: 'deposit',
      args: [amount, receiver],
    })
  }

  const withdraw = (
    vaultAddress: Address,
    amount: bigint,
    receiver: Address,
    owner: Address
  ) => {
    writeContract({
      address: vaultAddress,
      abi: erc4626Abi,
      functionName: 'withdraw',
      args: [amount, receiver, owner],
    })
  }

  const redeem = (
    vaultAddress: Address,
    shares: bigint,
    receiver: Address,
    owner: Address
  ) => {
    writeContract({
      address: vaultAddress,
      abi: erc4626Abi,
      functionName: 'redeem',
      args: [shares, receiver, owner],
    })
  }

  return {
    approve,
    deposit,
    withdraw,
    redeem,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  }
}
