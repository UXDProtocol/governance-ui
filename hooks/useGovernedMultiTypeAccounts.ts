import { GovernanceAccountType } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
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
      const governedTokenAccount = governedTokenAccounts.find((tokenAcc) =>
        tokenAcc.governance?.pubkey.equals(gov.pubkey)
      )
      if (governedTokenAccount) {
        return governedTokenAccount as GovernedMultiTypeAccount
      }

      const mintGovernance = mintWithGovernances.find((mint) =>
        mint.governance?.pubkey.equals(gov.pubkey)
      )
      if (mintGovernance) {
        return mintGovernance as GovernedMultiTypeAccount
      }

      return {
        governance: gov,
      }
    })

    // FIXME: `governedTokenAccounts` & `governancesArray` should have stable references.
    // These should respect immutability principles & only change if their content changes.
    // Working around this by stringifying both objects & using the resulting string
    // representation as hook dependency, so the hook only runs when either of these changes,
    // but with a performance tax unfortunately
  }, [JSON.stringify(governedTokenAccounts), JSON.stringify(governancesArray)])

  useEffect(() => {
    // Ignore obsolete results created by race calls
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

  const getGovernedAccountPublicKey = useCallback((
    governedAccount: GovernedMultiTypeAccount | null,

    // can force the fact to use the owner for SOL Token Governance
    forceToUseSolTokenGovernanceOwner?: boolean
  ): PublicKey | null | undefined => {
    if (!governedAccount) {
      return null
    }

    const accountType = governedAccount.governance.account.accountType

    switch (accountType) {
      case GovernanceAccountType.MintGovernanceV1:
      case GovernanceAccountType.MintGovernanceV2:
        return governedAccount.governance.account.governedAccount
      case GovernanceAccountType.TokenGovernanceV1:
      case GovernanceAccountType.TokenGovernanceV2: {
        if (governedAccount.isSol && !forceToUseSolTokenGovernanceOwner) {
          return governedAccount.transferAddress
        }

        return governedAccount.governance.pubkey
      }
      case GovernanceAccountType.ProgramGovernanceV1:
      case GovernanceAccountType.ProgramGovernanceV2:
        // Use the owner of the program id
        return governedAccount.governance.pubkey
      // return governedAccount.governance.account.governedAccount
      default:
        return governedAccount.governance.pubkey
    }
  }, [])

  return {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  }
}
