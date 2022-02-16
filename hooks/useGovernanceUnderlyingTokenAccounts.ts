import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
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

export type OwnedTokenAccountsInfo = {
  [key: string]: OwnedTokenAccountInfo
}

function getSplTokenNameFromConstant(tokenMint: PublicKey): string {
  return (
    Object.values(SPL_TOKENS).find(({ mint }) => mint.equals(tokenMint))
      ?.name ?? 'Unknown'
  )
}

async function getMultipleMintsInfo(
  mints: PublicKey[],
  connection: Connection
) {
  const mintInfos = await Promise.all(
    mints.map((mint) => tryGetMint(connection, mint))
  )

  return mintInfos.reduce(
    (mintInfos, mintInfo, index) => {
      if (!mintInfo) {
        throw new Error(
          `Cannot load mint info about ${mints[index].toString()}`
        )
      }

      const {
        publicKey,
        account: { decimals },
      } = mintInfo

      return {
        ...mintInfos,

        [publicKey.toString()]: {
          mint: publicKey,
          decimals,
          name: getSplTokenNameFromConstant(publicKey),
        },
      }
    },
    {} as {
      [key: string]: {
        mint: PublicKey
        decimals: number
        name: string
      }
    }
  )
}

// Loads all the token accounts related to the governance public key
export default function useGovernanceUnderlyingTokenAccounts(
  governancePk?: PublicKey
) {
  const connection = useWalletStore((state) => state.connection)

  const [
    ownedTokenAccountsInfo,
    setOwnedTokenAccountsInfo,
  ] = useState<OwnedTokenAccountsInfo | null>(null)

  const getOwnedTokenAccountsFn = useCallback(async () => {
    if (!connection || !governancePk) return null

    const accounts = await getOwnedTokenAccounts(
      connection.current,
      governancePk
    )

    // Create a map with all token accounts info
    const ownedTokenAccountsInfo = accounts.reduce(
      (ownedTokenAccountsInfo, { publicKey, account: { mint, amount } }) => ({
        ...ownedTokenAccountsInfo,

        [publicKey.toString()]: {
          pubkey: publicKey,
          amount: new BN(amount.toString()),
          mint,
        },
      }),
      {} as {
        [key: string]: Pick<OwnedTokenAccountInfo, 'pubkey' | 'amount' | 'mint'>
      }
    )

    const uniqueMintList = Array.from(
      Object.values(ownedTokenAccountsInfo).reduce(
        (tmp, { mint }) => tmp.add(mint),
        new Set()
      )
    ) as PublicKey[]

    // Get decimal/name information about the mint
    const mintsInfo = await getMultipleMintsInfo(
      uniqueMintList,
      connection.current
    )

    // Merge mint info with ownedTokenAccountsInfo
    return Object.entries(ownedTokenAccountsInfo).reduce(
      (ownedTokenAccountsInfo, [pubkeyString, ownedTokenAccountInfo]) => {
        const { decimals: mintDecimals, name: mintName } = mintsInfo[
          ownedTokenAccountInfo.mint.toString()
        ]

        const [ata] = findATAAddrSync(governancePk, ownedTokenAccountInfo.mint)

        return {
          ...ownedTokenAccountsInfo,

          [pubkeyString]: {
            ...ownedTokenAccountInfo,

            mintDecimals,
            mintName,
            uiAmount: new BigNumber(ownedTokenAccountInfo.amount.toString())
              .shiftedBy(-mintDecimals)
              .toNumber(),

            isATA: ata.equals(ownedTokenAccountInfo.pubkey),
          },
        }
      },
      {} as OwnedTokenAccountsInfo
    )
  }, [connection, governancePk])

  useEffect(() => {
    getOwnedTokenAccountsFn().then(setOwnedTokenAccountsInfo)
  }, [getOwnedTokenAccountsFn])

  return {
    ownedTokenAccountsInfo,
  }
}
