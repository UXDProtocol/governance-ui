import { GovernedMultiTypeAccount } from '@utils/tokens'
import { useCallback, useEffect, useState } from 'react'
import useGovernanceAssets from './useGovernanceAssets'

export default function useGovernedMultiTypeAccounts() {
  const {
    getMintWithGovernances,
    governancesArray,
    governedTokenAccounts,
  } = useGovernanceAssets()

  const [governedMultiTypeAccounts, setGovernedMultiTypeAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])

  const getGovernedMultiTypeAccounts = useCallback(async (): Promise<
    GovernedMultiTypeAccount[]
  > => {
    const mintWithGovernances = await getMintWithGovernances()

    return governancesArray.map((gov) => {
      const governedTokenAccount = governedTokenAccounts.find(
        (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
      )
      if (governedTokenAccount) {
        return governedTokenAccount as GovernedMultiTypeAccount
      }

      const mintGovernance = mintWithGovernances.find(
        (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
      )
      if (mintGovernance) {
        return mintGovernance as GovernedMultiTypeAccount
      }

      return {
        governance: gov,
      }
    })
  }, [JSON.stringify(governedTokenAccounts), JSON.stringify(governancesArray)])

  useEffect(() => {
    let abort = false

    ;(async () => {
      const governedMultiTypeAccounts = await getGovernedMultiTypeAccounts()

      if (abort) return

      setGovernedMultiTypeAccounts(governedMultiTypeAccounts)
    })()

    return () => {
      abort = true
    }
  }, [getGovernedMultiTypeAccounts])

  return {
    governedMultiTypeAccounts,
  }
}
