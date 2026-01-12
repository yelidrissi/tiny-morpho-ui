import { useReadContracts, useAccount } from 'wagmi'
import { erc4626Abi } from '../abi/erc4626'
import { erc20Abi } from '../abi/erc20'
import type { Address } from 'viem'

export function useVault(vaultAddress: Address | undefined, chainId: number | undefined) {
  const { address: userAddress } = useAccount()

  // Read vault info
  const vaultInfo = useReadContracts({
    contracts: vaultAddress && chainId ? [
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'name',
        chainId,
      },
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'symbol',
        chainId,
      },
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'asset',
        chainId,
      },
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'decimals',
        chainId,
      },
    ] : [],
    query: {
      enabled: !!vaultAddress && !!chainId,
    },
  })

  const assetAddress = vaultInfo.data?.[2]?.result as Address | undefined

  // Read asset token info
  const assetInfo = useReadContracts({
    contracts: assetAddress && chainId ? [
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId,
      },
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId,
      },
    ] : [],
    query: {
      enabled: !!assetAddress && !!chainId,
    },
  })

  // Read user balances
  const userBalances = useReadContracts({
    contracts: vaultAddress && assetAddress && userAddress && chainId ? [
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'balanceOf',
        args: [userAddress],
        chainId,
      },
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
        chainId,
      },
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, vaultAddress],
        chainId,
      },
    ] : [],
    query: {
      enabled: !!vaultAddress && !!assetAddress && !!userAddress && !!chainId,
    },
  })

  const userShares = userBalances.data?.[0]?.result as bigint | undefined

  // Convert shares to assets
  const sharesValue = useReadContracts({
    contracts: vaultAddress && userShares && userShares > 0n && chainId ? [
      {
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'convertToAssets',
        args: [userShares],
        chainId,
      },
    ] : [],
    query: {
      enabled: !!vaultAddress && !!userShares && userShares > 0n && !!chainId,
    },
  })

  const isLoading = vaultInfo.isLoading || assetInfo.isLoading || userBalances.isLoading
  const isError = vaultInfo.isError || (vaultInfo.data?.[0]?.error !== undefined)

  return {
    // Vault info
    vaultName: vaultInfo.data?.[0]?.result as string | undefined,
    vaultSymbol: vaultInfo.data?.[1]?.result as string | undefined,
    assetAddress,
    vaultDecimals: vaultInfo.data?.[3]?.result as number | undefined,

    // Asset info
    assetSymbol: assetInfo.data?.[0]?.result as string | undefined,
    assetDecimals: assetInfo.data?.[1]?.result as number | undefined,

    // User balances
    userShares,
    userSharesValue: sharesValue.data?.[0]?.result as bigint | undefined,
    userAssetBalance: userBalances.data?.[1]?.result as bigint | undefined,
    userAllowance: userBalances.data?.[2]?.result as bigint | undefined,

    // Status
    isLoading,
    isError,
    refetch: () => {
      vaultInfo.refetch()
      assetInfo.refetch()
      userBalances.refetch()
      sharesValue.refetch()
    },
  }
}
