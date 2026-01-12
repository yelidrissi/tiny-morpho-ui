import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSwitchChain } from 'wagmi'
import { isAddress, type Address } from 'viem'
import { supportedChains } from './config/chains'
import { useVault } from './hooks/useVault'
import { useVaultHistory, type SavedVault } from './hooks/useVaultHistory'
import { VaultInput } from './components/VaultInput'
import { VaultInfo } from './components/VaultInfo'
import { DepositForm } from './components/DepositForm'
import { WithdrawForm } from './components/WithdrawForm'

function App() {
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { vaults: savedVaults, addVault, removeVault } = useVaultHistory()
  const [vaultAddress, setVaultAddress] = useState('')
  const [chainId, setChainId] = useState<number>(supportedChains[0].id)

  const validVaultAddress = isAddress(vaultAddress) ? vaultAddress as Address : undefined

  const vault = useVault(validVaultAddress, chainId)

  // Save vault to history when it loads successfully
  useEffect(() => {
    if (validVaultAddress && vault.vaultName && vault.vaultSymbol && vault.assetSymbol) {
      addVault({
        address: validVaultAddress,
        chainId,
        name: vault.vaultName,
        symbol: vault.vaultSymbol,
        assetSymbol: vault.assetSymbol,
      })
    }
  }, [validVaultAddress, chainId, vault.vaultName, vault.vaultSymbol, vault.assetSymbol, addVault])

  const handleRefresh = () => {
    vault.refetch()
  }

  const handleChainChange = (newChainId: number) => {
    setChainId(newChainId)
    if (isConnected) {
      switchChain({ chainId: newChainId })
    }
  }

  const handleSelectVault = (saved: SavedVault) => {
    setVaultAddress(saved.address)
    handleChainChange(saved.chainId)
  }

  const handleRemoveVault = (address: string, vaultChainId: number) => {
    removeVault(address, vaultChainId)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Morpho Vault</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <VaultInput
          vaultAddress={vaultAddress}
          setVaultAddress={setVaultAddress}
          chainId={chainId}
          setChainId={handleChainChange}
          savedVaults={savedVaults}
          onSelectVault={handleSelectVault}
          onRemoveVault={handleRemoveVault}
        />

        {validVaultAddress && (
          <>
            <VaultInfo
              vaultName={vault.vaultName}
              vaultSymbol={vault.vaultSymbol}
              assetSymbol={vault.assetSymbol}
              assetDecimals={vault.assetDecimals}
              vaultDecimals={vault.vaultDecimals}
              userShares={vault.userShares}
              userSharesValue={vault.userSharesValue}
              userAssetBalance={vault.userAssetBalance}
              isLoading={vault.isLoading}
              isError={vault.isError}
            />

            {isConnected && vault.assetAddress && vault.assetSymbol && vault.assetDecimals && (
              <div className="grid gap-6 md:grid-cols-2">
                <DepositForm
                  vaultAddress={validVaultAddress}
                  assetAddress={vault.assetAddress}
                  assetSymbol={vault.assetSymbol}
                  assetDecimals={vault.assetDecimals}
                  userAssetBalance={vault.userAssetBalance ?? 0n}
                  userAllowance={vault.userAllowance ?? 0n}
                  onSuccess={handleRefresh}
                />

                {vault.userShares !== undefined && vault.userSharesValue !== undefined && vault.vaultSymbol && vault.vaultDecimals && (
                  <WithdrawForm
                    vaultAddress={validVaultAddress}
                    assetSymbol={vault.assetSymbol}
                    assetDecimals={vault.assetDecimals}
                    vaultDecimals={vault.vaultDecimals}
                    userShares={vault.userShares}
                    userSharesValue={vault.userSharesValue}
                    vaultSymbol={vault.vaultSymbol}
                    onSuccess={handleRefresh}
                  />
                )}
              </div>
            )}

            {!isConnected && vault.vaultName && (
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
                <p className="text-gray-400">Connect your wallet to deposit or withdraw</p>
              </div>
            )}
          </>
        )}

        {!validVaultAddress && vaultAddress === '' && (
          <div className="p-8 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">Enter a Morpho Vault address to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
