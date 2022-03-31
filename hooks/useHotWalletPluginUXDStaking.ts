import { useCallback, useEffect, useState } from 'react'
import { HotWalletAccount } from './useHotWallet'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import useWalletStore from 'stores/useWalletStore'
import {
  getOnchainStakingCampaign,
  StakingCampaignState,
} from '@uxdprotocol/uxd-staking-client'
import { PublicKey } from '@solana/web3.js'

const UsersCampaigns = {
  ['AWuSjBCEMVtk8fX2HAwtuMjoHLmLM72PJxi1dZdKHPFu']: [
    {
      name: 'Campaign Name',
      pda: new PublicKey('CrRH3o9TbxvRdNkkjcmG5qdG7XM397nKcRmxgkVniAtB'),
    },
  ],
}

export type StakingCampaignInfo = StakingCampaignState & {
  name: string
  pda: PublicKey
}

const useHotWalletPluginUXDStaking = (hotWalletAccount: HotWalletAccount) => {
  const [stakingCampaignsInfo, setStakingCampaignsInfo] = useState<
    StakingCampaignInfo[]
  >()
  const connection = useWalletStore((s) => s.connection)

  const loadUXDStakingCampaignInfo = useCallback(async () => {
    const programId =
      uxdProtocolStakingConfiguration.programId[connection.cluster]

    if (!programId) {
      throw new Error(
        `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`
      )
    }

    const campaigns =
      UsersCampaigns[hotWalletAccount.publicKey.toBase58()] ?? []

    const stakingCampaignStates: StakingCampaignState[] = await Promise.all(
      campaigns.map(({ pda }) =>
        getOnchainStakingCampaign(
          pda,
          connection.current,
          uxdProtocolStakingConfiguration.TXN_OPTS
        )
      )
    )

    setStakingCampaignsInfo(
      stakingCampaignStates.map((state, index) => ({
        ...state,
        name: campaigns[index].name,
        pda: campaigns[index].pda,
      }))
    )
  }, [connection, hotWalletAccount])

  useEffect(() => {
    loadUXDStakingCampaignInfo()
  }, [loadUXDStakingCampaignInfo])

  return { stakingCampaignsInfo }
}

export default useHotWalletPluginUXDStaking
