import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import AccountItem from './AccountItem'
import SOLAccountItem from './SOLAccountItem'

const AccountsItems = () => {
  const { governedTokenAccounts } = useGovernanceAssets()
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([])

  useEffect(() => {
    async function prepTreasuryAccounts() {
      setTreasuryAccounts(governedTokenAccounts)
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccounts)])

  return (
    <div className="space-y-3">
      {treasuryAccounts.map((accountWithGovernance) => {
        if (accountWithGovernance.isSol) {
          return (
            <SOLAccountItem
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.governance?.pubkey.toBase58()}
            />
          )
        }

        return (
          <AccountItem
            governedAccountTokenAccount={accountWithGovernance}
            key={accountWithGovernance?.governance?.pubkey.toBase58()}
          />
        )
      })}
    </div>
  )
}

export default AccountsItems
