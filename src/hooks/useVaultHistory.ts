import { useState, useEffect, useCallback } from 'react'

export interface SavedVault {
  address: string
  chainId: number
  name: string
  symbol: string
  assetSymbol: string
}

const STORAGE_KEY = 'morpho-vault-history'

function loadVaults(): SavedVault[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveVaults(vaults: SavedVault[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vaults))
}

export function useVaultHistory() {
  const [vaults, setVaults] = useState<SavedVault[]>([])

  useEffect(() => {
    setVaults(loadVaults())
  }, [])

  const addVault = useCallback((vault: SavedVault) => {
    setVaults((prev) => {
      // Check if vault already exists (same address + chainId)
      const exists = prev.some(
        (v) => v.address.toLowerCase() === vault.address.toLowerCase() && v.chainId === vault.chainId
      )
      if (exists) {
        // Update existing vault info
        const updated = prev.map((v) =>
          v.address.toLowerCase() === vault.address.toLowerCase() && v.chainId === vault.chainId
            ? vault
            : v
        )
        saveVaults(updated)
        return updated
      }
      // Add new vault at the beginning
      const updated = [vault, ...prev]
      saveVaults(updated)
      return updated
    })
  }, [])

  const removeVault = useCallback((address: string, chainId: number) => {
    setVaults((prev) => {
      const updated = prev.filter(
        (v) => !(v.address.toLowerCase() === address.toLowerCase() && v.chainId === chainId)
      )
      saveVaults(updated)
      return updated
    })
  }, [])

  return { vaults, addVault, removeVault }
}
