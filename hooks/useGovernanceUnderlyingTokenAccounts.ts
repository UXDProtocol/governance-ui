import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { getOwnedTokenAccounts, tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import { SPL_TOKENS } from '@utils/splTokens'
import { BN } from '@project-serum/anchor'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'

export type OwnedTokenAccountInfo = {
  pubkey: PublicKey
  mint: PublicKey
  amount: BN
  uiAmount: number
  mintDecimals: number
  mintName: string

  // could be either the Associated Token Account of the mint
  // or a Token Account
  isATA: boolean
}

export type OwnedTokenAccountInfos = OwnedTokenAccountInfo[]

// Loads all the token accounts related to the governance public key
export default function useGovernanceUnderlyingTokenAccounts(
  governancePk: PublicKey | null
) {
  const connection = useWalletStore((state) => state.connection)

  const [
    ownedTokenAccounts,
    setOwnedTokenAccounts,
  ] = useState<OwnedTokenAccountInfos | null>(null)

  const getOwnedTokenAccountsFn = useCallback(async () => {
    if (!connection || !governancePk) return null

    const accounts = await getOwnedTokenAccounts(
      connection.current,
      governancePk
    )

    const ownedTokenAccountInfos = accounts.map((x) => ({
      pubkey: x.publicKey,
      mint: x.account.mint,
      amount: new BN(x.account.amount.toString()),
    }))

    const mints = Array.from(
      ownedTokenAccountInfos.reduce((tmp, x) => tmp.add(x.mint), new Set())
    ) as PublicKey[]

    const mintInfos = await Promise.all(
      mints.map((mint) => tryGetMint(connection.current, mint))
    )

    return ownedTokenAccountInfos.map((accountInfo) => {
      const mintDecimals = mintInfos.find((mintInfo) =>
        mintInfo?.publicKey.equals(accountInfo.mint)
      )!.account.decimals

      const mintName =
        Object.values(SPL_TOKENS).find(({ mint }) =>
          mint.equals(accountInfo.mint)
        )?.name ?? 'Unknown'

      const [ata] = findATAAddrSync(governancePk, accountInfo.mint)

      return {
        ...accountInfo,
        mintDecimals,
        mintName,
        uiAmount: new BigNumber(accountInfo.amount.toString())
          .shiftedBy(-mintDecimals)
          .toNumber(),

        isATA: ata.equals(accountInfo.pubkey),
      }
    })
  }, [connection, governancePk])

  useEffect(() => {
    getOwnedTokenAccountsFn().then(setOwnedTokenAccounts)
  }, [getOwnedTokenAccountsFn])

  return {
    ownedTokenAccounts,
  }
}
