import { MintInfo, u64 } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
import { PublicKey } from '@solana/web3.js'
import { SPL_TOKENS } from '@utils/splTokens'
import {
  getOwnedTokenAccounts,
  TokenProgramAccount,
  tryGetMint,
} from '@utils/tokens'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import tokenService from '@utils/services/token'
import { BN } from '@project-serum/anchor'
import useRealm from './useRealm'

const HotWalletMap = {
  UXDProtocol: {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'),
  },
  'Kek World': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b'),
  },
}

export type HotWalletAccountInfo = {
  publicKey: PublicKey
  mint: PublicKey
  decimals: number
  amount: u64
  mintName?: string
  usdMintValue: number
  usdTotalValue: u64
}

function getSplTokenNameFromConstant(tokenMint: PublicKey): string | undefined {
  return Object.values(SPL_TOKENS).find(({ mint }) => mint.equals(tokenMint))
    ?.name
}

const useHotWallet = () => {
  const connection = useWalletStore((store) => store.connection)
  const [tokenAccountsInfo, setTokenAccountsInfo] = useState<
    HotWalletAccountInfo[] | null
  >(null)

  const { realm } = useRealm()

  const [hotWalletInfo, setHotWalletInfo] = useState<{
    name: string
    publicKey: PublicKey
  } | null>(null)

  useEffect(() => {
    if (!realm) return

    setHotWalletInfo(HotWalletMap[realm.account.name] ?? null)
  }, [realm])

  const loadTokenAccounts = useCallback(async () => {
    if (!connection.current || !hotWalletInfo) return

    const tokenAccounts = await getOwnedTokenAccounts(
      connection.current,
      hotWalletInfo.publicKey
    )

    const tokenMintAddresses = [
      ...new Set(tokenAccounts.map(({ account: { mint } }) => mint)),
    ]

    const mintInfos = (
      await Promise.all(
        tokenMintAddresses.map((tokenMintAddress) =>
          tryGetMint(connection.current, tokenMintAddress)
        )
      )
    ).reduce(
      (acc, mintInfo) => {
        if (!mintInfo) throw new Error('Cannot load mint info')

        acc[mintInfo.publicKey.toBase58()] = {
          ...mintInfo,
          name: getSplTokenNameFromConstant(mintInfo.publicKey),
          usdValue: tokenService.getUSDTokenPrice(
            mintInfo.publicKey.toBase58()
          ),
        }

        return acc
      },
      {} as {
        [key: string]: TokenProgramAccount<MintInfo> & {
          name?: string
          usdValue: number
        }
      }
    )

    setTokenAccountsInfo(
      tokenAccounts.map((tokenAccount) => {
        const mintInfo = mintInfos[tokenAccount.account.mint.toBase58()]

        return {
          mint: tokenAccount.account.mint,
          publicKey: tokenAccount.publicKey,
          amount: tokenAccount.account.amount,
          decimals: mintInfo.account.decimals,
          mintName: mintInfo.name,
          usdMintValue: mintInfo.usdValue,
          usdTotalValue: new BN(
            new BigNumber(tokenAccount.account.amount.toString())
              .multipliedBy(mintInfo.usdValue)
              .integerValue()
              .toString()
          ),
        }
      })
    )
  }, [
    connection,
    JSON.stringify(tokenService._tokenPriceToUSDlist),
    hotWalletInfo,
  ])

  useEffect(() => {
    loadTokenAccounts()
  }, [loadTokenAccounts])

  return {
    tokenAccountsInfo,
    hotWalletInfo,
  }
}

export default useHotWallet
