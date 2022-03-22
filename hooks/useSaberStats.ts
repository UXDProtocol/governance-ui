import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { Wallet } from '@project-serum/common'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'
import {
  findMinerAddress,
  findQuarryAddress,
  QuarrySDK,
} from '@quarryprotocol/quarry-sdk'
import QuarryMineConfiguration, {
  SABER_UXD_USDC_LP,
} from '@tools/sdk/quarryMine/configuration'
import { tryGetMint } from '@utils/tokens'
import { BN } from '@project-serum/anchor'
import BigNumber from 'bignumber.js'
import { getSplTokenNameByMint } from '@utils/splTokens'

const SaberAccountOwner = {
  UXDProtocol: {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'),
  },
  'Kek World': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b'),
  },
}

export type SaberStats = {
  liquidityPoolName: string
  balance: BN
  uiBalance: number
  pendingRewards: {
    mint: PublicKey
    name: string
    uiPendingAmount: number
  }[]
  mintName: string
  rewardsTokenMintName: string
}

const useSaberStats = () => {
  const connection = useWalletStore((store) => store.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realm } = useRealm()

  const [saberStats, setSaberStats] = useState<SaberStats[] | null>(null)

  const [saberAccountOwner, setSaberAccountOwner] = useState<{
    name: string
    publicKey: PublicKey
  } | null>(null)

  useEffect(() => {
    if (!realm) return

    setSaberAccountOwner(SaberAccountOwner[realm.account.name] ?? null)
  }, [realm])

  const loadInfo = useCallback(async () => {
    if (!connection.current || !saberAccountOwner) return

    try {
      const {
        mint,
        rewarder,
        mintName,
        rewardsTokenMintName,
      } = QuarryMineConfiguration.mintSpecificAddresses[SABER_UXD_USDC_LP]

      const [quarry] = await findQuarryAddress(rewarder, mint)
      const [miner] = await findMinerAddress(
        quarry,
        saberAccountOwner.publicKey
      )

      const sdk = QuarrySDK.load({
        provider: new SolanaAugmentedProvider(
          SolanaProvider.load({
            connection: connection.current,
            sendConnection: connection.current,
            wallet: wallet as Wallet,
          })
        ),
      })

      const sonarData = await fetch(
        'https://api-uxd.sonar.watch/uxd'
      ).then((res) => res.json())
      const saberAccountSonarData = sonarData.find(
        ({ platform, owner }) =>
          platform === 'quarry' &&
          owner === saberAccountOwner.publicKey.toBase58()
      )

      const pendingRewards = saberAccountSonarData.rewardAssets.map(
        (asset) => ({
          mint: new PublicKey(asset.mint),
          name: getSplTokenNameByMint(new PublicKey(asset.mint)),
          uiPendingAmount: asset.pending,
        })
      )

      const minerData = await sdk.programs.Mine.account.miner.fetch(miner)

      const lpMintInfo = await tryGetMint(connection.current, mint)
      if (!lpMintInfo)
        throw new Error(`Cannot load lp mint info for ${mint.toBase58()}`)

      setSaberStats([
        {
          liquidityPoolName: 'Saber UXD-USDC Liquidity Pool',
          balance: minerData.balance,
          uiBalance: new BigNumber(minerData.balance.toString())
            .shiftedBy(-lpMintInfo.account.decimals)
            .toNumber(),
          pendingRewards,
          mintName,
          rewardsTokenMintName,
        },
      ])
    } catch (err) {
      console.log('error loading saber stats', err)
    }
  }, [connection, saberAccountOwner, wallet])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  return {
    saberAccountOwner,
    saberStats,
  }
}

export default useSaberStats
